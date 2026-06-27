'use client'

/**
 * AgentDirectory.tsx — Searchable, region-filterable advisor roster.
 *
 * Client component (holds filter state) that reuses the shared AgentCard for
 * visual consistency with the About teaser. Filtering is in-memory over the
 * static roster; an empty result shows a graceful EmptyState. Layout follows the
 * filter-bar + responsive grid pattern from DESIGN.md §8.3 / §14 (Properties).
 */
import { useMemo, useState } from 'react'
import { AgentCard } from '@/components/about/AgentCard'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { AGENTS, AGENT_REGIONS } from '@/lib/data/agents'

const REGION_OPTIONS = [
  { value: 'all', label: 'All Regions' },
  ...AGENT_REGIONS.map((r) => ({ value: r, label: r })),
]

export function AgentDirectory() {
  const [query, setQuery] = useState('')
  const [region, setRegion] = useState('all')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return AGENTS.filter((agent) => {
      const matchesRegion = region === 'all' || agent.region === region
      const matchesQuery =
        !q ||
        agent.name.toLowerCase().includes(q) ||
        agent.specialty.toLowerCase().includes(q) ||
        agent.role.toLowerCase().includes(q)
      return matchesRegion && matchesQuery
    })
  }, [query, region])

  return (
    <section className="py-stack-lg">
      <div className="page-container">
        {/* Filter bar */}
        <div className="bg-surface-container-low rounded-xl p-4 flex flex-col gap-4 md:flex-row md:items-center mb-stack-md">
          <div className="relative flex-1">
            <span
              className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-secondary pointer-events-none"
              aria-hidden="true"
            >
              search
            </span>
            <Input
              id="agent-search"
              aria-label="Search advisors by name or specialty"
              placeholder="Search by name, specialty, or role"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-11"
            />
          </div>
          <div className="md:w-56">
            <Select
              aria-label="Filter by region"
              options={REGION_OPTIONS}
              value={region}
              onChange={setRegion}
            />
          </div>
        </div>

        {/* Result count */}
        <p className="font-body text-body-md text-secondary mb-8" aria-live="polite">
          {filtered.length} {filtered.length === 1 ? 'advisor' : 'advisors'}
          {region !== 'all' && ` in ${region}`}
        </p>

        {/* Grid or empty state */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center text-center gap-3 py-16">
            <span className="material-symbols-outlined text-[40px] text-secondary" aria-hidden="true">
              person_search
            </span>
            <h3 className="font-display text-headline-md font-semibold text-primary">
              No advisors found
            </h3>
            <p className="font-body text-body-md text-secondary max-w-sm">
              Try a different search term or region. Our full team spans every major luxury market.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
