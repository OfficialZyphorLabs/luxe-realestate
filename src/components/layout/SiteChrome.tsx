'use client'

/**
 * SiteChrome.tsx — Conditionally renders the marketing Navbar + Footer.
 *
 * Auth screens (login, register, invite, password reset) and — in later phases —
 * the org/superadmin dashboards use their own full-screen shells, so the public
 * site chrome is suppressed there. Keeping this decision in one client component
 * lets the root layout stay a Server Component and preserves the ThemeProvider
 * tree for every route.
 */
import { usePathname } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

/** Route prefixes that render without the public site chrome. */
const CHROMELESS_PREFIXES = ['/login', '/register', '/forgot-password', '/reset-password', '/invite']

function isChromeless(pathname: string): boolean {
  return CHROMELESS_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const chromeless = isChromeless(pathname)

  if (chromeless) {
    // Auth/dashboard shells own the full viewport.
    return <main className="flex-1">{children}</main>
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  )
}
