'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
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

  const handleChange = (key: keyof FilterOptions) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters((prev) => ({ ...prev, [key]: e.target.value }))
  }

  const handleApply = () => {
    onFilter?.(filters)
  }

  const selectClass =
    'bg-surface border-0 font-body text-body-md text-on-surface appearance-none cursor-pointer px-3 py-2 flex-1 min-w-0 focus:outline-none'

  return (
    <div className="bg-surface-container-low rounded-xl p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
      <div className="flex flex-1 flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-outline-variant/30 bg-surface rounded-xl overflow-hidden shadow-sm">
        <select
          value={filters.location}
          onChange={handleChange('location')}
          className={selectClass}
          aria-label="Filter by location"
        >
          {LOCATION_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          value={filters.propertyType}
          onChange={handleChange('propertyType')}
          className={selectClass}
          aria-label="Filter by property type"
        >
          {PROPERTY_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          value={filters.beds}
          onChange={handleChange('beds')}
          className={selectClass}
          aria-label="Filter by bedrooms"
        >
          {BEDS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          value={filters.priceRange}
          onChange={handleChange('priceRange')}
          className={selectClass}
          aria-label="Filter by price range"
        >
          {PRICE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <Button onClick={handleApply} size="md" className="shrink-0 px-8">
        <span className="material-symbols-outlined text-[18px]">filter_list</span>
        Apply
      </Button>
    </div>
  )
}
