/**
 * rate-limit.ts — Sliding-window rate limiting backed by Upstash Redis.
 *
 * Used to blunt credential stuffing, password-reset enumeration/email-bombing,
 * and invite spam (SAAS_ARCHITECTURE.md §11, Layer 1). Limiters are created
 * lazily and cached per (limit, window) pair so we don't construct a new
 * Ratelimit instance on every request.
 *
 * Graceful degradation: when Redis isn't configured (local dev without Upstash),
 * `enforceRateLimit` allows the request and logs a one-time warning. Production
 * deployments MUST set the Upstash env vars so limiting is actually enforced.
 */
import { Ratelimit } from '@upstash/ratelimit'
import { redis } from '@/lib/redis'
import { RATE_LIMITS } from '@/lib/auth/constants'

type LimitConfig = { limit: number; windowSeconds: number }

const limiterCache = new Map<string, Ratelimit>()
let warnedMissingRedis = false

/** Build (or reuse) a sliding-window limiter for the given budget. */
function getLimiter(prefix: string, { limit, windowSeconds }: LimitConfig): Ratelimit | null {
  if (!redis) return null
  const key = `${prefix}:${limit}:${windowSeconds}`
  let limiter = limiterCache.get(key)
  if (!limiter) {
    limiter = new Ratelimit({
      redis,
      // `${n} s` is the Upstash duration syntax for a sliding window.
      limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`),
      prefix: `ratelimit:${prefix}`,
      analytics: false,
    })
    limiterCache.set(key, limiter)
  }
  return limiter
}

export interface RateLimitResult {
  success: boolean
  /** Seconds until the limit resets — surfaced to clients via Retry-After. */
  retryAfter: number
}

/**
 * Enforce a named rate-limit budget for a caller identity (usually the client IP,
 * optionally namespaced by org/email). Returns `success: false` when the caller
 * has exceeded the window.
 */
export async function enforceRateLimit(
  bucket: keyof typeof RATE_LIMITS,
  identifier: string
): Promise<RateLimitResult> {
  const limiter = getLimiter(bucket, RATE_LIMITS[bucket])

  if (!limiter) {
    if (!warnedMissingRedis && process.env.NODE_ENV === 'production') {
      console.warn(
        '[rate-limit] Upstash Redis is not configured — rate limiting is DISABLED. ' +
          'Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.'
      )
      warnedMissingRedis = true
    }
    return { success: true, retryAfter: 0 }
  }

  const { success, reset } = await limiter.limit(identifier)
  const retryAfter = Math.max(0, Math.ceil((reset - Date.now()) / 1000))
  return { success, retryAfter }
}

/**
 * Best-effort client IP extraction from proxy headers. Vercel/most platforms set
 * `x-forwarded-for` (comma-separated, client first). Falls back to a constant so
 * limiting still groups unknown clients rather than failing open per-request.
 */
export function getClientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0]!.trim()
  return req.headers.get('x-real-ip')?.trim() || '127.0.0.1'
}
