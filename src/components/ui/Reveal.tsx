'use client'

/**
 * Reveal.tsx — Scroll-triggered fade/slide-in wrapper.
 *
 * The single reusable primitive for entrance animations across the site. Uses
 * Framer Motion's `whileInView` (viewport-once) so an element animates the first
 * time it scrolls into view, then stays put — no scroll listeners, no layout
 * thrashing. Only GPU-friendly `opacity` + `transform` are animated.
 *
 * Accessibility: when the OS requests reduced motion, the content renders in its
 * final state immediately (no transform, no delay).
 *
 * Usage:
 *   <Reveal>…</Reveal>                      // fade + slide up
 *   <Reveal delay={0.1}>…</Reveal>          // stagger within a group (i * 0.08)
 *   <Reveal direction="left">…</Reveal>     // slide in from the left
 */
import { motion, useReducedMotion } from 'motion/react'

type Direction = 'up' | 'down' | 'left' | 'right' | 'none'

interface RevealProps {
  children: React.ReactNode
  /** Seconds to wait before animating — use `i * 0.08` to stagger a list. */
  delay?: number
  /** Travel distance in px for the slide. */
  distance?: number
  /** Animation duration in seconds. */
  duration?: number
  /** Direction the element slides in from. */
  direction?: Direction
  className?: string
}

/** Map a direction to its initial offset. */
function offset(direction: Direction, distance: number): { x?: number; y?: number } {
  switch (direction) {
    case 'up':
      return { y: distance }
    case 'down':
      return { y: -distance }
    case 'left':
      return { x: distance }
    case 'right':
      return { x: -distance }
    default:
      return {}
  }
}

export function Reveal({
  children,
  delay = 0,
  distance = 24,
  duration = 0.6,
  direction = 'up',
  className,
}: RevealProps) {
  const reduce = useReducedMotion()

  // Reduced motion: skip the animation entirely, render final state.
  if (reduce) {
    return <div className={className}>{children}</div>
  }

  const from = offset(direction, distance)

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...from }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
