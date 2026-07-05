'use server'

/**
 * billing.ts — Server Actions for self-serve Stripe billing (Phase 5).
 *
 * Consistent with the codebase's Server-Actions-first approach: the client
 * calls these, gets back a Stripe-hosted URL, and redirects to it. Each action
 * re-authorizes billing:manage (admin), degrades gracefully when Stripe isn't
 * configured, and lazily provisions a real Stripe customer the first time an
 * org needs one (registration seeds only a placeholder id).
 */
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { can } from '@/lib/permissions'
import { logAction } from '@/lib/audit'
import { getStripe } from '@/lib/billing/stripe'
import { PLAN_PRICE_IDS } from '@/lib/billing/plans'
import { getOrgBySlug } from '@/lib/data/dashboard'
import { getBaseUrl } from '@/lib/email/client'
import type { Stripe } from 'stripe'
import type { Session } from 'next-auth'
import type { Plan } from '@/generated/prisma'

export type BillingResult = { ok: true; url: string } | { ok: false; error: string }

type OrgRecord = NonNullable<Awaited<ReturnType<typeof getOrgBySlug>>>
type BillingContext =
  | { ok: false; error: string }
  | { ok: true; session: Session; stripe: Stripe; org: OrgRecord; customerId: string }

/** Placeholder customer ids seeded at registration / by the seed script. */
function isPlaceholderCustomer(id: string | undefined | null): boolean {
  return !id || id.startsWith('pending_') || id.startsWith('cus_seed_')
}

/**
 * Resolve the org (billing:manage-gated) and return its Stripe customer id,
 * creating a real Stripe customer on first use. Returns an error string on any
 * misconfiguration so callers can surface it.
 */
async function resolveBillingContext(slug: string): Promise<BillingContext> {
  const session = await auth()
  if (!session?.user) return { ok: false, error: 'You must be signed in.' }
  if (!can(session, 'billing:manage', slug)) return { ok: false, error: 'You do not have permission.' }

  const stripe = getStripe()
  if (!stripe) return { ok: false, error: 'Billing is not configured yet. Please contact support.' }

  const org = await getOrgBySlug(slug)
  if (!org) return { ok: false, error: 'Organization not found.' }

  // Ensure a real Stripe customer exists (registration seeds a placeholder).
  let customerId = org.subscription?.stripeCustomerId
  if (isPlaceholderCustomer(customerId)) {
    const customer = await stripe.customers.create({
      name: org.name,
      metadata: { orgId: org.id, orgSlug: slug },
    })
    customerId = customer.id
    await prisma.subscription.update({
      where: { organizationId: org.id },
      data: { stripeCustomerId: customerId },
    })
  }

  return { ok: true, session, stripe, org, customerId: customerId! }
}

/**
 * Create a Stripe Checkout session to subscribe/upgrade to `plan`. Returns the
 * hosted checkout URL for the client to redirect to.
 */
export async function createCheckoutSession(slug: string, plan: Plan): Promise<BillingResult> {
  const ctx = await resolveBillingContext(slug)
  if (!ctx.ok) return { ok: false, error: ctx.error }

  const priceId = PLAN_PRICE_IDS[plan]
  if (!priceId) return { ok: false, error: 'That plan is not available for self-serve checkout.' }

  const baseUrl = getBaseUrl()
  const checkout = await ctx.stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: ctx.customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${baseUrl}/org/${slug}/billing?checkout=success`,
    cancel_url: `${baseUrl}/org/${slug}/billing?checkout=cancelled`,
    // Echo the tenant + target plan so the webhook can reconcile our records.
    metadata: { orgId: ctx.org.id, plan },
    subscription_data: { metadata: { orgId: ctx.org.id, plan } },
  })

  if (!checkout.url) return { ok: false, error: 'Could not start checkout. Please try again.' }

  await logAction({
    actorId: ctx.session.user.id,
    actorType: 'USER',
    organizationId: ctx.org.id,
    action: 'billing.checkout_started',
    targetType: 'Organization',
    targetId: ctx.org.id,
    metadata: { plan },
  })

  return { ok: true, url: checkout.url }
}
