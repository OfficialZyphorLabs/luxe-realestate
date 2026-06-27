'use client'

/**
 * PasswordField.tsx — Password input with a show/hide toggle and an optional
 * inline strength meter.
 *
 * Mirrors the styling of the shared `Input` atom (DESIGN.md §8.5) but adds a
 * trailing visibility button, so it lives as its own component rather than
 * overloading `Input`. The toggle has an `aria-label` and never submits the form.
 */
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { PasswordStrengthMeter } from '@/components/auth/PasswordStrengthMeter'

interface PasswordFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  error?: string
  /** Show the live strength meter beneath the field (registration / reset). */
  showStrength?: boolean
}

export function PasswordField({
  label,
  error,
  showStrength = false,
  className,
  id,
  value,
  ...props
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={id}
          className="font-body text-label-md font-semibold text-secondary uppercase tracking-widest text-xs"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          className={cn(
            'w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-4 py-3 pr-12',
            'font-body text-body-md text-on-surface placeholder:text-secondary',
            'focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none',
            'transition-standard',
            error && 'border-error focus:ring-error',
            className
          )}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-secondary hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
            {visible ? 'visibility_off' : 'visibility'}
          </span>
        </button>
      </div>
      {showStrength && <PasswordStrengthMeter password={typeof value === 'string' ? value : ''} />}
      {error && <p className="text-caption text-error font-body">{error}</p>}
    </div>
  )
}
