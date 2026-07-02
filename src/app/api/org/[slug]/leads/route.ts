/**
 * route.ts — POST /api/org/[slug]/leads
 *
 * UNAUTHENTICATED public inquiry endpoint (Phase 4). Anonymous visitors on an
 * org's white-label page submit an inquiry that becomes a NEW lead for that org.
 *
 * Because it's public it is defended in depth:
 *   - IP rate-limited (blunt spam / abuse),
 *   - only accepts inquiries for ACTIVE orgs that allow public listings,
 *   - validates + normalizes input with `publicLeadSchema`,
 *   - a supplied propertyId must belong to THIS org and be ACTIVE (else dropped),
 *   - never reveals whether an org exists beyond a generic 404.
 * Admins are notified by email (best-effort); the lead is logged as a SYSTEM
 * audit action.
 */
import { prisma } from '@/lib/prisma'
import { handleRoute, ok, fail, HttpError } from '@/lib/api'
import { publicLeadSchema } from '@/lib/validations/lead'
import { logAction } from '@/lib/audit'
import { enforceRateLimit, getClientIp } from '@/lib/rate-limit'
import { sendLeadNotificationEmail } from '@/lib/email'

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  return handleRoute(async () => {
    const { slug } = await params

    // 1. Throttle by IP to blunt spam.
    const { success } = await enforceRateLimit('publicLead', `lead:${slug}:${getClientIp(req)}`)
    if (!success) {
      return fail('Too many submissions. Please try again shortly.', 429, { code: 'RATE_LIMITED' })
    }

    // 2. Validate the submission.
    const body = await req.json().catch(() => ({}))
    const { name, email, phone, message, propertyId } = publicLeadSchema.parse(body)

    // 3. Resolve the org — must be active and accept public inquiries.
    const org = await prisma.organization.findUnique({
      where: { slug },
      select: { id: true, name: true, status: true, settings: { select: { allowPublicListings: true } } },
    })
    if (!org || org.status !== 'ACTIVE' || !org.settings?.allowPublicListings) {
      throw new HttpError(404, 'This organization is not accepting inquiries.', 'NOT_FOUND')
    }

    // 4. Only attach a property that belongs to this org and is public (ACTIVE).
    let attachedPropertyId: string | null = null
    let propertyTitle: string | null = null
    if (propertyId) {
      const property = await prisma.property.findFirst({
        where: { id: propertyId, organizationId: org.id, status: 'ACTIVE' },
        select: { id: true, title: true },
      })
      if (property) {
        attachedPropertyId = property.id
        propertyTitle = property.title
      }
    }

    // 5. Create the lead.
    const lead = await prisma.lead.create({
      data: {
        organizationId: org.id,
        propertyId: attachedPropertyId,
        name,
        email,
        phone: phone || null,
        message: message || null,
        status: 'NEW',
      },
      select: { id: true },
    })

    await logAction({
      actorId: 'public',
      actorType: 'SYSTEM',
      organizationId: org.id,
      action: 'lead.created',
      targetType: 'Lead',
      targetId: lead.id,
      metadata: { email, propertyId: attachedPropertyId },
    })

    // 6. Notify org admins (best-effort — the lead is already saved).
    try {
      const admins = await prisma.membership.findMany({
        where: { organizationId: org.id, role: 'ADMIN' },
        select: { user: { select: { email: true } } },
      })
      const recipients = admins.map((a) => a.user.email).filter(Boolean)
      if (recipients.length > 0) {
        await sendLeadNotificationEmail({
          recipients,
          orgName: org.name,
          orgSlug: slug,
          leadId: lead.id,
          leadName: name,
          leadEmail: email,
          leadPhone: phone || null,
          propertyTitle,
          message: message || null,
        })
      }
    } catch (e) {
      console.error('[leads] notification email failed:', e)
    }

    return ok({ message: 'Thank you — your inquiry has been received.' }, { status: 201 })
  })
}
