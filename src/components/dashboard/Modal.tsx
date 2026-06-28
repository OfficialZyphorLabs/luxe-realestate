'use client'

/**
 * Modal — accessible, animated dialog rendered through a portal.
 *
 * Portaled to <body> on purpose: page content is wrapped in a transform-based
 * page-transition (SiteChrome), and a `position: fixed` descendant of a
 * transformed ancestor would be positioned relative to it. The portal escapes
 * that context. Closes on Escape and backdrop click, locks body scroll while
 * open, and respects reduced motion.
 */
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/utils'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children?: React.ReactNode
  footer?: React.ReactNode
  size?: 'sm' | 'md'
}

const SIZES = { sm: 'max-w-md', md: 'max-w-lg' } as const

export function Modal({ open, onClose, title, description, children, footer, size = 'md' }: ModalProps) {
  const reduce = useReducedMotion()
  const [mounted, setMounted] = useState(false)

  // Canonical client-mount gate: the server must render null before createPortal
  // touches document.body. This one-shot setState is intentional.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), [])

  // Escape to close + body scroll lock while open.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-primary/40 backdrop-blur-sm"
            initial={reduce ? false : { opacity: 0 }}
            animate={reduce ? undefined : { opacity: 1 }}
            exit={reduce ? undefined : { opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
          />
          {/* Panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={cn(
              'relative w-full rounded-2xl bg-surface-container-lowest p-6 shadow-xl',
              SIZES[size]
            )}
            initial={reduce ? false : { opacity: 0, scale: 0.96, y: 12 }}
            animate={reduce ? undefined : { opacity: 1, scale: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-headline-md font-semibold text-primary">{title}</h2>
                {description && (
                  <p className="mt-1 font-body text-body-md text-secondary">{description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="-mr-1 -mt-1 flex h-9 w-9 items-center justify-center rounded-full text-secondary transition-colors hover:bg-surface-container hover:text-primary"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {children && <div className="mt-5">{children}</div>}
            {footer && <div className="mt-6 flex justify-end gap-3">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
