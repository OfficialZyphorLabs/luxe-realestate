'use client'

import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'motion/react'

const SPRING = { type: 'spring', stiffness: 200, damping: 50 } as const

interface NavDesktopBodyProps {
  children: React.ReactNode
  visible: boolean
  className?: string
}

interface NavMobileBodyProps {
  children: React.ReactNode
  visible: boolean
  className?: string
}

interface MobileMenuPanelProps {
  children: React.ReactNode
  isOpen: boolean
}

/**
 * Animated desktop nav container.
 * Not scrolled → full-width glassmorphism bar.
 * Scrolled past threshold → centered dark-navy pill floating 14px from top.
 */
export function NavDesktopBody({ children, visible, className }: NavDesktopBodyProps) {
  return (
    <motion.div
      animate={{
        width: visible ? '62%' : '100%',
        y: visible ? 14 : 0,
        borderRadius: visible ? 9999 : 0,
        paddingTop: visible ? 8 : 16,
        paddingBottom: visible ? 8 : 16,
        paddingLeft: visible ? 24 : 64,
        paddingRight: visible ? 24 : 64,
        boxShadow: visible
          ? '0 8px 40px rgba(4,22,39,0.22), 0 0 0 1px rgba(4,22,39,0.12)'
          : '0 1px 4px rgba(0,0,0,0.05)',
      }}
      transition={SPRING}
      className={cn(
        'relative z-[60] mx-auto hidden w-full items-center justify-between backdrop-blur-md lg:flex',
        visible ? 'bg-primary/95' : 'bg-surface/80',
        className
      )}
    >
      {children}
    </motion.div>
  )
}

/**
 * Animated mobile nav container — mirrors NavDesktopBody for small screens.
 * Scrolled → rounded card floating below top edge.
 */
export function NavMobileBody({ children, visible, className }: NavMobileBodyProps) {
  return (
    <motion.div
      animate={{
        width: visible ? '92%' : '100%',
        y: visible ? 10 : 0,
        borderRadius: visible ? 16 : 0,
        paddingLeft: visible ? 16 : 20,
        paddingRight: visible ? 16 : 20,
        boxShadow: visible ? '0 8px 40px rgba(4,22,39,0.2)' : 'none',
      }}
      transition={SPRING}
      className={cn(
        'relative z-[60] mx-auto flex w-full flex-col py-3 backdrop-blur-md lg:hidden',
        visible ? 'bg-primary/95' : 'bg-surface/80',
        className
      )}
    >
      {children}
    </motion.div>
  )
}

/**
 * Slide-down mobile menu panel — appears below the mobile bar.
 */
export function MobileMenuPanel({ children, isOpen }: MobileMenuPanelProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          className="absolute inset-x-4 top-full mt-2 flex flex-col gap-1 rounded-2xl bg-primary p-4 shadow-[0_8px_40px_rgba(4,22,39,0.25)]"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
