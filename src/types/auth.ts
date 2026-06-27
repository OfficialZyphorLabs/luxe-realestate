/**
 * auth.ts — Session & JWT type augmentation for NextAuth.js v5 (Auth.js).
 *
 * The default NextAuth `Session`/`User`/`JWT` shapes are extended here so the
 * platform-specific claims (super-admin flag + pre-loaded org memberships) are
 * fully typed everywhere `auth()` or `getSession()` is consumed. Memberships are
 * embedded in the JWT at sign-in time so middleware/proxy and server components
 * can authorize requests without an extra DB round-trip on every navigation.
 *
 * See SAAS_ARCHITECTURE.md §4 "Session JWT Structure".
 */
import type { OrgRole } from '@/generated/prisma'

/** A single org the user belongs to, with their role inside it. */
export interface SessionMembership {
  orgId: string
  orgSlug: string
  orgName: string
  role: OrgRole
}

/** The enriched user object exposed on the session and embedded in the JWT. */
export interface SessionUser {
  id: string
  email: string
  name: string | null
  avatarUrl: string | null
  isSuperAdmin: boolean
  memberships: SessionMembership[]
}

declare module 'next-auth' {
  /** Shape returned by `auth()` / `useSession()` throughout the app. */
  interface Session {
    user: SessionUser
  }

  /** Extra fields carried on the NextAuth `User` returned by `authorize()`. */
  interface User {
    isSuperAdmin?: boolean
    avatarUrl?: string | null
    memberships?: SessionMembership[]
  }
}

declare module 'next-auth/jwt' {
  /** Custom claims persisted inside the signed JWT. */
  interface JWT {
    uid: string
    isSuperAdmin: boolean
    avatarUrl: string | null
    memberships: SessionMembership[]
  }
}
