// Shared helpers for talking to the Roblox public API.
//
// `roproxy.com` is great until it isn't — it aggressively rate-limits per source IP
// and frequently returns 429 to traffic from cloud providers (which is what
// happens when our Next.js routes call it from Vercel). To stay reliable we try
// a list of mirrors in order and only give up if every single host fails or
// rate-limits us.
//
// Order matters: `apis.roblox.com` and `users.roblox.com` are the official
// endpoints and almost always succeed; the proxies are kept as backups in case
// Roblox itself blocks the egress IP range.

const SUBDOMAINS = {
  users: ["users.roblox.com", "users.roproxy.com", "users.rprxy.xyz"],
  thumbnails: [
    "thumbnails.roblox.com",
    "thumbnails.roproxy.com",
    "thumbnails.rprxy.xyz",
  ],
} as const

type Subdomain = keyof typeof SUBDOMAINS

export type RobloxFailureReason = "rate_limited" | "not_found" | "network" | "upstream"

export type RobloxFetchResult =
  | { ok: true; data: unknown; host: string }
  | { ok: false; status: number; reason: RobloxFailureReason }

// Generic fetch with mirror fallback. Returns the first successful JSON response.
// 404 responses short-circuit (the resource genuinely doesn't exist), but 429
// and 5xx responses fall through to the next host.
export async function robloxFetch(
  subdomain: Subdomain,
  path: string,
  init?: RequestInit,
): Promise<RobloxFetchResult> {
  const hosts = SUBDOMAINS[subdomain]
  let lastStatus = 0

  for (const host of hosts) {
    let res: Response
    try {
      res = await fetch(`https://${host}${path}`, {
        ...init,
        cache: "no-store",
        headers: {
          accept: "application/json",
          // Some Roblox edges 403 requests with no User-Agent.
          "user-agent": "fruits.place/1.0 (+https://fruits.place)",
          ...(init?.headers ?? {}),
          ...(init?.body ? { "content-type": "application/json" } : {}),
        },
      })
    } catch {
      // DNS / connection error — try the next host.
      lastStatus = 0
      continue
    }

    if (res.status === 404) {
      return { ok: false, status: 404, reason: "not_found" }
    }

    if (res.ok) {
      try {
        const data = (await res.json()) as unknown
        return { ok: true, data, host }
      } catch {
        // Malformed JSON from this host — try the next.
        lastStatus = 502
        continue
      }
    }

    lastStatus = res.status
    // 429 and 5xx → try the next mirror.
  }

  if (lastStatus === 429) return { ok: false, status: 429, reason: "rate_limited" }
  if (lastStatus === 0) return { ok: false, status: 502, reason: "network" }
  return { ok: false, status: lastStatus || 502, reason: "upstream" }
}

// Friendly user-facing message for a failed Roblox call, used by both routes
// so the client sees a consistent error vocabulary.
export function robloxErrorMessage(reason: RobloxFailureReason): string {
  switch (reason) {
    case "rate_limited":
      return "Roblox is rate-limiting us right now. Wait ~30 seconds and try again."
    case "not_found":
      return "That Roblox account doesn't exist."
    case "network":
      return "Couldn't reach Roblox. Check your connection and try again."
    case "upstream":
    default:
      return "Roblox is temporarily unavailable. Try again in a moment."
  }
}
