/**
 * session.ts — Server-side session helpers for Server Components, layouts, and
 * route handlers.
 *
 * These wrap NextAuth's `auth()` with typed, intention-revealing guards so call
 * sites read declaratively ("require an admin of this org") instead of repeating
 * null-checks and redirects. Guards that fail either redirect (for pages) or are
 * paired with the API helpers in `lib/api.ts` (for route handlers).
 */
import { redirect } from 'next/navigation'
import type { Session } from 'next-auth'
import { auth } from '@/lib/auth'
import { can, type Permission } from '@/lib/permissions'

/** Current session, or null. Thin alias over `auth()` for readability. */
export async function getSession(): Promise<Session | null> {
  return auth()
}

/**
 * Require an authenticated user. Redirects unauthenticated visitors to /login,
 * preserving the originally requested URL as `callbackUrl`.
 */
export async function requireAuth(callbackUrl?: string): Promise<Session> {
  const session = await auth()
  if (!session?.user) {
    const target = callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''
    redirect(`/login${target}`)
  }
  return session
}

/** Require a platform super-admin. Sends non-admins to the home page. */
export async function requireSuperAdmin(): Promise<Session> {
  const session = await requireAuth('/superadmin')
  if (!session.user.isSuperAdmin) redirect('/')
  return session
}

/**
 * Require membership of `orgSlug`, optionally with a specific permission.
 * Redirects to /login if unauthenticated, or home if the user lacks access.
 * Returns the validated session for downstream use.
 */
export async function requireOrgAccess(
  orgSlug: string,
  permission: Permission = 'org:read'
): Promise<Session> {
  const session = await requireAuth(`/org/${orgSlug}/dashboard`)
  if (!can(session, permission, orgSlug)) redirect('/')
  return session
}
