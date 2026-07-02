'use client'

/**
 * LeadsViewToggle — switches the leads page between the Kanban board and a flat
 * list via a `view` URL param (default: board), keeping the page server-rendered.
 */
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'

const VIEWS = [
  { value: 'board', icon: 'view_kanban', label: 'Board view' },
  { value: 'list', icon: 'view_list', label: 'List view' },
] as const

export function LeadsViewToggle() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const current = params.get('view') === 'list' ? 'list' : 'board'

  function setView(view: string) {
    const next = new URLSearchParams(params.toString())
    if (view === 'board') next.delete('view')
    else next.set('view', view)
    router.replace(`${pathname}?${next.toString()}`)
  }

  return (
    <div
      className="inline-flex items-center gap-1 rounded-full border border-outline-variant/40 bg-surface-container-lowest p-1"
      role="group"
      aria-label="Change leads view"
    >
      {VIEWS.map((v) => {
        const active = current === v.value
        return (
          <button
            key={v.value}
            type="button"
            aria-label={v.label}
            aria-pressed={active}
            onClick={() => setView(v.value)}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full transition-colors',
              active ? 'bg-primary text-on-primary' : 'text-secondary hover:text-primary'
            )}
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
              {v.icon}
            </span>
          </button>
        )
      })}
    </div>
  )
}
