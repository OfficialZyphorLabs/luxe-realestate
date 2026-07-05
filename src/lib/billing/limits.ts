/**
 * limits.ts — Plan-limit enforcement (Phase 5).
 *
 * Gates resource creation against the org's plan caps (SAAS_ARCHITECTURE.md §12,
 * mirrored in `PLAN_LIMITS`). A null cap means unlimited (Enterprise). Callers
 * check BEFORE creating so a blocked action returns a friendly upgrade prompt
 * instead of silently exceeding the plan. This is the server-side backstop —
 * the billing UI also surfaces usage meters.
 */
import { prisma } from '@/lib/prisma'
import { PLAN_LIMITS, PLAN_LABELS } from '@/lib/data/dashboard'

export type LimitResource = 'listings' | 'members'
export type LimitCheck = { ok: true } | { ok: false; error: string }

/**
 * Is the org still under its plan cap for `resource`? Returns ok:false with a
 * user-facing upgrade message when the cap is reached.
 */
export async function assertWithinPlanLimit(
  orgId: string,
  resource: LimitResource
): Promise<LimitCheck> {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { plan: true },
  })
  if (!org) return { ok: false, error: 'Organization not found.' }

  const limit = PLAN_LIMITS[org.plan][resource]
  if (limit === null) return { ok: true } // Enterprise — unlimited

  const used =
    resource === 'listings'
      ? await prisma.property.count({ where: { organizationId: orgId } })
      : await prisma.membership.count({ where: { organizationId: orgId } })

  if (used >= limit) {
    return {
      ok: false,
      error: `Your ${PLAN_LABELS[org.plan]} plan is limited to ${limit} ${resource}. Upgrade your plan to add more.`,
    }
  }
  return { ok: true }
}
