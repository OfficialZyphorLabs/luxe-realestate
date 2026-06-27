/**
 * claims.ts — Loads the per-user session claims (super-admin flag + org
 * memberships) that get embedded into the JWT at sign-in.
 *
 * This runs ONLY when a token is first minted (login / OAuth callback), never on
 * every request — middleware/proxy and server components read the cached claims
 * straight from the signed token. That keeps the hot path DB-free while the
 * token stays the single source of truth for coarse authorization.
 *
 * Query is `select`-scoped to exactly the fields needed (no over-fetching), and
 * joins memberships → organization in a single round-trip.
 */
import { prisma } from '@/lib/prisma'
import type { SessionMembership } from '@/types/auth'

export interface UserSessionClaims {
  avatarUrl: string | null
  isSuperAdmin: boolean
  memberships: SessionMembership[]
}

/** Returns the claims for a user id, or null if the user no longer exists. */
export async function getUserSessionClaims(userId: string): Promise<UserSessionClaims | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      isSuperAdmin: true,
      avatarUrl: true,
      image: true,
      memberships: {
        select: {
          role: true,
          organization: { select: { id: true, slug: true, name: true } },
        },
      },
    },
  })

  if (!user) return null

  return {
    // Prefer an app-managed avatar; fall back to the OAuth profile picture.
    avatarUrl: user.avatarUrl ?? user.image ?? null,
    isSuperAdmin: user.isSuperAdmin,
    memberships: user.memberships.map((m) => ({
      orgId: m.organization.id,
      orgSlug: m.organization.slug,
      orgName: m.organization.name,
      role: m.role,
    })),
  }
}
