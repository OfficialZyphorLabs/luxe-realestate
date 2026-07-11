'use client'

/**
 * Select — accessible custom dropdown.
 *
 * The menu is rendered through a portal to <body> with FIXED positioning, so it
 * can never be clipped by an ancestor's overflow or mis-positioned by a
 * transformed ancestor (the page-transition wrapper) — the bug that made
 * dropdowns feel "stuck". It:
 *   - reposition-tracks the trigger on scroll/resize (works with Lenis, which
 *     dispatches native scroll events),
 *   - flips above the trigger when there isn't room below,
 *   - scrolls internally for long lists (`data-lenis-prevent` keeps the wheel
 *     from being hijacked by smooth-scroll),
 *   - supports full keyboard nav (↑/↓/Home/End/Enter/Escape).
 *
 * Public API is unchanged from the previous version.
 */
import { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import { cn } from '@/lib/utils'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  label?: string
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
  /** default — form field with bg, border, rounded trigger; ghost — transparent for embedded filter rows */
  variant?: 'default' | 'ghost'
  /** Material Symbol name as a leading prefix icon (ghost variant) */
  icon?: string
  id?: string
  className?: string
  'aria-label'?: string
  disabled?: boolean
}

/** Where the portaled menu should render, in viewport (fixed) coordinates. */
interface MenuRect {
  left: number
  width: number
  /** Distance from the top of the viewport when placed below the trigger. */
  top?: number
  /** Distance from the bottom of the viewport when flipped above the trigger. */
  bottom?: number
  maxHeight: number
}

const MENU_GAP = 8
const MENU_MAX = 320

export function Select({
  label,
  options,
  value,
  onChange,
  variant = 'default',
  icon,
  id,
  className,
  'aria-label': ariaLabel,
  disabled,
}: SelectProps) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [rect, setRect] = useState<MenuRect | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLUListElement>(null)

  const selected = options.find((o) => o.value === value) ?? options[0]
  const selectedIndex = Math.max(0, options.findIndex((o) => o.value === value))

  // Portal can only touch document.body after mount.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), [])

  /** Measure the trigger and decide whether the menu opens below or above it. */
  const reposition = useCallback(() => {
    const el = triggerRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const spaceBelow = window.innerHeight - r.bottom - MENU_GAP
    const spaceAbove = r.top - MENU_GAP
    const flipUp = spaceBelow < 200 && spaceAbove > spaceBelow
    setRect({
      left: r.left,
      width: r.width,
      ...(flipUp
        ? { bottom: window.innerHeight - r.top + MENU_GAP, maxHeight: Math.min(MENU_MAX, spaceAbove) }
        : { top: r.bottom + MENU_GAP, maxHeight: Math.min(MENU_MAX, spaceBelow) }),
    })
  }, [])

  function openMenu() {
    if (disabled) return
    reposition()
    setActiveIndex(selectedIndex)
    setOpen(true)
  }

  // Keep the menu glued to the trigger while open, and close on outside/Escape.
  useEffect(() => {
    if (!open) return
    reposition()
    const onScroll = () => reposition()
    const onResize = () => reposition()
    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Node
      if (triggerRef.current?.contains(t) || menuRef.current?.contains(t)) return
      setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true, capture: true })
    window.addEventListener('resize', onResize, { passive: true })
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('scroll', onScroll, { capture: true } as EventListenerOptions)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, reposition])

  // Keep the highlighted option scrolled into view.
  useLayoutEffect(() => {
    if (!open) return
    const node = menuRef.current?.children[activeIndex] as HTMLElement | undefined
    node?.scrollIntoView({ block: 'nearest' })
  }, [open, activeIndex])

  function commit(index: number) {
    const opt = options[index]
    if (opt) onChange(opt.value)
    setOpen(false)
    triggerRef.current?.focus()
  }

  /** Arrow-key navigation on the trigger (opens if closed) and within the menu. */
  function onTriggerKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (!open) {
        openMenu()
        return
      }
      if (e.key === 'Enter' || e.key === ' ') {
        commit(activeIndex)
      } else {
        setActiveIndex((i) => {
          const next = e.key === 'ArrowDown' ? i + 1 : i - 1
          return (next + options.length) % options.length
        })
      }
    } else if (e.key === 'Home' && open) {
      e.preventDefault()
      setActiveIndex(0)
    } else if (e.key === 'End' && open) {
      e.preventDefault()
      setActiveIndex(options.length - 1)
    }
  }

  const menu =
    mounted && open && rect
      ? createPortal(
          <AnimatePresence>
            <motion.ul
              ref={menuRef}
              role="listbox"
              data-lenis-prevent
              initial={{ opacity: 0, y: rect.bottom ? 8 : -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: rect.bottom ? 8 : -8, scale: 0.98 }}
              transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
              style={{
                position: 'fixed',
                left: rect.left,
                width: rect.width,
                top: rect.top,
                bottom: rect.bottom,
                maxHeight: rect.maxHeight,
              }}
              className="z-[90] overflow-y-auto overscroll-contain rounded-2xl bg-surface-container-lowest py-1 shadow-[0_8px_40px_rgba(4,22,39,0.14),0_0_0_1px_rgba(4,22,39,0.07)]"
            >
              {options.map((opt, i) => (
                <li key={opt.value} role="option" aria-selected={opt.value === value}>
                  <button
                    type="button"
                    onClick={() => commit(i)}
                    onMouseEnter={() => setActiveIndex(i)}
                    className={cn(
                      'w-full px-4 py-2.5 text-left font-body text-body-md transition-colors',
                      opt.value === value
                        ? 'bg-primary text-on-primary font-semibold'
                        : i === activeIndex
                          ? 'bg-surface-container-low text-on-surface'
                          : 'text-on-surface'
                    )}
                  >
                    {opt.label}
                  </button>
                </li>
              ))}
            </motion.ul>
          </AnimatePresence>,
          document.body
        )
      : null

  /* ── Ghost variant (filter bars / hero search) ── */
  if (variant === 'ghost') {
    return (
      <div className={cn('relative flex items-center', className)}>
        {icon && (
          <span
            className="material-symbols-outlined pointer-events-none ml-3 shrink-0 text-[18px] text-secondary"
            aria-hidden="true"
          >
            {icon}
          </span>
        )}
        <button
          ref={triggerRef}
          id={id}
          type="button"
          aria-label={ariaLabel}
          aria-haspopup="listbox"
          aria-expanded={open}
          disabled={disabled}
          onClick={() => (open ? setOpen(false) : openMenu())}
          onKeyDown={onTriggerKeyDown}
          className="flex min-w-0 flex-1 cursor-pointer items-center py-3 pl-2 pr-7 text-left font-body text-body-md text-on-surface focus:outline-none"
        >
          {selected?.label}
        </button>
        <span
          className={cn(
            'material-symbols-outlined pointer-events-none absolute right-2 shrink-0 text-[18px] text-secondary/60 transition-transform duration-200',
            open && 'rotate-180'
          )}
          aria-hidden="true"
        >
          expand_more
        </span>
        {menu}
      </div>
    )
  }

  /* ── Default variant (form fields) ── */
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label
          htmlFor={id}
          className="font-body text-xs font-semibold uppercase tracking-widest text-secondary"
        >
          {label}
        </label>
      )}
      <button
        ref={triggerRef}
        id={id}
        type="button"
        aria-label={ariaLabel ?? label}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={onTriggerKeyDown}
        className={cn(
          'flex w-full items-center justify-between rounded-xl px-4 py-3 text-left',
          'border border-outline-variant/50 bg-surface-container-low',
          'font-body text-body-md text-on-surface',
          'transition-standard focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
          open ? 'border-primary ring-1 ring-primary' : 'hover:border-outline'
        )}
      >
        <span className="truncate">{selected?.label}</span>
        <span
          className={cn(
            'material-symbols-outlined ml-2 shrink-0 text-[18px] text-secondary transition-transform duration-200',
            open && 'rotate-180'
          )}
          aria-hidden="true"
        >
          expand_more
        </span>
      </button>
      {menu}
    </div>
  )
}
