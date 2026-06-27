/**
 * route.ts — GET /api/auth/check-slug?slug=acme-realty
 *
 * Debounced availability check for the registration form. Returns whether a
 * workspace slug is both well-formed (Zod, incl. reserved-word list) and unused.
 * The lookup hits the unique index on `organizations.slug`, selecting only `id`
 * so it never over-fetches. This is advisory UX only — registration re-checks
 * atomically, so a slug reported "available" here can still lose a race there.
 */
import { prisma } from '@/lib/prisma'
import { handleRoute, ok } from '@/lib/api'
import { slugCheckSchema } from '@/lib/validations/auth'

export async function GET(req: Request) {
  return handleRoute(async () => {
    const slug = new URL(req.url).searchParams.get('slug') ?? ''

    // Validate format/reserved without throwing — invalid simply means "no".
    const parsed = slugCheckSchema.safeParse({ slug })
    if (!parsed.success) {
      const reason = parsed.error.flatten().fieldErrors.slug?.[0] ?? 'Invalid slug'
      return ok({ available: false, reason })
    }

    const existing = await prisma.organization.findUnique({
      where: { slug: parsed.data.slug },
      select: { id: true },
    })

    return existing
      ? ok({ available: false, reason: 'This workspace URL is already taken' })
      : ok({ available: true })
  })
}
