import { createHmac, randomBytes, timingSafeEqual } from "node:crypto"

// Server-issued, HMAC-signed Roblox bio verification codes.
//
// Why not generate codes client-side?
//   The previous flow let the client invent any FRUITS-XXXXXXXX string and the
//   server accepted it as long as the SHAPE matched. That made one phishing
//   path possible: trick a victim into pasting an attacker-supplied code in
//   their own bio (e.g. "enter this code to claim a giveaway"), then call
//   /api/roblox/auth with the victim's userId and the same code. The server
//   would dutifully observe the code in the bio and link the victim's Roblox
//   account to the attacker's session.
//
// Fix:
//   The server now MINTS codes via /api/roblox/issue-code. Each code embeds
//   the userId and a timestamp, signed with an HMAC over a server-only
//   secret. Verification re-computes the HMAC and rejects:
//     - codes whose embedded userId doesn't match the userId being verified
//     - codes older than CODE_TTL_MS
//     - codes whose signature was tampered with
//   Without the secret an attacker cannot forge a code, and the userId
//   binding makes phishing useless because a code minted for the victim's
//   userId can only authenticate as the victim — exactly what we want.

// Format anatomy: FRUITS-{nonce}-{tsBase36}-{sig}
//   - 6 random alphabet chars for entropy (so identical timestamps still
//     produce distinct codes if two requests collide)
//   - Base36 timestamp (current ~9 chars; safe headroom into year 2100)
//   - 8-char HMAC signature truncated from SHA-256 (~40 bits of integrity)
//
// The timestamp ALSO acts as a replay-window guard: even if an old code
// leaked, it's useless after CODE_TTL_MS.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
const NONCE_LEN = 6
const SIG_LEN = 8
export const CODE_TTL_MS = 10 * 60_000

// Anchored, intentionally narrow regex. Anything else fails fast before we
// touch the secret material.
const CODE_FORMAT = /^FRUITS-([A-Z0-9]{6})-([0-9a-z]{1,12})-([A-Z0-9]{8})$/

let cachedSecret: Buffer | null = null
function getSecret(): Buffer {
  if (cachedSecret) return cachedSecret
  const raw =
    process.env.ROBLOX_VERIFY_SECRET ||
    process.env.SUPABASE_JWT_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!raw) {
    throw new Error(
      "Verification secret missing: set ROBLOX_VERIFY_SECRET (or rely on the SUPABASE_JWT_SECRET fallback).",
    )
  }
  // Namespace the underlying secret so this module can't accidentally
  // collide with any other HMAC consumer of the same env var.
  cachedSecret = createHmac("sha256", raw).update("roblox-verify/v1").digest()
  return cachedSecret
}

function sign(payload: string): string {
  const mac = createHmac("sha256", getSecret()).update(payload).digest()
  let out = ""
  for (let i = 0; i < SIG_LEN; i++) {
    out += ALPHABET[mac[i]! % ALPHABET.length]
  }
  return out
}

function randomNonce(): string {
  const bytes = randomBytes(NONCE_LEN)
  let out = ""
  for (let i = 0; i < NONCE_LEN; i++) {
    out += ALPHABET[bytes[i]! % ALPHABET.length]
  }
  return out
}

export type IssuedCode = { code: string; expiresAt: number }

export function issueCode(userId: number): IssuedCode {
  const nonce = randomNonce()
  const ts = Date.now()
  const ts36 = ts.toString(36)
  const sig = sign(`${userId}|${nonce}|${ts36}`)
  return { code: `FRUITS-${nonce}-${ts36}-${sig}`, expiresAt: ts + CODE_TTL_MS }
}

export type VerifyFailure = "format" | "expired" | "tampered"
export type VerifyResult = { ok: true } | { ok: false; reason: VerifyFailure }

export function verifyCode(userId: number, code: string): VerifyResult {
  const match = CODE_FORMAT.exec(code)
  if (!match) return { ok: false, reason: "format" }
  const [, nonce, ts36, sig] = match
  const ts = parseInt(ts36!, 36)
  if (!Number.isFinite(ts)) return { ok: false, reason: "format" }
  if (Date.now() - ts > CODE_TTL_MS) return { ok: false, reason: "expired" }

  const expected = sign(`${userId}|${nonce}|${ts36}`)
  // Constant-time compare — the easy `===` would leak which prefix matched
  // through timing differences. Buffers must be the same length, which is
  // already guaranteed by the regex.
  if (
    expected.length !== sig!.length ||
    !timingSafeEqual(Buffer.from(expected), Buffer.from(sig!))
  ) {
    return { ok: false, reason: "tampered" }
  }
  return { ok: true }
}

/** Friendly user-facing message for a verifyCode failure. */
export function verifyFailureMessage(reason: VerifyFailure): string {
  switch (reason) {
    case "expired":
      return "That verification code expired. Generate a new one and try again."
    case "tampered":
    case "format":
    default:
      return "That verification code is invalid. Generate a new one and try again."
  }
}
