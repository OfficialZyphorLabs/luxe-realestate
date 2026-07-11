'use client'

/**
 * DropdownMenu — an icon-triggered menu that portals its panel to <body> with
 * fixed positioning, so it is never clipped by an ancestor's overflow (e.g. the
 * DataTable's horizontal scroll container) — the same class of bug the Select
 * fix addressed. Tracks the trigger on scroll/resize, flips above when low on
 * space, right- or left-aligns, and closes on outside click / Escape.
 *
 * Usage:
 *   <DropdownMenu label="Actions for X">
 *     {(close) => (<> …menu items that call close() … </>)}
 *   </DropdownMenu>
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import { cn } from '@/lib/utils'

interface DropdownMenuProps {
  /** Accessible label for the trigger button. */
  label: string
  /** Material Symbols icon for the trigger (default: more_vert). */
  icon?: string
  /** Menu edge to align to the trigger (default: right). */
  align?: 'left' | 'right'
  disabled?: boolean
  /** Render menu contents; call `close` after acting. */
  children: (close: () => void) => React.ReactNode
}

interface Pos {
  left: number
  top?: number
  bottom?: number
  maxHeight: number
}

const MENU_W = 208 // matches w-52
const GAP = 6
const MAX = 320

export function DropdownMenu({ label, icon = 'more_vert', align = 'right', disabled, children }: DropdownMenuProps) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [pos, setPos] = useState<Pos | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), [])

  const reposition = useCallback(() => {
    const el = triggerRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const spaceBelow = window.innerHeight - r.bottom - GAP
    const spaceAbove = r.top - GAP
    const flipUp = spaceBelow < 220 && spaceAbove > spaceBelow
    const rawLeft = align === 'right' ? r.right - MENU_W : r.left
    const left = Math.max(8, Math.min(rawLeft, window.innerWidth - MENU_W - 8))
    setPos({
      left,
      ...(flipUp
        ? { bottom: window.innerHeight - r.top + GAP, maxHeight: Math.min(MAX, spaceAbove) }
        : { top: r.bottom + GAP, maxHeight: Math.min(MAX, spaceBelow) }),
    })
  }, [align])

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (!open) return
    reposition()
    const onScroll = () => reposition()
    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Node
      if (triggerRef.current?.contains(t) || menuRef.current?.contains(t)) return
      setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('scroll', onScroll, { passive: true, capture: true })
    window.addEventListener('resize', onScroll, { passive: true })
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('scroll', onScroll, { capture: true } as EventListenerOptions)
      window.removeEventListener('resize', onScroll)
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, reposition])

  return (
    <div className="flex justify-end">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (open ? setOpen(false) : (reposition(), setOpen(true)))}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={disabled}
        className="flex h-8 w-8 items-center justify-center rounded-full text-secondary transition-colors hover:bg-surface-container hover:text-primary disabled:opacity-50"
      >
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
      </button>

      {mounted && open && pos
        ? createPortal(
            <AnimatePresence>
              <motion.div
                ref={menuRef}
                role="menu"
                data-lenis-prevent
                initial={{ opacity: 0, y: pos.bottom ? 6 : -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: pos.bottom ? 6 : -6, scale: 0.98 }}
                transition={{ duration: 0.14, ease: [0.4, 0, 0.2, 1] }}
                style={{
                  position: 'fixed',
                  left: pos.left,
                  top: pos.top,
                  bottom: pos.bottom,
                  width: MENU_W,
                  maxHeight: pos.maxHeight,
                }}
                className={cn(
                  'z-[90] overflow-y-auto overscroll-contain rounded-xl bg-surface-container-lowest py-1',
                  'shadow-[0_8px_40px_rgba(4,22,39,0.14),0_0_0_1px_rgba(4,22,39,0.07)]'
                )}
              >
                {children(close)}
              </motion.div>
            </AnimatePresence>,
            document.body
          )
        : null}
    </div>
  )
}

/** A standard menu item button for use inside DropdownMenu. */
export function DropdownItem({
  icon,
  label,
  onClick,
  tone = 'default',
}: {
  icon: string
  label: string
  onClick: () => void
  tone?: 'default' | 'danger'
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 px-4 py-2.5 text-left font-body text-body-md transition-colors',
        tone === 'danger'
          ? 'text-error hover:bg-error-container/40'
          : 'text-on-surface hover:bg-surface-container-low'
      )}
    >
      <span
        className={cn(
          'material-symbols-outlined text-[20px]',
          tone === 'danger' ? 'text-error' : 'text-secondary'
        )}
        aria-hidden="true"
      >
        {icon}
      </span>
      {label}
    </button>
  )
}
