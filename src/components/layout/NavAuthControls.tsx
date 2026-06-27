'use client'

/**
 * NavAuthControls.tsx — Session-aware navbar affordances.
 *
 * Logged out → "Sign in" link. Logged in → a "Dashboard" link (resolved to the
 * user's first org, or the super-admin portal) plus a sign-out button. Colors
 * follow the navbar's scrolled (`visible`) state so the controls stay legible
 * over both the cream page and the navy scrolled bar (DESIGN.md §8.1).
 *
 * Rendered in both the desktop cluster and the mobile menu via the `variant`.
 */
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'

interface NavAuthControlsProps {
  visible: boolean
  variant?: 'desktop' | 'mobile'
  onNavigate?: () => void
}

/** Where "Dashboard" should point for the current session. */
function useDashboardHref(): string | null {
  const { data: session } = useSession()
  if (!session?.user) return null
  if (session.user.isSuperAdmin) return '/superadmin'
  const first = session.user.memberships?.[0]
  return first ? `/org/${first.orgSlug}/dashboard` : '/'
}

export function NavAuthControls({ visible, variant = 'desktop', onNavigate }: NavAuthControlsProps) {
  const { status } = useSession()
  const dashboardHref = useDashboardHref()

  // Avoid a flash of the wrong state during the initial session fetch.
  if (status === 'loading') return null

  const authed = status === 'authenticated' && dashboardHref

  if (variant === 'mobile') {
    return authed ? (
      <>
        <Link
          href={dashboardHref!}
          onClick={onNavigate}
          className="block px-3 py-3 rounded-xl font-body text-body-md text-on-primary/80 hover:text-on-primary hover:bg-primary-container/50 transition-standard"
        >
          Dashboard
        </Link>
        <button
          onClick={() => {
            onNavigate?.()
            void signOut({ callbackUrl: '/' })
          }}
          className="block w-full text-left px-3 py-3 rounded-xl font-body text-body-md text-on-primary/80 hover:text-on-primary hover:bg-primary-container/50 transition-standard"
        >
          Sign out
        </button>
      </>
    ) : (
      <Link
        href="/login"
        onClick={onNavigate}
        className="block px-3 py-3 rounded-xl font-body text-body-md text-on-primary/80 hover:text-on-primary hover:bg-primary-container/50 transition-standard"
      >
        Sign in
      </Link>
    )
  }

  // ── Desktop ──
  const linkClass = cn(
    'font-body text-label-md font-semibold transition-colors duration-200 whitespace-nowrap',
    visible ? 'text-on-primary/80 hover:text-on-primary' : 'text-secondary hover:text-primary'
  )

  if (authed) {
    return (
      <div className="flex items-center gap-3">
        <Link href={dashboardHref!} className={linkClass}>
          Dashboard
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          aria-label="Sign out"
          className={cn(linkClass, 'flex items-center gap-1')}
        >
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
            logout
          </span>
        </button>
      </div>
    )
  }

  return (
    <Link href="/login" className={linkClass}>
      Sign in
    </Link>
  )
}
