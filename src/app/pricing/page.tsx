/**
 * Pricing — public SaaS pricing page. States who LuxeReal is for, the three
 * plans, and a clear "start free trial" CTA (GTM launch-checklist item).
 * Static marketing page under the site chrome.
 */
import Link from 'next/link'
import type { Metadata } from 'next'
import { PLAN_LABELS, PLAN_PRICES } from '@/lib/billing/plan-meta'
import { cn } from '@/lib/utils'
import type { Plan } from '@/generated/prisma'

export const metadata: Metadata = {
  title: 'Pricing — LuxeReal',
  description:
    'Simple plans for real-estate teams: a branded website, listings manager, and lead CRM in one subscription. Start a 14-day free trial.',
}

const PLAN_ORDER: Plan[] = ['STARTER', 'GROWTH', 'ENTERPRISE']

const PLAN_TAGLINE: Record<Plan, string> = {
  STARTER: 'For solo agents and small teams getting online.',
  GROWTH: 'For growing brokerages that need custom branding and analytics.',
  ENTERPRISE: 'For multi-office firms with bespoke needs.',
}

const PLAN_FEATURES: Record<Plan, string[]> = {
  STARTER: [
    'Up to 5 team members',
    'Up to 20 active listings',
    'Branded public catalog',
    'Lead capture + pipeline CRM',
    'Email support',
  ],
  GROWTH: [
    'Up to 20 team members',
    'Up to 100 active listings',
    'Custom domain white-labeling',
    'Advanced analytics',
    'AI listing descriptions',
    'Priority support',
  ],
  ENTERPRISE: [
    'Unlimited members & listings',
    'Dedicated success manager',
    'SSO & advanced security',
    'Custom integrations & API',
    'Onboarding & migration help',
  ],
}

export default function PricingPage() {
  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="page-container py-stack-lg text-center">
        <p className="font-body text-label-md uppercase tracking-widest text-on-primary-container">
          Pricing
        </p>
        <h1 className="mx-auto mt-2 max-w-3xl font-display text-display-lg font-bold leading-tight text-primary">
          One subscription. Your website, listings, and CRM.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl font-body text-body-lg text-secondary">
          LuxeReal replaces a custom website build and a separate CRM with one beautifully-branded
          platform. Every plan starts with a 14-day free trial — no credit card required.
        </p>
      </section>

      {/* Plans */}
      <section className="page-container pb-stack-lg">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {PLAN_ORDER.map((plan) => {
            const featured = plan === 'GROWTH'
            return (
              <div
                key={plan}
                className={cn(
                  'flex flex-col rounded-2xl border bg-surface-container-lowest p-8',
                  featured
                    ? 'border-primary shadow-[0px_10px_40px_rgba(0,0,0,0.08)] ring-1 ring-primary'
                    : 'border-outline-variant/30'
                )}
              >
                {featured && (
                  <span className="mb-4 inline-flex w-fit rounded-full bg-primary px-3 py-1 font-body text-caption font-semibold uppercase tracking-wider text-on-primary">
                    Most popular
                  </span>
                )}
                <h2 className="font-display text-headline-md font-semibold text-primary">
                  {PLAN_LABELS[plan]}
                </h2>
                <p className="mt-1 font-body text-body-md text-secondary">{PLAN_TAGLINE[plan]}</p>
                <p className="mt-6 font-display text-display-lg font-bold text-primary">
                  {PLAN_PRICES[plan]}
                  {plan !== 'ENTERPRISE' && (
                    <span className="font-body text-body-md font-normal text-secondary"> / month</span>
                  )}
                </p>

                <ul className="mt-6 flex flex-1 flex-col gap-3">
                  {PLAN_FEATURES[plan].map((feature) => (
                    <li key={feature} className="flex items-start gap-2 font-body text-body-md text-on-surface-variant">
                      <span className="material-symbols-outlined mt-0.5 text-[18px] text-primary" aria-hidden="true">
                        check
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan === 'ENTERPRISE' ? '/contact' : '/register'}
                  className={cn(
                    'mt-8 inline-flex items-center justify-center rounded-xl px-6 py-3 font-body text-label-md font-semibold transition-standard active:scale-95',
                    featured
                      ? 'bg-primary text-on-primary hover:opacity-90'
                      : 'border border-primary text-primary hover:bg-primary hover:text-on-primary'
                  )}
                >
                  {plan === 'ENTERPRISE' ? 'Contact sales' : 'Start free trial'}
                </Link>
              </div>
            )
          })}
        </div>

        <p className="mt-8 text-center font-body text-body-md text-secondary">
          Prices in USD. Annual billing available. Questions?{' '}
          <Link href="/contact" className="font-semibold text-primary hover:underline">
            Talk to us
          </Link>
          .
        </p>
      </section>
    </div>
  )
}
