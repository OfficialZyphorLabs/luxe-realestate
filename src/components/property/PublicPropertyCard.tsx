import Image from 'next/image'
import Link from 'next/link'
import { PROPERTY_TYPE_LABELS } from '@/lib/validations/property'
import { formatCurrency } from '@/lib/format'
import type { PropertyType } from '@/generated/prisma'

/**
 * PublicPropertyCard — a listing card on the org's public catalog. The whole
 * card links to the property detail page. Presentational; DESIGN tokens only.
 */
export interface PublicCardProperty {
  slug: string
  title: string
  price: number
  address: string
  city: string
  state: string
  beds: number | null
  baths: number | null
  sqft: number | null
  propertyType: PropertyType
  images: { url: string }[]
}

export function PublicPropertyCard({ orgSlug, property: p }: { orgSlug: string; property: PublicCardProperty }) {
  return (
    <Link
      href={`/org/${orgSlug}/public/${p.slug}`}
      className="group block overflow-hidden rounded-xl bg-surface-container-lowest shadow-[0px_4px_20px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0px_10px_40px_rgba(0,0,0,0.08)]"
    >
      <div className="relative h-56 overflow-hidden bg-surface-container">
        {p.images[0]?.url ? (
          <Image
            src={p.images[0].url}
            alt={`${p.title} — ${p.address}`}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="material-symbols-outlined text-[32px] text-secondary" aria-hidden="true">
              image
            </span>
          </div>
        )}
        <div className="absolute left-4 top-4">
          <span className="rounded-full bg-primary/80 px-3 py-1 font-body text-[10px] font-bold uppercase tracking-tighter text-white backdrop-blur">
            {PROPERTY_TYPE_LABELS[p.propertyType]}
          </span>
        </div>
      </div>
      <div className="p-6">
        <p className="font-display text-headline-md font-semibold text-primary">{formatCurrency(p.price)}</p>
        <p className="mt-1 font-body text-label-md font-semibold text-on-surface">{p.title}</p>
        <p className="font-body text-body-md text-secondary">
          {p.address}, {p.city}, {p.state}
        </p>
        <div className="mt-4 flex items-center gap-4 border-t border-outline-variant/20 pt-3 font-body text-label-md text-on-surface-variant">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">bed</span>
            {p.beds ?? '—'}
          </span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">bathtub</span>
            {p.baths ?? '—'}
          </span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">square_foot</span>
            {p.sqft ? p.sqft.toLocaleString() : '—'}
          </span>
        </div>
      </div>
    </Link>
  )
}
