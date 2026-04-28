// In-memory sliding-window rate limiter, keyed by `${bucket}:${ip}`.
//
// Caveats and design notes:
// - Vercel functions can run on multiple instances, so this limiter is
//   per-instance rather than global. Warm-instance reuse means it still
//   meaningfully throttles single-client bursts (which is the realistic
//   abuse pattern we care about); a globally-distributed attacker remains
//   bounded by Vercel's own infrastructure limits.
// - For production-grade global limits, swap the `buckets` Map for an
//   Upstash Redis client doing token-bucket via INCR + EXPIRE. The
//   `consume()` shape was chosen so that swap is mechanical.

type Bucket = { tokens: number; refilledAt: number }

const buckets = new Map<string, Bucket>()

// Periodic GC so long-lived processes don't leak memory under sustained
// traffic from many distinct IPs. Runs at most every minute.
let lastGcAt = 0
function maybeGc(now: number, windowMs: number) {
  if (now - lastGcAt < 60_000) return
  lastGcAt = now
  for (const [key, b] of buckets) {
    if (now - b.refilledAt > windowMs * 2) buckets.delete(key)
  }
}

export type RateLimitOptions = {
  /** Number of requests allowed per `windowMs`. */
  limit: number
  /** Sliding window length in milliseconds. */
  windowMs: number
}

export type RateLimitDecision =
  | { ok: true; remaining: number; resetAt: number }
  | { ok: false; retryAfterSeconds: number; resetAt: number }

/**
 * Decrement one token from the bucket identified by `key`. Resets the bucket
 * when the previous window elapsed.
 */
export function consume(key: string, opts: RateLimitOptions): RateLimitDecision {
  const now = Date.now()
  maybeGc(now, opts.windowMs)
  const bucket = buckets.get(key)
  if (!bucket || now - bucket.refilledAt >= opts.windowMs) {
    buckets.set(key, { tokens: opts.limit - 1, refilledAt: now })
    return { ok: true, remaining: opts.limit - 1, resetAt: now + opts.windowMs }
  }
  if (bucket.tokens <= 0) {
    const resetAt = bucket.refilledAt + opts.windowMs
    return {
      ok: false,
      retryAfterSeconds: Math.max(1, Math.ceil((resetAt - now) / 1000)),
      resetAt,
    }
  }
  bucket.tokens -= 1
  return {
    ok: true,
    remaining: bucket.tokens,
    resetAt: bucket.refilledAt + opts.windowMs,
  }
}

/**
 * Best-effort client IP extraction. Vercel sets `x-forwarded-for` to the
 * client IP followed by any proxy hops; the first entry is what we want.
 * Falls back to "unknown" so unidentifiable clients share a bucket rather
 * than bypassing the limiter entirely.
 */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for")
  if (xff) {
    const first = xff.split(",")[0]?.trim()
    if (first) return first
  }
  return req.headers.get("x-real-ip") ?? "unknown"
}

/**
 * Convenience wrapper for route handlers. Returns a 429 `Response` when the
 * request should be rejected, or `undefined` when it can proceed:
 *
 *   const limited = limit(req, "lookup", { limit: 30, windowMs: 60_000 })
 *   if (limited) return limited
 */
export function limit(
  req: Request,
  bucket: string,
  opts: RateLimitOptions,
): Response | undefined {
  const decision = consume(`${bucket}:${clientIp(req)}`, opts)
  if (decision.ok) return undefined
  return new Response(
    JSON.stringify({
      error: `Too many requests. Try again in ${decision.retryAfterSeconds}s.`,
    }),
    {
      status: 429,
      headers: {
        "content-type": "application/json",
        "retry-after": String(decision.retryAfterSeconds),
      },
    },
  )
}
