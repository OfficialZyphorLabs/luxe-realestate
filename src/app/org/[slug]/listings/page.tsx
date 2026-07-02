/**
 * Listings management (Phase 4) — grid/table of the org's properties with
 * search, status filter, and pagination. Any member may view + create; edit
 * and delete controls are gated per-row by ownership/role (computed here and
 * passed to the client ListingRowActions island).
 */
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { requireOrgAccess } from '@/lib/auth/session'
import { can, isAdminOf } from '@/lib/permissions'
import { getOrgBySlug } from '@/lib/data/dashboard'
import { listProperties, type PropertyListRow } from '@/lib/data/properties'
import { PROPERTY_STATUSES } from '@/lib/validations/property'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { EmptyState } from '@/components/dashboard/EmptyState'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { DataTable, type Column } from '@/components/dashboard/DataTable'
import { ListingFilters } from '@/components/dashboard/org/ListingFilters'
import { ListingsViewToggle } from '@/components/dashboard/org/ListingsViewToggle'
import { ListingRowActions } from '@/components/dashboard/org/ListingRowActions'
import { formatCurrency, formatDate } from '@/lib/format'
import type { PropertyStatus } from '@/generated/prisma'

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ query?: string; status?: string; view?: string; page?: string }>
}

export default async function OrgListingsPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const { query, status, view, page } = await searchParams
  const session = await requireOrgAccess(slug, 'properties:create')
  const org = await getOrgBySlug(slug)
  if (!org) notFound()

  // Narrow the raw status param to a valid enum value (ignore anything else).
  const statusFilter = PROPERTY_STATUSES.includes(status as PropertyStatus)
    ? (status as PropertyStatus)
    : undefined

  const { properties, total, page: current, pageCount } = await listProperties(org.id, {
    query,
    status: statusFilter,
    page: page ? Number(page) : 1,
  })

  const editAny = can(session, 'properties:edit-any', slug)
  const canDelete = isAdminOf(session, slug)
  const canEditRow = (row: PropertyListRow) => editAny || row.createdById === session.user.id
  const isTable = view === 'table'

  const columns: Column<PropertyListRow>[] = [
    {
      key: 'listing',
      header: 'Listing',
      render: (p) => (
        <div className="flex items-center gap-3">
          <Thumb url={p.images[0]?.url} title={p.title} />
          <div className="min-w-0">
            <p className="truncate font-body text-label-md font-semibold text-on-surface">{p.title}</p>
            <p className="truncate font-body text-caption text-secondary">
              {p.address}, {p.city}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      render: (p) => <span className="font-body text-label-md text-on-surface">{formatCurrency(p.price)}</span>,
    },
    { key: 'status', header: 'Status', render: (p) => <StatusBadge status={p.status} /> },
    {
      key: 'leads',
      header: 'Leads',
      align: 'right',
      hideOnMobile: true,
      render: (p) => <span className="text-secondary">{p._count.leads}</span>,
    },
    {
      key: 'updated',
      header: 'Updated',
      hideOnMobile: true,
      render: (p) => <span className="text-secondary">{formatDate(p.updatedAt)}</span>,
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      render: (p) => (
        <ListingRowActions
          slug={slug}
          propertyId={p.id}
          title={p.title}
          status={p.status}
          canEdit={canEditRow(p)}
          canDelete={canDelete}
        />
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="Listings"
        description={`${total} ${total === 1 ? 'property' : 'properties'} in ${org.name}.`}
        actions={
          <div className="flex items-center gap-3">
            <ListingsViewToggle />
            <Link
              href={`/org/${slug}/listings/new`}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-1.5 font-body text-sm font-semibold tracking-wide text-on-primary transition-standard hover:opacity-90 active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                add
              </span>
              New listing
            </Link>
          </div>
        }
      />

      <ListingFilters />

      {properties.length === 0 ? (
        <EmptyState
          icon="home_work"
          title={query || statusFilter ? 'No listings match your filters' : 'No listings yet'}
          description={
            query || statusFilter
              ? 'Try clearing the search or status filter.'
              : 'Create your first listing to start building your portfolio.'
          }
        />
      ) : isTable ? (
        <DataTable columns={columns} rows={properties} getRowKey={(p) => p.id} />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {properties.map((p) => (
            <ListingCard
              key={p.id}
              slug={slug}
              property={p}
              canEdit={canEditRow(p)}
              canDelete={canDelete}
            />
          ))}
        </div>
      )}

      {pageCount > 1 && <Pagination slug={slug} current={current} pageCount={pageCount} query={query} status={status} />}
    </>
  )
}

/** Cover-image thumbnail with a graceful placeholder. */
function Thumb({ url, title }: { url?: string; title: string }) {
  if (!url) {
    return (
      <div className="flex h-11 w-16 shrink-0 items-center justify-center rounded-lg bg-surface-container">
        <span className="material-symbols-outlined text-[18px] text-secondary" aria-hidden="true">
          image
        </span>
      </div>
    )
  }
  return (
    <div className="relative h-11 w-16 shrink-0 overflow-hidden rounded-lg bg-surface-container">
      <Image src={url} alt={title} fill className="object-cover" sizes="64px" />
    </div>
  )
}

/** Grid-view listing card. */
function ListingCard({
  slug,
  property: p,
  canEdit,
  canDelete,
}: {
  slug: string
  property: PropertyListRow
  canEdit: boolean
  canDelete: boolean
}) {
  return (
    <article className="group overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container-lowest shadow-[0px_4px_20px_rgba(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0px_10px_40px_rgba(0,0,0,0.08)]">
      <div className="relative h-44 overflow-hidden bg-surface-container">
        {p.images[0]?.url ? (
          <Image
            src={p.images[0].url}
            alt={p.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="material-symbols-outlined text-[32px] text-secondary" aria-hidden="true">
              image
            </span>
          </div>
        )}
        <div className="absolute left-3 top-3">
          <StatusBadge status={p.status} />
        </div>
        <div className="absolute right-2 top-2">
          <ListingRowActions
            slug={slug}
            propertyId={p.id}
            title={p.title}
            status={p.status}
            canEdit={canEdit}
            canDelete={canDelete}
          />
        </div>
      </div>
      <div className="p-5">
        <p className="font-display text-headline-md font-semibold text-primary">{formatCurrency(p.price)}</p>
        <p className="mt-0.5 truncate font-body text-label-md font-semibold text-on-surface">{p.title}</p>
        <p className="truncate font-body text-caption text-secondary">
          {p.address}, {p.city}
        </p>
        <div className="mt-3 flex items-center gap-4 border-t border-outline-variant/20 pt-3 font-body text-caption text-secondary">
          <span className="inline-flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">bed</span>
            {p.beds ?? '—'}
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">bathtub</span>
            {p.baths ?? '—'}
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">square_foot</span>
            {p.sqft ? p.sqft.toLocaleString() : '—'}
          </span>
          <span className="ml-auto inline-flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">forum</span>
            {p._count.leads}
          </span>
        </div>
      </div>
    </article>
  )
}

/** Prev/next pager that preserves the active filters in the URL. */
function Pagination({
  slug,
  current,
  pageCount,
  query,
  status,
}: {
  slug: string
  current: number
  pageCount: number
  query?: string
  status?: string
}) {
  const href = (page: number) => {
    const params = new URLSearchParams()
    if (query) params.set('query', query)
    if (status) params.set('status', status)
    if (page > 1) params.set('page', String(page))
    const qs = params.toString()
    return `/org/${slug}/listings${qs ? `?${qs}` : ''}`
  }

  return (
    <div className="mt-8 flex items-center justify-between">
      <PagerLink href={href(current - 1)} disabled={current <= 1} icon="chevron_left" label="Previous" />
      <span className="font-body text-body-md text-secondary">
        Page {current} of {pageCount}
      </span>
      <PagerLink href={href(current + 1)} disabled={current >= pageCount} icon="chevron_right" label="Next" trailing />
    </div>
  )
}

function PagerLink({
  href,
  disabled,
  icon,
  label,
  trailing,
}: {
  href: string
  disabled: boolean
  icon: string
  label: string
  trailing?: boolean
}) {
  const classes =
    'inline-flex items-center gap-1 rounded-full border border-outline-variant/40 px-4 py-2 font-body text-label-md font-semibold text-primary transition-colors hover:bg-surface-container'
  if (disabled) {
    return (
      <span className={`${classes} pointer-events-none opacity-40`} aria-disabled="true">
        {!trailing && <span className="material-symbols-outlined text-[18px]">{icon}</span>}
        {label}
        {trailing && <span className="material-symbols-outlined text-[18px]">{icon}</span>}
      </span>
    )
  }
  return (
    <Link href={href} className={classes}>
      {!trailing && <span className="material-symbols-outlined text-[18px]">{icon}</span>}
      {label}
      {trailing && <span className="material-symbols-outlined text-[18px]">{icon}</span>}
    </Link>
  )
}
