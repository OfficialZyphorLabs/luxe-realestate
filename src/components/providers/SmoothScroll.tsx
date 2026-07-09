'use client'

/**
 * SmoothScroll.tsx — Lenis-powered inertia scrolling (the "cinematic" feel).
 *
 * Lenis drives the real window scroll position (it doesn't transform the page),
 * so it dispatches native scroll events — meaning Framer's `useScroll` (hero
 * parallax) and the `Reveal` viewport triggers keep working unchanged.
 *
 * Accessibility & correctness:
 *  - Disabled entirely under `prefers-reduced-motion` (native scroll is used).
 *  - On route change we jump Lenis to the top immediately so its internal
 *    position stays in sync with the App Router's scroll reset.
 *  - The RAF loop is torn down on unmount to avoid leaks.
 */
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useReducedMotion } from 'motion/react'
import Lenis from 'lenis'

let lenisInstance: Lenis | null = null

export function SmoothScroll() {
  const reduce = useReducedMotion()
  const pathname = usePathname()

  useEffect(() => {
    if (reduce) return

    const lenis = new Lenis({
      // Shorter duration = the page tracks the wheel more tightly and settles
      // faster, so scrolling feels responsive rather than "floaty"/laggy.
      duration: 0.8,
      // Exponential ease-out — quick to respond, gentle to settle.
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 2,
    })
    lenisInstance = lenis

    let rafId = 0
    const raf = (time: number) => {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
      lenisInstance = null
    }
  }, [reduce])

  // Keep Lenis in sync with Next's scroll-to-top on navigation.
  useEffect(() => {
    lenisInstance?.scrollTo(0, { immediate: true })
  }, [pathname])

  return null
}
