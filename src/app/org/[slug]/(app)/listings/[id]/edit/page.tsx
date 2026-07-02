/**
 * Edit listing (Phase 4) — pre-populated form. Loads the property scoped to the
 * org (404 on cross-tenant/missing) and enforces the same ownership rule as the
 * update action: members may edit only their own listings, admins any.
 */
import { notFound, redirect } from 'next/navigation'
import { requireOrgAccess } from '@/lib/auth/session'
import { can } from '@/lib/permissions'
import { getOrgBySlug } from '@/lib/data/dashboard'
import { getPropertyById } from '@/lib/data/properties'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { PropertyForm, type PropertyFormDefaults } from '@/components/dashboard/org/PropertyForm'

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>
}) {
  const { slug, id } = await params
  const session = await requireOrgAccess(slug, 'properties:create')
  const org = await getOrgBySlug(slug)
  if (!org) notFound()

  const property = await getPropertyById(org.id, id)
  if (!property) notFound()

  // Ownership: members may edit only their own; admins/super-admins edit any.
  const editAny = can(session, 'properties:edit-any', slug)
  if (!editAny && property.createdById !== session.user.id) {
    redirect(`/org/${slug}/listings`)
  }

  const defaults: PropertyFormDefaults = {
    title: property.title,
    description: property.description ?? '',
    price: String(property.price),
    address: property.address,
    city: property.city,
    state: property.state,
    beds: property.beds?.toString() ?? '',
    baths: property.baths?.toString() ?? '',
    sqft: property.sqft?.toString() ?? '',
    propertyType: property.propertyType,
    status: property.status,
    images: property.images.map((img) => img.url),
  }

  return (
    <>
      <PageHeader title="Edit listing" description={property.title} />
      <div className="max-w-3xl">
        <PropertyForm slug={slug} mode="edit" propertyId={property.id} defaults={defaults} />
      </div>
    </>
  )
}
