/**
 * Public white-label catalog (Phase 4) — /org/[slug]/public
 *
 * An anonymous, org-branded page showing that org's ACTIVE listings plus an
 * inquiry form that creates a lead for them. Deliberately OUTSIDE the (app)
 * route group so it does NOT inherit the auth-gated dashboard shell, and
 * exempted from the proxy auth gate (see src/proxy.ts).
 *
 * White-labeling: uses the org's logo + brand color. The brand color is applied
 * via an inline style — the one sanctioned exception to the "no inline styles"
 * rule, since per-tenant theming is inherently dynamic and can't be a token.
 */
import Image from 'next/image'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getOrgBySlug } from '@/lib/data/dashboard'
import { listActiveOrgProperties } from '@/lib/data/properties'
import { PublicInquiryForm } from '@/components/property/PublicInquiryForm'
import { PROPERTY_TYPE_LABELS } from '@/lib/validations/property'
import { formatCurrency } from '@/lib/format'

const DEFAULT_BRAND = '#041627' // DESIGN `primary` — fallback when the org sets none

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const org = await getOrgBySlug(slug)
  if (!org) return { title: 'Not found' }
  return {
    title: `${org.name} — Properties`,
    description: `Browse available listings from ${org.name}.`,
  }
}

export default async function OrgPublicPage({ params }: PageProps) {
  const { slug } = await params
  const org = await getOrgBySlug(slug)

  // Only ACTIVE orgs that opted into public listings expose a catalog.
  if (!org || org.status !== 'ACTIVE' || !org.settings?.allowPublicListings) notFound()

  const brand = org.settings?.primaryColor || DEFAULT_BRAND
  const properties = await listActiveOrgProperties(org.id)

  return (
    <main className="min-h-screen bg-surface">
      {/* ── Branded header ── */}
      <header className="border-b border-outline-variant/20 bg-surface-container-lowest">
        <div className="mx-auto flex max-w-container-max items-center gap-3 px-margin-mobile py-4 md:px-margin-desktop">
          {org.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={org.logoUrl} alt={`${org.name} logo`} className="h-8 w-auto" />
          ) : (
            <span
              className="flex h-9 w-9 items-center justify-center rounded-lg font-display text-headline-md font-semibold text-white"
              style={{ backgroundColor: brand }}
            >
              {org.name.charAt(0)}
            </span>
          )}
          <span className="font-display text-headline-md font-semibold text-primary">{org.name}</span>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="px-margin-mobile py-stack-lg text-white md:px-margin-desktop" style={{ backgroundColor: brand }}>
        <div className="mx-auto max-w-container-max">
          <p className="font-body text-label-md uppercase tracking-widest text-white/60">Exclusive Listings</p>
          <h1 className="mt-2 max-w-2xl font-display text-display-lg font-bold leading-tight">
            Discover properties from {org.name}
          </h1>
          <p className="mt-3 max-w-xl font-body text-body-lg text-white/75">
            {properties.length} {properties.length === 1 ? 'property' : 'properties'} currently available. Reach
            out to arrange a private viewing.
          </p>
        </div>
      </section>

      {/* ── Listings ── */}
      <section className="mx-auto max-w-container-max px-margin-mobile py-stack-lg md:px-margin-desktop">
        {properties.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-outline-variant/40 px-6 py-16 text-center">
            <span className="material-symbols-outlined text-[32px] text-secondary" aria-hidden="true">
              home_work
            </span>
            <p className="mt-3 font-body text-body-md text-secondary">
              No listings are available right now. Please check back soon.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((p) => (
              <article
                key={p.id}
                className="group overflow-hidden rounded-xl bg-surface-container-lowest shadow-[0px_4px_20px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0px_10px_40px_rgba(0,0,0,0.08)]"
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
              </article>
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

      {/* ── Footer ── */}
      <footer className="border-t border-outline-variant/20 px-margin-mobile py-6 md:px-margin-desktop">
        <p className="mx-auto max-w-container-max font-body text-caption text-secondary">
          Powered by <span className="font-semibold text-primary">LuxeReal</span>
        </p>
      </footer>
    </main>
  )
}
