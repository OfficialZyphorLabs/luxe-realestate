/**
 * Members page — team roster + pending invitations.
 *
 * Read for any member (members:read); invite control and the pending list are
 * admin-only. The roster renders through the presentational DataTable; row
 * actions (role change / remove) are layered on in the next step.
 */
import { notFound } from 'next/navigation'
import { requireOrgAccess } from '@/lib/auth/session'
import { isAdminOf } from '@/lib/permissions'
import { getOrgBySlug, getOrgMembers, getPendingInvitations } from '@/lib/data/dashboard'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { MemberAvatar } from '@/components/dashboard/MemberAvatar'
import { RoleBadge } from '@/components/dashboard/RoleBadge'
import { EmptyState } from '@/components/dashboard/EmptyState'
import { DataTable, type Column } from '@/components/dashboard/DataTable'
import { InviteMemberButton } from '@/components/dashboard/org/InviteMemberButton'
import { formatDate, formatRelativeTime } from '@/lib/format'

type MemberRow = Awaited<ReturnType<typeof getOrgMembers>>[number]

export default async function OrgMembersPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const session = await requireOrgAccess(slug, 'members:read')
  const org = await getOrgBySlug(slug)
  if (!org) notFound()

  const isAdmin = isAdminOf(session, slug)
  const [members, pending] = await Promise.all([
    getOrgMembers(org.id),
    isAdmin ? getPendingInvitations(org.id) : Promise.resolve([]),
  ])

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
        title="Members"
        description={`${members.length} ${members.length === 1 ? 'person' : 'people'} in ${org.name}.`}
        actions={isAdmin ? <InviteMemberButton slug={slug} /> : undefined}
      />

      <DataTable columns={columns} rows={members} getRowKey={(m) => m.id} />

      {isAdmin && pending.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 font-display text-headline-md font-semibold text-primary">
            Pending Invitations
          </h2>
          <ul className="divide-y divide-outline-variant/20 rounded-xl border border-outline-variant/30 bg-surface-container-lowest">
            {pending.map((inv) => (
              <li key={inv.id} className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="min-w-0">
                  <p className="truncate font-body text-label-md font-semibold text-on-surface">
                    {inv.email}
                  </p>
                  <p className="font-body text-caption text-secondary">
                    Expires {formatRelativeTime(inv.expiresAt)}
                  </p>
                </div>
                <RoleBadge role={inv.role} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {members.length === 0 && (
        <EmptyState
          icon="group"
          title="No members yet"
          description="Invite teammates to collaborate in this organization."
          className="mt-6"
        />
      )}
    </>
  )
}
