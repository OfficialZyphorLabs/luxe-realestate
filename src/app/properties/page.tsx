'use client'

import { useState } from 'react'
import { PropertyGrid } from '@/components/property/PropertyGrid'
import { PropertyFilterBar } from '@/components/property/PropertyFilterBar'
import { cn } from '@/lib/utils'
import type { Property, FilterOptions } from '@/types'

const ALL_PROPERTIES: Property[] = [
  {
    id: '1',
    slug: '742-evergreen-terrace',
    title: 'The Glass House',
    price: 4750000,
    address: '742 Evergreen Terrace, Beverly Hills, CA',
    city: 'Beverly Hills',
    state: 'CA',
    beds: 5,
    baths: 6,
    sqft: 7200,
    imageUrl:
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop&q=80',
    badges: ['For Sale', 'New Listing'],
  },
  {
    id: '2',
    slug: '150-coastal-bluff',
    title: 'The Coastal Retreat',
    price: 8500000,
    address: '150 Coastal Bluff Rd, Malibu, CA',
    city: 'Malibu',
    state: 'CA',
    beds: 4,
    baths: 5,
    sqft: 5800,
    imageUrl:
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=80',
    badges: ['For Sale'],
  },
  {
    id: '3',
    slug: '200-central-park-west',
    title: 'Skyline Penthouse',
    price: 11400000,
    address: '200 Central Park West, New York, NY',
    city: 'New York',
    state: 'NY',
    beds: 4,
    baths: 3,
    sqft: 3900,
    imageUrl:
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&auto=format&fit=crop&q=80',
    badges: ['For Sale'],
  },
  {
    id: '4',
    slug: '88-bel-air-road',
    title: 'Bel Air Estate',
    price: 3200000,
    address: '88 Bel Air Road, Los Angeles, CA',
    city: 'Los Angeles',
    state: 'CA',
    beds: 6,
    baths: 8,
    sqft: 9400,
    imageUrl:
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&auto=format&fit=crop&q=80',
    badges: ['For Sale'],
  },
  {
    id: '5',
    slug: '55-pacific-heights',
    title: 'Pacific Heights Villa',
    price: 6000000,
    address: '55 Pacific Heights Blvd, San Francisco, CA',
    city: 'San Francisco',
    state: 'CA',
    beds: 4,
    baths: 4,
    sqft: 5100,
    imageUrl:
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: '6',
    slug: '12-lake-shore',
    title: 'Lakefront Manor',
    price: 12100000,
    address: '12 Lake Shore Drive, Chicago, IL',
    city: 'Chicago',
    state: 'IL',
    beds: 5,
    baths: 5,
    sqft: 6300,
    imageUrl:
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&auto=format&fit=crop&q=80',
    badges: ['Price Reduced'],
  },
]

const ITEMS_PER_PAGE = 6

export default function PropertiesPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid')
  const [currentPage, setCurrentPage] = useState(1)
  const [filteredProperties] = useState<Property[]>(ALL_PROPERTIES)

  const totalPages = Math.ceil(filteredProperties.length / ITEMS_PER_PAGE)
  const paginatedProperties = filteredProperties.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const handleFilter = (_filters: FilterOptions) => {
    setCurrentPage(1)
  }

  return (
    <div className="pt-24 pb-stack-lg min-h-screen">
      <div className="page-container">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pt-8">
          <div>
            <span className="font-body text-label-md font-semibold uppercase tracking-widest text-on-primary-container">
              Browse
            </span>
            <h1 className="font-display text-display-lg font-bold text-primary mt-1">
              Exclusive Listings
            </h1>
            <p className="font-body text-body-md text-secondary mt-2">
              Architectural masterpieces in the world's most sought-after locations.
            </p>
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-2 bg-surface-container-low rounded-xl p-1 self-start sm:self-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-lg font-body text-label-md transition-standard',
                viewMode === 'grid'
                  ? 'bg-surface shadow-sm text-primary'
                  : 'text-secondary hover:text-primary'
              )}
              aria-pressed={viewMode === 'grid'}
            >
              <span className="material-symbols-outlined text-[18px]">grid_view</span>
              Grid
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-lg font-body text-label-md transition-standard',
                viewMode === 'map'
                  ? 'bg-surface shadow-sm text-primary'
                  : 'text-secondary hover:text-primary'
              )}
              aria-pressed={viewMode === 'map'}
            >
              <span className="material-symbols-outlined text-[18px]">map</span>
              Map
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="mb-10">
          <PropertyFilterBar onFilter={handleFilter} />
        </div>

        {/* Results count */}
        <p className="font-body text-body-md text-secondary mb-6">
          Showing {paginatedProperties.length} of {filteredProperties.length} properties
        </p>

        {/* Grid */}
        <PropertyGrid properties={paginatedProperties} />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="w-10 h-10 rounded-full border border-outline-variant/50 flex items-center justify-center text-secondary hover:border-primary hover:text-primary transition-standard disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Previous page"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={cn(
                  'w-10 h-10 rounded-full font-body text-label-md font-semibold transition-standard',
                  page === currentPage
                    ? 'bg-primary text-on-primary'
                    : 'border border-outline-variant/50 text-secondary hover:border-primary hover:text-primary'
                )}
                aria-label={`Page ${page}`}
                aria-current={page === currentPage ? 'page' : undefined}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="w-10 h-10 rounded-full border border-outline-variant/50 flex items-center justify-center text-secondary hover:border-primary hover:text-primary transition-standard disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Next page"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
