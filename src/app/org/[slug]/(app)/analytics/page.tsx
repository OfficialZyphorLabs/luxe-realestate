/**
 * Analytics — lead trend + lead/listing status breakdowns. Visible to any
 * member (read-only insight); charts are CSS-only (no chart dependency).
 */
import { notFound } from 'next/navigation'
import { requireOrgAccess } from '@/lib/auth/session'
import { getOrgBySlug, getOrgAnalytics } from '@/lib/data/dashboard'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { BarChart } from '@/components/dashboard/BarChart'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { EmptyState } from '@/components/dashboard/EmptyState'

/** Horizontal proportion bars for a status breakdown. */
function StatusBreakdown({ rows }: { rows: { status: string; count: number }[] }) {
  const total = rows.reduce((sum, r) => sum + r.count, 0)
  if (total === 0) {
    return <p className="font-body text-body-md text-secondary">No data yet.</p>
  }
  return (
    <ul className="flex flex-col gap-3">
      {rows.map((r) => (
        <li key={r.status} className="flex items-center gap-3">
          <span className="w-28 shrink-0">
            <StatusBadge status={r.status} />
          </span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-container">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${(r.count / total) * 100}%` }}
            />
          </div>
          <span className="w-8 shrink-0 text-right font-body text-label-md font-semibold text-on-surface">
            {r.count}
          </span>
        </li>
      ))}
    </ul>
  )
}

export default async function OrgAnalyticsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  await requireOrgAccess(slug)
  const org = await getOrgBySlug(slug)
  if (!org) notFound()

  const { leadsByStatus, listingsByStatus, leadsByMonth } = await getOrgAnalytics(org.id)
  const hasAnyData = org._count.leads > 0 || org._count.properties > 0

  return (
    <>
      <PageHeader title="Analytics" description="Performance at a glance." />

      {!hasAnyData ? (
        <EmptyState
          icon="insights"
          title="No analytics yet"
          description="Once you add listings and start receiving leads, trends will appear here."
        />
      ) : (
        <div className="flex flex-col gap-6">
          <section className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6">
            <h2 className="mb-6 font-display text-headline-md font-semibold text-primary">
              Leads — last 6 months
            </h2>
            <BarChart data={leadsByMonth} />
          </section>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6">
              <h2 className="mb-6 font-display text-headline-md font-semibold text-primary">
                Leads by status
              </h2>
              <StatusBreakdown rows={leadsByStatus} />
            </section>
            <section className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6">
              <h2 className="mb-6 font-display text-headline-md font-semibold text-primary">
                Listings by status
              </h2>
              <StatusBreakdown rows={listingsByStatus} />
            </section>
          </div>
        </div>
      )}
    </>
  )
}
