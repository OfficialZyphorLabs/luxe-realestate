/**
 * route.ts — POST /api/webhooks/stripe
 *
 * Receives Stripe events and reconciles them into our Subscription/Organization
 * records (SAAS_ARCHITECTURE.md §Billing). The raw request body is required for
 * signature verification, so we read it with req.text() and never parse first.
 *
 * Handled events:
 *   - checkout.session.completed        → attach subscription, set plan/status
 *   - customer.subscription.updated     → sync plan/status/period/cancel flag
 *   - customer.subscription.deleted     → cancel + downgrade to Starter
 *   - invoice.payment_failed            → mark PAST_DUE
 *   - invoice.paid                      → mark ACTIVE
 *
 * Unknown events are acknowledged (200) so Stripe stops retrying. Failures in
 * our handling return 500 so Stripe retries with backoff.
 */
import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { getStripe, getWebhookSecret } from '@/lib/billing/stripe'
import { planForPriceId } from '@/lib/billing/plans'
import { logAction } from '@/lib/audit'
import type { Plan, SubscriptionStatus } from '@/generated/prisma'

/** Map a Stripe subscription status to our enum (defaults to INCOMPLETE). */
function mapStatus(stripeStatus: Stripe.Subscription.Status): SubscriptionStatus {
  switch (stripeStatus) {
    case 'active':
      return 'ACTIVE'
    case 'trialing':
      return 'TRIALING'
    case 'past_due':
    case 'unpaid':
      return 'PAST_DUE'
    case 'canceled':
    case 'incomplete_expired':
    case 'paused':
      return 'CANCELED'
    default:
      return 'INCOMPLETE'
  }
}

/** The subscription's current-period end (seconds → Date), if available. */
function periodEnd(sub: Stripe.Subscription): Date | null {
  const secs = sub.items?.data?.[0]?.current_period_end
  return typeof secs === 'number' ? new Date(secs * 1000) : null
}

/** Normalize Stripe's customer field (string id | expanded object) to an id. */
function customerId(sub: Stripe.Subscription): string {
  return typeof sub.customer === 'string' ? sub.customer : sub.customer.id
}

/** Resolve our org id for a subscription (metadata first, then customer lookup). */
async function resolveOrgId(sub: Stripe.Subscription): Promise<string | null> {
  if (sub.metadata?.orgId) return sub.metadata.orgId
  const record = await prisma.subscription.findFirst({
    where: { stripeCustomerId: customerId(sub) },
    select: { organizationId: true },
  })
  return record?.organizationId ?? null
}

/** Sync a Stripe subscription into our Subscription + Organization.plan. */
async function syncSubscription(sub: Stripe.Subscription): Promise<void> {
  const orgId = await resolveOrgId(sub)
  if (!orgId) {
    console.warn('[stripe] no org for subscription', sub.id)
    return
  }

  const priceId = sub.items?.data?.[0]?.price?.id
  const plan = planForPriceId(priceId)
  const status = mapStatus(sub.status)

  await prisma.subscription.updateMany({
    where: { organizationId: orgId },
    data: {
      stripeSubscriptionId: sub.id,
      status,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      currentPeriodEnd: periodEnd(sub),
      ...(plan ? { plan } : {}),
    },
  })
  // Keep the org's plan (used for limits + UI) in step with the subscription.
  if (plan) await prisma.organization.update({ where: { id: orgId }, data: { plan } })

  await logAction({
    actorId: 'stripe',
    actorType: 'SYSTEM',
    organizationId: orgId,
    action: 'billing.subscription_updated',
    targetType: 'Organization',
    targetId: orgId,
    metadata: { status, plan: plan ?? undefined },
  })
}

/** Mark an org's subscription with a status derived from an invoice event. */
async function setStatusForInvoice(invoice: Stripe.Invoice, status: SubscriptionStatus) {
  const cust = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id
  if (!cust) return
  await prisma.subscription.updateMany({ where: { stripeCustomerId: cust }, data: { status } })
}

export async function POST(req: Request) {
  const stripe = getStripe()
  const secret = getWebhookSecret()
  // Billing not configured — acknowledge so Stripe doesn't retry indefinitely.
  if (!stripe || !secret) {
    return NextResponse.json({ received: true, ignored: 'billing not configured' })
  }

  const signature = req.headers.get('stripe-signature')
  if (!signature) return NextResponse.json({ error: 'Missing signature' }, { status: 400 })

  const body = await req.text()
  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, secret)
  } catch (err) {
    console.error('[stripe] signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        if (session.subscription) {
          const subId =
            typeof session.subscription === 'string' ? session.subscription : session.subscription.id
          const sub = await stripe.subscriptions.retrieve(subId)
          await syncSubscription(sub)
        }
        break
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.created':
        await syncSubscription(event.data.object)
        break
      case 'customer.subscription.deleted': {
        const sub = event.data.object
        const orgId = await resolveOrgId(sub)
        if (orgId) {
          const downgrade: Plan = 'STARTER'
          await prisma.subscription.updateMany({
            where: { organizationId: orgId },
            data: { status: 'CANCELED', cancelAtPeriodEnd: false, plan: downgrade },
          })
          await prisma.organization.update({ where: { id: orgId }, data: { plan: downgrade } })
        }
        break
      }
      case 'invoice.payment_failed':
        await setStatusForInvoice(event.data.object, 'PAST_DUE')
        break
      case 'invoice.paid':
        await setStatusForInvoice(event.data.object, 'ACTIVE')
        break
      default:
        // Unhandled event types are acknowledged without action.
        break
    }
  } catch (err) {
    console.error(`[stripe] handler error for ${event.type}:`, err)
    return NextResponse.json({ error: 'Handler error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
