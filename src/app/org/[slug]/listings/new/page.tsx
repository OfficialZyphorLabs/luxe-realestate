/**
 * New listing (Phase 4) — create form. Gated by properties:create (all members
 * may create). The PropertyForm posts to the createProperty Server Action and
 * redirects back to the listings index on success.
 */
import { requireOrgAccess } from '@/lib/auth/session'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { PropertyForm } from '@/components/dashboard/org/PropertyForm'

export default async function NewListingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  await requireOrgAccess(slug, 'properties:create')

  return (
    <>
      <PageHeader title="New listing" description="Add a property to your organization's portfolio." />
      <div className="max-w-3xl">
        <PropertyForm slug={slug} mode="create" />
      </div>
    </>
  )
}
