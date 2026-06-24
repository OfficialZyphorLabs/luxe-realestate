'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import type { FilterOptions } from '@/types'

const LOCATION_OPTIONS = [
  { value: '', label: 'All Locations' },
  { value: 'beverly-hills', label: 'Beverly Hills, CA' },
  { value: 'malibu', label: 'Malibu, CA' },
  { value: 'new-york', label: 'New York, NY' },
  { value: 'miami', label: 'Miami, FL' },
  { value: 'aspen', label: 'Aspen, CO' },
]

const PROPERTY_TYPE_OPTIONS = [
  { value: '', label: 'Property Type' },
  { value: 'luxury-villa', label: 'Luxury Villa' },
  { value: 'penthouse', label: 'Penthouse' },
  { value: 'estate', label: 'Estate' },
  { value: 'waterfront', label: 'Waterfront' },
]

const BEDS_OPTIONS = [
  { value: '', label: 'Any Beds' },
  { value: '2', label: '2+ Beds' },
  { value: '3', label: '3+ Beds' },
  { value: '4', label: '4+ Beds' },
  { value: '5', label: '5+ Beds' },
]

const PRICE_OPTIONS = [
  { value: '', label: 'Price Range' },
  { value: '1m-3m', label: '$1M – $3M' },
  { value: '3m-5m', label: '$3M – $5M' },
  { value: '5m-10m', label: '$5M – $10M' },
  { value: '10m+', label: '$10M+' },
]

interface PropertyFilterBarProps {
  onFilter?: (filters: FilterOptions) => void
}

export function PropertyFilterBar({ onFilter }: PropertyFilterBarProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    location: '',
    propertyType: '',
    beds: '',
    priceRange: '',
  })

  const set = (key: keyof FilterOptions) => (value: string) =>
    setFilters((prev) => ({ ...prev, [key]: value }))

  return (
    <div className="bg-surface-container-low rounded-xl p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
      {/* overflow-hidden intentionally removed — keeps dropdown panels unclipped */}
      <div className="flex flex-1 flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-outline-variant/30 bg-surface rounded-xl shadow-sm">
        <Select
          variant="ghost"
          value={filters.location}
          onChange={set('location')}
          options={LOCATION_OPTIONS}
          aria-label="Filter by location"
          className="flex-1 min-w-0"
        />
        <Select
          variant="ghost"
          value={filters.propertyType}
          onChange={set('propertyType')}
          options={PROPERTY_TYPE_OPTIONS}
          aria-label="Filter by property type"
          className="flex-1 min-w-0"
        />
        <Select
          variant="ghost"
          value={filters.beds}
          onChange={set('beds')}
          options={BEDS_OPTIONS}
          aria-label="Filter by bedrooms"
          className="flex-1 min-w-0"
        />
        <Select
          variant="ghost"
          value={filters.priceRange}
          onChange={set('priceRange')}
          options={PRICE_OPTIONS}
          aria-label="Filter by price range"
          className="flex-1 min-w-0"
        />
      </div>

      <Button onClick={() => onFilter?.(filters)} size="md" className="shrink-0 px-8">
        <span className="material-symbols-outlined text-[18px]">filter_list</span>
        Apply
      </Button>
    </div>
  )
}
