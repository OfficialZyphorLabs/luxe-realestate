/**
 * Leads (Phase 4) — pipeline board + list view of the org's inquiries.
 *
 * Role-scoped: ADMINs/super-admins see every lead; plain MEMBERs see only leads
 * assigned to them (enforced in the data layer via the LeadScope). The board is
 * the default; a list view is available via the view toggle. Search is
 * URL-driven so both views stay server-rendered.
 */
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireOrgAccess } from '@/lib/auth/session'
import { isAdminOf } from '@/lib/permissions'
import { getOrgBySlug } from '@/lib/data/dashboard'
import { listLeads, type LeadRow } from '@/lib/data/leads'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { EmptyState } from '@/components/dashboard/EmptyState'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { MemberAvatar } from '@/components/dashboard/MemberAvatar'
import { DataTable, type Column } from '@/components/dashboard/DataTable'
import { TableSearch } from '@/components/dashboard/superadmin/TableSearch'
import { LeadsViewToggle } from '@/components/dashboard/org/LeadsViewToggle'
import { LeadPipeline, type PipelineLead } from '@/components/dashboard/org/LeadPipeline'
import { formatRelativeTime } from '@/lib/format'

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ query?: string; view?: string }>
}

export default async function OrgLeadsPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const { query, view } = await searchParams
  const session = await requireOrgAccess(slug)
  const org = await getOrgBySlug(slug)
  if (!org) notFound()

  const scope = { viewerId: session.user.id, canViewAll: isAdminOf(session, slug) }
  const leads = await listLeads(org.id, scope, { query })

  const pipelineLeads: PipelineLead[] = leads.map((l) => ({
    id: l.id,
    name: l.name,
    email: l.email,
    status: l.status,
    propertyTitle: l.property?.title ?? null,
    assigneeName: l.assignee?.name ?? null,
    assigneeEmail: l.assignee?.email ?? null,
    assigneeAvatar: l.assignee?.avatarUrl ?? null,
    createdAtIso: l.createdAt.toISOString(),
  }))

  const columns: Column<LeadRow>[] = [
    {
      key: 'lead',
      header: 'Lead',
      render: (l) => (
        <Link href={`/org/${slug}/leads/${l.id}`} className="block min-w-0">
          <p className="truncate font-body text-label-md font-semibold text-on-surface hover:text-primary">
            {l.name}
          </p>
          <p className="truncate font-body text-caption text-secondary">{l.email}</p>
        </Link>
      ),
    },
    {
      key: 'property',
      header: 'Interest',
      hideOnMobile: true,
      render: (l) => (
        <span className="text-secondary">{l.property ? l.property.title : 'General inquiry'}</span>
      ),
    },
    { key: 'status', header: 'Status', render: (l) => <StatusBadge status={l.status} /> },
    {
      key: 'assignee',
      header: 'Assigned',
      hideOnMobile: true,
      render: (l) =>
        l.assignee ? (
          <div className="flex items-center gap-2">
            <MemberAvatar name={l.assignee.name} email={l.assignee.email} src={l.assignee.avatarUrl} size="sm" />
            <span className="truncate font-body text-caption text-secondary">
              {l.assignee.name ?? l.assignee.email}
            </span>
          </div>
        ) : (
          <span className="font-body text-caption text-secondary/70">Unassigned</span>
        ),
    },
    {
      key: 'created',
      header: 'Received',
      align: 'right',
      hideOnMobile: true,
      render: (l) => <span className="text-secondary">{formatRelativeTime(l.createdAt)}</span>,
    },
  ]

  const isList = view === 'list'

  return (
    <>
      <PageHeader
        title="Leads"
        description={
          scope.canViewAll
            ? `${leads.length} ${leads.length === 1 ? 'inquiry' : 'inquiries'} across ${org.name}.`
            : 'Inquiries assigned to you.'
        }
        actions={<LeadsViewToggle />}
      />

      <TableSearch placeholder="Search leads by name or email" />

      {leads.length === 0 ? (
        <EmptyState
          icon="forum"
          title={query ? 'No leads match your search' : 'No leads yet'}
          description={
            query
              ? 'Try a different name or email.'
              : 'Inquiries from your public listing page will land here automatically.'
          }
        />
      ) : isList ? (
        <DataTable columns={columns} rows={leads} getRowKey={(l) => l.id} />
      ) : (
        <LeadPipeline slug={slug} leads={pipelineLeads} />
      )}
    </>
  )
}
