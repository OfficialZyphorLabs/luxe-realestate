/**
 * SuperAdmin overview — platform health metrics + a snapshot of recent orgs.
 */
import Link from 'next/link'
import { getPlatformStats, getAllOrganizations } from '@/lib/data/platform'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { StatCard } from '@/components/dashboard/StatCard'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { DataTable, type Column } from '@/components/dashboard/DataTable'
import { PLAN_LABELS } from '@/lib/data/dashboard'
import { formatCurrency, formatRelativeTime } from '@/lib/format'

type OrgRow = Awaited<ReturnType<typeof getAllOrganizations>>[number]

export default async function SuperAdminOverviewPage() {
  const [stats, orgs] = await Promise.all([getPlatformStats(), getAllOrganizations({})])
  const recent = orgs.slice(0, 5)

  const columns: Column<OrgRow>[] = [
    {
      key: 'name',
      header: 'Organization',
      render: (o) => (
        <Link
          href={`/superadmin/organizations/${o.id}`}
          className="font-body text-label-md font-semibold text-primary hover:underline"
        >
          {o.name}
        </Link>
      ),
    },
    { key: 'plan', header: 'Plan', hideOnMobile: true, render: (o) => PLAN_LABELS[o.plan] },
    { key: 'members', header: 'Members', align: 'right', render: (o) => o._count.memberships },
    { key: 'status', header: 'Status', render: (o) => <StatusBadge status={o.status} /> },
    {
      key: 'created',
      header: 'Created',
      hideOnMobile: true,
      render: (o) => <span className="text-secondary">{formatRelativeTime(o.createdAt)}</span>,
    },
  ]

  return (
    <>
      <PageHeader title="Platform Overview" description="Health of the LuxeReal platform at a glance." />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon="apartment"
          label="Organizations"
          value={stats.totalOrgs}
          delta={stats.newOrgs > 0 ? `+${stats.newOrgs} (30d)` : undefined}
          deltaTrend={stats.newOrgs > 0 ? 'up' : 'neutral'}
        />
        <StatCard
          icon="group"
          label="Users"
          value={stats.totalUsers}
          delta={stats.newUsers > 0 ? `+${stats.newUsers} (30d)` : undefined}
          deltaTrend={stats.newUsers > 0 ? 'up' : 'neutral'}
        />
        <StatCard icon="payments" label="Est. MRR" value={formatCurrency(stats.mrr)} />
        <StatCard icon="schedule" label="On Trial" value={stats.trialing} />
      </div>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-headline-md font-semibold text-primary">
            Recent Organizations
          </h2>
          <Link
            href="/superadmin/organizations"
            className="font-body text-label-md text-primary hover:underline"
          >
            View all
          </Link>
        </div>
        <DataTable columns={columns} rows={recent} getRowKey={(o) => o.id} />
      </section>
    </>
  )
}
