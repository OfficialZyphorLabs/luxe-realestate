'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import type { Property } from '@/types'

interface PropertyCardProps {
  property: Property
}

export function PropertyCard({ property }: PropertyCardProps) {
  const [favorited, setFavorited] = useState(property.isFavorited ?? false)

  return (
    <article className="group bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0px_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0px_10px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300">
      {/* Image area */}
      <div className="relative h-64 overflow-hidden">
        <Image
          src={property.imageUrl}
          alt={`${property.title} — ${property.address}`}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-700"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Badges */}
        {property.badges && property.badges.length > 0 && (
          <div className="absolute top-4 left-4 flex gap-2">
            {property.badges.map((badge) => (
              <Badge key={badge} variant="image">
                {badge}
              </Badge>
            ))}
          </div>
        )}

        {/* Favorite button */}
        <button
          onClick={() => setFavorited(!favorited)}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-surface/20 backdrop-blur-sm flex items-center justify-center hover:bg-surface/40 transition-standard"
          aria-label={favorited ? 'Remove from favorites' : 'Save to favorites'}
        >
          <span
            className={cn(
              'material-symbols-outlined text-[18px]',
              favorited ? 'material-symbols-filled text-error' : 'text-white'
            )}
          >
            favorite
          </span>
        </button>
      </div>

      {/* Card body */}
      <div className="p-6">
        <p className="font-display text-headline-md font-semibold text-primary mb-1">
          ${property.price.toLocaleString()}
        </p>
        <p className="font-body text-body-md text-secondary mb-4">{property.address}</p>

        {/* Specs row */}
        <div className="flex items-center gap-4 border-y border-outline-variant/20 py-3 mb-4">
          <span className="flex items-center gap-1 font-body text-label-md text-on-surface-variant">
            <span className="material-symbols-outlined text-[18px]">bed</span>
            {property.beds} Beds
          </span>
          <span className="flex items-center gap-1 font-body text-label-md text-on-surface-variant">
            <span className="material-symbols-outlined text-[18px]">bathtub</span>
            {property.baths} Baths
          </span>
          <span className="flex items-center gap-1 font-body text-label-md text-on-surface-variant">
            <span className="material-symbols-outlined text-[18px]">square_foot</span>
            {property.sqft.toLocaleString()} sqft
          </span>
        </div>

        {/* CTA */}
        <Link
          href={`/properties/${property.slug}`}
          className="flex items-center justify-center gap-2 w-full border border-primary text-primary rounded-lg py-2.5 font-body text-label-md font-semibold group-hover:bg-primary group-hover:text-on-primary transition-standard active:scale-95"
        >
          View Details
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </Link>
      </div>
    </article>
  )
}
