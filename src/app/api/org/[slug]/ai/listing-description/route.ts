/**
 * route.ts — POST /api/org/[slug]/ai/listing-description
 *
 * Authenticated endpoint that generates a marketing description for a listing
 * from its facts, using Claude. Requires a member who can create properties;
 * rate-limited per user to bound LLM cost/abuse. Returns 503 when the AI isn't
 * configured so the client can hide the feature.
 */
import { handleRoute, ok, fail, HttpError } from '@/lib/api'
import { auth } from '@/lib/auth'
import { can } from '@/lib/permissions'
import { enforceRateLimit } from '@/lib/rate-limit'
import { isAiConfigured, generateListingDescription } from '@/lib/ai'
import { propertyInputSchema } from '@/lib/validations/property'

// Reuse the property schema but only require the fields the copywriter needs.
const inputSchema = propertyInputSchema.pick({
  title: true,
  propertyType: true,
  price: true,
  address: true,
  city: true,
  state: true,
  beds: true,
  baths: true,
  sqft: true,
})

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  return handleRoute(async () => {
    const { slug } = await params

    const session = await auth()
    if (!session?.user) throw new HttpError(401, 'You must be signed in.', 'UNAUTHENTICATED')
    if (!can(session, 'properties:create', slug)) {
      throw new HttpError(403, 'You do not have permission.', 'FORBIDDEN')
    }

    if (!isAiConfigured()) {
      return fail('AI features are not configured.', 503, { code: 'AI_DISABLED' })
    }

    const { success } = await enforceRateLimit('ai', `ai:${session.user.id}`)
    if (!success) return fail('Too many requests. Please wait a moment.', 429, { code: 'RATE_LIMITED' })

    const body = await req.json().catch(() => ({}))
    const parsed = inputSchema.safeParse(body)
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? 'Add a title and price first.', 400, {
        code: 'VALIDATION_ERROR',
      })
    }

    const result = await generateListingDescription(parsed.data)
    if (!result.ok) return fail(result.error, 502, { code: 'AI_FAILED' })

    return ok({ description: result.text })
  })
}
