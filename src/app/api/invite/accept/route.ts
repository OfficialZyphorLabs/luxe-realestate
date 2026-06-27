/**
 * route.ts — Invitation acceptance API.
 *
 *   GET  /api/invite/accept?token=…  → validate a token and describe the invite
 *                                      (org name, role, whether the email already
 *                                      has an account) so the page can render the
 *                                      right form. Never returns the email itself
 *                                      to an unauthenticated caller beyond what's
 *                                      needed, and reveals nothing for bad tokens.
 *   POST /api/invite/accept          → redeem the token: attach an existing user
 *                                      to the org, or create a new user (name +
 *                                      password) and attach them. Atomic; the
 *                                      invite is burned on success.
 *
 * Possession of the raw token (delivered only by email) proves control of the
 * invited address, so a new account is created with `emailVerified` set.
 */
import { prisma } from '@/lib/prisma'
import { handleRoute, ok, fail, HttpError } from '@/lib/api'
import { acceptInviteSchema } from '@/lib/validations/auth'
import { hashToken } from '@/lib/auth/tokens'
import { hashPassword } from '@/lib/auth/password'
import { enforceRateLimit, getClientIp } from '@/lib/rate-limit'

/** Load a still-valid invitation by raw token, or null. */
async function findValidInvitation(rawToken: string) {
  if (!rawToken) return null
  const invitation = await prisma.invitation.findUnique({
    where: { token: hashToken(rawToken) },
    select: {
      id: true,
      email: true,
      role: true,
      expiresAt: true,
      acceptedAt: true,
      organization: { select: { id: true, slug: true, name: true } },
    },
  })
  if (!invitation || invitation.acceptedAt || invitation.expiresAt < new Date()) return null
  return invitation
}

export async function GET(req: Request) {
  return handleRoute(async () => {
    const token = new URL(req.url).searchParams.get('token') ?? ''
    const invitation = await findValidInvitation(token)
    if (!invitation) {
      return fail('This invitation is invalid or has expired.', 400, { code: 'INVALID_TOKEN' })
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: invitation.email },
      select: { id: true },
    })

    return ok({
      email: invitation.email,
      role: invitation.role,
      orgName: invitation.organization.name,
      orgSlug: invitation.organization.slug,
      userExists: Boolean(existingUser),
    })
  })
}

export async function POST(req: Request) {
  return handleRoute(async () => {
    const { success } = await enforceRateLimit('auth', `invite-accept:${getClientIp(req)}`)
    if (!success) {
      return fail('Too many attempts. Please try again shortly.', 429, { code: 'RATE_LIMITED' })
    }

    const body = await req.json().catch(() => ({}))
    const { token, name, password } = acceptInviteSchema.parse(body)

    const invitation = await findValidInvitation(token)
    if (!invitation) {
      return fail('This invitation is invalid or has expired.', 400, { code: 'INVALID_TOKEN' })
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: invitation.email },
      select: { id: true },
    })

    // New users must supply a name + password. Resolve their create payload now
    // (with the hash) so the value is fully typed inside the transaction — no
    // non-null assertions needed.
    const orgId = invitation.organization.id
    const userCreated = !existingUser
    let newUserData: { email: string; name: string; passwordHash: string; emailVerified: Date } | undefined

    if (!existingUser) {
      if (!name || !password) {
        throw new HttpError(400, 'Name and password are required to create your account.', 'NEED_PROFILE')
      }
      newUserData = {
        email: invitation.email,
        name,
        passwordHash: await hashPassword(password),
        emailVerified: new Date(), // proven via the emailed token
      }
    }

    await prisma.$transaction(async (tx) => {
      let userId: string

      if (existingUser) {
        userId = existingUser.id
      } else if (newUserData) {
        const created = await tx.user.create({ data: newUserData, select: { id: true } })
        userId = created.id
      } else {
        // Unreachable: guarded above. Keeps `userId` definitely assigned.
        throw new HttpError(400, 'Invalid invitation state.', 'INVALID_STATE')
      }

      // Idempotent membership (skip if somehow already present).
      await tx.membership.upsert({
        where: { userId_organizationId: { userId, organizationId: orgId } },
        update: {},
        create: { userId, organizationId: orgId, role: invitation.role },
      })

      await tx.invitation.update({
        where: { id: invitation.id },
        data: { acceptedAt: new Date() },
      })
    })

    return ok({
      orgSlug: invitation.organization.slug,
      email: invitation.email,
      userCreated,
      message: `Welcome to ${invitation.organization.name}.`,
    })
  })
}
