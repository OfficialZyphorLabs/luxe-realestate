'use client'

import { useRef } from 'react'
import { motion } from 'motion/react'
import { useTheme } from '@/context/ThemeContext'

const DARK_SURFACE = '#080e17'
const LIGHT_SURFACE = '#fcf9f8'

/**
 * Full-viewport overlay that sweeps across the screen when the theme is toggled.
 *
 * Phase 1 — "covering": a circle expands from the bottom-left corner until it
 *   covers the entire viewport, then the theme flips underneath.
 * Phase 2 — "revealing": the circle shrinks away from the top-left corner,
 *   exposing the newly-switched theme beneath.
 *
 * Mounting a fresh element per phase (via `key`) guarantees clean initial
 * clip-path values and avoids mid-animation state bleed.
 */
export function ThemeTransition() {
  const { phase, pendingTheme, onCoverComplete, onRevealComplete } = useTheme()
  const phaseRef = useRef(phase)
  phaseRef.current = phase

  if (phase === 'idle') return null

  const isCovering = phase === 'covering'
  const color = pendingTheme === 'dark' ? DARK_SURFACE : LIGHT_SURFACE

  return (
    <motion.div
      key={isCovering ? 'cover' : 'reveal'}
      aria-hidden="true"
      className="fixed inset-0 z-[9999] pointer-events-none"
      style={{ backgroundColor: color }}
      initial={{
        clipPath: isCovering ? 'circle(0% at 0% 100%)' : 'circle(200% at 0% 0%)',
      }}
      animate={{
        clipPath: isCovering ? 'circle(200% at 0% 100%)' : 'circle(0% at 0% 0%)',
      }}
      transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
      onAnimationComplete={() => {
        if (phaseRef.current === 'covering') onCoverComplete()
        else onRevealComplete()
      }}
    />
  )
}
