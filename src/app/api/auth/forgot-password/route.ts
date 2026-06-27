/**
 * route.ts — POST /api/auth/forgot-password
 *
 * Issues a single-use password-reset link. The response is ALWAYS a generic
 * success, whether or not the email maps to an account — this prevents account
 * enumeration. Only the SHA-256 hash of the token is stored; the raw token lives
 * only in the emailed link (see src/lib/auth/tokens.ts).
 *
 * Rate-limited per IP+email to curb enumeration probing and email bombing.
 */
import { prisma } from '@/lib/prisma'
import { handleRoute, ok, fail } from '@/lib/api'
import { forgotPasswordSchema } from '@/lib/validations/auth'
import { generateToken, hashToken } from '@/lib/auth/tokens'
import { PASSWORD_RESET_TTL_MS } from '@/lib/auth/constants'
import { enforceRateLimit, getClientIp } from '@/lib/rate-limit'
import { sendPasswordResetEmail } from '@/lib/email'

// Identical body returned in every case so timing/shape can't reveal existence.
const GENERIC = {
  message: 'If an account exists for that email, a reset link is on its way.',
}

export async function POST(req: Request) {
  return handleRoute(async () => {
    const ip = getClientIp(req)
    const body = await req.json().catch(() => ({}))
    const { email } = forgotPasswordSchema.parse(body)

    const { success } = await enforceRateLimit('passwordReset', `forgot:${ip}:${email}`)
    if (!success) {
      return fail('Too many requests. Please try again later.', 429, { code: 'RATE_LIMITED' })
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true },
    })

    // Only do real work when the user exists; otherwise fall through to GENERIC.
    if (user) {
      const rawToken = generateToken()
      const tokenHash = hashToken(rawToken)
      const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS)

      // Invalidate any outstanding tokens, then mint a fresh one — atomically.
      await prisma.$transaction([
        prisma.passwordResetToken.deleteMany({ where: { userId: user.id } }),
        prisma.passwordResetToken.create({ data: { userId: user.id, tokenHash, expiresAt } }),
      ])

      try {
        await sendPasswordResetEmail({ to: email, name: user.name, token: rawToken })
      } catch (e) {
        // Don't reveal failure to the client; log for ops.
        console.error('[forgot-password] email send failed:', e)
      }
    }

    return ok(GENERIC)
  })
}
