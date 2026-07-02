/**
 * platform.ts — Server-side data access for the SuperAdmin portal.
 *
 * Platform-wide (NOT org-scoped) — every caller must already be a super-admin
 * (enforced by the /superadmin layout + proxy). Read-only aggregates and lists.
 */
import { cache } from 'react'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@/generated/prisma'
import type { Plan, OrgStatus } from '@/generated/prisma'

/** Monthly price per plan, for a rough MRR estimate (Enterprise is custom → 0). */
export const PLAN_MONTHLY_PRICE: Record<Plan, number> = {
  STARTER: 49,
  GROWTH: 149,
  ENTERPRISE: 0,
}

/** Headline platform metrics for the overview. */
export async function getPlatformStats() {
  const since = new Date()
  since.setDate(since.getDate() - 30)

  const [totalOrgs, trialing, totalUsers, newUsers, newOrgs, totalListings, activeSubs] =
    await Promise.all([
      prisma.organization.count(),
      prisma.subscription.count({ where: { status: 'TRIALING' } }),
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: since } } }),
      prisma.organization.count({ where: { createdAt: { gte: since } } }),
      prisma.property.count(),
      prisma.subscription.findMany({
        where: { status: { in: ['ACTIVE', 'TRIALING'] } },
        select: { plan: true },
      }),
    ])

  const mrr = activeSubs.reduce((sum, s) => sum + PLAN_MONTHLY_PRICE[s.plan], 0)
  return { totalOrgs, trialing, totalUsers, newUsers, newOrgs, totalListings, mrr }
}

/** All organizations, filtered by free-text query, plan, and status. */
export async function getAllOrganizations(filters: {
  query?: string
  plan?: string
  status?: string
}) {
  const where: Prisma.OrganizationWhereInput = {}
  if (filters.query) {
    where.OR = [
      { name: { contains: filters.query, mode: 'insensitive' } },
      { slug: { contains: filters.query, mode: 'insensitive' } },
    ]
  }
  if (filters.plan && filters.plan !== 'all') where.plan = filters.plan as Plan
  if (filters.status && filters.status !== 'all') where.status = filters.status as OrgStatus

  return prisma.organization.findMany({
    where,
    include: {
      subscription: { select: { status: true } },
      _count: { select: { memberships: true, properties: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
}

/** Deep view of one organization (members, settings, subscription, counts). */
export const getOrganizationDetail = cache(async (orgId: string) => {
  return prisma.organization.findUnique({
    where: { id: orgId },
    include: {
      settings: true,
      subscription: true,
      _count: { select: { memberships: true, properties: true, leads: true } },
      memberships: {
        include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
        orderBy: [{ role: 'asc' }, { joinedAt: 'asc' }],
      },
    },
  })
})

/** All users across the platform, with their org memberships. */
export async function getAllUsers(query?: string) {
  const where: Prisma.UserWhereInput = query
    ? {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      }
    : {}

  return prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      isSuperAdmin: true,
      createdAt: true,
      memberships: {
        select: { role: true, organization: { select: { name: true, slug: true } } },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
  })
}

/** Most recent audit log entries (newest first). */
export async function getRecentAuditLogs(limit = 50) {
  return prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: limit })
}

/** Filtered audit log for the portal — supports text search and action-type filter. */
export async function getAuditLogs(filters: { query?: string; action?: string } = {}, limit = 100) {
  const where: Prisma.AuditLogWhereInput = {}

  if (filters.query) {
    where.OR = [
      { actorId: { contains: filters.query, mode: 'insensitive' } },
      { targetId: { contains: filters.query, mode: 'insensitive' } },
      { action: { contains: filters.query, mode: 'insensitive' } },
    ]
  }
  if (filters.action && filters.action !== 'all') {
    where.action = filters.action
  }

  return prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}
