import { cn } from '@/lib/utils'

/**
 * RoleBadge — a pill for a user's role (SUPERADMIN / ADMIN / MEMBER).
 * Colors stay within the Heritage & Horizon palette (DESIGN.md §2).
 */
type Role = 'SUPERADMIN' | 'ADMIN' | 'MEMBER'

interface RoleBadgeProps {
  role: Role
  className?: string
}

const ROLE_STYLES: Record<Role, string> = {
  SUPERADMIN: 'bg-primary text-on-primary',
  ADMIN: 'bg-tertiary-fixed text-on-tertiary-fixed',
  MEMBER: 'bg-surface-variant text-on-surface-variant',
}

const ROLE_LABELS: Record<Role, string> = {
  SUPERADMIN: 'Super Admin',
  ADMIN: 'Admin',
  MEMBER: 'Member',
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 font-body text-caption font-semibold uppercase tracking-wider',
        ROLE_STYLES[role],
        className
      )}
    >
      {ROLE_LABELS[role]}
    </span>
  )
}
