'use server'

/**
 * org.ts — Server Actions for organization settings.
 * Re-authorizes (`org:write`), validates with Zod, and persists the org profile
 * + white-label settings. Returns a FormState consumed by useActionState.
 * Every mutation writes an audit log entry (best-effort).
 */
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { can } from '@/lib/permissions'
import { logAction } from '@/lib/audit'

export type FormState = { error?: string; success?: string }

const settingsSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters.').max(80),
  logoUrl: z.string().trim().url('Logo must be a valid URL.').or(z.literal('')),
  primaryColor: z
    .string()
    .trim()
    .regex(/^#([0-9a-fA-F]{6})$/, 'Use a 6-digit hex color (e.g. #041627).')
    .or(z.literal('')),
  allowPublicListings: z.boolean(),
})

export async function updateOrgSettings(
  slug: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await auth()
  if (!session?.user) return { error: 'You must be signed in.' }
  if (!can(session, 'org:write', slug)) return { error: 'You do not have permission.' }

  const parsed = settingsSchema.safeParse({
    name: formData.get('name'),
    logoUrl: formData.get('logoUrl') ?? '',
    primaryColor: formData.get('primaryColor') ?? '',
    allowPublicListings: formData.get('allowPublicListings') === 'on',
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Please check the form.' }
  }

  const { name, logoUrl, primaryColor, allowPublicListings } = parsed.data
  await prisma.organization.update({
    where: { slug },
    data: {
      name,
      logoUrl: logoUrl || null,
      settings: {
        upsert: {
          create: { primaryColor: primaryColor || null, allowPublicListings },
          update: { primaryColor: primaryColor || null, allowPublicListings },
        },
      },
    },
  })

  const org = await prisma.organization.findUnique({ where: { slug }, select: { id: true } })
  if (org) {
    await logAction({
      actorId: session.user.id,
      actorType: 'USER',
      organizationId: org.id,
      action: 'org.settings_updated',
      targetType: 'Organization',
      targetId: org.id,
    })
  }

  revalidatePath(`/org/${slug}/settings`)
  revalidatePath(`/org/${slug}/dashboard`)
  return { success: 'Settings saved.' }
}

/** Soft-delete an organization (ADMIN only). Marks status=DELETED. */
export async function deleteOrg(slug: string, _prev: FormState): Promise<FormState> {
  const session = await auth()
  if (!session?.user) return { error: 'You must be signed in.' }
  if (!can(session, 'org:delete', slug)) return { error: 'You do not have permission.' }

  const org = await prisma.organization.findUnique({ where: { slug }, select: { id: true } })
  if (!org) return { error: 'Organization not found.' }

  await prisma.organization.update({ where: { id: org.id }, data: { status: 'DELETED' } })
  await logAction({
    actorId: session.user.id,
    actorType: 'USER',
    organizationId: org.id,
    action: 'org.deleted',
    targetType: 'Organization',
    targetId: org.id,
  })

  revalidatePath(`/org/${slug}`)
  return { success: 'Organization deleted.' }
}
