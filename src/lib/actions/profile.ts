'use server'

/**
 * profile.ts — Server Actions for the current user's own profile + password.
 * Operate strictly on the signed-in user (no admin scope). Password changes
 * verify the current password when one is set (OAuth-only users can set one).
 */
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { hashPassword, verifyPassword } from '@/lib/auth/password'

export type FormState = { error?: string; success?: string }

const profileSchema = z.object({
  name: z.string().trim().max(80).or(z.literal('')),
  avatarUrl: z.string().trim().url('Avatar must be a valid URL.').or(z.literal('')),
})

export async function updateProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await auth()
  if (!session?.user) return { error: 'You must be signed in.' }

  const parsed = profileSchema.safeParse({
    name: formData.get('name') ?? '',
    avatarUrl: formData.get('avatarUrl') ?? '',
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Please check the form.' }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: parsed.data.name || null, avatarUrl: parsed.data.avatarUrl || null },
  })
  return { success: 'Profile saved. Your name/avatar update across the app after your next sign-in.' }
}

const passwordSchema = z.object({
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8, 'New password must be at least 8 characters.'),
})

export async function changePassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await auth()
  if (!session?.user) return { error: 'You must be signed in.' }

  const parsed = passwordSchema.safeParse({
    currentPassword: (formData.get('currentPassword') as string) || undefined,
    newPassword: formData.get('newPassword'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Please check the form.' }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { passwordHash: true },
  })
  if (!user) return { error: 'Account not found.' }

  // If the user already has a password, the current one must match.
  if (user.passwordHash) {
    const valid = await verifyPassword(parsed.data.currentPassword ?? '', user.passwordHash)
    if (!valid) return { error: 'Your current password is incorrect.' }
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { passwordHash: await hashPassword(parsed.data.newPassword) },
  })
  return { success: 'Password updated.' }
}
