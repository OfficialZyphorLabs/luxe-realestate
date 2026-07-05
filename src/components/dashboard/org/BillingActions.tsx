'use client'

/**
 * BillingActions — self-serve billing controls on the billing page.
 *
 * "Manage subscription" opens the Stripe Customer Portal; "Change plan" opens a
 * comparison modal whose per-plan buttons start Stripe Checkout. Both call the
 * billing Server Actions and redirect the browser to the returned Stripe URL.
 * When billing isn't configured the actions return a friendly error we surface.
 *
 * Only the static SELF_SERVE_PLANS list is used here (not the env-backed price
 * map, which is server-only) — the action re-validates the price server-side.
 */
import { useState } from 'react'
import { createCheckoutSession, createPortalSession } from '@/lib/actions/billing'
import { SELF_SERVE_PLANS } from '@/lib/billing/plans'
import { PLAN_LABELS, PLAN_PRICES } from '@/lib/billing/plan-meta'
import { Modal } from '@/components/dashboard/Modal'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import type { Plan } from '@/generated/prisma'

const PLAN_FEATURES: Record<Plan, string[]> = {
  STARTER: ['Up to 5 members', 'Up to 20 listings', 'Lead management', 'Email support'],
  GROWTH: ['Up to 20 members', 'Up to 100 listings', 'Custom domain', 'Advanced analytics'],
  ENTERPRISE: ['Unlimited members', 'Unlimited listings', 'CRM + export', 'Dedicated support'],
}

const DISPLAY_PLANS: Plan[] = ['STARTER', 'GROWTH', 'ENTERPRISE']

export function BillingActions({ slug, currentPlan }: { slug: string; currentPlan: Plan }) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function manage() {
    setBusy('portal')
    setError(null)
    const res = await createPortalSession(slug)
    if (res.ok) window.location.href = res.url
    else {
      setError(res.error)
      setBusy(null)
    }
  }

  async function choose(plan: Plan) {
    setBusy(plan)
    setError(null)
    const res = await createCheckoutSession(slug, plan)
    if (res.ok) window.location.href = res.url
    else {
      setError(res.error)
      setBusy(null)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="sm" onClick={() => setOpen(true)}>
        <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
          upgrade
        </span>
        Change plan
      </Button>
      <Button variant="secondary" size="sm" onClick={manage} disabled={busy === 'portal'}>
        {busy === 'portal' ? 'Opening…' : 'Manage subscription'}
      </Button>

      {error && (
        <p className="w-full rounded-lg bg-error-container/50 px-3 py-2 font-body text-caption text-on-error-container">
          {error}
        </p>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Choose your plan" size="md">
        <div className="flex flex-col gap-4">
          {DISPLAY_PLANS.map((plan) => {
            const current = plan === currentPlan
            const purchasable = SELF_SERVE_PLANS.includes(plan)
            return (
              <div
                key={plan}
                className={cn(
                  'flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between',
                  current ? 'border-primary ring-1 ring-primary' : 'border-outline-variant/30'
                )}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-headline-md font-semibold text-primary">
                      {PLAN_LABELS[plan]}
                    </h3>
                    <span className="font-body text-body-md text-secondary">
                      {PLAN_PRICES[plan]}
                      {plan !== 'ENTERPRISE' && <span className="text-secondary/70"> / mo</span>}
                    </span>
                  </div>
                  <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                    {PLAN_FEATURES[plan].map((f) => (
                      <li key={f} className="font-body text-caption text-secondary">
                        · {f}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="shrink-0">
                  {current ? (
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1.5 font-body text-caption font-semibold uppercase tracking-wider text-primary">
                      Current
                    </span>
                  ) : purchasable ? (
                    <Button size="sm" onClick={() => choose(plan)} disabled={busy === plan}>
                      {busy === plan ? 'Redirecting…' : 'Choose'}
                    </Button>
                  ) : (
                    <a
                      href="mailto:concierge@luxereal.com?subject=Enterprise%20plan%20enquiry"
                      className="inline-flex items-center gap-1 rounded-full border border-primary px-4 py-1.5 font-body text-sm font-semibold text-primary transition-standard hover:bg-primary hover:text-on-primary"
                    >
                      Contact sales
                    </a>
                  )}
                </div>
              </div>
            )
          })}
          {error && (
            <p className="rounded-lg bg-error-container/50 px-3 py-2 font-body text-caption text-on-error-container">
              {error}
            </p>
          )}
        </div>
      </Modal>
    </div>
  )
}
