/**
 * SuperAdmin — platform settings. Shows the signed-in admin's account today;
 * platform-wide config (email sender, maintenance mode) arrives in a later phase.
 */
import { getSession } from '@/lib/auth/session'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { MemberAvatar } from '@/components/dashboard/MemberAvatar'
import { RoleBadge } from '@/components/dashboard/RoleBadge'
import { EmptyState } from '@/components/dashboard/EmptyState'

export default async function SuperAdminSettingsPage() {
  const session = await getSession()
  const user = session?.user

  return (
    <>
      <PageHeader title="Platform Settings" description="Your account and platform configuration." />

      <section className="mb-8 flex items-center gap-4 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6">
        <MemberAvatar name={user?.name} email={user?.email} src={user?.avatarUrl} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-headline-md font-semibold text-primary">
            {user?.name ?? 'Platform Admin'}
          </p>
          <p className="truncate font-body text-body-md text-secondary">{user?.email}</p>
        </div>
        <RoleBadge role="SUPERADMIN" />
      </section>

      <EmptyState
        icon="settings"
        title="Platform configuration is coming soon"
        description="Email sender identity, maintenance mode, and other platform-wide settings will live here in a later phase."
      />
    </>
  )
}
