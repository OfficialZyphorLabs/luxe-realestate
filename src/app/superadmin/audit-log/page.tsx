/**
 * SuperAdmin — platform audit log. Every mutation (member changes, org
 * suspend/delete, plan changes, SA grant/revoke, impersonation) writes a row
 * via lib/audit.ts. This page shows the log with search and action-type filter.
 */
import { getAuditLogs } from '@/lib/data/platform'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { EmptyState } from '@/components/dashboard/EmptyState'
import { DataTable, type Column } from '@/components/dashboard/DataTable'
import { TableSearch } from '@/components/dashboard/superadmin/TableSearch'
import { AuditActionFilter } from '@/components/dashboard/superadmin/AuditActionFilter'
import { formatRelativeTime } from '@/lib/format'

type LogRow = Awaited<ReturnType<typeof getAuditLogs>>[number]

/** Human-readable labels for known audit action strings. */
const ACTION_LABELS: Record<string, string> = {
  'member.invited': 'Member invited',
  'member.role_changed': 'Role changed',
  'member.removed': 'Member removed',
  'member.invite_cancelled': 'Invite cancelled',
  'org.settings_updated': 'Settings updated',
  'org.suspended': 'Org suspended',
  'org.reactivated': 'Org reactivated',
  'org.deleted': 'Org deleted',
  'org.plan_changed': 'Plan changed',
  'user.superadmin_granted': 'SA granted',
  'user.superadmin_revoked': 'SA revoked',
  'impersonation.started': 'Impersonation started',
  'impersonation.ended': 'Impersonation ended',
}

/** Tailwind tone classes per action category. */
function actionTone(action: string): string {
  if (action.includes('deleted') || action.includes('removed') || action.includes('revoked')) {
    return 'bg-error-container text-on-error-container'
  }
  if (action.includes('suspended')) return 'bg-error-container/60 text-on-error-container'
  if (action.includes('granted') || action.includes('started')) {
    return 'bg-tertiary-fixed-dim text-on-tertiary-fixed'
  }
  return 'bg-surface-variant text-on-surface-variant'
}

export default async function SuperAdminAuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; action?: string }>
}) {
  const { query, action } = await searchParams
  const logs = await getAuditLogs({ query, action })

  const columns: Column<LogRow>[] = [
    {
      key: 'action',
      header: 'Action',
      render: (l) => (
        <span
          className={[
            'inline-flex items-center rounded-full px-2.5 py-0.5 font-body text-caption font-semibold',
            actionTone(l.action),
          ].join(' ')}
        >
          {ACTION_LABELS[l.action] ?? l.action}
        </span>
      ),
    },
    {
      key: 'actor',
      header: 'Actor',
      hideOnMobile: true,
      render: (l) => (
        <div className="font-body text-body-md">
          <span className="rounded bg-surface-variant px-1.5 py-0.5 font-mono text-caption text-on-surface-variant">
            {l.actorType}
          </span>
          <span className="ml-2 text-secondary">{l.actorId.slice(0, 12)}&hellip;</span>
        </div>
      ),
    },
    {
      key: 'target',
      header: 'Target',
      hideOnMobile: true,
      render: (l) =>
        l.targetType ? (
          <span className="font-body text-body-md text-secondary">
            {l.targetType}
            {l.targetId ? (
              <span className="ml-1 font-mono text-caption">{l.targetId.slice(0, 10)}&hellip;</span>
            ) : null}
          </span>
        ) : (
          <span className="text-secondary">—</span>
        ),
    },
    {
      key: 'when',
      header: 'When',
      align: 'right',
      render: (l) => <span className="font-body text-body-md text-secondary">{formatRelativeTime(l.createdAt)}</span>,
    },
  ]

  return (
    <>
      <PageHeader
        title="Audit Log"
        description={`${logs.length} event${logs.length !== 1 ? 's' : ''} — every platform mutation, newest first.`}
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <TableSearch placeholder="Search by actor, target, or action…" />
        </div>
        <div className="shrink-0">
          <AuditActionFilter current={action ?? 'all'} />
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={logs}
        getRowKey={(l) => l.id}
        empty={
          <EmptyState
            icon="receipt_long"
            title="No events match"
            description={
              query || (action && action !== 'all')
                ? 'Try a different search or filter.'
                : 'Audited actions will appear here once users start making changes.'
            }
          />
        }
      />
    </>
  )
}

