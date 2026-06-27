/**
 * route.ts — POST /api/auth/register
 *
 * Self-service new-organization registration (SAAS_ARCHITECTURE.md §4, Flow 1).
 * In one atomic transaction it provisions: User → Organization → OrgSettings →
 * Subscription (14-day trial) → ADMIN Membership. Either everything commits or
 * nothing does, so a failure never leaves an orphaned org or a user with no team.
 *
 * Security:
 *  - IP rate-limited to slow automated signups (RATE_LIMITS.auth).
 *  - Input re-validated server-side with Zod; slug reserved-word list enforced.
 *  - Password is bcrypt-hashed before it ever touches the DB.
 *  - Uniqueness races are caught (Prisma P2002) and mapped to field errors so we
 *    never leak a stack trace.
 *  - Welcome email is best-effort — a mail outage must not fail the signup.
 */
import { prisma } from '@/lib/prisma'
import { handleRoute, ok, fail, HttpError } from '@/lib/api'
import { registerSchema } from '@/lib/validations/auth'
import { hashPassword } from '@/lib/auth/password'
import { generateToken } from '@/lib/auth/tokens'
import { TRIAL_PERIOD_MS } from '@/lib/auth/constants'
import { enforceRateLimit, getClientIp } from '@/lib/rate-limit'
import { sendWelcomeEmail } from '@/lib/email'

export async function POST(req: Request) {
  return handleRoute(async () => {
    // 1. Throttle by client IP.
    const { success } = await enforceRateLimit('auth', `register:${getClientIp(req)}`)
    if (!success) {
      return fail('Too many attempts. Please try again shortly.', 429, { code: 'RATE_LIMITED' })
    }

    // 2. Validate (throws ZodError → 400 via handleRoute).
    const body = await req.json().catch(() => ({}))
    const { name, email, password, orgName, orgSlug } = registerSchema.parse(body)

    // 3. Friendly pre-checks (the transaction's unique constraints are the real
    //    guard against races; these just yield nicer field-level messages).
    const [emailTaken, slugTaken] = await Promise.all([
      prisma.user.findUnique({ where: { email }, select: { id: true } }),
      prisma.organization.findUnique({ where: { slug: orgSlug }, select: { id: true } }),
    ])
    if (emailTaken) {
      return fail('Validation failed', 409, {
        code: 'EMAIL_TAKEN',
        fieldErrors: { email: ['An account with this email already exists'] },
      })
    }
    if (slugTaken) {
      return fail('Validation failed', 409, {
        code: 'SLUG_TAKEN',
        fieldErrors: { orgSlug: ['This workspace URL is already taken'] },
      })
    }

    // 4. Provision everything atomically.
    const passwordHash = await hashPassword(password)
    const trialEnd = new Date(Date.now() + TRIAL_PERIOD_MS)

    const { org } = await prisma
      .$transaction(async (tx) => {
        const user = await tx.user.create({
          data: { email, name, passwordHash },
          select: { id: true },
        })

        const organization = await tx.organization.create({
          data: {
            slug: orgSlug,
            name: orgName,
            plan: 'STARTER',
            status: 'ACTIVE',
            settings: { create: { allowPublicListings: true } },
            subscription: {
              create: {
                plan: 'STARTER',
                status: 'TRIALING',
                // Placeholder until a real Stripe customer is created in Phase 5.
                // Must be unique, so derive from a random token.
                stripeCustomerId: `pending_${generateToken().slice(0, 24)}`,
                currentPeriodEnd: trialEnd,
              },
            },
            memberships: { create: { userId: user.id, role: 'ADMIN' } },
          },
          select: { id: true, slug: true, name: true },
        })

        return { org: organization }
      })
      .catch((err: unknown) => {
        // Unique-constraint race (P2002) → treat as a conflict.
        if (err && typeof err === 'object' && 'code' in err && err.code === 'P2002') {
          throw new HttpError(409, 'That email or workspace URL was just taken.', 'CONFLICT')
        }
        throw err
      })

    // 5. Best-effort welcome email.
    try {
      await sendWelcomeEmail({ to: email, name, orgName: org.name, orgSlug: org.slug })
    } catch (e) {
      console.error('[register] welcome email failed (non-fatal):', e)
    }

    // The client signs in with the same credentials after this resolves.
    return ok({ orgSlug: org.slug }, { status: 201 })
  })
}
