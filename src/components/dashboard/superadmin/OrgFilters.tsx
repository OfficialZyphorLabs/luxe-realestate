'use client'

/**
 * OrgFilters — search + plan/status filters for the organizations list. Drives
 * state through the URL (router.replace) so results stay server-rendered and the
 * filtered view is shareable/bookmarkable. Search is debounced.
 */
import { useRef } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Select } from '@/components/ui/Select'

const PLAN_OPTIONS = [
  { value: 'all', label: 'All plans' },
  { value: 'STARTER', label: 'Starter' },
  { value: 'GROWTH', label: 'Growth' },
  { value: 'ENTERPRISE', label: 'Enterprise' },
]
const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'SUSPENDED', label: 'Suspended' },
  { value: 'DELETED', label: 'Deleted' },
]

export function OrgFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString())
    if (value && value !== 'all') next.set(key, value)
    else next.delete(key)
    router.replace(`${pathname}?${next.toString()}`)
  }

  return (
    <div className="mb-6 flex flex-col gap-3 rounded-xl bg-surface-container-low p-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <span
          className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-secondary"
          aria-hidden="true"
        >
          search
        </span>
        <input
          type="search"
          aria-label="Search organizations"
          placeholder="Search by name or slug"
          defaultValue={params.get('query') ?? ''}
          onChange={(e) => {
            const v = e.target.value
            if (debounce.current) clearTimeout(debounce.current)
            debounce.current = setTimeout(() => setParam('query', v), 300)
          }}
          className="w-full rounded-lg border border-outline-variant/50 bg-surface px-4 py-2.5 pl-10 font-body text-body-md text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
      <div className="sm:w-44">
        <Select
          aria-label="Filter by plan"
          options={PLAN_OPTIONS}
          value={params.get('plan') ?? 'all'}
          onChange={(v) => setParam('plan', v)}
        />
      </div>
      <div className="sm:w-44">
        <Select
          aria-label="Filter by status"
          options={STATUS_OPTIONS}
          value={params.get('status') ?? 'all'}
          onChange={(v) => setParam('status', v)}
        />
      </div>
    </div>
  )
}
