import Link from 'next/link'
import { cn } from '@/lib/utils'

/**
 * StatCard — icon + value + label, with an optional delta and link.
 * The headline dashboard metric tile (SAAS_TODOS Phase 3 "Shared UI").
 * Pure/presentational — safe in Server Components.
 */
interface StatCardProps {
  /** Material Symbols Outlined icon name. */
  icon: string
  label: string
  value: string | number
  /** Optional change indicator, e.g. "+8 this week". */
  delta?: string
  deltaTrend?: 'up' | 'down' | 'neutral'
  /** When set, the whole card becomes a link. */
  href?: string
  className?: string
}

export function StatCard({
  icon,
  label,
  value,
  delta,
  deltaTrend = 'neutral',
  href,
  className,
}: StatCardProps) {
  const body = (
    <>
      <div className="flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-tertiary-fixed">
          <span className="material-symbols-outlined text-[24px] text-on-tertiary-fixed" aria-hidden="true">
            {icon}
          </span>
        </div>
        {delta && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 font-body text-caption font-semibold',
              deltaTrend === 'up' && 'text-primary',
              deltaTrend === 'down' && 'text-error',
              deltaTrend === 'neutral' && 'text-secondary'
            )}
          >
            {deltaTrend !== 'neutral' && (
              <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                {deltaTrend === 'up' ? 'trending_up' : 'trending_down'}
              </span>
            )}
            {delta}
          </span>
        )}
      </div>
      <p className="mt-5 font-display text-headline-lg font-semibold text-primary">{value}</p>
      <p className="mt-1 font-body text-body-md text-secondary">{label}</p>
    </>
  )

  const base = cn(
    'block rounded-xl bg-surface-container-lowest p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.04)]',
    href &&
      'transition-all duration-300 hover:-translate-y-1 hover:shadow-[0px_10px_40px_rgba(0,0,0,0.08)]',
    className
  )

  return href ? (
    <Link href={href} className={base}>
      {body}
    </Link>
  ) : (
    <div className={base}>{body}</div>
  )
}
