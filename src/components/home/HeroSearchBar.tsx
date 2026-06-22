'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

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

  const selectClass =
    'bg-transparent font-body text-body-md text-on-surface placeholder:text-secondary appearance-none cursor-pointer px-4 py-3 focus:outline-none flex-1 min-w-0'

  return (
    <div className="glass-effect rounded-2xl shadow-xl p-2 max-w-3xl w-full mx-auto">
      <div className="flex flex-col sm:flex-row items-stretch">
        <div className="flex flex-1 flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-outline-variant/30">
          <div className="flex items-center px-2">
            <span className="material-symbols-outlined text-[18px] text-secondary shrink-0">location_on</span>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={selectClass}
              aria-label="Search by location"
            >
              {LOCATION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center px-2">
            <span className="material-symbols-outlined text-[18px] text-secondary shrink-0">home</span>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className={selectClass}
              aria-label="Search by property type"
            >
              {TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center px-2">
            <span className="material-symbols-outlined text-[18px] text-secondary shrink-0">bed</span>
            <select
              value={beds}
              onChange={(e) => setBeds(e.target.value)}
              className={selectClass}
              aria-label="Search by bedrooms"
            >
              {BEDS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
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
