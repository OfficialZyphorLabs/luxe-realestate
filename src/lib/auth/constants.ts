/**
 * constants.ts — Centralized, security-relevant constants for the auth system.
 *
 * Keeping these in one place avoids magic numbers scattered across routes and
 * makes the security posture (token lifetimes, hashing cost, lockout windows)
 * auditable at a glance.
 */

/** bcrypt cost factor. 12 ≈ ~250ms/hash on commodity hardware — a deliberate
 *  brute-force speed bump. Raise as hardware improves. */
export const BCRYPT_COST = 12

/** Invitation links expire after 48h (SAAS_ARCHITECTURE.md §4, Flow 2). */
export const INVITATION_TTL_MS = 48 * 60 * 60 * 1000

/** Password-reset links are short-lived to shrink the theft window. */
export const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000 // 1 hour

/** Free-trial length granted to every newly registered organization. */
export const TRIAL_PERIOD_MS = 14 * 24 * 60 * 60 * 1000 // 14 days

/** Raw token byte length before hex-encoding (32 bytes → 64 hex chars → 256 bits). */
export const TOKEN_BYTES = 32

/** Password policy — enforced identically on client and server via Zod. */
export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 100

/** Org slug policy. */
export const SLUG_MIN_LENGTH = 3
export const SLUG_MAX_LENGTH = 48

/** Reserved slugs that must never be claimed by a tenant — they collide with
 *  first-class platform routes or are confusing/abusable. */
export const RESERVED_SLUGS = new Set([
  'org',
  'superadmin',
  'admin',
  'api',
  'auth',
  'login',
  'register',
  'invite',
  'forgot-password',
  'reset-password',
  'about',
  'contact',
  'properties',
  'settings',
  'billing',
  'dashboard',
  'www',
  'app',
  'mail',
  'static',
  'public',
  'assets',
])

/** Rate-limit budgets (requests / window) per sensitive endpoint. */
export const RATE_LIMITS = {
  /** Login + register: blunt credential-stuffing/brute-force. */
  auth: { limit: 10, windowSeconds: 60 },
  /** Password-reset requests: limit enumeration + email-bombing. */
  passwordReset: { limit: 5, windowSeconds: 60 * 15 },
  /** Member invitations per org. */
  invite: { limit: 20, windowSeconds: 60 * 60 },
} as const
