'use client'

/**
 * OnboardingChecklist — a first-run "get set up" card on the org dashboard.
 *
 * Shown to admins until every step is complete (the parent computes each step's
 * done-state from live data and passes it in). Guides the org to a populated,
 * branded, shareable public page in a few clicks — the activation path. The
 * "load sample listings" step calls a Server Action so an empty org can go live
 * instantly; everything else is a link into the relevant page.
 */
import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { loadSampleListings } from '@/lib/actions/onboarding'
import { cn } from '@/lib/utils'

interface OnboardingChecklistProps {
  slug: string
  hasListing: boolean
  hasBranding: boolean
  hasTeam: boolean
}

export function OnboardingChecklist({ slug, hasListing, hasBranding, hasTeam }: OnboardingChecklistProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function seed() {
    setError(null)
    startTransition(async () => {
      const res = await loadSampleListings(slug)
      if (res.ok) router.refresh()
      else setError(res.error)
    })
  }

  const done = [hasListing, hasBranding, hasTeam].filter(Boolean).length
  const total = 3

  return (
    <section className="mb-8 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-headline-md font-semibold text-primary">Get set up</h2>
          <p className="mt-1 font-body text-body-md text-secondary">
            A few steps to a polished, shareable presence. {done}/{total} done.
          </p>
        </div>
        <span className="hidden h-12 w-12 items-center justify-center rounded-xl bg-tertiary-fixed sm:flex">
          <span className="material-symbols-outlined text-[24px] text-on-tertiary-fixed" aria-hidden="true">
            rocket_launch
          </span>
        </span>
      </div>

      <ul className="mt-5 flex flex-col gap-3">
        <Step done={hasListing} label="Add your first listing" icon="home_work">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/org/${slug}/listings/new`}
              className="font-body text-label-md font-semibold text-primary hover:underline"
            >
              Create a listing
            </Link>
            {!hasListing && (
              <>
                <span className="text-secondary/50">·</span>
                <button
                  type="button"
                  onClick={seed}
                  disabled={pending}
                  className="inline-flex items-center gap-1.5 font-body text-label-md font-semibold text-primary hover:underline disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                    {pending ? 'progress_activity' : 'auto_awesome'}
                  </span>
                  {pending ? 'Adding samples…' : 'Load sample listings'}
                </button>
              </>
            )}
          </div>
          {error && <p className="mt-1 font-body text-caption text-error">{error}</p>}
        </Step>

        <Step done={hasBranding} label="Brand your public page" icon="palette">
          <Link
            href={`/org/${slug}/settings`}
            className="font-body text-label-md font-semibold text-primary hover:underline"
          >
            Add your logo & color
          </Link>
        </Step>

        <Step done={hasTeam} label="Invite your team" icon="group">
          <Link
            href={`/org/${slug}/members`}
            className="font-body text-label-md font-semibold text-primary hover:underline"
          >
            Invite teammates
          </Link>
        </Step>
      </ul>

      <div className="mt-5 border-t border-outline-variant/20 pt-4">
        <Link
          href={`/org/${slug}/public`}
          className="inline-flex items-center gap-1 font-body text-label-md font-semibold text-primary transition-all hover:gap-2"
        >
          Preview your public page
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
            arrow_forward
          </span>
        </Link>
      </div>
    </section>
  )
}

/** One checklist row: status dot + label + action(s). */
function Step({
  done,
  label,
  icon,
  children,
}: {
  done: boolean
  label: string
  icon: string
  children: React.ReactNode
}) {
  return (
    <li className="flex items-start gap-3">
      <span
        className={cn(
          'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
          done ? 'bg-primary text-on-primary' : 'bg-surface-container text-secondary'
        )}
      >
        <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
          {done ? 'check' : icon}
        </span>
      </span>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'font-body text-label-md font-semibold',
            done ? 'text-secondary line-through' : 'text-on-surface'
          )}
        >
          {label}
        </p>
        {!done && <div className="mt-0.5">{children}</div>}
      </div>
    </li>
  )
}
