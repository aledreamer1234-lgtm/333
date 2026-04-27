import { NextResponse } from "next/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import { limit } from "@/lib/rate-limit"
import { robloxErrorMessage, robloxFetch } from "@/lib/roblox"
import { verifyCode, verifyFailureMessage } from "@/lib/verify-code"

// Server endpoint that ties a Roblox-bio verification to a Supabase session,
// without ever asking the user for an email or password.
//
// Flow:
//   1. Re-verify the bio code on the server (same logic as /api/roblox/verify)
//   2. Use the Supabase service role key to create a user keyed off the
//      Roblox account id with a synthetic email + random password
//   3. Generate a magic link and return its `hashed_token` so the client can
//      call `supabase.auth.verifyOtp({ type: "email", token_hash })` and
//      establish a session.
//
// The synthetic email lives on a domain we don't expect anyone to send mail
// to; it exists purely so Supabase has a unique identifier per Roblox user.

export const runtime = "nodejs"

const SYNTHETIC_EMAIL_DOMAIN = "accounts.fruits.place"

function syntheticEmail(robloxId: number) {
  return `roblox-${robloxId}@${SYNTHETIC_EMAIL_DOMAIN}`
}

// Avatar URLs come from Roblox's CDNs via the lookup route. We accept ONLY
// https URLs hosted on a known Roblox / RoProxy domain so a malicious client
// can't stuff arbitrary URLs (javascript:, data:, attacker-controlled hosts)
// into our user_metadata, where they'd later render as the dashboard avatar.
const AVATAR_HOST_SUFFIXES = [
  "rbxcdn.com",
  "roblox.com",
  "roproxy.com",
  "rprxy.xyz",
]
function sanitizeAvatarUrl(raw: unknown): string | null {
  if (typeof raw !== "string") return null
  const trimmed = raw.trim()
  if (!trimmed || trimmed.length > 1024) return null
  let url: URL
  try {
    url = new URL(trimmed)
  } catch {
    return null
  }
  if (url.protocol !== "https:") return null
  const host = url.hostname.toLowerCase()
  if (!AVATAR_HOST_SUFFIXES.some((s) => host === s || host.endsWith(`.${s}`))) {
    return null
  }
  return url.toString()
}

type Body = {
  userId?: unknown
  code?: unknown
  robloxName?: unknown
  displayName?: unknown
  avatarUrl?: unknown
  // "signup" → reject if the Roblox user is already registered.
  // "login"  → re-issue a session for an existing user (auto-create if missing
  //            for back-compat with older clients).
  // If omitted, we default to "login" behaviour to avoid breaking existing
  // clients that don't pass the flag.
  mode?: unknown
}

type RoUserDetails = { description?: string | null }

export async function POST(req: Request) {
  // This route both creates Supabase users AND issues session tokens. We
  // throttle aggressively (10/min/IP) so it can't be used to spam-fill the
  // Supabase user pool or brute-force codes.
  const limited = limit(req, "roblox-auth", { limit: 10, windowMs: 60_000 })
  if (limited) return limited

  let body: Body
  try {
    body = (await req.json()) as Body
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  // ---- input validation ----
  const userId =
    typeof body.userId === "number" && Number.isInteger(body.userId)
      ? body.userId
      : typeof body.userId === "string" && /^\d+$/.test(body.userId)
        ? Number(body.userId)
        : null
  const code = typeof body.code === "string" ? body.code.trim() : ""
  const robloxName =
    typeof body.robloxName === "string" ? body.robloxName.trim().slice(0, 64) : ""
  const displayName =
    typeof body.displayName === "string" && body.displayName.trim().length > 0
      ? body.displayName.trim().slice(0, 128)
      : robloxName
  // Avatar URLs come from Roblox CDNs. Reject anything that isn't a https URL
  // pointing at a known Roblox host so a malicious client can't stuff
  // arbitrary URLs into our user_metadata.
  const avatarUrl = sanitizeAvatarUrl(body.avatarUrl)
  const mode: "signup" | "login" =
    body.mode === "signup" ? "signup" : "login"

  if (!userId || !robloxName) {
    return NextResponse.json(
      { error: "Missing Roblox account info." },
      { status: 400 },
    )
  }

  // The submitted code MUST be one our server minted for this exact userId
  // and still within its TTL — see lib/verify-code.ts. This is the single
  // most important check in this route: it kills the entire phishing path
  // where an attacker tricks the victim into pasting an attacker-supplied
  // code into their own bio.
  const codeCheck = verifyCode(userId, code)
  if (!codeCheck.ok) {
    return NextResponse.json(
      { error: verifyFailureMessage(codeCheck.reason) },
      { status: 400 },
    )
  }

  // ---- re-verify bio (defence in depth) ----
  const result = await robloxFetch("users", `/v1/users/${userId}`)
  if (!result.ok) {
    const status =
      result.status === 404 ? 404 : result.status === 429 ? 429 : 502
    return NextResponse.json(
      { error: robloxErrorMessage(result.reason) },
      { status },
    )
  }
  const description = ((result.data as RoUserDetails).description ?? "").toString()
  if (!description.toUpperCase().includes(code.toUpperCase())) {
    return NextResponse.json(
      {
        error:
          "We couldn't find the code in your Roblox bio yet. Save your profile and try again.",
      },
      { status: 400 },
    )
  }

  // ---- create or refresh the Supabase user, then issue a session token ----
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json(
      { error: "Authentication is not configured on the server." },
      { status: 500 },
    )
  }

  const admin = createAdminClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const email = syntheticEmail(userId)
  const userMetadata = {
    username: robloxName,
    roblox_id: userId,
    roblox_username: robloxName,
    roblox_display_name: displayName,
    roblox_avatar_url: avatarUrl,
    roblox_verified_at: new Date().toISOString(),
  }

  // Try to create the user. If they already exist we'll update their metadata
  // after the magic link is generated (we use it to find the user id).
  //
  // Bcrypt (used by GoTrue) caps passwords at 72 bytes — two UUIDs joined with
  // a dash is 73 bytes which crashes the auth server with a panic. A single
  // UUID is 36 chars, well under the limit, and the user never sees or types
  // it; Supabase only hashes it for storage.
  const randomPassword =
    typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Math.random().toString(36).slice(2)}${Date.now()}`.slice(0, 64)

  const { error: createError } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    password: randomPassword,
    user_metadata: userMetadata,
  })

  const alreadyExists =
    !!createError && /already (registered|exists|been registered)/i.test(createError.message)

  if (createError && !alreadyExists) {
    return NextResponse.json({ error: createError.message }, { status: 500 })
  }

  // Sign-up specifically refuses to take over an existing account. Returning
  // 409 Conflict gives the client a clean signal to direct the user to /login.
  if (alreadyExists && mode === "signup") {
    return NextResponse.json(
      {
        error:
          "This Roblox user is already signed up to fruits.place. Sign in instead.",
        code: "already_registered",
      },
      { status: 409 },
    )
  }

  // Generate a magic link — returns the hashed token regardless of whether the
  // user just got created or was already there.
  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
  })

  if (linkError || !linkData?.properties?.hashed_token) {
    return NextResponse.json(
      { error: linkError?.message ?? "Failed to issue a session." },
      { status: 500 },
    )
  }

  // Best-effort metadata refresh so the latest avatar / display name sticks
  // for returning users. Failure here is non-fatal — they're still signed in.
  if (linkData.user?.id) {
    await admin.auth.admin.updateUserById(linkData.user.id, {
      user_metadata: userMetadata,
    })
  }

  return NextResponse.json({
    email,
    token_hash: linkData.properties.hashed_token,
  })
}
