/**
 * SuperAdmin — organizations list with URL-driven search + plan/status filters.
 */
import Link from 'next/link'
import { getAllOrganizations } from '@/lib/data/platform'
import { PLAN_LABELS } from '@/lib/data/dashboard'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { EmptyState } from '@/components/dashboard/EmptyState'
import { DataTable, type Column } from '@/components/dashboard/DataTable'
import { OrgFilters } from '@/components/dashboard/superadmin/OrgFilters'
import { formatRelativeTime } from '@/lib/format'

type OrgRow = Awaited<ReturnType<typeof getAllOrganizations>>[number]

export default async function SuperAdminOrganizationsPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; plan?: string; status?: string }>
}) {
  const sp = await searchParams
  const orgs = await getAllOrganizations({ query: sp.query, plan: sp.plan, status: sp.status })

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
          <span className="block font-body text-caption font-normal text-secondary">/{o.slug}</span>
        </Link>
      ),
    },
    { key: 'plan', header: 'Plan', hideOnMobile: true, render: (o) => PLAN_LABELS[o.plan] },
    { key: 'members', header: 'Members', align: 'right', render: (o) => o._count.memberships },
    {
      key: 'listings',
      header: 'Listings',
      align: 'right',
      hideOnMobile: true,
      render: (o) => o._count.properties,
    },
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
      <PageHeader title="Organizations" description={`${orgs.length} organizations on the platform.`} />
      <OrgFilters />
      <DataTable
        columns={columns}
        rows={orgs}
        getRowKey={(o) => o.id}
        empty={
          <EmptyState
            icon="apartment"
            title="No organizations match"
            description="Try clearing the search or filters."
          />
        }
      />
    </>
  )
}
