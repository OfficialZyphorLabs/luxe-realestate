/**
 * proxy.ts — Next.js 16 Proxy (formerly `middleware.ts`).
 *
 * Coarse, first-line authorization + tenant resolution that runs before any
 * route renders (SAAS_ARCHITECTURE.md §2 "Tenant Resolution Flow"). It reads the
 * signed session token (no DB round-trip — memberships are baked into the JWT)
 * and:
 *   - gates /org/[slug]/*   → must be signed in AND a member of that org,
 *   - gates /superadmin/*   → must be a platform super-admin,
 *   - bounces already-authenticated users away from /login and /register,
 *   - forwards the resolved org id/slug as request headers for downstream code.
 *
 * This is defense-in-depth layer 1 ONLY. Every route handler and Server
 * Component MUST still authorize independently (see lib/permissions.ts) — a
 * matcher change must never silently remove protection (per Next.js proxy docs).
 *
 * Uses the edge-safe base auth config (no Prisma adapter) so the proxy stays
 * lean and decode-only.
 */
import NextAuth from 'next-auth'
import { NextResponse, type NextRequest } from 'next/server'
import { authConfig } from '@/lib/auth/config'
import type { Session } from 'next-auth'

const { auth } = NextAuth(authConfig)

/** Build a /login redirect that returns the user to where they were headed. */
function redirectToLogin(req: NextRequest): NextResponse {
  const url = new URL('/login', req.url)
  url.searchParams.set('callbackUrl', req.nextUrl.pathname + req.nextUrl.search)
  return NextResponse.redirect(url)
}

/** Best destination for an already-authenticated user hitting an auth page. */
function defaultDestination(session: Session): string {
  if (session.user.isSuperAdmin) return '/superadmin'
  const first = session.user.memberships?.[0]
  return first ? `/org/${first.orgSlug}/dashboard` : '/'
}

export default auth((req) => {
  const { nextUrl } = req
  const session = req.auth as Session | null
  const isLoggedIn = Boolean(session?.user)
  const { pathname } = nextUrl

  // ── Keep signed-in users out of the auth screens ──
  if (isLoggedIn && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL(defaultDestination(session!), req.url))
  }

  // ── SuperAdmin portal ──
  if (pathname.startsWith('/superadmin')) {
    if (!isLoggedIn) return redirectToLogin(req)
    if (!session!.user.isSuperAdmin) return NextResponse.redirect(new URL('/', req.url))
    return NextResponse.next()
  }

  // ── Org dashboards: /org/[slug]/* ──
  if (pathname.startsWith('/org/')) {
    if (!isLoggedIn) return redirectToLogin(req)

    const slug = pathname.split('/')[2] // ['', 'org', '<slug>', ...]
    if (!slug) return NextResponse.redirect(new URL('/', req.url))

    const membership = session!.user.memberships.find((m) => m.orgSlug === slug)

    // Super-admins may enter any org; otherwise membership is required.
    if (!session!.user.isSuperAdmin && !membership) {
      return NextResponse.redirect(new URL('/', req.url))
    }

    // Forward the resolved tenant context for downstream handlers/components.
    const headers = new Headers(req.headers)
    headers.set('x-org-slug', slug)
    if (membership) headers.set('x-org-id', membership.orgId)
    return NextResponse.next({ request: { headers } })
  }

  return NextResponse.next()
})

export const config = {
  // Scope the proxy to the protected/auth areas only — never to API routes,
  // static assets, or image optimization (which it would otherwise block).
  matcher: ['/org/:path*', '/superadmin/:path*', '/login', '/register'],
}
