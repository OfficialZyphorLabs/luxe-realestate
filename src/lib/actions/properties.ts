'use server'

/**
 * properties.ts — Server Actions for property listings (Phase 4 CRUD).
 *
 * Every action re-authorizes against the live session (never trusting the proxy
 * alone), scopes the target to the org in the slug, and enforces the finer
 * ownership rule the permission table defers here: a plain MEMBER may create
 * listings and edit only their OWN, while `properties:edit-any` / `:delete`
 * (ADMIN, super-admin) act on any listing. Each mutation writes an audit entry.
 *
 * Inputs arrive as a typed object (not FormData) so the ordered `images` array
 * survives; the action always re-validates with `propertyInputSchema`.
 */
import { revalidatePath } from 'next/cache'
import type { Session } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { can } from '@/lib/permissions'
import { logAction } from '@/lib/audit'
import { propertyInputSchema, type PropertyInput } from '@/lib/validations/property'
import { slugify } from '@/lib/validations/auth'
import { getOrgBySlug } from '@/lib/data/dashboard'
import { getPropertyById, isPropertySlugTaken } from '@/lib/data/properties'
import type { PropertyStatus } from '@/generated/prisma'

export type ActionResult = { ok: true } | { ok: false; error: string }
export type CreateResult = { ok: true; id: string; slug: string } | { ok: false; error: string }

/** Resolve the org for `slug` and confirm the caller may act on it. */
async function authorizeOrg(
  slug: string,
  permission: Parameters<typeof can>[1]
): Promise<{ session: Session; orgId: string } | { error: string }> {
  const session = await auth()
  if (!session?.user) return { error: 'You must be signed in.' }
  if (!can(session, permission, slug)) return { error: 'You do not have permission.' }
  const org = await getOrgBySlug(slug)
  if (!org) return { error: 'Organization not found.' }
  return { session, orgId: org.id }
}

/** Derive a slug from the title that is unique within the org. */
async function uniquePropertySlug(orgId: string, title: string): Promise<string> {
  const base = slugify(title) || 'listing'
  let candidate = base
  for (let n = 2; n <= 50 && (await isPropertySlugTaken(orgId, candidate)); n++) {
    candidate = `${base}-${n}`
  }
  return candidate
}

/** Map a validated image URL list to nested-create rows preserving order. */
function imageRows(images: string[]) {
  return images.map((url, order) => ({ url, order }))
}

export async function createProperty(slug: string, input: PropertyInput): Promise<CreateResult> {
  const authz = await authorizeOrg(slug, 'properties:create')
  if ('error' in authz) return { ok: false, error: authz.error }

  const parsed = propertyInputSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Please check the form.' }
  const data = parsed.data

  const propertySlug = await uniquePropertySlug(authz.orgId, data.title)

  const property = await prisma.property.create({
    data: {
      organizationId: authz.orgId,
      slug: propertySlug,
      title: data.title,
      description: data.description || null,
      price: data.price,
      address: data.address,
      city: data.city,
      state: data.state,
      beds: data.beds,
      baths: data.baths,
      sqft: data.sqft,
      propertyType: data.propertyType,
      status: data.status,
      createdById: authz.session.user.id,
      images: { create: imageRows(data.images) },
    },
    select: { id: true, slug: true },
  })

  await logAction({
    actorId: authz.session.user.id,
    actorType: 'USER',
    organizationId: authz.orgId,
    action: 'property.created',
    targetType: 'Property',
    targetId: property.id,
    metadata: { title: data.title, status: data.status },
  })

  revalidatePath(`/org/${slug}/listings`)
  return { ok: true, id: property.id, slug: property.slug }
}

export async function updateProperty(
  slug: string,
  id: string,
  input: PropertyInput
): Promise<ActionResult> {
  const authz = await authorizeOrg(slug, 'properties:create')
  if ('error' in authz) return { ok: false, error: authz.error }

  const existing = await getPropertyById(authz.orgId, id)
  if (!existing) return { ok: false, error: 'Listing not found.' }

  // Ownership: members may edit only their own; edit-any covers admins.
  const editAny = can(authz.session, 'properties:edit-any', slug)
  if (!editAny && existing.createdById !== authz.session.user.id) {
    return { ok: false, error: 'You can only edit listings you created.' }
  }

  const parsed = propertyInputSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Please check the form.' }
  const data = parsed.data

  // Slug stays stable across edits to preserve any shared/public URLs.
  await prisma.property.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description || null,
      price: data.price,
      address: data.address,
      city: data.city,
      state: data.state,
      beds: data.beds,
      baths: data.baths,
      sqft: data.sqft,
      propertyType: data.propertyType,
      status: data.status,
      // Replace the image set wholesale: clear then re-create in order.
      images: { deleteMany: {}, create: imageRows(data.images) },
    },
  })

  await logAction({
    actorId: authz.session.user.id,
    actorType: 'USER',
    organizationId: authz.orgId,
    action: 'property.updated',
    targetType: 'Property',
    targetId: id,
  })

  revalidatePath(`/org/${slug}/listings`)
  revalidatePath(`/org/${slug}/listings/${id}/edit`)
  return { ok: true }
}

export async function deleteProperty(slug: string, id: string): Promise<ActionResult> {
  const authz = await authorizeOrg(slug, 'properties:delete')
  if ('error' in authz) return { ok: false, error: authz.error }

  const existing = await getPropertyById(authz.orgId, id)
  if (!existing) return { ok: false, error: 'Listing not found.' }

  await prisma.property.delete({ where: { id } })
  await logAction({
    actorId: authz.session.user.id,
    actorType: 'USER',
    organizationId: authz.orgId,
    action: 'property.deleted',
    targetType: 'Property',
    targetId: id,
    metadata: { title: existing.title },
  })

  revalidatePath(`/org/${slug}/listings`)
  return { ok: true }
}

/**
 * Quick status change from the listings table (publish / unpublish / mark
 * sold / withdraw). Same ownership rule as editing.
 */
export async function setPropertyStatus(
  slug: string,
  id: string,
  status: PropertyStatus
): Promise<ActionResult> {
  const authz = await authorizeOrg(slug, 'properties:create')
  if ('error' in authz) return { ok: false, error: authz.error }

  const existing = await getPropertyById(authz.orgId, id)
  if (!existing) return { ok: false, error: 'Listing not found.' }

  const editAny = can(authz.session, 'properties:edit-any', slug)
  if (!editAny && existing.createdById !== authz.session.user.id) {
    return { ok: false, error: 'You can only change listings you created.' }
  }

  await prisma.property.update({ where: { id }, data: { status } })

  // Publishing (→ ACTIVE) and unpublishing (ACTIVE → DRAFT) get their own
  // audit verbs; other transitions log as a generic update.
  const action =
    status === 'ACTIVE'
      ? 'property.published'
      : existing.status === 'ACTIVE' && status === 'DRAFT'
        ? 'property.unpublished'
        : 'property.updated'
  await logAction({
    actorId: authz.session.user.id,
    actorType: 'USER',
    organizationId: authz.orgId,
    action,
    targetType: 'Property',
    targetId: id,
    metadata: { status },
  })

  revalidatePath(`/org/${slug}/listings`)
  return { ok: true }
}
