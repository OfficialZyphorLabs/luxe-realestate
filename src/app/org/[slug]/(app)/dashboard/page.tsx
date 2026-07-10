/**
 * Org dashboard home — overview stats, recent leads, and the team roster.
 * Server Component: reads live data scoped to the org via the data-access layer.
 */
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireOrgAccess } from '@/lib/auth/session'
import { isAdminOf } from '@/lib/permissions'
import { getOrgBySlug, getOrgOverview } from '@/lib/data/dashboard'
import { OnboardingChecklist } from '@/components/dashboard/org/OnboardingChecklist'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { StatCard } from '@/components/dashboard/StatCard'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { RoleBadge } from '@/components/dashboard/RoleBadge'
import { MemberAvatar } from '@/components/dashboard/MemberAvatar'
import { EmptyState } from '@/components/dashboard/EmptyState'
import { formatCompactCurrency, formatRelativeTime } from '@/lib/format'
import { orgHref } from '@/lib/dashboard-nav'

export default async function OrgDashboardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const session = await requireOrgAccess(slug)
  const org = await getOrgBySlug(slug)
  if (!org) notFound()

  const data = await getOrgOverview(org.id)
  const firstName = session.user.name?.split(' ')[0] ?? 'there'

  // First-run onboarding: shown to admins until every step is complete.
  const isAdmin = isAdminOf(session, slug)
  const hasListing = data.totalListings > 0
  const hasBranding = Boolean(org.logoUrl || org.settings?.primaryColor)
  const hasTeam = data.memberCount > 1
  const showOnboarding = isAdmin && !(hasListing && hasBranding && hasTeam)

  return (
    <>
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description={`Here's what's happening at ${org.name} today.`}
      />

      {showOnboarding && (
        <OnboardingChecklist
          slug={slug}
          hasListing={hasListing}
          hasBranding={hasBranding}
          hasTeam={hasTeam}
        />
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon="home_work" label="Active Listings" value={data.activeListings} href={orgHref(slug, 'listings')} />
        <StatCard icon="forum" label="New Leads" value={data.newLeads} href={orgHref(slug, 'leads')} />
        <StatCard
          icon="payments"
          label="Portfolio Value"
          value={formatCompactCurrency(data.portfolioValue)}
        />
        <StatCard icon="group" label="Team Members" value={data.memberCount} href={orgHref(slug, 'members')} />
      </div>

      {/* Recent leads + team */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent leads */}
        <section className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-headline-md font-semibold text-primary">Recent Leads</h2>
            <Link
              href={orgHref(slug, 'leads')}
              className="font-body text-label-md text-primary transition-all hover:gap-2"
            >
              View all
            </Link>
          </div>
          {data.recentLeads.length === 0 ? (
            <EmptyState icon="forum" title="No leads yet" description="New inquiries from your listings will appear here." />
          ) : (
            <ul className="divide-y divide-outline-variant/20 rounded-xl border border-outline-variant/30 bg-surface-container-lowest">
              {data.recentLeads.map((lead) => (
                <li key={lead.id} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div className="min-w-0">
                    <p className="truncate font-body text-label-md font-semibold text-on-surface">
                      {lead.name}
                    </p>
                    <p className="truncate font-body text-caption text-secondary">
                      {lead.property ? lead.property.title : 'General inquiry'} ·{' '}
                      {formatRelativeTime(lead.createdAt)}
                    </p>
                  </div>
                  <StatusBadge status={lead.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Team */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-headline-md font-semibold text-primary">Team</h2>
            <Link
              href={orgHref(slug, 'members')}
              className="font-body text-label-md text-primary transition-all hover:gap-2"
            >
              Manage
            </Link>
          </div>
          <ul className="flex flex-col gap-3 rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-4">
            {data.members.map((m) => (
              <li key={m.id} className="flex items-center gap-3">
                <MemberAvatar name={m.user.name} email={m.user.email} src={m.user.avatarUrl} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-body text-label-md font-semibold text-on-surface">
                    {m.user.name ?? m.user.email}
                  </p>
                </div>
                <RoleBadge role={m.role} />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  )
}
