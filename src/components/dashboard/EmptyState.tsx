import { cn } from '@/lib/utils'

/**
 * EmptyState — a centered icon + message for "no listings / no leads / no
 * members" situations, with an optional call-to-action slot.
 */
interface EmptyStateProps {
  /** Material Symbols Outlined icon name. */
  icon: string
  title: string
  description?: string
  /** Optional action node (e.g. a Button or Link). */
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-dashed border-outline-variant/40 bg-surface-container-lowest px-6 py-16 text-center',
        className
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-container">
        <span className="material-symbols-outlined text-[28px] text-secondary" aria-hidden="true">
          {icon}
        </span>
      </div>
      <h3 className="mt-4 font-display text-headline-md font-semibold text-primary">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm font-body text-body-md text-secondary">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
