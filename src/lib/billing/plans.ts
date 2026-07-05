/**
 * plans.ts — Billing plan configuration for Stripe.
 *
 * Maps each app Plan to its Stripe Price ID (from env) and the reverse, which
 * the webhook uses to translate a subscription's price back into our Plan. Plan
 * *limits* and display labels/prices remain in `lib/data/dashboard.ts` (the
 * single source shared by the dashboards); this file is billing-specific.
 */
import type { Plan } from '@/generated/prisma'

/**
 * Stripe Price IDs per plan, read from env. ENTERPRISE is sales-led (no
 * self-serve price). Undefined values mean that plan isn't purchasable yet.
 */
export const PLAN_PRICE_IDS: Record<Plan, string | undefined> = {
  STARTER: process.env.STRIPE_PRICE_STARTER,
  GROWTH: process.env.STRIPE_PRICE_GROWTH,
  ENTERPRISE: undefined,
}

/** Plans a customer can self-serve checkout/upgrade to (have a Stripe price). */
export const SELF_SERVE_PLANS: Plan[] = ['STARTER', 'GROWTH']

/** Is this plan purchasable via self-serve checkout (has a configured price)? */
export function isPurchasable(plan: Plan): boolean {
  return Boolean(PLAN_PRICE_IDS[plan])
}

/**
 * Reverse-lookup: given a Stripe Price ID (from a subscription), return the app
 * Plan it corresponds to, or null if unrecognized (e.g. a legacy/custom price).
 */
export function planForPriceId(priceId: string | null | undefined): Plan | null {
  if (!priceId) return null
  const entry = (Object.entries(PLAN_PRICE_IDS) as [Plan, string | undefined][]).find(
    ([, id]) => id === priceId
  )
  return entry ? entry[0] : null
}
