/**
 * tokens.ts — Cryptographically secure, single-use tokens for invitations and
 * password resets.
 *
 * Threat model: a database read (leaked backup, SQLi, rogue admin) must NOT
 * yield usable tokens. We therefore follow the same pattern as password storage:
 *  - Generate a high-entropy random token (256 bits) — this raw value is the
 *    ONLY copy ever sent to the user (inside the email link).
 *  - Persist only the SHA-256 hash of the token.
 *  - On redemption, hash the incoming token and look it up by hash.
 *
 * SHA-256 (not bcrypt) is correct here: the input already has full entropy, so
 * there is nothing to brute-force — we just need a fast one-way fingerprint.
 */
import { randomBytes, createHash, timingSafeEqual } from 'crypto'
import { TOKEN_BYTES } from '@/lib/auth/constants'

/** Generate a URL-safe random token (hex). Return the raw value to the caller. */
export function generateToken(): string {
  return randomBytes(TOKEN_BYTES).toString('hex')
}

/** Deterministic one-way hash of a token, for storage and lookup. */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

/**
 * Constant-time comparison of two token hashes. Lookups are normally done by
 * indexed hash equality, but where an in-memory compare is needed this avoids
 * leaking match progress through timing.
 */
export function safeEqualHashes(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}
