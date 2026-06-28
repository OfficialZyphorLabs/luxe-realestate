/**
 * format.ts — Small, dependency-free display formatters built on Intl.
 * Used across the dashboards for money, counts, and dates.
 */

/** "$4,750,000" — whole-dollar currency. */
export function formatCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value)
}

/** "$4.8M" — compact currency for tight stat tiles. */
export function formatCompactCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

/** "1.2K", "3.4M" — compact integer. */
export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(
    value
  )
}

/** "Jun 28, 2026" */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(d)
}

/** "2h ago", "3d ago", "just now" — coarse relative time. */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const seconds = Math.round((Date.now() - d.getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const rtf = new Intl.RelativeTimeFormat('en-US', { numeric: 'auto' })
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 31536000],
    ['month', 2592000],
    ['week', 604800],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ]
  for (const [unit, secondsPer] of units) {
    if (seconds >= secondsPer) return rtf.format(-Math.floor(seconds / secondsPer), unit)
  }
  return 'just now'
}

/** Initials from a name or email ("Marcus Reeves" → "MR", "a@b.com" → "A"). */
export function initials(nameOrEmail: string | null | undefined): string {
  if (!nameOrEmail) return '?'
  const source = nameOrEmail.includes('@') ? nameOrEmail.split('@')[0] : nameOrEmail
  const parts = source.trim().split(/[\s._-]+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
