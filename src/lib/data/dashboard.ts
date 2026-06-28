/**
 * dashboard.ts — Server-side data access for the org dashboards.
 *
 * Every query is explicitly scoped by `organizationId` (the primary tenant
 * boundary; Postgres RLS is the backstop). Called only from Server Components
 * and Server Actions — never the client.
 */
import { cache } from 'react'
import { prisma } from '@/lib/prisma'
import type { Plan } from '@/generated/prisma'

// ── Plan configuration (SAAS_ARCHITECTURE.md §12) ──
export const PLAN_LIMITS: Record<Plan, { members: number | null; listings: number | null }> = {
  STARTER: { members: 5, listings: 20 },
  GROWTH: { members: 20, listings: 100 },
  ENTERPRISE: { members: null, listings: null },
}

export const PLAN_LABELS: Record<Plan, string> = {
  STARTER: 'Starter',
  GROWTH: 'Growth',
  ENTERPRISE: 'Enterprise',
}

export const PLAN_PRICES: Record<Plan, string> = {
  STARTER: '$49',
  GROWTH: '$149',
  ENTERPRISE: 'Custom',
}

/**
 * Org core record + settings, subscription, and entity counts for a slug.
 * Wrapped in React `cache()` so the layout and the page in a single request
 * share one query instead of hitting the DB twice.
 */
export const getOrgBySlug = cache(async (slug: string) => {
  return prisma.organization.findUnique({
    where: { slug },
    include: {
      settings: true,
      subscription: true,
      _count: { select: { memberships: true, properties: true, leads: true } },
    },
  })
})

/** Aggregated metrics + recent activity for the dashboard home. */
export async function getOrgOverview(orgId: string) {
  const [
    activeListings,
    totalListings,
    newLeads,
    totalLeads,
    memberCount,
    portfolio,
    recentLeads,
    members,
  ] = await Promise.all([
    prisma.property.count({ where: { organizationId: orgId, status: 'ACTIVE' } }),
    prisma.property.count({ where: { organizationId: orgId } }),
    prisma.lead.count({ where: { organizationId: orgId, status: 'NEW' } }),
    prisma.lead.count({ where: { organizationId: orgId } }),
    prisma.membership.count({ where: { organizationId: orgId } }),
    prisma.property.aggregate({
      where: { organizationId: orgId, status: 'ACTIVE' },
      _sum: { price: true },
    }),
    prisma.lead.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { property: { select: { title: true, slug: true } } },
    }),
    prisma.membership.findMany({
      where: { organizationId: orgId },
      include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
      orderBy: { joinedAt: 'asc' },
      take: 6,
    }),
  ])

  return {
    activeListings,
    totalListings,
    newLeads,
    totalLeads,
    memberCount,
    portfolioValue: portfolio._sum.price ?? 0,
    recentLeads,
    members,
  }
}

/** Full member roster (admins first, then by join date). */
export async function getOrgMembers(orgId: string) {
  return prisma.membership.findMany({
    where: { organizationId: orgId },
    include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
    orderBy: [{ role: 'asc' }, { joinedAt: 'asc' }],
  })
}

/** Outstanding (unaccepted, unexpired) invitations for the org. */
export async function getPendingInvitations(orgId: string) {
  return prisma.invitation.findMany({
    where: { organizationId: orgId, acceptedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { expiresAt: 'desc' },
  })
}
