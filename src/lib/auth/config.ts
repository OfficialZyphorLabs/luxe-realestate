/**
 * config.ts — Base (DB-free) NextAuth configuration.
 *
 * This is the "edge-safe" half of the Auth.js split-config pattern: it contains
 * NO database adapter and NO bcrypt, so it can be imported by the proxy
 * (middleware) to decode and read the session token cheaply. The full config in
 * `index.ts` extends this with the Prisma adapter and the Credentials provider.
 *
 * The `jwt`/`session` callbacks here only shuttle already-resolved claims
 * between the token and the session object — the DB lookup that populates those
 * claims happens once, at sign-in, in the full config (see index.ts).
 */
import type { NextAuthConfig } from 'next-auth'
import Google from 'next-auth/providers/google'

export const authConfig = {
  // Custom auth screens live under the (auth) route group.
  pages: {
    signIn: '/login',
    error: '/login',
  },

  // JWT strategy is required for the Credentials provider and lets us embed
  // org memberships in the token for fast, DB-free authorization checks.
  session: { strategy: 'jwt' },

  // Google is edge-safe (no DB), so it lives in the base config. It is only
  // registered when its credentials are present, so the absence of OAuth env
  // vars in dev doesn't break startup. Credentials provider is added in index.ts.
  providers: [
    ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
            // Request a refresh token + consent for completeness.
            authorization: {
              params: { prompt: 'consent', access_type: 'offline', response_type: 'code' },
            },
          }),
        ]
      : []),
  ],

  callbacks: {
    /**
     * Base (DB-free) token copier. The full config in index.ts overrides this
     * with a DB-backed version that loads claims at sign-in and on `update`. This
     * variant is what the proxy uses: it only ever runs in decode mode (no
     * `user`), so it simply returns the already-populated token.
     */
    jwt({ token, user }) {
      if (user) {
        token.uid = user.id as string
        token.isSuperAdmin = user.isSuperAdmin ?? false
        token.avatarUrl = user.avatarUrl ?? null
        token.memberships = user.memberships ?? []
      }
      return token
    },

    /** Projects the token claims onto the typed session consumed app-wide. */
    session({ session, token }) {
      if (token.uid) {
        session.user.id = token.uid
        session.user.isSuperAdmin = token.isSuperAdmin
        session.user.avatarUrl = token.avatarUrl
        session.user.memberships = token.memberships ?? []
      }
      return session
    },
  },
} satisfies NextAuthConfig
