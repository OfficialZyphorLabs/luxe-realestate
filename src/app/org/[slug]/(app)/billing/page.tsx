/**
 * Billing — current plan, usage against plan limits, and self-serve Stripe
 * management (Phase 5). Admin-only (billing:manage). Change-plan opens Stripe
 * Checkout; "Manage subscription" opens the Customer Portal (see BillingActions).
 * A post-checkout banner reflects the ?checkout= result.
 */
import { notFound } from 'next/navigation'
import { requireOrgAccess } from '@/lib/auth/session'
import { getOrgBySlug, PLAN_LABELS, PLAN_PRICES, PLAN_LIMITS } from '@/lib/data/dashboard'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { PlanUsageMeter } from '@/components/dashboard/PlanUsageMeter'
import { BillingActions } from '@/components/dashboard/org/BillingActions'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Plan } from '@/generated/prisma'

const PLAN_ORDER: Plan[] = ['STARTER', 'GROWTH', 'ENTERPRISE']
const PLAN_FEATURES: Record<Plan, string[]> = {
  STARTER: ['Up to 5 members', 'Up to 20 listings', 'Basic lead management', 'Email support'],
  GROWTH: ['Up to 20 members', 'Up to 100 listings', 'Custom domain', 'Advanced analytics'],
  ENTERPRISE: ['Unlimited members', 'Unlimited listings', 'CRM + export', 'Dedicated support'],
}

export default async function OrgBillingPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ checkout?: string }>
}) {
  const { slug } = await params
  const { checkout } = await searchParams
  await requireOrgAccess(slug, 'billing:manage')
  const org = await getOrgBySlug(slug)
  if (!org) notFound()

  const plan = org.plan
  const limits = PLAN_LIMITS[plan]
  const sub = org.subscription

  return (
    <>
      <PageHeader
        title="Billing"
        description="Your plan, usage, and limits."
        actions={<BillingActions slug={slug} currentPlan={plan} />}
      />

      {checkout === 'success' && (
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-primary/10 px-4 py-3 font-body text-body-md text-primary">
          <span className="material-symbols-outlined text-[20px]" aria-hidden="true">check_circle</span>
          Payment received — your plan will update momentarily.
        </div>
      )}
      {checkout === 'cancelled' && (
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-surface-container px-4 py-3 font-body text-body-md text-secondary">
          <span className="material-symbols-outlined text-[20px]" aria-hidden="true">info</span>
          Checkout was cancelled — no changes were made.
        </div>
      )}

      {/* Current plan */}
      <div className="rounded-2xl bg-primary p-6 text-on-primary md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-body text-label-md uppercase tracking-widest text-on-primary/60">
              Current plan
            </p>
            <p className="mt-1 font-display text-display-lg font-bold">{PLAN_LABELS[plan]}</p>
            <p className="font-body text-body-md text-on-primary/70">
              {PLAN_PRICES[plan]}
              {plan !== 'ENTERPRISE' && <span className="text-on-primary/50"> / month</span>}
            </p>
          </div>
          {sub && (
            <div className="text-right">
              <StatusBadge status={sub.status} />
              {sub.currentPeriodEnd && (
                <p className="mt-2 font-body text-caption text-on-primary/60">
                  {sub.status === 'TRIALING' ? 'Trial ends' : 'Renews'}{' '}
                  {formatDate(sub.currentPeriodEnd)}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="rounded-xl bg-on-primary/10 p-4">
            <PlanUsageMeter
              label="Members"
              icon="group"
              used={org._count.memberships}
              limit={limits.members}
              className="[&_*]:text-on-primary"
            />
          </div>
          <div className="rounded-xl bg-on-primary/10 p-4">
            <PlanUsageMeter
              label="Listings"
              icon="home_work"
              used={org._count.properties}
              limit={limits.listings}
              className="[&_*]:text-on-primary"
            />
          </div>
        </div>
      </div>

      {/* Plan comparison */}
      <h2 className="mb-4 mt-10 font-display text-headline-md font-semibold text-primary">Plans</h2>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {PLAN_ORDER.map((p) => {
          const current = p === plan
          return (
            <div
              key={p}
              className={cn(
                'flex flex-col rounded-2xl border bg-surface-container-lowest p-6',
                current ? 'border-primary ring-1 ring-primary' : 'border-outline-variant/30'
              )}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-headline-md font-semibold text-primary">
                  {PLAN_LABELS[p]}
                </h3>
                {current && (
                  <span className="rounded-full bg-primary px-2.5 py-0.5 font-body text-caption font-semibold uppercase tracking-wider text-on-primary">
                    Current
                  </span>
                )}
              </div>
              <p className="mt-2 font-display text-headline-lg font-semibold text-primary">
                {PLAN_PRICES[p]}
                {p !== 'ENTERPRISE' && (
                  <span className="font-body text-body-md text-secondary"> / mo</span>
                )}
              </p>
              <ul className="mt-4 flex flex-1 flex-col gap-2">
                {PLAN_FEATURES[p].map((f) => (
                  <li key={f} className="flex items-center gap-2 font-body text-body-md text-secondary">
                    <span className="material-symbols-outlined text-[18px] text-primary" aria-hidden="true">
                      check
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
      <p className="mt-6 font-body text-body-md text-secondary">
        Use <span className="font-semibold text-on-surface">Change plan</span> to upgrade via Stripe
        Checkout, or <span className="font-semibold text-on-surface">Manage subscription</span> to update
        payment details, download invoices, or cancel.
      </p>
    </>
  )
}
