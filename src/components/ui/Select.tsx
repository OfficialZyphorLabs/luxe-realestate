'use client'

import { useState, useRef, useEffect } from 'react'
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
  const ref = useRef<HTMLDivElement>(null)

  const selected = options.find((o) => o.value === value) ?? options[0]

  useEffect(() => {
    if (!open) return
    const onMouseDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const optionList = (dropdownClass?: string) => (
    <AnimatePresence>
      {open && (
        <motion.ul
          role="listbox"
          initial={{ opacity: 0, y: -8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.97 }}
          transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
          className={cn(
            'absolute top-full mt-2 z-50 overflow-hidden rounded-2xl py-1',
            'bg-surface-container-lowest shadow-[0_8px_40px_rgba(4,22,39,0.14),0_0_0_1px_rgba(4,22,39,0.07)]',
            dropdownClass
          )}
        >
          {options.map((opt) => (
            <li key={opt.value} role="option" aria-selected={opt.value === value}>
              <button
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false) }}
                className={cn(
                  'w-full px-4 py-2.5 text-left font-body text-body-md transition-colors',
                  opt.value === value
                    ? 'bg-primary text-on-primary font-semibold'
                    : 'text-on-surface hover:bg-surface-container-low'
                )}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </motion.ul>
      )}
    </AnimatePresence>
  )

  /* ── Ghost variant (filter bars / hero search) ── */
  if (variant === 'ghost') {
    return (
      <div ref={ref} className={cn('relative flex items-center', className)}>
        {icon && (
          <span
            className="material-symbols-outlined text-[18px] text-secondary shrink-0 ml-3 pointer-events-none"
            aria-hidden="true"
          >
            {icon}
          </span>
        )}
        <button
          id={id}
          type="button"
          aria-label={ariaLabel}
          aria-haspopup="listbox"
          aria-expanded={open}
          disabled={disabled}
          onClick={() => setOpen((v) => !v)}
          className="flex items-center flex-1 min-w-0 py-3 pl-2 pr-7 font-body text-body-md text-on-surface focus:outline-none cursor-pointer text-left"
        >
          {selected?.label}
        </button>
        <span
          className={cn(
            'material-symbols-outlined pointer-events-none absolute right-2 text-[18px] text-secondary/60 shrink-0 transition-transform duration-200',
            open && 'rotate-180'
          )}
          aria-hidden="true"
        >
          expand_more
        </span>
        {optionList('left-0 min-w-[200px]')}
      </div>
    )
  }

  /* ── Default variant (form fields) ── */
  return (
    <div ref={ref} className={cn('relative flex flex-col gap-1.5', className)}>
      {label && (
        <label
          htmlFor={id}
          className="font-body text-xs font-semibold text-secondary uppercase tracking-widest"
        >
          {label}
        </label>
      )}
      <button
        id={id}
        type="button"
        aria-label={ariaLabel ?? label}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex items-center justify-between w-full rounded-xl px-4 py-3 text-left',
          'bg-surface-container-low border border-outline-variant/50',
          'font-body text-body-md text-on-surface cursor-pointer',
          'focus:outline-none transition-standard',
          open ? 'border-primary ring-1 ring-primary' : 'hover:border-outline'
        )}
      >
        <span>{selected?.label}</span>
        <span
          className={cn(
            'material-symbols-outlined text-[18px] text-secondary shrink-0 ml-2 transition-transform duration-200',
            open && 'rotate-180'
          )}
          aria-hidden="true"
        >
          expand_more
        </span>
      </button>
      {optionList('left-0 right-0')}
    </div>
  )
}
