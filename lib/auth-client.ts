// Client-side helpers for the Roblox-bio authentication flow.
//
// The same three round-trips (lookup → issue code → verify) are used by both
// the login and sign-up pages. Centralising the fetch calls and JSON shapes
// in one place keeps the page components thin and means a server-side
// contract change only needs a single client-side update.

export type RobloxUser = {
  id: number
  name: string
  displayName: string
  avatarUrl: string | null
}

/**
 * Look up a Roblox username and return the canonical profile (id, display
 * name, avatar). Throws an `Error` whose message is safe to surface in the UI.
 */
export async function lookupRobloxUser(username: string): Promise<RobloxUser> {
  const res = await fetch("/api/roblox/lookup", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ username }),
  })
  const data = (await res.json()) as RobloxUser & { error?: string }
  if (!res.ok) {
    throw new Error(data.error ?? "Couldn't find that Roblox user")
  }
  return {
    id: data.id,
    name: data.name,
    displayName: data.displayName,
    avatarUrl: data.avatarUrl,
  }
}

/**
 * Ask the server to mint a fresh, HMAC-signed verification code bound to
 * `userId`. Codes are deliberately *not* generated on the client — the server
 * has to be the one to attest a code is ours, otherwise an attacker could
 * trick a victim into pasting an attacker-supplied string into their bio.
 *
 * @see app/api/roblox/issue-code/route.ts
 */
export async function fetchVerificationCode(userId: number): Promise<string> {
  const res = await fetch("/api/roblox/issue-code", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ userId }),
  })
  const data = (await res.json()) as { code?: string; error?: string }
  if (!res.ok || !data.code) {
    throw new Error(data.error ?? "Couldn't issue a verification code.")
  }
  return data.code
}

export type ExchangeRobloxAuthResult =
  | { kind: "ok"; tokenHash: string }
  | { kind: "already_registered"; message: string }

/**
 * Submit the Roblox identity + verification code to `/api/roblox/auth`. The
 * server re-fetches the user's bio, confirms the code is present, then either
 * provisions (signup) or re-authenticates (login) the user and returns a
 * one-shot magic-link `token_hash` we can exchange for a real session via
 * `supabase.auth.verifyOtp`.
 *
 * For sign-up, a 409 response with `code: "already_registered"` is folded
 * into a structured result so the UI can render a "Sign in instead" CTA
 * instead of a generic error toast.
 */
export async function exchangeRobloxAuth(params: {
  mode: "signup" | "login"
  user: RobloxUser
  code: string
}): Promise<ExchangeRobloxAuthResult> {
  const res = await fetch("/api/roblox/auth", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      mode: params.mode,
      userId: params.user.id,
      code: params.code,
      robloxName: params.user.name,
      displayName: params.user.displayName,
      avatarUrl: params.user.avatarUrl,
    }),
  })
  const data = (await res.json()) as {
    token_hash?: string
    error?: string
    code?: string
  }
  if (res.status === 409 || data.code === "already_registered") {
    return {
      kind: "already_registered",
      message:
        data.error ?? "This Roblox user is already signed up to fruits.place.",
    }
  }
  if (!res.ok || !data.token_hash) {
    throw new Error(data.error ?? "Verification failed")
  }
  return { kind: "ok", tokenHash: data.token_hash }
}
