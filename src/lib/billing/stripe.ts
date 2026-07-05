/**
 * stripe.ts — Stripe server client singleton with graceful degradation.
 *
 * Mirrors the rate-limiter's "optional dependency" pattern: when
 * STRIPE_SECRET_KEY is absent (local dev, or before billing is configured),
 * `getStripe()` returns null and callers surface a friendly "billing not
 * configured" message instead of crashing. Production MUST set the key.
 *
 * The API version is intentionally left to the account default so this file
 * doesn't need editing every time the pinned version string changes across
 * SDK upgrades.
 */
import Stripe from 'stripe'

let client: Stripe | null | undefined

/** The configured Stripe client, or null when no secret key is set. */
export function getStripe(): Stripe | null {
  if (client !== undefined) return client
  const key = process.env.STRIPE_SECRET_KEY
  client = key ? new Stripe(key) : null
  return client
}

/** True when Stripe is configured (a secret key is present). */
export function isBillingEnabled(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY)
}

/** Webhook signing secret (verifies incoming Stripe events). */
export function getWebhookSecret(): string | undefined {
  return process.env.STRIPE_WEBHOOK_SECRET
}
