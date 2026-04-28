import { NextResponse } from "next/server"
import { limit } from "@/lib/rate-limit"
import { robloxErrorMessage, robloxFetch } from "@/lib/roblox"
import { verifyCode, verifyFailureMessage } from "@/lib/verify-code"

// Verifies a user's Roblox account by checking their profile description ("bio")
// for a one-time code we issued during the sign-up flow. The user pastes the
// code into their Roblox bio, then we fetch the bio (with multi-host fallback)
// and confirm the code is present.
//
// Defence in depth:
//   - Per-IP rate limiting keeps this from being used as a free profile
//     scraper, even though it's already gated by `verifyCode`.
//   - The submitted code MUST have been minted by /api/roblox/issue-code,
//     bound to *this* userId, and not yet expired. Without those checks the
//     endpoint would happily look up arbitrary Roblox profiles.

export const runtime = "nodejs"

type RoUserDetails = {
  description?: string | null
  name?: string
  displayName?: string
  isBanned?: boolean
}

export async function POST(req: Request) {
  const limited = limit(req, "roblox-verify", { limit: 30, windowMs: 60_000 })
  if (limited) return limited

  let body: { userId?: unknown; code?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const userId =
    typeof body.userId === "number" && Number.isInteger(body.userId)
      ? body.userId
      : typeof body.userId === "string" && /^\d+$/.test(body.userId)
        ? Number(body.userId)
        : null
  const code = typeof body.code === "string" ? body.code.trim() : ""

  if (!userId || !code) {
    return NextResponse.json(
      { error: "Missing Roblox user id or verification code." },
      { status: 400 },
    )
  }

  // Reject anything that isn't one of OUR HMAC-signed, userId-bound codes.
  // This kills the previous "any FRUITS-XXXXXX accepted" abuse vector.
  const codeCheck = verifyCode(userId, code)
  if (!codeCheck.ok) {
    return NextResponse.json(
      { error: verifyFailureMessage(codeCheck.reason) },
      { status: 400 },
    )
  }

  const result = await robloxFetch("users", `/v1/users/${userId}`)

  if (!result.ok) {
    const status = result.status === 404 ? 404 : result.status === 429 ? 429 : 502
    return NextResponse.json({ error: robloxErrorMessage(result.reason) }, { status })
  }

  const details = result.data as RoUserDetails
  const description = (details.description ?? "").trim()
  const verified = description.toUpperCase().includes(code.toUpperCase())

  return NextResponse.json({
    verified,
    // We only echo a short snippet so the client can show "no code found" hints
    // without dumping the entire profile bio back to the browser.
    descriptionSnippet: description.slice(0, 280),
  })
}
