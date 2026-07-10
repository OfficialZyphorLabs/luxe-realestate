/**
 * Public white-label catalog — /org/[slug]/public
 *
 * Anonymous, org-branded page listing that org's ACTIVE properties (each card
 * links to its detail page) plus a general inquiry form. Outside the (app) route
 * group + proxy-exempted. White-labeled via the org's logo + brand color.
 */
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getOrgBySlug } from '@/lib/data/dashboard'
import { searchActiveOrgProperties, type PublicPropertyFilters } from '@/lib/data/properties'
import { PublicOrgHeader, PublicOrgFooter } from '@/components/property/PublicOrgHeader'
import { PublicPropertyCard } from '@/components/property/PublicPropertyCard'
import { PublicCatalogFilters } from '@/components/property/PublicCatalogFilters'
import { PublicInquiryForm } from '@/components/property/PublicInquiryForm'
import { PROPERTY_TYPES } from '@/lib/validations/property'
import type { PropertyType } from '@/generated/prisma'

const DEFAULT_BRAND = '#041627' // DESIGN `primary` — fallback when the org sets none

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ q?: string; type?: string; beds?: string; min?: string; max?: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const org = await getOrgBySlug(slug)
  if (!org) return { title: 'Not found' }
  return {
    title: `${org.name} — Properties`,
    description: `Browse available luxury listings from ${org.name}.`,
  }
}

/** Parse raw query params into a validated filter object for the data layer. */
function parseFilters(sp: {
  q?: string
  type?: string
  beds?: string
  min?: string
  max?: string
}): PublicPropertyFilters {
  const type = PROPERTY_TYPES.includes(sp.type as PropertyType) ? (sp.type as PropertyType) : undefined
  const toInt = (v?: string) => {
    const n = Number(v)
    return v && Number.isFinite(n) && n >= 0 ? n : undefined
  }
  return { query: sp.q?.trim() || undefined, type, minBeds: toInt(sp.beds), minPrice: toInt(sp.min), maxPrice: toInt(sp.max) }
}

export default async function OrgPublicPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const sp = await searchParams
  const org = await getOrgBySlug(slug)

  // Only ACTIVE orgs that opted into public listings expose a catalog.
  if (!org || org.status !== 'ACTIVE' || !org.settings?.allowPublicListings) notFound()

  const brand = org.settings?.primaryColor || DEFAULT_BRAND
  const filters = parseFilters(sp)
  const hasFilters = Boolean(filters.query || filters.type || filters.minBeds || filters.minPrice || filters.maxPrice)
  const properties = await searchActiveOrgProperties(org.id, filters)

  return (
    <main className="min-h-screen bg-surface">
      <PublicOrgHeader slug={slug} name={org.name} logoUrl={org.logoUrl} brand={brand} />

      {/* ── Hero ── */}
      <section className="px-margin-mobile py-stack-lg text-white md:px-margin-desktop" style={{ backgroundColor: brand }}>
        <div className="mx-auto max-w-container-max">
          <p className="font-body text-label-md uppercase tracking-widest text-white/60">Exclusive Listings</p>
          <h1 className="mt-2 max-w-2xl font-display text-display-lg font-bold leading-tight">
            Discover properties from {org.name}
          </h1>
          <p className="mt-3 max-w-xl font-body text-body-lg text-white/75">
            Browse the collection and reach out to arrange a private viewing.
          </p>
        </div>
      </section>

      {/* ── Filters + listings ── */}
      <section className="mx-auto max-w-container-max px-margin-mobile py-stack-lg md:px-margin-desktop">
        <PublicCatalogFilters />

        <p className="mb-6 font-body text-body-md text-secondary">
          {properties.length} {properties.length === 1 ? 'property' : 'properties'}
          {hasFilters ? ' match your search' : ' available'}
        </p>

        {properties.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-outline-variant/40 px-6 py-16 text-center">
            <span className="material-symbols-outlined text-[32px] text-secondary" aria-hidden="true">
              {hasFilters ? 'search_off' : 'home_work'}
            </span>
            <p className="mt-3 font-body text-body-md text-secondary">
              {hasFilters
                ? 'No listings match your filters. Try widening your search.'
                : 'No listings are available right now. Please check back soon.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((p) => (
              <PublicPropertyCard key={p.id} orgSlug={slug} property={p} />
            ))}
          </div>
        )}
      </section>

      {/* ── Inquiry ── */}
      <section className="bg-surface-container-low px-margin-mobile py-stack-lg md:px-margin-desktop">
        <div className="mx-auto grid max-w-container-max grid-cols-1 gap-8 lg:grid-cols-2">
          <div>
            <p className="font-body text-label-md uppercase tracking-widest text-on-primary-container">Get in Touch</p>
            <h2 className="mt-2 font-display text-headline-lg font-semibold text-primary">
              Request a private viewing
            </h2>
            <p className="mt-3 max-w-md font-body text-body-md text-secondary">
              Share a few details and a member of the {org.name} team will contact you to arrange a viewing or
              answer your questions.
            </p>
          </div>
          <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.04)] md:p-8">
            <PublicInquiryForm slug={slug} />
          </div>
        </div>
      </section>

      <PublicOrgFooter />
    </main>
  )
}
