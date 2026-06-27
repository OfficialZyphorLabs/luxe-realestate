/**
 * route.ts — POST /api/org/[slug]/invite
 *
 * An org ADMIN (or super-admin) invites someone by email + role
 * (SAAS_ARCHITECTURE.md §4, Flow 2). A high-entropy token is generated; only its
 * SHA-256 hash is stored in `Invitation.token`, so a DB leak can't be replayed —
 * the raw token lives only in the emailed link. Any prior pending invite for the
 * same email+org is replaced so resending stays idempotent.
 *
 * Authorization is enforced here in the handler (members:invite) — never relying
 * on the proxy alone (see SAAS_ARCHITECTURE.md §11, Layer 3).
 */
import { prisma } from '@/lib/prisma'
import { handleRoute, ok, fail, HttpError } from '@/lib/api'
import { auth } from '@/lib/auth'
import { can } from '@/lib/permissions'
import { inviteSchema } from '@/lib/validations/auth'
import { generateToken, hashToken } from '@/lib/auth/tokens'
import { INVITATION_TTL_MS } from '@/lib/auth/constants'
import { enforceRateLimit, getClientIp } from '@/lib/rate-limit'
import { sendInvitationEmail } from '@/lib/email'

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  return handleRoute(async () => {
    const { slug } = await params

    // 1. AuthN + AuthZ — must be an admin of THIS org.
    const session = await auth()
    if (!session?.user) throw new HttpError(401, 'You must be signed in.', 'UNAUTHENTICATED')
    if (!can(session, 'members:invite', slug)) {
      throw new HttpError(403, 'You do not have permission to invite members.', 'FORBIDDEN')
    }

    // 2. Throttle invites per org.
    const { success } = await enforceRateLimit('invite', `invite:${slug}:${getClientIp(req)}`)
    if (!success) {
      return fail('Invite limit reached. Please try again later.', 429, { code: 'RATE_LIMITED' })
    }

    // 3. Validate.
    const body = await req.json().catch(() => ({}))
    const { email, role } = inviteSchema.parse(body)

    // 4. Resolve org + reject if the invitee is already a member.
    const org = await prisma.organization.findUnique({
      where: { slug },
      select: { id: true, name: true },
    })
    if (!org) throw new HttpError(404, 'Organization not found.', 'NOT_FOUND')

    const existingUser = await prisma.user.findUnique({ where: { email }, select: { id: true } })
    if (existingUser) {
      const membership = await prisma.membership.findUnique({
        where: { userId_organizationId: { userId: existingUser.id, organizationId: org.id } },
        select: { id: true },
      })
      if (membership) {
        return fail('This person is already a member of your organization.', 409, {
          code: 'ALREADY_MEMBER',
        })
      }
    }

    // 5. Mint a fresh invite, replacing any pending one for this email+org.
    const rawToken = generateToken()
    const tokenHash = hashToken(rawToken)
    const expiresAt = new Date(Date.now() + INVITATION_TTL_MS)

    await prisma.$transaction([
      prisma.invitation.deleteMany({
        where: { email, organizationId: org.id, acceptedAt: null },
      }),
      prisma.invitation.create({
        data: {
          email,
          organizationId: org.id,
          role,
          token: tokenHash,
          expiresAt,
          invitedById: session.user.id,
        },
      }),
    ])

    // 6. Email the raw token. Surface a soft warning if mail is down, but the
    //    invite itself is already persisted.
    const inviterName = session.user.name ?? session.user.email
    try {
      await sendInvitationEmail({ to: email, orgName: org.name, inviterName, role, token: rawToken })
    } catch (e) {
      console.error('[invite] email send failed:', e)
      return ok({ emailed: false, message: 'Invitation created, but the email failed to send.' })
    }

    return ok({ emailed: true, message: `Invitation sent to ${email}.` }, { status: 201 })
  })
}
