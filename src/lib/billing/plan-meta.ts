/**
 * plan-meta.ts — Pure plan metadata (limits, labels, prices).
 *
 * Deliberately free of any server-only imports (no Prisma) so it can be used
 * from BOTH server code and Client Components. `lib/data/dashboard.ts`
 * re-exports these for existing server call sites; client components import them
 * directly from here to avoid dragging the Prisma/pg client into the browser
 * bundle.
 */
import type { Plan } from '@/generated/prisma'

/** Plan caps (SAAS_ARCHITECTURE.md §12). null = unlimited. */
export const PLAN_LIMITS: Record<Plan, { members: number | null; listings: number | null }> = {
  STARTER: { members: 5, listings: 20 },
  GROWTH: { members: 20, listings: 100 },
  ENTERPRISE: { members: null, listings: null },
}

export const PLAN_LABELS: Record<Plan, string> = {
  STARTER: 'Starter',
  GROWTH: 'Growth',
  ENTERPRISE: 'Enterprise',
}

export const PLAN_PRICES: Record<Plan, string> = {
  STARTER: '$49',
  GROWTH: '$149',
  ENTERPRISE: 'Custom',
}
