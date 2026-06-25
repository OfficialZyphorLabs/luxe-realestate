import { Redis } from '@upstash/redis'

// Returns null when env vars are not configured (local dev without Redis).
// All callers must guard with `if (redis)` before use.
export const redis: Redis | null =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null
