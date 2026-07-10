/**
 * Public property detail (MVP) — /org/[slug]/public/[listingSlug]
 *
 * Anonymous, org-branded detail view of a single ACTIVE listing: gallery, specs,
 * description, and a per-property inquiry form that creates a lead tied to this
 * property. Outside the (app) route group + proxy-exempted (see src/proxy.ts).
 * Ships SEO metadata + schema.org/RealEstateListing JSON-LD for organic reach.
 */
import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getOrgBySlug } from '@/lib/data/dashboard'
import { getPublicPropertyBySlug, listActiveOrgProperties } from '@/lib/data/properties'
import { PublicOrgHeader, PublicOrgFooter } from '@/components/property/PublicOrgHeader'
import { PublicPropertyGallery } from '@/components/property/PublicPropertyGallery'
import { PublicPropertyCard } from '@/components/property/PublicPropertyCard'
import { PublicInquiryForm } from '@/components/property/PublicInquiryForm'
import { PROPERTY_TYPE_LABELS } from '@/lib/validations/property'
import { formatCurrency } from '@/lib/format'

const DEFAULT_BRAND = '#041627'

interface PageProps {
  params: Promise<{ slug: string; listingSlug: string }>
}

/** Shared resolver so metadata + page don't diverge (both cached by React). */
async function resolve(slug: string, listingSlug: string) {
  const org = await getOrgBySlug(slug)
  if (!org || org.status !== 'ACTIVE' || !org.settings?.allowPublicListings) return null
  const property = await getPublicPropertyBySlug(org.id, listingSlug)
  if (!property) return null
  return { org, property }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, listingSlug } = await params
  const data = await resolve(slug, listingSlug)
  if (!data) return { title: 'Not found' }

  const { org, property } = data
  const cover = property.images[0]?.url
  const title = `${property.title} — ${formatCurrency(property.price)} | ${org.name}`
  const description =
    property.description?.slice(0, 160) ??
    `${property.title} in ${property.city}, ${property.state}. Presented by ${org.name}.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: cover ? [{ url: cover }] : undefined,
      type: 'website',
    },
  }
}

export default async function PublicPropertyDetailPage({ params }: PageProps) {
  const { slug, listingSlug } = await params
  const data = await resolve(slug, listingSlug)
  if (!data) notFound()

  const { org, property } = data
  const brand = org.settings?.primaryColor || DEFAULT_BRAND
  const images = property.images.map((img) => img.url)

  // A few other listings for internal linking / engagement.
  const others = (await listActiveOrgProperties(org.id)).filter((p) => p.id !== property.id).slice(0, 3)

  // schema.org structured data for rich search results.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title,
    description: property.description ?? undefined,
    image: images,
    offers: {
      '@type': 'Offer',
      price: property.price,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: property.address,
      addressLocality: property.city,
      addressRegion: property.state,
    },
  }

  const specs = [
    { icon: 'bed', label: 'Bedrooms', value: property.beds ?? '—' },
    { icon: 'bathtub', label: 'Bathrooms', value: property.baths ?? '—' },
    { icon: 'square_foot', label: 'Sq. Ft.', value: property.sqft ? property.sqft.toLocaleString() : '—' },
    { icon: 'home_work', label: 'Type', value: PROPERTY_TYPE_LABELS[property.propertyType] },
  ]

  return (
    <main className="min-h-screen bg-surface">
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <PublicOrgHeader slug={slug} name={org.name} logoUrl={org.logoUrl} brand={brand} />

      <div className="mx-auto max-w-container-max px-margin-mobile py-stack-lg md:px-margin-desktop">
        <Link
          href={`/org/${slug}/public`}
          className="mb-6 inline-flex items-center gap-1 font-body text-label-md font-semibold text-primary transition-all hover:gap-2"
        >
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">arrow_back</span>
          All listings
        </Link>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left: gallery + info */}
          <div className="lg:col-span-2">
            <PublicPropertyGallery images={images} title={property.title} />

            <div className="mt-8">
              <span className="rounded-full bg-tertiary-fixed px-3 py-1 font-body text-caption font-semibold uppercase tracking-wider text-on-tertiary-fixed">
                {PROPERTY_TYPE_LABELS[property.propertyType]}
              </span>
              <h1 className="mt-3 font-display text-display-lg font-bold leading-tight text-primary">
                {property.title}
              </h1>
              <p className="mt-2 flex items-center gap-1 font-body text-body-lg text-secondary">
                <span className="material-symbols-outlined text-[20px]" aria-hidden="true">location_on</span>
                {property.address}, {property.city}, {property.state}
              </p>
              <p className="mt-4 font-display text-display-lg font-bold text-primary">
                {formatCurrency(property.price)}
              </p>

              {/* Specs */}
              <div className="mt-8 grid grid-cols-2 gap-4 border-y border-outline-variant/20 py-6 sm:grid-cols-4">
                {specs.map((s) => (
                  <div key={s.label} className="flex flex-col items-center text-center">
                    <span className="material-symbols-outlined text-[24px] text-primary" aria-hidden="true">
                      {s.icon}
                    </span>
                    <span className="mt-1 font-display text-headline-md font-semibold text-primary">{s.value}</span>
                    <span className="font-body text-caption uppercase tracking-widest text-secondary">{s.label}</span>
                  </div>
                ))}
              </div>

              {property.description && (
                <div className="mt-8">
                  <h2 className="font-display text-headline-md font-semibold text-primary">About this property</h2>
                  <p className="mt-3 whitespace-pre-line font-body text-body-lg leading-relaxed text-on-surface-variant">
                    {property.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right: sticky inquiry */}
          <aside className="lg:col-span-1">
            <div className="sticky top-6 rounded-2xl bg-surface-container-lowest p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.04)]">
              <h2 className="font-display text-headline-md font-semibold text-primary">Interested?</h2>
              <p className="mb-4 mt-1 font-body text-body-md text-secondary">
                Request details or schedule a private viewing.
              </p>
              <PublicInquiryForm slug={slug} propertyId={property.id} propertyTitle={property.title} />
            </div>
          </aside>
        </div>

        {/* Other listings */}
        {others.length > 0 && (
          <section className="mt-16">
            <h2 className="mb-6 font-display text-headline-lg font-semibold text-primary">More from {org.name}</h2>
            <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-3">
              {others.map((p) => (
                <PublicPropertyCard key={p.id} orgSlug={slug} property={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      <PublicOrgFooter />
    </main>
  )
}
