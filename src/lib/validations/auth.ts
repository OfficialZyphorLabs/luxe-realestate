/**
 * auth.ts — Zod validation schemas shared by client forms and server routes.
 *
 * Defining the schemas once and importing them on both sides guarantees the
 * exact same rules run in the browser (instant UX feedback) and on the server
 * (the real security boundary — the client can always be bypassed). Every API
 * route MUST re-validate with these before touching the database.
 */
import { z } from 'zod'
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  SLUG_MIN_LENGTH,
  SLUG_MAX_LENGTH,
  RESERVED_SLUGS,
} from '@/lib/auth/constants'

/** Normalize emails: trim + lowercase so uniqueness checks are case-insensitive. */
const email = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, 'Email is required')
  .email('Enter a valid email address')
  .max(254, 'Email is too long')

/** Strong-ish password policy: length + character-class diversity.
 *  We avoid over-restricting (NIST discourages rigid composition rules) but
 *  require a mix to defeat trivially-guessable passwords. */
const password = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
  .max(PASSWORD_MAX_LENGTH, `Password must be at most ${PASSWORD_MAX_LENGTH} characters`)
  .regex(/[a-z]/, 'Include at least one lowercase letter')
  .regex(/[A-Z]/, 'Include at least one uppercase letter')
  .regex(/[0-9]/, 'Include at least one number')

/** URL-safe org slug: lowercase letters, numbers, single hyphens; not reserved. */
const slug = z
  .string()
  .trim()
  .toLowerCase()
  .min(SLUG_MIN_LENGTH, `Slug must be at least ${SLUG_MIN_LENGTH} characters`)
  .max(SLUG_MAX_LENGTH, `Slug must be at most ${SLUG_MAX_LENGTH} characters`)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'Use lowercase letters, numbers, and single hyphens only'
  )
  .refine((s) => !RESERVED_SLUGS.has(s), 'This slug is reserved — choose another')

const name = z
  .string()
  .trim()
  .min(2, 'Name must be at least 2 characters')
  .max(80, 'Name is too long')

/** New-organization self-service registration (SAAS_ARCHITECTURE.md §4, Flow 1). */
export const registerSchema = z.object({
  name,
  email,
  password,
  orgName: z.string().trim().min(2, 'Organization name is required').max(80, 'Name is too long'),
  orgSlug: slug,
})
export type RegisterInput = z.infer<typeof registerSchema>

/** Credentials login — password is only checked for presence here (the real
 *  policy applies at registration; old accounts must still be able to log in). */
export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required'),
})
export type LoginInput = z.infer<typeof loginSchema>

export const forgotPasswordSchema = z.object({ email })
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is missing'),
  password,
})
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>

/** Sending an invitation (org ADMIN action). */
export const inviteSchema = z.object({
  email,
  role: z.enum(['ADMIN', 'MEMBER']).default('MEMBER'),
})
export type InviteInput = z.infer<typeof inviteSchema>

/** Accepting an invitation. `password` is required only for brand-new users;
 *  the route decides based on whether the email already has an account. */
export const acceptInviteSchema = z.object({
  token: z.string().min(1, 'Invitation token is missing'),
  name: name.optional(),
  password: password.optional(),
})
export type AcceptInviteInput = z.infer<typeof acceptInviteSchema>

export const slugCheckSchema = z.object({ slug })

/** Derive a candidate slug from a free-text org name (used for live UX). */
export function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // non-alphanumerics → hyphen
    .replace(/^-+|-+$/g, '') // trim leading/trailing hyphens
    .slice(0, SLUG_MAX_LENGTH)
}
