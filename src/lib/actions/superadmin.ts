'use server'

/**
 * superadmin.ts — Server Actions for SuperAdmin mutations.
 *
 * Every action re-verifies `isSuperAdmin` from the live session before touching
 * the DB — never trusting only the proxy. Writes are followed by an audit log
 * entry and `revalidatePath` so the portal reflects changes immediately.
 *
 * Also contains impersonation lifecycle actions (start / exit) that set or
 * clear the `luxe-impersonation` HttpOnly cookie that the org layout reads to
 * show the ImpersonationBanner.
 */
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { logAction } from '@/lib/audit'
import { IMPERSONATION_COOKIE } from '@/lib/impersonation'
import type { Plan } from '@/generated/prisma'

export type ActionResult = { ok: true } | { ok: false; error: string }

/** Verify the caller is a super-admin; return the session or null. */
async function assertSuperAdmin() {
  const session = await auth()
  if (!session?.user?.isSuperAdmin) return null
  return session
}

// ─── Org lifecycle ────────────────────────────────────────────────────────────

export async function suspendOrg(orgId: string): Promise<ActionResult> {
  const session = await assertSuperAdmin()
  if (!session) return { ok: false, error: 'Permission denied.' }

  await prisma.organization.update({ where: { id: orgId }, data: { status: 'SUSPENDED' } })
  await logAction({
    actorId: session.user.id,
    actorType: 'SUPERADMIN',
    organizationId: orgId,
    action: 'org.suspended',
    targetType: 'Organization',
    targetId: orgId,
  })
  revalidatePath('/superadmin/organizations')
  revalidatePath(`/superadmin/organizations/${orgId}`)
  return { ok: true }
}

export async function reactivateOrg(orgId: string): Promise<ActionResult> {
  const session = await assertSuperAdmin()
  if (!session) return { ok: false, error: 'Permission denied.' }

  await prisma.organization.update({ where: { id: orgId }, data: { status: 'ACTIVE' } })
  await logAction({
    actorId: session.user.id,
    actorType: 'SUPERADMIN',
    organizationId: orgId,
    action: 'org.reactivated',
    targetType: 'Organization',
    targetId: orgId,
  })
  revalidatePath('/superadmin/organizations')
  revalidatePath(`/superadmin/organizations/${orgId}`)
  return { ok: true }
}

export async function softDeleteOrg(orgId: string): Promise<ActionResult> {
  const session = await assertSuperAdmin()
  if (!session) return { ok: false, error: 'Permission denied.' }

  await prisma.organization.update({ where: { id: orgId }, data: { status: 'DELETED' } })
  await logAction({
    actorId: session.user.id,
    actorType: 'SUPERADMIN',
    organizationId: orgId,
    action: 'org.deleted',
    targetType: 'Organization',
    targetId: orgId,
  })
  revalidatePath('/superadmin/organizations')
  revalidatePath(`/superadmin/organizations/${orgId}`)
  return { ok: true }
}

export async function changeOrgPlan(orgId: string, plan: Plan): Promise<ActionResult> {
  const session = await assertSuperAdmin()
  if (!session) return { ok: false, error: 'Permission denied.' }

  await prisma.$transaction([
    prisma.organization.update({ where: { id: orgId }, data: { plan } }),
    prisma.subscription.updateMany({ where: { organizationId: orgId }, data: { plan } }),
  ])
  await logAction({
    actorId: session.user.id,
    actorType: 'SUPERADMIN',
    organizationId: orgId,
    action: 'org.plan_changed',
    targetType: 'Organization',
    targetId: orgId,
    metadata: { plan },
  })
  revalidatePath('/superadmin/organizations')
  revalidatePath(`/superadmin/organizations/${orgId}`)
  return { ok: true }
}

// ─── User mutations ───────────────────────────────────────────────────────────

export async function grantSuperAdmin(userId: string): Promise<ActionResult> {
  const session = await assertSuperAdmin()
  if (!session) return { ok: false, error: 'Permission denied.' }

  await prisma.user.update({ where: { id: userId }, data: { isSuperAdmin: true } })
  await logAction({
    actorId: session.user.id,
    actorType: 'SUPERADMIN',
    action: 'user.superadmin_granted',
    targetType: 'User',
    targetId: userId,
  })
  revalidatePath('/superadmin/users')
  return { ok: true }
}

export async function revokeSuperAdmin(userId: string): Promise<ActionResult> {
  const session = await assertSuperAdmin()
  if (!session) return { ok: false, error: 'Permission denied.' }
  if (session.user.id === userId) {
    return { ok: false, error: 'You cannot revoke your own super-admin status.' }
  }

  await prisma.user.update({ where: { id: userId }, data: { isSuperAdmin: false } })
  await logAction({
    actorId: session.user.id,
    actorType: 'SUPERADMIN',
    action: 'user.superadmin_revoked',
    targetType: 'User',
    targetId: userId,
  })
  revalidatePath('/superadmin/users')
  return { ok: true }
}

// ─── Impersonation lifecycle ──────────────────────────────────────────────────

/**
 * Set the impersonation cookie and redirect into the org dashboard.
 * The cookie value is `orgSlug` — the org layout reads it to show the banner.
 */
export async function startImpersonation(orgSlug: string): Promise<never> {
  const session = await assertSuperAdmin()
  if (!session) redirect('/')

  const cookieStore = await cookies()
  cookieStore.set(IMPERSONATION_COOKIE, orgSlug, {
    httpOnly: true,
    sameSite: 'strict',
    path: '/',
    // Session cookie — expires when the browser closes, or when the admin exits.
    maxAge: 60 * 60 * 4, // 4 hours max
  })

  await logAction({
    actorId: session.user.id,
    actorType: 'SUPERADMIN',
    action: 'impersonation.started',
    targetType: 'Organization',
    metadata: { orgSlug },
  })

  redirect(`/org/${orgSlug}/dashboard`)
}

/** Clear the impersonation cookie and return to the SuperAdmin portal. */
export async function exitImpersonation(): Promise<never> {
  const session = await auth()
  const cookieStore = await cookies()

  if (session?.user?.isSuperAdmin) {
    const orgSlug = cookieStore.get(IMPERSONATION_COOKIE)?.value
    await logAction({
      actorId: session.user.id,
      actorType: 'SUPERADMIN',
      action: 'impersonation.ended',
      metadata: orgSlug ? { orgSlug } : undefined,
    })
  }

  cookieStore.delete(IMPERSONATION_COOKIE)
  redirect('/superadmin')
}
