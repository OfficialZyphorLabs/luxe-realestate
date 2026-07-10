'use client'

/**
 * PublicCatalogFilters — buyer-facing search/filter bar on the public catalog.
 * URL-driven (a form that writes q/type/beds/min/max to the querystring on
 * Apply) so results stay server-rendered and the filtered view is shareable.
 */
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { Select } from '@/components/ui/Select'
import { PROPERTY_TYPES, PROPERTY_TYPE_LABELS } from '@/lib/validations/property'

const TYPE_OPTIONS = [
  { value: 'all', label: 'Any type' },
  ...PROPERTY_TYPES.map((t) => ({ value: t, label: PROPERTY_TYPE_LABELS[t] })),
]
const BEDS_OPTIONS = [
  { value: 'all', label: 'Any beds' },
  { value: '1', label: '1+ beds' },
  { value: '2', label: '2+ beds' },
  { value: '3', label: '3+ beds' },
  { value: '4', label: '4+ beds' },
  { value: '5', label: '5+ beds' },
]

export function PublicCatalogFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  const [q, setQ] = useState(params.get('q') ?? '')
  const [type, setType] = useState(params.get('type') ?? 'all')
  const [beds, setBeds] = useState(params.get('beds') ?? 'all')
  const [min, setMin] = useState(params.get('min') ?? '')
  const [max, setMax] = useState(params.get('max') ?? '')

  function apply(e: React.FormEvent) {
    e.preventDefault()
    const next = new URLSearchParams()
    if (q.trim()) next.set('q', q.trim())
    if (type !== 'all') next.set('type', type)
    if (beds !== 'all') next.set('beds', beds)
    if (min.trim()) next.set('min', min.trim())
    if (max.trim()) next.set('max', max.trim())
    const qs = next.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname)
  }

  function reset() {
    setQ('')
    setType('all')
    setBeds('all')
    setMin('')
    setMax('')
    router.replace(pathname)
  }

  const priceClass =
    'w-full rounded-lg border border-outline-variant/50 bg-surface-container-low px-4 py-3 font-body text-body-md text-on-surface transition-standard placeholder:text-secondary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'

  return (
    <form
      onSubmit={apply}
      className="mb-8 grid grid-cols-1 gap-3 rounded-2xl bg-surface-container-low p-4 md:grid-cols-[1.5fr_1fr_1fr_1fr_1fr_auto]"
    >
      <div className="relative">
        <span
          className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-secondary"
          aria-hidden="true"
        >
          search
        </span>
        <input
          type="search"
          aria-label="Search listings"
          placeholder="City, address, or name"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className={`${priceClass} pl-10`}
        />
      </div>
      <Select aria-label="Property type" options={TYPE_OPTIONS} value={type} onChange={setType} />
      <Select aria-label="Bedrooms" options={BEDS_OPTIONS} value={beds} onChange={setBeds} />
      <input
        type="number"
        min={0}
        aria-label="Minimum price"
        placeholder="Min $"
        value={min}
        onChange={(e) => setMin(e.target.value)}
        className={priceClass}
      />
      <input
        type="number"
        min={0}
        aria-label="Maximum price"
        placeholder="Max $"
        value={max}
        onChange={(e) => setMax(e.target.value)}
        className={priceClass}
      />
      <div className="flex items-center gap-2">
        <button
          type="submit"
          className="flex-1 rounded-lg bg-primary px-5 py-3 font-body text-label-md font-semibold text-on-primary transition-standard hover:opacity-90 active:scale-95 md:flex-none"
        >
          Search
        </button>
        <button
          type="button"
          onClick={reset}
          aria-label="Reset filters"
          className="rounded-lg px-3 py-3 font-body text-label-md font-semibold text-secondary transition-colors hover:text-primary"
        >
          Reset
        </button>
      </div>
    </form>
  )
}
