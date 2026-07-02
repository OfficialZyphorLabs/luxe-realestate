'use client'

/**
 * AuditActionFilter — URL-driven select that auto-submits when the action
 * type changes. Updates the page's `action` searchParam without losing `query`.
 */
import { useRouter, useSearchParams } from 'next/navigation'

const FILTER_OPTIONS = [
  { value: 'all', label: 'All actions' },
  { value: 'member.invited', label: 'Member invited' },
  { value: 'member.role_changed', label: 'Role changed' },
  { value: 'member.removed', label: 'Member removed' },
  { value: 'org.suspended', label: 'Org suspended' },
  { value: 'org.reactivated', label: 'Org reactivated' },
  { value: 'org.deleted', label: 'Org deleted' },
  { value: 'org.plan_changed', label: 'Plan changed' },
  { value: 'user.superadmin_granted', label: 'SA granted' },
  { value: 'user.superadmin_revoked', label: 'SA revoked' },
  { value: 'impersonation.started', label: 'Impersonation' },
]

export function AuditActionFilter({ current }: { current: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString())
    if (e.target.value === 'all') {
      params.delete('action')
    } else {
      params.set('action', e.target.value)
    }
    router.replace(`?${params.toString()}`)
  }

  return (
    <select
      value={current}
      onChange={onChange}
      className="rounded-xl border border-outline-variant/30 bg-surface px-3 py-2 font-body text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
      aria-label="Filter by action type"
    >
      {FILTER_OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}
