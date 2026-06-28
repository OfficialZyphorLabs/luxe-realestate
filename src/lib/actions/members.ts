'use server'

/**
 * members.ts — Server Actions for managing org membership.
 *
 * Each action re-authorizes independently (never trusting the proxy alone),
 * scopes the target to the org in the slug, and guards org integrity (an org
 * must keep at least one admin; you can't remove yourself). Returns a result
 * object instead of throwing so the client can render friendly errors.
 */
import { revalidatePath } from 'next/cache'
import type { Session } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { can, type Permission } from '@/lib/permissions'
import type { OrgRole } from '@/generated/prisma'

export type ActionResult = { ok: true } | { ok: false; error: string }

/** Authorize the caller for `permission` within `slug`, returning the session. */
async function authorize(
  slug: string,
  permission: Permission
): Promise<{ session: Session } | { error: string }> {
  const session = await auth()
  if (!session?.user) return { error: 'You must be signed in.' }
  if (!can(session, permission, slug)) return { error: 'You do not have permission.' }
  return { session }
}

/** Load a membership and confirm it belongs to `slug`. */
async function loadMembership(membershipId: string, slug: string) {
  const membership = await prisma.membership.findUnique({
    where: { id: membershipId },
    include: { organization: { select: { slug: true } } },
  })
  if (!membership || membership.organization.slug !== slug) return null
  return membership
}

export async function updateMemberRole(
  slug: string,
  membershipId: string,
  role: OrgRole
): Promise<ActionResult> {
  const auth0 = await authorize(slug, 'members:promote')
  if ('error' in auth0) return { ok: false, error: auth0.error }

  const membership = await loadMembership(membershipId, slug)
  if (!membership) return { ok: false, error: 'Member not found.' }

  // Never leave the org without an admin.
  if (membership.role === 'ADMIN' && role === 'MEMBER') {
    const admins = await prisma.membership.count({
      where: { organizationId: membership.organizationId, role: 'ADMIN' },
    })
    if (admins <= 1) return { ok: false, error: 'An organization must have at least one admin.' }
  }

  await prisma.membership.update({ where: { id: membershipId }, data: { role } })
  revalidatePath(`/org/${slug}/members`)
  return { ok: true }
}

export async function removeMember(slug: string, membershipId: string): Promise<ActionResult> {
  const auth0 = await authorize(slug, 'members:remove')
  if ('error' in auth0) return { ok: false, error: auth0.error }

  const membership = await loadMembership(membershipId, slug)
  if (!membership) return { ok: false, error: 'Member not found.' }

  if (membership.userId === auth0.session.user.id) {
    return { ok: false, error: 'You cannot remove yourself.' }
  }
  if (membership.role === 'ADMIN') {
    const admins = await prisma.membership.count({
      where: { organizationId: membership.organizationId, role: 'ADMIN' },
    })
    if (admins <= 1) return { ok: false, error: 'You cannot remove the last admin.' }
  }

  await prisma.membership.delete({ where: { id: membershipId } })
  revalidatePath(`/org/${slug}/members`)
  return { ok: true }
}

export async function cancelInvitation(slug: string, invitationId: string): Promise<ActionResult> {
  const auth0 = await authorize(slug, 'members:invite')
  if ('error' in auth0) return { ok: false, error: auth0.error }

  const invitation = await prisma.invitation.findUnique({
    where: { id: invitationId },
    include: { organization: { select: { slug: true } } },
  })
  if (!invitation || invitation.organization.slug !== slug) {
    return { ok: false, error: 'Invitation not found.' }
  }

  await prisma.invitation.delete({ where: { id: invitationId } })
  revalidatePath(`/org/${slug}/members`)
  return { ok: true }
}
