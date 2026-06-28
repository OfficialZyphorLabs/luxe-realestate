/**
 * SuperAdmin — platform audit log (newest first). The audit-write helper is
 * wired into mutations in Phase 2; until then this reads whatever exists.
 */
import { getRecentAuditLogs } from '@/lib/data/platform'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { EmptyState } from '@/components/dashboard/EmptyState'
import { DataTable, type Column } from '@/components/dashboard/DataTable'
import { formatRelativeTime } from '@/lib/format'

type LogRow = Awaited<ReturnType<typeof getRecentAuditLogs>>[number]

export default async function SuperAdminAuditLogPage() {
  const logs = await getRecentAuditLogs(100)

  const columns: Column<LogRow>[] = [
    {
      key: 'action',
      header: 'Action',
      render: (l) => <span className="font-mono text-caption text-on-surface">{l.action}</span>,
    },
    {
      key: 'actor',
      header: 'Actor',
      hideOnMobile: true,
      render: (l) => (
        <span className="text-secondary">
          {l.actorType}
          <span className="text-on-surface-variant"> · {l.actorId.slice(0, 8)}</span>
        </span>
      ),
    },
    {
      key: 'target',
      header: 'Target',
      hideOnMobile: true,
      render: (l) =>
        l.targetType ? (
          <span className="text-secondary">
            {l.targetType}
            {l.targetId ? ` · ${l.targetId.slice(0, 8)}` : ''}
          </span>
        ) : (
          <span className="text-secondary">—</span>
        ),
    },
    {
      key: 'when',
      header: 'When',
      align: 'right',
      render: (l) => <span className="text-secondary">{formatRelativeTime(l.createdAt)}</span>,
    },
  ]

  return (
    <>
      <PageHeader title="Audit Log" description="Every platform mutation, newest first." />
      <DataTable
        columns={columns}
        rows={logs}
        getRowKey={(l) => l.id}
        empty={
          <EmptyState
            icon="receipt_long"
            title="No activity recorded yet"
            description="Audited actions (org changes, member edits, suspensions) will appear here once mutation logging is enabled in Phase 2."
          />
        }
      />
    </>
  )
}
