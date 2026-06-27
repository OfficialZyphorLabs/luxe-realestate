'use client'

/**
 * SiteChrome.tsx — Conditional marketing chrome + page transitions.
 *
 * Two jobs:
 *  1. Render the public Navbar/Footer everywhere except auth screens (which use
 *     their own full-screen shell), keeping the root layout a Server Component.
 *  2. Animate route changes with a fade + slide-up, keyed by pathname.
 *
 * Page-transition design notes:
 *  - `AnimatePresence initial={false}` means the FIRST render (and SSR output)
 *    is shown in its final state — content is never hidden on first paint, so
 *    SEO and no-JS users are unaffected. Only subsequent navigations animate.
 *  - Enter-only (no exit / no `mode="wait"`) keeps navigation feeling instant
 *    rather than waiting on an outgoing animation — reliable under the App
 *    Router's synchronous content swap.
 *  - Reduced-motion renders children directly with no wrapper.
 */
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

/** Route prefixes that render without the public site chrome. */
const CHROMELESS_PREFIXES = ['/login', '/register', '/forgot-password', '/reset-password', '/invite']

function isChromeless(pathname: string): boolean {
  return CHROMELESS_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const reduce = useReducedMotion()
  const chromeless = isChromeless(pathname)

  // Wrap the page content in a per-route transition (or pass through verbatim
  // when reduced motion is requested).
  const transitioned = reduce ? (
    children
  ) : (
    <AnimatePresence initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )

  if (chromeless) {
    // Auth shells own the full viewport.
    return <main className="flex-1">{transitioned}</main>
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">{transitioned}</main>
      <Footer />
    </>
  )
}
