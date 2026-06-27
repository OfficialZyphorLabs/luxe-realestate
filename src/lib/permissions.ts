/**
 * permissions.ts — Role-based access control (RBAC).
 *
 * Single source of truth for "who can do what", mirroring the permission matrix
 * in SAAS_ARCHITECTURE.md §5. Authorization is layered (defense in depth):
 *   1. proxy.ts        — coarse gate (authenticated? member of this org?)
 *   2. can() / require* — per-action checks inside route handlers & server code
 *   3. Postgres RLS     — last line of defense against ORM bugs
 *
 * `can()` is pure and synchronous — it reads the membership claims already baked
 * into the session token, so it never touches the database.
 */
import type { Session } from 'next-auth'

export type Permission =
  | 'org:read'
  | 'org:write'
  | 'org:delete'
  | 'members:read'
  | 'members:invite'
  | 'members:remove'
  | 'members:promote'
  | 'properties:create'
  | 'properties:edit-any'
  | 'properties:delete'
  | 'leads:view-all'
  | 'leads:assign'
  | 'billing:manage'
  | 'platform:superadmin'

/** Permissions granted to each org role. SuperAdmin bypasses this table entirely. */
const ROLE_PERMISSIONS: Record<'ADMIN' | 'MEMBER', Permission[]> = {
  ADMIN: [
    'org:read',
    'org:write',
    'org:delete',
    'members:read',
    'members:invite',
    'members:remove',
    'members:promote',
    'properties:create',
    'properties:edit-any',
    'properties:delete',
    'leads:view-all',
    'leads:assign',
    'billing:manage',
  ],
  MEMBER: [
    'org:read',
    'members:read',
    'properties:create',
    // Members may only act on their OWN leads/listings — that finer scoping is
    // enforced at the data layer (query filters + RLS), not by this table.
    'leads:view-all',
  ],
}

/**
 * Does `session` hold `permission` within the org identified by `orgSlug`?
 *
 * - SuperAdmins are allowed everything, with no org scope required.
 * - Any org-scoped permission requires an `orgSlug` and an active membership.
 */
export function can(
  session: Session | null,
  permission: Permission,
  orgSlug?: string
): boolean {
  if (!session?.user) return false
  if (session.user.isSuperAdmin) return true
  if (permission === 'platform:superadmin') return false // only super-admins
  if (!orgSlug) return false

  const membership = session.user.memberships.find((m) => m.orgSlug === orgSlug)
  if (!membership) return false

  return ROLE_PERMISSIONS[membership.role]?.includes(permission) ?? false
}

/** Convenience: is the user a member (any role) of the given org? */
export function isMemberOf(session: Session | null, orgSlug: string): boolean {
  if (!session?.user) return false
  if (session.user.isSuperAdmin) return true
  return session.user.memberships.some((m) => m.orgSlug === orgSlug)
}

/** Convenience: is the user an ADMIN of the given org (or a super-admin)? */
export function isAdminOf(session: Session | null, orgSlug: string): boolean {
  if (!session?.user) return false
  if (session.user.isSuperAdmin) return true
  return session.user.memberships.some((m) => m.orgSlug === orgSlug && m.role === 'ADMIN')
}
