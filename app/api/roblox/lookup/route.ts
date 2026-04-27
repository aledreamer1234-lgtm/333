import { NextResponse } from "next/server"
import { limit } from "@/lib/rate-limit"
import { robloxErrorMessage, robloxFetch } from "@/lib/roblox"

// Resolves a Roblox username to its profile and fetches the user's avatar
// headshot. We try the official Roblox API first and fall back to roproxy
// mirrors so a single host being rate-limited (429) doesn't break sign-up.
//
// Rate-limited per IP so this endpoint can't be abused as a free Roblox
// profile-scraping proxy.

export const runtime = "nodejs"

type RoUser = { id: number; name: string; displayName: string }
type RoThumb = { targetId: number; state: string; imageUrl: string | null }

export async function POST(req: Request) {
  const limited = limit(req, "roblox-lookup", { limit: 30, windowMs: 60_000 })
  if (limited) return limited

  let body: { username?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const raw = typeof body.username === "string" ? body.username.trim() : ""
  if (raw.length < 3 || raw.length > 20 || !/^[A-Za-z0-9_]+$/.test(raw)) {
    return NextResponse.json(
      {
        error:
          "Roblox usernames must be 3–20 characters and contain only letters, numbers, and underscores.",
      },
      { status: 400 },
    )
  }

  // 1. Resolve username -> userId via the multi-username lookup endpoint.
  const lookup = await robloxFetch("users", "/v1/usernames/users", {
    method: "POST",
    body: JSON.stringify({ usernames: [raw], excludeBannedUsers: false }),
  })

  if (!lookup.ok) {
    return NextResponse.json(
      { error: robloxErrorMessage(lookup.reason) },
      { status: lookup.status === 429 ? 429 : 502 },
    )
  }

  const lookupData = lookup.data as { data?: RoUser[] }
  const user = lookupData.data?.[0]
  if (!user) {
    return NextResponse.json(
      { error: "No Roblox user found with that username." },
      { status: 404 },
    )
  }

  // 2. Fetch their headshot — best-effort, sign-up still works without it.
  let avatarUrl: string | null = null
  const thumb = await robloxFetch(
    "thumbnails",
    `/v1/users/avatar-headshot?userIds=${user.id}&size=150x150&format=Png&isCircular=false`,
  )
  if (thumb.ok) {
    const td = thumb.data as { data?: RoThumb[] }
    avatarUrl = td.data?.[0]?.imageUrl ?? null
  }

  return NextResponse.json({
    id: user.id,
    name: user.name,
    displayName: user.displayName,
    avatarUrl,
  })
}
