/**
 * password.ts — Password hashing & verification (bcrypt) plus a strength meter.
 *
 * Security notes:
 *  - We never store or log plaintext passwords; only the bcrypt digest is persisted.
 *  - `verifyPassword` is always given a real bcrypt compare to run, even on the
 *    login path where the user may not exist — see `lib/auth/config.ts`, which
 *    compares against a dummy hash to keep response timing uniform and prevent
 *    user-enumeration via timing side-channels.
 *  - bcrypt has a 72-byte input limit; longer inputs are truncated by the algo.
 *    Our Zod policy caps length well below that, so no surprise truncation.
 */
import bcrypt from 'bcryptjs'
import { BCRYPT_COST } from '@/lib/auth/constants'

/** Hash a plaintext password for storage. */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_COST)
}

/** Constant-work comparison of a plaintext password against a stored hash. */
export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash)
}

/**
 * A precomputed bcrypt hash of a random string, used as a decoy in the login
 * flow so a missing user still incurs the same bcrypt cost as a real one.
 * (Generated once at module load — value is irrelevant, only its compare cost.)
 */
export const DUMMY_PASSWORD_HASH = bcrypt.hashSync('luxereal-decoy-password', BCRYPT_COST)

export interface PasswordStrength {
  /** 0 (empty) – 4 (strong). */
  score: number
  label: 'Very weak' | 'Weak' | 'Fair' | 'Good' | 'Strong'
}

/**
 * Lightweight heuristic strength estimate for the registration UI. This is a
 * UX hint only — the authoritative rules live in the Zod `password` schema.
 */
export function estimatePasswordStrength(password: string): PasswordStrength {
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++

  // Clamp into the 0–4 label range.
  score = Math.min(score, 4)
  const labels: PasswordStrength['label'][] = [
    'Very weak',
    'Weak',
    'Fair',
    'Good',
    'Strong',
  ]
  return { score, label: labels[score] }
}
