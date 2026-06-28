'use client'

/**
 * TableSearch — a debounced search box that drives a single URL query param,
 * keeping the list server-rendered. Reused across SuperAdmin list pages.
 */
import { useRef } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

export function TableSearch({
  placeholder = 'Search…',
  paramKey = 'query',
}: {
  placeholder?: string
  paramKey?: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  return (
    <div className="relative mb-6 max-w-md">
      <span
        className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-secondary"
        aria-hidden="true"
      >
        search
      </span>
      <input
        type="search"
        aria-label={placeholder}
        placeholder={placeholder}
        defaultValue={params.get(paramKey) ?? ''}
        onChange={(e) => {
          const v = e.target.value
          if (debounce.current) clearTimeout(debounce.current)
          debounce.current = setTimeout(() => {
            const next = new URLSearchParams(params.toString())
            if (v) next.set(paramKey, v)
            else next.delete(paramKey)
            router.replace(`${pathname}?${next.toString()}`)
          }, 300)
        }}
        className="w-full rounded-lg border border-outline-variant/50 bg-surface-container-low px-4 py-2.5 pl-10 font-body text-body-md text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      />
    </div>
  )
}
