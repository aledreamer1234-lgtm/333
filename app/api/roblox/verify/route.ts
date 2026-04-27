import { NextResponse } from "next/server"
import { robloxErrorMessage, robloxFetch } from "@/lib/roblox"

// Verifies a user's Roblox account by checking their profile description ("bio")
// for a one-time code we issued during the sign-up flow. The user pastes the
// code into their Roblox bio, then we fetch the bio (with multi-host fallback)
// and confirm the code is present.

export const runtime = "nodejs"

type RoUserDetails = {
  description?: string | null
  name?: string
  displayName?: string
  isBanned?: boolean
}

export async function POST(req: Request) {
  let body: { userId?: unknown; code?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const userId =
    typeof body.userId === "number"
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

  // The verification codes we issue follow a strict shape — reject anything else
  // so this endpoint can't be turned into a generic profile-scraping helper.
  if (!/^FRUITS-[A-Z0-9]{6,12}$/.test(code)) {
    return NextResponse.json({ error: "Invalid verification code format." }, { status: 400 })
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
