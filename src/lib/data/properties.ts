/**
 * properties.ts — Server-side data access for property listings.
 *
 * Every query is explicitly scoped by `organizationId` (the tenant boundary;
 * Postgres RLS is the backstop). Read-only — mutations live in
 * `lib/actions/properties.ts`. Called only from Server Components / Actions.
 */
import { cache } from 'react'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@/generated/prisma'
import type { PropertyStatus } from '@/generated/prisma'

/** Listings shown per page on the management table/grid. */
export const PROPERTY_PAGE_SIZE = 12

export interface PropertyListFilters {
  query?: string
  status?: PropertyStatus
  page?: number
}

/**
 * Paginated, filtered list of an org's properties (newest first). Each row
 * carries only its cover image (first by order) and a lead count — enough for
 * both the table and grid views without over-fetching.
 */
export async function listProperties(orgId: string, filters: PropertyListFilters = {}) {
  const page = Math.max(1, filters.page ?? 1)
  const skip = (page - 1) * PROPERTY_PAGE_SIZE

  const where: Prisma.PropertyWhereInput = { organizationId: orgId }
  if (filters.status) where.status = filters.status
  if (filters.query) {
    where.OR = [
      { title: { contains: filters.query, mode: 'insensitive' } },
      { address: { contains: filters.query, mode: 'insensitive' } },
      { city: { contains: filters.query, mode: 'insensitive' } },
    ]
  }

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      include: {
        images: { orderBy: { order: 'asc' }, take: 1 },
        _count: { select: { leads: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: PROPERTY_PAGE_SIZE,
    }),
    prisma.property.count({ where }),
  ])

  return {
    properties,
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / PROPERTY_PAGE_SIZE)),
  }
}

export type PropertyListRow = Awaited<ReturnType<typeof listProperties>>['properties'][number]

/**
 * A single property by id, scoped to the org. Returns null if it belongs to a
 * different tenant (so callers 404 rather than leak existence). Images ordered.
 * Wrapped in React `cache()` so a page + its metadata share one query.
 */
export const getPropertyById = cache(async (orgId: string, id: string) => {
  return prisma.property.findFirst({
    where: { id, organizationId: orgId },
    include: { images: { orderBy: { order: 'asc' } } },
  })
})

/** Count of an org's properties — used for plan-limit enforcement. */
export function countOrgProperties(orgId: string): Promise<number> {
  return prisma.property.count({ where: { organizationId: orgId } })
}

/** Is a slug already taken within this org? (Excludes `exceptId` when editing.) */
export async function isPropertySlugTaken(
  orgId: string,
  slug: string,
  exceptId?: string
): Promise<boolean> {
  const existing = await prisma.property.findFirst({
    where: { organizationId: orgId, slug, ...(exceptId ? { NOT: { id: exceptId } } : {}) },
    select: { id: true },
  })
  return existing !== null
}

// ─── Public (white-label) reads ────────────────────────────────────────────

/** All ACTIVE listings for an org's public catalog (with cover image). */
export async function listActiveOrgProperties(orgId: string) {
  return prisma.property.findMany({
    where: { organizationId: orgId, status: 'ACTIVE' },
    include: { images: { orderBy: { order: 'asc' }, take: 1 } },
    orderBy: { createdAt: 'desc' },
  })
}

/** A single ACTIVE public listing by slug (full images), scoped to the org. */
export async function getPublicPropertyBySlug(orgId: string, slug: string) {
  return prisma.property.findFirst({
    where: { organizationId: orgId, slug, status: 'ACTIVE' },
    include: { images: { orderBy: { order: 'asc' } } },
  })
}
