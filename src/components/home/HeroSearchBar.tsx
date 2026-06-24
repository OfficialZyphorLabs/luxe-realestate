'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Select } from '@/components/ui/Select'

const LOCATION_OPTIONS = [
  { value: '', label: 'Any Location' },
  { value: 'beverly-hills', label: 'Beverly Hills, CA' },
  { value: 'malibu', label: 'Malibu, CA' },
  { value: 'new-york', label: 'New York, NY' },
  { value: 'miami', label: 'Miami, FL' },
]

const TYPE_OPTIONS = [
  { value: '', label: 'Property Type' },
  { value: 'luxury-villa', label: 'Luxury Villa' },
  { value: 'penthouse', label: 'Penthouse' },
  { value: 'estate', label: 'Estate' },
]

const BEDS_OPTIONS = [
  { value: '', label: 'Any Beds' },
  { value: '2', label: '2+ Beds' },
  { value: '3', label: '3+ Beds' },
  { value: '4', label: '4+ Beds' },
  { value: '5', label: '5+ Beds' },
]

export function HeroSearchBar() {
  const router = useRouter()
  const [location, setLocation] = useState('')
  const [type, setType] = useState('')
  const [beds, setBeds] = useState('')

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (location) params.set('location', location)
    if (type) params.set('type', type)
    if (beds) params.set('beds', beds)
    router.push(`/properties?${params.toString()}`)
  }

  return (
    <div className="glass-effect rounded-2xl shadow-xl p-2 max-w-3xl w-full mx-auto">
      <div className="flex flex-col sm:flex-row items-stretch">
        <div className="flex flex-1 flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-outline-variant/30">
          <Select
            variant="ghost"
            icon="location_on"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            options={LOCATION_OPTIONS}
            aria-label="Search by location"
            className="flex-1"
          />
          <Select
            variant="ghost"
            icon="home"
            value={type}
            onChange={(e) => setType(e.target.value)}
            options={TYPE_OPTIONS}
            aria-label="Search by property type"
            className="flex-1"
          />
          <Select
            variant="ghost"
            icon="bed"
            value={beds}
            onChange={(e) => setBeds(e.target.value)}
            options={BEDS_OPTIONS}
            aria-label="Search by bedrooms"
            className="flex-1"
          />
        </div>

        <button
          onClick={handleSearch}
          className="bg-primary text-on-primary px-6 py-3 rounded-xl font-body text-label-md font-semibold flex items-center gap-2 hover:opacity-90 transition-standard active:scale-95 mt-2 sm:mt-0 sm:ml-2"
        >
          <span className="material-symbols-outlined text-[18px]">search</span>
          Search
        </button>
      </div>
    </div>
  )
}
