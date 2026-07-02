/**
 * SuperAdmin — single organization deep-dive: stats, subscription, members,
 * settings, and admin action panel (suspend / delete / plan-change / impersonate).
 */
import { notFound } from 'next/navigation'
import { getOrganizationDetail } from '@/lib/data/platform'
import { PLAN_LABELS, PLAN_LIMITS } from '@/lib/data/dashboard'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { StatCard } from '@/components/dashboard/StatCard'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { RoleBadge } from '@/components/dashboard/RoleBadge'
import { MemberAvatar } from '@/components/dashboard/MemberAvatar'
import { PlanUsageMeter } from '@/components/dashboard/PlanUsageMeter'
import { DataTable, type Column } from '@/components/dashboard/DataTable'
import { OrgActions } from '@/components/dashboard/superadmin/OrgActions'
import { StartImpersonationButton } from '@/components/dashboard/superadmin/StartImpersonationButton'
import { formatDate } from '@/lib/format'

export default async function SuperAdminOrgDetailPage({
  params,
}: {
  params: Promise<{ orgId: string }>
}) {
  const { orgId } = await params
  const org = await getOrganizationDetail(orgId)
  if (!org) notFound()

  const limits = PLAN_LIMITS[org.plan]
  type MemberRow = (typeof org.memberships)[number]

  const columns: Column<MemberRow>[] = [
    {
      key: 'member',
      header: 'Member',
      render: (m) => (
        <div className="flex items-center gap-3">
          <MemberAvatar name={m.user.name} email={m.user.email} src={m.user.avatarUrl} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-body text-label-md font-semibold text-on-surface">
              {m.user.name ?? '—'}
            </p>
            <p className="truncate font-body text-caption text-secondary">{m.user.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'role', header: 'Role', render: (m) => <RoleBadge role={m.role} /> },
    {
      key: 'joined',
      header: 'Joined',
      hideOnMobile: true,
      render: (m) => <span className="text-secondary">{formatDate(m.joinedAt)}</span>,
    },
  ]

  return (
    <>
      <PageHeader
        title={org.name}
        description={`/${org.slug} · ${PLAN_LABELS[org.plan]} plan`}
        actions={
          <div className="flex items-center gap-3">
            <StatusBadge status={org.status} />
            <StartImpersonationButton orgSlug={org.slug} />
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard icon="group" label="Members" value={org._count.memberships} />
        <StatCard icon="home_work" label="Listings" value={org._count.properties} />
        <StatCard icon="forum" label="Leads" value={org._count.leads} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Members */}
        <section className="lg:col-span-2">
          <h2 className="mb-4 font-display text-headline-md font-semibold text-primary">Members</h2>
          <DataTable columns={columns} rows={org.memberships} getRowKey={(m) => m.id} />
        </section>

        {/* Actions + subscription + usage + settings */}
        <section className="flex flex-col gap-6">
          <OrgActions
            orgId={org.id}
            orgName={org.name}
            currentStatus={org.status}
            currentPlan={org.plan}
          />
          <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5">
            <h3 className="mb-4 font-display text-headline-md font-semibold text-primary">
              Subscription
            </h3>
            {org.subscription ? (
              <dl className="flex flex-col gap-2 font-body text-body-md">
                <div className="flex justify-between">
                  <dt className="text-secondary">Status</dt>
                  <dd>
                    <StatusBadge status={org.subscription.status} />
                  </dd>
                </div>
                {org.subscription.currentPeriodEnd && (
                  <div className="flex justify-between">
                    <dt className="text-secondary">Period ends</dt>
                    <dd className="text-on-surface">{formatDate(org.subscription.currentPeriodEnd)}</dd>
                  </div>
                )}
              </dl>
            ) : (
              <p className="font-body text-body-md text-secondary">No subscription on record.</p>
            )}
          </div>

          <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5">
            <h3 className="mb-4 font-display text-headline-md font-semibold text-primary">Usage</h3>
            <div className="flex flex-col gap-4">
              <PlanUsageMeter label="Members" used={org._count.memberships} limit={limits.members} />
              <PlanUsageMeter label="Listings" used={org._count.properties} limit={limits.listings} />
            </div>
          </div>

          <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5">
            <h3 className="mb-4 font-display text-headline-md font-semibold text-primary">Settings</h3>
            <dl className="flex flex-col gap-2 font-body text-body-md">
              <div className="flex justify-between">
                <dt className="text-secondary">Public listings</dt>
                <dd className="text-on-surface">
                  {org.settings?.allowPublicListings ? 'Enabled' : 'Disabled'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-secondary">Brand color</dt>
                <dd className="text-on-surface">{org.settings?.primaryColor ?? '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-secondary">Custom domain</dt>
                <dd className="text-on-surface">{org.settings?.customDomain ?? '—'}</dd>
              </div>
            </dl>
          </div>
        </section>
      </div>
    </>
  )
}
