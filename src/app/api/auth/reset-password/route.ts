/**
 * route.ts — POST /api/auth/reset-password
 *
 * Consumes a single-use reset token and sets a new password. The incoming raw
 * token is hashed and looked up by its unique hash; the record must be unused
 * and unexpired. On success the password is updated, the token is burned, and
 * every other outstanding reset token for that user is revoked — all atomically.
 *
 * Errors are deliberately generic ("invalid or expired") so a caller can't probe
 * which tokens exist.
 */
import { prisma } from '@/lib/prisma'
import { handleRoute, ok, fail } from '@/lib/api'
import { resetPasswordSchema } from '@/lib/validations/auth'
import { hashToken } from '@/lib/auth/tokens'
import { hashPassword } from '@/lib/auth/password'
import { enforceRateLimit, getClientIp } from '@/lib/rate-limit'

export async function POST(req: Request) {
  return handleRoute(async () => {
    const { success } = await enforceRateLimit('passwordReset', `reset:${getClientIp(req)}`)
    if (!success) {
      return fail('Too many attempts. Please try again later.', 429, { code: 'RATE_LIMITED' })
    }

    const body = await req.json().catch(() => ({}))
    const { token, password } = resetPasswordSchema.parse(body)

    const record = await prisma.passwordResetToken.findUnique({
      where: { tokenHash: hashToken(token) },
      select: { id: true, userId: true, expiresAt: true, usedAt: true },
    })

    const isValid = record && !record.usedAt && record.expiresAt > new Date()
    if (!isValid) {
      return fail('This reset link is invalid or has expired.', 400, { code: 'INVALID_TOKEN' })
    }

    const passwordHash = await hashPassword(password)

    // Update password, burn this token, and revoke any siblings in one tx.
    await prisma.$transaction([
      prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
      prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
      prisma.passwordResetToken.deleteMany({
        where: { userId: record.userId, usedAt: null },
      }),
    ])

    return ok({ message: 'Your password has been reset. You can now sign in.' })
  })
}
