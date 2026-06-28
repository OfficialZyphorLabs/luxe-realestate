import { cn } from '@/lib/utils'

/**
 * StatusBadge — a tone-mapped pill for entity statuses (org status, subscription
 * status, property status, lead status). Unknown statuses fall back to neutral.
 * Tones use only DESIGN palette tokens (no green exists in the system — "positive"
 * reads as navy, "warning" as warm sand, "danger" as the error red).
 */
type Tone = 'positive' | 'warning' | 'danger' | 'neutral'

interface StatusBadgeProps {
  status: string
  /** Override the auto-mapped tone. */
  tone?: Tone
  className?: string
}

const TONE_STYLES: Record<Tone, string> = {
  positive: 'bg-primary/10 text-primary',
  warning: 'bg-tertiary-fixed text-on-tertiary-fixed',
  danger: 'bg-error-container text-on-error-container',
  neutral: 'bg-surface-variant text-on-surface-variant',
}

/** Map well-known status values across the schema to a tone. */
const STATUS_TONES: Record<string, Tone> = {
  // Org / subscription
  ACTIVE: 'positive',
  TRIALING: 'warning',
  PAST_DUE: 'danger',
  SUSPENDED: 'danger',
  CANCELED: 'danger',
  INCOMPLETE: 'warning',
  DELETED: 'danger',
  // Property
  DRAFT: 'neutral',
  SOLD: 'positive',
  WITHDRAWN: 'neutral',
  // Lead
  NEW: 'warning',
  CONTACTED: 'neutral',
  QUALIFIED: 'positive',
  CLOSED_WON: 'positive',
  CLOSED_LOST: 'danger',
}

/** Title-case a SCREAMING_SNAKE status for display ("PAST_DUE" → "Past Due"). */
function humanize(status: string): string {
  return status
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export function StatusBadge({ status, tone, className }: StatusBadgeProps) {
  const resolved = tone ?? STATUS_TONES[status] ?? 'neutral'
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 font-body text-caption font-semibold uppercase tracking-wider',
        TONE_STYLES[resolved],
        className
      )}
    >
      {humanize(status)}
    </span>
  )
}
