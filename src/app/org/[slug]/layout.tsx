/**
 * Org dashboard layout — guards access and renders the dashboard shell.
 *
 * Authorization is enforced here (not just in proxy.ts): `requireOrgAccess`
 * redirects non-members, and a missing org 404s. Super-admins pass `can()` and
 * may view any org. The resolved org + role are handed to the client shell.
 */
import { notFound } from 'next/navigation'
import { requireOrgAccess } from '@/lib/auth/session'
import { isAdminOf } from '@/lib/permissions'
import { getOrgBySlug, PLAN_LABELS } from '@/lib/data/dashboard'
import { OrgShell } from '@/components/dashboard/org/OrgShell'

export default async function OrgLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const session = await requireOrgAccess(slug)
  const org = await getOrgBySlug(slug)
  if (!org) notFound()

  return (
    <OrgShell
      slug={slug}
      orgName={org.name}
      planLabel={PLAN_LABELS[org.plan]}
      isAdmin={isAdminOf(session, slug)}
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
