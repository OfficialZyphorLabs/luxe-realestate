/**
 * SuperAdmin — all users across the platform, with their org memberships and
 * a grant/revoke SuperAdmin action per row.
 */
import { getAllUsers } from '@/lib/data/platform'
import { requireSuperAdmin } from '@/lib/auth/session'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { MemberAvatar } from '@/components/dashboard/MemberAvatar'
import { RoleBadge } from '@/components/dashboard/RoleBadge'
import { EmptyState } from '@/components/dashboard/EmptyState'
import { DataTable, type Column } from '@/components/dashboard/DataTable'
import { TableSearch } from '@/components/dashboard/superadmin/TableSearch'
import { UserActions } from '@/components/dashboard/superadmin/UserActions'
import { formatDate } from '@/lib/format'

type UserRow = Awaited<ReturnType<typeof getAllUsers>>[number]

export default async function SuperAdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>
}) {
  const [{ query }, session] = await Promise.all([searchParams, requireSuperAdmin()])
  const users = await getAllUsers(query)
  const currentUserId = session.user.id

  const columns: Column<UserRow>[] = [
    {
      key: 'user',
      header: 'User',
      render: (u) => (
        <div className="flex items-center gap-3">
          <MemberAvatar name={u.name} email={u.email} src={u.avatarUrl} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-body text-label-md font-semibold text-on-surface">
              {u.name ?? '—'}
            </p>
            <p className="truncate font-body text-caption text-secondary">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'memberships',
      header: 'Organizations',
      hideOnMobile: true,
      render: (u) =>
        u.isSuperAdmin ? (
          <RoleBadge role="SUPERADMIN" />
        ) : u.memberships.length === 0 ? (
          <span className="text-secondary">—</span>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {u.memberships.map((m) => (
              <span
                key={m.organization.slug}
                className="inline-flex items-center gap-1 rounded-full bg-surface-variant px-2.5 py-0.5 font-body text-caption text-on-surface-variant"
              >
                {m.organization.name}
                <span className="text-secondary">· {m.role === 'ADMIN' ? 'Admin' : 'Member'}</span>
              </span>
            ))}
          </div>
        ),
    },
    {
      key: 'joined',
      header: 'Joined',
      hideOnMobile: true,
      render: (u) => <span className="text-secondary">{formatDate(u.createdAt)}</span>,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (u) => (
        <UserActions
          userId={u.id}
          userName={u.name}
          isSuperAdmin={u.isSuperAdmin}
          currentUserId={currentUserId}
        />
      ),
    },
  ]

  return (
    <>
      <PageHeader title="Users" description={`${users.length} users across all organizations.`} />
      <TableSearch placeholder="Search by name or email" />
      <DataTable
        columns={columns}
        rows={users}
        getRowKey={(u) => u.id}
        empty={<EmptyState icon="group" title="No users match" description="Try a different search." />}
      />
    </>
  )
}
