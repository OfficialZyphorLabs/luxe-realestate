/**
 * leads.ts — Server-side data access for leads (inquiries).
 *
 * Org-scoped like all tenant data. Additionally applies ROLE scoping: callers
 * without `leads:view-all` (i.e. plain MEMBERs) only see leads assigned to
 * them — the finer-grained rule the permission table defers to the data layer.
 */
import { cache } from 'react'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@/generated/prisma'
import type { LeadStatus } from '@/generated/prisma'

/** Assignee/property fields every lead row needs for display. */
const leadRowInclude = {
  property: { select: { id: true, title: true, slug: true } },
  assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
} satisfies Prisma.LeadInclude

export interface LeadListFilters {
  query?: string
  status?: LeadStatus
}

export interface LeadScope {
  /** The viewing user's id — used to restrict MEMBERs to their own leads. */
  viewerId: string
  /** True for ADMIN / super-admin (`leads:view-all`); false narrows to assigned. */
  canViewAll: boolean
}

/** Build the tenant + role WHERE clause shared by list and board queries. */
function buildLeadWhere(
  orgId: string,
  scope: LeadScope,
  filters: LeadListFilters
): Prisma.LeadWhereInput {
  const where: Prisma.LeadWhereInput = { organizationId: orgId }
  if (!scope.canViewAll) where.assignedTo = scope.viewerId
  if (filters.status) where.status = filters.status
  if (filters.query) {
    where.OR = [
      { name: { contains: filters.query, mode: 'insensitive' } },
      { email: { contains: filters.query, mode: 'insensitive' } },
    ]
  }
  return where
}

/**
 * Flat, filtered list of leads (newest first) — powers both the list view and
 * the Kanban board (the page groups by status client-side). Capped so a busy
 * org's board stays responsive; the count is surfaced separately when needed.
 */
export async function listLeads(
  orgId: string,
  scope: LeadScope,
  filters: LeadListFilters = {}
) {
  return prisma.lead.findMany({
    where: buildLeadWhere(orgId, scope, filters),
    include: leadRowInclude,
    orderBy: { createdAt: 'desc' },
    take: 300,
  })
}

export type LeadRow = Awaited<ReturnType<typeof listLeads>>[number]

/**
 * A single lead with its property, assignee, and full note timeline (newest
 * first, each with author). Scoped to the org and — for non-privileged viewers
 * — to their own assignment, so members can't read others' leads by id.
 */
export const getLeadById = cache(async (orgId: string, id: string, scope: LeadScope) => {
  const where: Prisma.LeadWhereInput = { id, organizationId: orgId }
  if (!scope.canViewAll) where.assignedTo = scope.viewerId

  return prisma.lead.findFirst({
    where,
    include: {
      ...leadRowInclude,
      notes: {
        orderBy: { createdAt: 'desc' },
        include: { author: { select: { id: true, name: true, email: true, avatarUrl: true } } },
      },
    },
  })
})

export type LeadDetail = NonNullable<Awaited<ReturnType<typeof getLeadById>>>
