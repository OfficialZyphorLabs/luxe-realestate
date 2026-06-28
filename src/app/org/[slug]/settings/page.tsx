/**
 * Org settings — profile + white-label settings. Admin-only (org:write).
 */
import { notFound } from 'next/navigation'
import { requireOrgAccess } from '@/lib/auth/session'
import { getOrgBySlug } from '@/lib/data/dashboard'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { OrgSettingsForm } from '@/components/dashboard/org/OrgSettingsForm'

export default async function OrgSettingsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  await requireOrgAccess(slug, 'org:write')
  const org = await getOrgBySlug(slug)
  if (!org) notFound()

  return (
    <>
      <PageHeader title="Organization Settings" description="Manage your organization's profile and branding." />
      <OrgSettingsForm
        slug={slug}
        defaults={{
          name: org.name,
          logoUrl: org.logoUrl ?? '',
          primaryColor: org.settings?.primaryColor ?? '',
          allowPublicListings: org.settings?.allowPublicListings ?? true,
        }}
      />
    </>
  )
}
