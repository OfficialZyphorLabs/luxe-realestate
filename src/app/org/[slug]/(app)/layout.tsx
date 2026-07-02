/**
 * Org dashboard layout — guards access and renders the dashboard shell.
 *
 * Authorization is enforced here (not just in proxy.ts): `requireOrgAccess`
 * redirects non-members, and a missing org 404s. Super-admins pass `can()` and
 * may view any org. The resolved org + role are handed to the client shell.
 *
 * Reads the `luxe-impersonation` cookie (set by startImpersonation) to show
 * the ImpersonationBanner when a SuperAdmin is viewing this org as admin.
 */
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { requireOrgAccess } from '@/lib/auth/session'
import { isAdminOf } from '@/lib/permissions'
import { getOrgBySlug, PLAN_LABELS } from '@/lib/data/dashboard'
import { OrgShell } from '@/components/dashboard/org/OrgShell'
import { IMPERSONATION_COOKIE } from '@/lib/impersonation'

export default async function OrgLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [session, cookieStore] = await Promise.all([requireOrgAccess(slug), cookies()])
  const org = await getOrgBySlug(slug)
  if (!org) notFound()

  const impersonating =
    session.user.isSuperAdmin && cookieStore.get(IMPERSONATION_COOKIE)?.value === slug

  return (
    <OrgShell
      slug={slug}
      orgName={org.name}
      planLabel={PLAN_LABELS[org.plan]}
      isAdmin={isAdminOf(session, slug)}
      impersonating={impersonating}
      user={{
        name: session.user.name,
        email: session.user.email,
        avatarUrl: session.user.avatarUrl,
      }}
    >
      {children}
    </OrgShell>
  )
}
