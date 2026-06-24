'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { PropertyGallery } from '@/components/property/PropertyGallery'
import { PropertySpecs } from '@/components/property/PropertySpecs'
import { AmenityItem } from '@/components/property/AmenityItem'
import { SimilarProperties } from '@/components/property/SimilarProperties'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import type { Property } from '@/types'

const TOUR_TIME_OPTIONS = [
  { value: '', label: 'Select a time' },
  { value: '9am', label: '9:00 AM' },
  { value: '11am', label: '11:00 AM' },
  { value: '1pm', label: '1:00 PM' },
  { value: '3pm', label: '3:00 PM' },
  { value: '5pm', label: '5:00 PM' },
]

const MOCK_PROPERTY: Property = {
  id: '1',
  slug: '842-bel-air-road',
  title: '842 Bel Air Road',
  price: 4250000,
  address: '842 Bel Air Road',
  city: 'Beverly Hills',
  state: 'CA',
  beds: 5,
  baths: 4,
  sqft: 6800,
  lotSize: 14000,
  yearBuilt: 2019,
  garage: 3,
  imageUrl:
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&auto=format&fit=crop&q=80',
  images: [
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop&q=80',
  ],
  badges: ['For Sale', 'Luxury'],
  description: `Set behind private gates in the coveted Bel Air enclave, this architectural masterpiece offers sweeping canyon views and an unrivaled sense of privacy. The open-concept floor plan seamlessly integrates indoor and outdoor living, anchored by a double-height great room with floor-to-ceiling glass.

The chef's kitchen features custom Italian cabinetry, Calacatta marble, and premium Miele appliances. The primary suite spans the entire east wing, complete with a private terrace, dressing room, and spa bath clad in book-matched stone.

Grounds include a resort-style infinity pool, outdoor kitchen, and formal motor court. A rare offering for the most discerning buyer.`,
  amenities: [
    'Infinity Pool',
    'Home Cinema',
    'Wine Cellar',
    'Smart Home System',
    'Private Gym',
    'Guest House',
    'Tennis Court',
    'Outdoor Kitchen',
  ],
  agent: {
    id: '1',
    name: 'Marcus Williams',
    role: 'Senior Partner',
    specialty: 'Beverly Hills & Bel Air Estates',
    imageUrl:
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&auto=format&fit=crop&q=80',
    phone: '+1 (310) 555-0142',
    email: 'marcus@luxereal.com',
  },
}

const SIMILAR: Property[] = [
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

const AMENITY_ICONS: Record<string, string> = {
  'Infinity Pool': 'pool',
  'Home Cinema': 'movie',
  'Wine Cellar': 'wine_bar',
  'Smart Home System': 'home_iot_device',
  'Private Gym': 'fitness_center',
  'Guest House': 'cottage',
  'Tennis Court': 'sports_tennis',
  'Outdoor Kitchen': 'outdoor_grill',
}

export default function PropertyDetailPage() {
  useParams()
  const property = MOCK_PROPERTY
  const [tourType, setTourType] = useState<'in-person' | 'video'>('in-person')
  const [tourDate, setTourDate] = useState('')
  const [tourTime, setTourTime] = useState('')

  return (
    <div className="pt-20 min-h-screen">
      <div className="page-container py-8">
        {/* Gallery */}
        <PropertyGallery images={property.images ?? [property.imageUrl]} title={property.title} />

        {/* Main content */}
        <div className="mt-10 flex flex-col lg:flex-row gap-12">
          {/* Left column */}
          <div className="flex-1 min-w-0">
            {/* Title + badges */}
            <div className="flex flex-wrap items-start gap-3 mb-3">
              {property.badges?.map((b) => (
                <Badge key={b} variant="image">
                  {b}
                </Badge>
              ))}
            </div>
            <h1 className="font-display text-display-lg font-bold text-primary leading-tight">
              {property.title}
            </h1>
            <div className="flex items-center gap-2 mt-2 mb-1">
              <span className="material-symbols-outlined text-[18px] text-secondary">location_on</span>
              <p className="font-body text-body-md text-secondary">
                {property.address}, {property.city}, {property.state}
              </p>
            </div>
            <p className="font-display text-headline-lg font-semibold text-primary mt-4">
              ${property.price.toLocaleString()}
            </p>

            {/* Specs grid */}
            <div className="mt-8">
              <h2 className="font-body text-label-md font-semibold uppercase tracking-widest text-secondary mb-4">
                Property Details
              </h2>
              <PropertySpecs property={property} />
            </div>

            {/* Description */}
            <div className="mt-10">
              <h2 className="font-display text-headline-md font-semibold text-primary mb-4">
                Property Description
              </h2>
              {property.description?.split('\n\n').map((para, i) => (
                <p key={i} className="font-body text-body-md text-on-surface-variant leading-relaxed mb-4">
                  {para}
                </p>
              ))}
            </div>

            {/* Amenities */}
            {property.amenities && (
              <div className="mt-10">
                <h2 className="font-display text-headline-md font-semibold text-primary mb-4">
                  Premium Amenities
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                  {property.amenities.map((amenity) => (
                    <AmenityItem
                      key={amenity}
                      icon={AMENITY_ICONS[amenity] ?? 'check_circle'}
                      label={amenity}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Location */}
            <div className="mt-10">
              <h2 className="font-display text-headline-md font-semibold text-primary mb-4">
                Location
              </h2>
              <div className="relative h-64 bg-surface-container-high rounded-2xl overflow-hidden flex items-center justify-center">
                <span className="material-symbols-outlined text-[48px] text-outline/40">map</span>
                <p className="absolute bottom-4 left-4 font-body text-body-md text-secondary">
                  {property.address}, {property.city}, {property.state}
                </p>
              </div>
            </div>
          </div>

          {/* Right column — sticky sidebar */}
          <div className="lg:w-96 shrink-0">
            <div className="sticky top-24 bg-surface-container-lowest rounded-2xl shadow-xl overflow-hidden">
              {/* Tour type toggle */}
              <div className="flex border-b border-outline-variant/20">
                <button
                  onClick={() => setTourType('in-person')}
                  className={`flex-1 py-4 font-body text-label-md font-semibold transition-standard ${
                    tourType === 'in-person'
                      ? 'bg-primary text-on-primary'
                      : 'text-secondary hover:text-primary'
                  }`}
                >
                  In-Person Tour
                </button>
                <button
                  onClick={() => setTourType('video')}
                  className={`flex-1 py-4 font-body text-label-md font-semibold transition-standard ${
                    tourType === 'video'
                      ? 'bg-primary text-on-primary'
                      : 'text-secondary hover:text-primary'
                  }`}
                >
                  Video Tour
                </button>
              </div>

              <div className="p-6 flex flex-col gap-5">
                <h3 className="font-display text-headline-md font-semibold text-primary">
                  Schedule a Tour
                </h3>

                <div className="flex flex-col gap-1.5">
                  <label className="font-body text-xs font-semibold text-secondary uppercase tracking-widest">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    value={tourDate}
                    onChange={(e) => setTourDate(e.target.value)}
                    className="bg-surface-container-low border border-outline-variant/50 rounded-lg px-4 py-3 font-body text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-standard"
                  />
                </div>

                <Select
                  label="Preferred Time"
                  value={tourTime}
                  onChange={setTourTime}
                  options={TOUR_TIME_OPTIONS}
                />

                <Button size="lg" fullWidth className="rounded-xl">
                  Request Tour
                </Button>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-outline-variant/30" />
                  <span className="font-body text-caption text-secondary">or contact agent</span>
                  <div className="flex-1 h-px bg-outline-variant/30" />
                </div>

                {/* Agent card */}
                {property.agent && (
                  <div className="flex items-center gap-4 bg-surface-container-low rounded-xl p-4">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={property.agent.imageUrl}
                        alt={property.agent.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-label-md font-semibold text-on-surface truncate">
                        {property.agent.name}
                      </p>
                      <p className="font-body text-caption text-secondary">{property.agent.role}</p>
                    </div>
                    <a
                      href={`tel:${property.agent.phone}`}
                      className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-on-primary transition-standard"
                      aria-label={`Call ${property.agent.name}`}
                    >
                      <span className="material-symbols-outlined text-[18px]">call</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Similar properties */}
        <SimilarProperties properties={SIMILAR} />
      </div>
    </div>
  )
}
