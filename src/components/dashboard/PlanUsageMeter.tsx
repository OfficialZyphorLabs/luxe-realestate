import { cn } from '@/lib/utils'
import { formatCompactNumber } from '@/lib/format'

/**
 * PlanUsageMeter — a labeled progress bar of "used / limit" against a plan cap
 * (listings, members). A null limit means unlimited (Enterprise) → no bar. The
 * fill warms to sand near the cap and to error red when at/over it.
 */
interface PlanUsageMeterProps {
  label: string
  used: number
  /** null = unlimited. */
  limit: number | null
  icon?: string
  className?: string
}

export function PlanUsageMeter({ label, used, limit, icon, className }: PlanUsageMeterProps) {
  const unlimited = limit === null
  const pct = unlimited ? 0 : Math.min(100, Math.round((used / Math.max(limit, 1)) * 100))
  const tone = pct >= 100 ? 'bg-error' : pct >= 80 ? 'bg-tertiary-fixed-dim' : 'bg-primary'

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-2 font-body text-label-md font-semibold text-on-surface">
          {icon && (
            <span className="material-symbols-outlined text-[18px] text-secondary" aria-hidden="true">
              {icon}
            </span>
          )}
          {label}
        </span>
        <span className="font-body text-body-md text-secondary">
          {unlimited ? (
            <span className="font-semibold text-primary">{formatCompactNumber(used)} · Unlimited</span>
          ) : (
            <>
              <span className="font-semibold text-on-surface">{formatCompactNumber(used)}</span> /{' '}
              {formatCompactNumber(limit)}
            </>
          )}
        </span>
      </div>
      {!unlimited && (
        <div
          className="h-2 w-full overflow-hidden rounded-full bg-surface-container"
          role="progressbar"
          aria-valuenow={used}
          aria-valuemin={0}
          aria-valuemax={limit}
          aria-label={label}
        >
          <div className={cn('h-full rounded-full transition-all', tone)} style={{ width: `${pct}%` }} />
        </div>
      )}
    </div>
  )
}
