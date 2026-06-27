/**
 * index.ts — Full NextAuth.js v5 instance (server-side, DB-backed).
 *
 * Extends the edge-safe base config (config.ts) with:
 *  - the Prisma adapter (persists OAuth users/accounts),
 *  - the Credentials provider (email + password) with a hardened `authorize`,
 *  - a `jwt` callback that loads org-membership claims from the DB at sign-in.
 *
 * Exports the standard v5 surface: `handlers` (route handler), `auth`
 * (universal session accessor), and `signIn`/`signOut`.
 *
 * Security highlights:
 *  - `authorize` runs a bcrypt compare on EVERY attempt — against a decoy hash
 *    when the user/password is absent — so success and failure take ~equal time,
 *    defeating user-enumeration via timing.
 *  - Returned errors are intentionally opaque (`null`) so the client only ever
 *    sees a generic "invalid credentials" message.
 */
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import { authConfig } from '@/lib/auth/config'
import { loginSchema } from '@/lib/validations/auth'
import { verifyPassword, DUMMY_PASSWORD_HASH } from '@/lib/auth/password'
import { getUserSessionClaims } from '@/lib/auth/claims'

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  // Honor the platform's forwarded host headers (Vercel, reverse proxies).
  trustHost: true,
  providers: [
    ...authConfig.providers,
    Credentials({
      // Field metadata is unused by our custom login UI but documents the shape.
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(raw) {
        // Re-validate on the server — never trust the client's shape.
        const parsed = loginSchema.safeParse(raw)
        if (!parsed.success) return null
        const { email, password } = parsed.data

        const user = await prisma.user.findUnique({
          where: { email },
          select: { id: true, email: true, name: true, passwordHash: true },
        })

        // Always perform a bcrypt compare to keep timing uniform whether or not
        // the account exists or has a password (OAuth-only users have none).
        const hash = user?.passwordHash ?? DUMMY_PASSWORD_HASH
        const passwordOk = await verifyPassword(password, hash)

        if (!user || !user.passwordHash || !passwordOk) return null

        // Minimal user — the jwt callback enriches with claims from the DB.
        return { id: user.id, email: user.email, name: user.name }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    /**
     * On sign-in (`user` present) or explicit `session.update()`, load fresh
     * super-admin + membership claims from the DB and bake them into the token.
     * Re-fetching on `update` (rather than trusting client-sent data) means a
     * client can refresh its claims after accepting an invite, but can never
     * forge elevated ones.
     */
    async jwt({ token, user, trigger }) {
      if (user?.id) {
        const claims = await getUserSessionClaims(user.id)
        token.uid = user.id
        token.isSuperAdmin = claims?.isSuperAdmin ?? false
        token.avatarUrl = claims?.avatarUrl ?? null
        token.memberships = claims?.memberships ?? []
      } else if (trigger === 'update' && token.uid) {
        const claims = await getUserSessionClaims(token.uid)
        if (claims) {
          token.isSuperAdmin = claims.isSuperAdmin
          token.avatarUrl = claims.avatarUrl
          token.memberships = claims.memberships
        }
      }
      return token
    },
  },
})
