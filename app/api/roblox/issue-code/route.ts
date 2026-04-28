import { NextResponse } from "next/server"
import { limit } from "@/lib/rate-limit"
import { issueCode } from "@/lib/verify-code"

// Mints a fresh, server-signed verification code bound to a Roblox userId.
// See lib/verify-code.ts for the threat model and signing scheme.

export const runtime = "nodejs"

export async function POST(req: Request) {
  // Cap code minting to a reasonable burst per IP. 20/min comfortably covers
  // a user clicking "Generate a new code" repeatedly without giving an
  // attacker enough volume to do anything useful.
  const limited = limit(req, "issue-code", { limit: 20, windowMs: 60_000 })
  if (limited) return limited

  let body: { userId?: unknown }
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

  if (!userId || userId < 1 || userId > Number.MAX_SAFE_INTEGER) {
    return NextResponse.json({ error: "Missing Roblox userId." }, { status: 400 })
  }

  try {
    const issued = issueCode(userId)
    return NextResponse.json(issued)
  } catch {
    // The only realistic failure here is "secret not configured", which is
    // a deploy-time issue we don't want to leak details about over the wire.
    return NextResponse.json(
      { error: "Verification is not configured on the server." },
      { status: 500 },
    )
  }
}
