/**
 * SuperAdmin layout — gate + platform shell.
 * `requireSuperAdmin` enforces the platform role here (defense in depth beyond
 * proxy.ts); non-admins are redirected home.
 */
import { requireSuperAdmin } from '@/lib/auth/session'
import { SuperAdminShell } from '@/components/dashboard/superadmin/SuperAdminShell'

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSuperAdmin()

  return (
    <SuperAdminShell
      user={{
        name: session.user.name,
        email: session.user.email,
        avatarUrl: session.user.avatarUrl,
      }}
    >
      {children}
    </SuperAdminShell>
  )
}
