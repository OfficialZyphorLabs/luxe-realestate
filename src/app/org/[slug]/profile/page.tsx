/**
 * Profile — the signed-in user's own account settings (name, avatar, password).
 * Any member can manage their own profile.
 */
import { requireOrgAccess } from '@/lib/auth/session'
import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { MemberAvatar } from '@/components/dashboard/MemberAvatar'
import { ProfileDetailsForm, PasswordForm } from '@/components/dashboard/org/ProfileForms'

export default async function OrgProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const session = await requireOrgAccess(slug)

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, avatarUrl: true, passwordHash: true },
  })

  return (
    <>
      <PageHeader title="Your Profile" description="Manage your personal account details." />

      <div className="flex max-w-2xl flex-col gap-10">
        <section className="flex items-center gap-4 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6">
          <MemberAvatar name={user?.name} email={user?.email} src={user?.avatarUrl} size="lg" />
          <div className="min-w-0">
            <p className="truncate font-display text-headline-md font-semibold text-primary">
              {user?.name ?? 'Your account'}
            </p>
            <p className="truncate font-body text-body-md text-secondary">{user?.email}</p>
          </div>
        </section>

        <section>
          <h2 className="mb-4 font-display text-headline-md font-semibold text-primary">Details</h2>
          <ProfileDetailsForm
            defaults={{ name: user?.name ?? '', avatarUrl: user?.avatarUrl ?? '' }}
          />
        </section>

        <section>
          <h2 className="mb-4 font-display text-headline-md font-semibold text-primary">
            {user?.passwordHash ? 'Change password' : 'Set a password'}
          </h2>
          <PasswordForm hasPassword={Boolean(user?.passwordHash)} />
        </section>
      </div>
    </>
  )
}
