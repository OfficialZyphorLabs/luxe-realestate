import { cn } from '@/lib/utils'

/**
 * BarChart — a tiny, dependency-free vertical bar chart (CSS, GPU-friendly).
 * Heights are proportional to the max value; an all-zero series renders flat.
 * Presentational and server-renderable.
 */
interface BarChartProps {
  data: { label: string; value: number }[]
  className?: string
}

export function BarChart({ data, className }: BarChartProps) {
  const max = Math.max(1, ...data.map((d) => d.value))

  return (
    <div className={cn('flex h-48 items-end gap-3', className)} role="img" aria-label="Bar chart">
      {data.map((d) => (
        <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
          <span className="font-body text-caption font-semibold text-on-surface">{d.value}</span>
          <div className="flex w-full flex-1 items-end">
            <div
              className="w-full rounded-t-md bg-primary/80 transition-all"
              style={{ height: `${Math.max(2, (d.value / max) * 100)}%` }}
            />
          </div>
          <span className="font-body text-caption text-secondary">{d.label}</span>
        </div>
      ))}
    </div>
  )
}
