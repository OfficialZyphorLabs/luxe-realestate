'use server'

/**
 * leads.ts — Server Actions for managing leads from the dashboard.
 *
 * Access model:
 *  - ADMIN / super-admin manage every lead in the org.
 *  - A plain MEMBER may only act on leads ASSIGNED to them.
 * "Can view/manage all" is derived from `isAdminOf` (NOT the permission table —
 * its MEMBER `leads:view-all` entry is intentionally overridden by this finer
 * data-layer rule). Assignment itself is admin-only (`leads:assign`).
 *
 * Public inquiry creation is NOT here — anonymous submissions go through the
 * rate-limited POST /api/org/[slug]/leads route instead.
 */
import { revalidatePath } from 'next/cache'
import type { Session } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { can, isAdminOf, isMemberOf } from '@/lib/permissions'
import { logAction } from '@/lib/audit'
import { leadNoteSchema, LEAD_STATUSES } from '@/lib/validations/lead'
import { getOrgBySlug } from '@/lib/data/dashboard'
import type { Lead, LeadStatus } from '@/generated/prisma'

export type ActionResult = { ok: true } | { ok: false; error: string }

/**
 * Confirm the caller may manage lead `id` in `slug`: they must be a member of
 * the org, and — unless admin — the lead must be assigned to them. Returns the
 * loaded lead plus scope flags.
 */
async function authorizeLead(
  slug: string,
  id: string
): Promise<{ session: Session; orgId: string; lead: Lead; canViewAll: boolean } | { error: string }> {
  const session = await auth()
  if (!session?.user) return { error: 'You must be signed in.' }
  if (!isMemberOf(session, slug)) return { error: 'You do not have permission.' }

  const org = await getOrgBySlug(slug)
  if (!org) return { error: 'Organization not found.' }

  const lead = await prisma.lead.findFirst({ where: { id, organizationId: org.id } })
  if (!lead) return { error: 'Lead not found.' }

  const canViewAll = isAdminOf(session, slug)
  if (!canViewAll && lead.assignedTo !== session.user.id) {
    return { error: 'You can only manage leads assigned to you.' }
  }
  return { session, orgId: org.id, lead, canViewAll }
}

/** Move a lead to a new pipeline stage. */
export async function updateLeadStatus(
  slug: string,
  id: string,
  status: LeadStatus
): Promise<ActionResult> {
  if (!LEAD_STATUSES.includes(status)) return { ok: false, error: 'Unknown status.' }

  const authz = await authorizeLead(slug, id)
  if ('error' in authz) return { ok: false, error: authz.error }
  if (authz.lead.status === status) return { ok: true }

  await prisma.lead.update({ where: { id }, data: { status } })
  await logAction({
    actorId: authz.session.user.id,
    actorType: 'USER',
    organizationId: authz.orgId,
    action: 'lead.status_changed',
    targetType: 'Lead',
    targetId: id,
    metadata: { from: authz.lead.status, to: status },
  })

  revalidatePath(`/org/${slug}/leads`)
  revalidatePath(`/org/${slug}/leads/${id}`)
  return { ok: true }
}

/** Assign (or, with null, unassign) a lead to an org member. Admin-only. */
export async function assignLead(
  slug: string,
  id: string,
  assigneeId: string | null
): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user) return { ok: false, error: 'You must be signed in.' }
  if (!can(session, 'leads:assign', slug)) return { ok: false, error: 'You do not have permission.' }

  const org = await getOrgBySlug(slug)
  if (!org) return { ok: false, error: 'Organization not found.' }

  const lead = await prisma.lead.findFirst({ where: { id, organizationId: org.id }, select: { id: true } })
  if (!lead) return { ok: false, error: 'Lead not found.' }

  // The assignee must be a member of THIS org (or null to clear).
  if (assigneeId) {
    const membership = await prisma.membership.findUnique({
      where: { userId_organizationId: { userId: assigneeId, organizationId: org.id } },
      select: { id: true },
    })
    if (!membership) return { ok: false, error: 'That person is not a member of this organization.' }
  }

  await prisma.lead.update({ where: { id }, data: { assignedTo: assigneeId } })
  await logAction({
    actorId: session.user.id,
    actorType: 'USER',
    organizationId: org.id,
    action: 'lead.assigned',
    targetType: 'Lead',
    targetId: id,
    metadata: { assigneeId },
  })

  revalidatePath(`/org/${slug}/leads`)
  revalidatePath(`/org/${slug}/leads/${id}`)
  return { ok: true }
}

/** Add a free-text note to a lead's timeline. */
export async function addLeadNote(slug: string, id: string, body: string): Promise<ActionResult> {
  const authz = await authorizeLead(slug, id)
  if ('error' in authz) return { ok: false, error: authz.error }

  const parsed = leadNoteSchema.safeParse({ body })
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Please check the note.' }

  await prisma.leadNote.create({
    data: { leadId: id, authorId: authz.session.user.id, body: parsed.data.body },
  })
  await logAction({
    actorId: authz.session.user.id,
    actorType: 'USER',
    organizationId: authz.orgId,
    action: 'lead.note_added',
    targetType: 'Lead',
    targetId: id,
  })

  revalidatePath(`/org/${slug}/leads/${id}`)
  return { ok: true }
}
