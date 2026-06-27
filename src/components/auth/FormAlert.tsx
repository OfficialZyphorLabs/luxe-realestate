/**
 * FormAlert.tsx — Inline status banner for auth forms (error / success / info).
 *
 * Stateless and presentational; colors use design tokens only (DESIGN.md §2).
 * `role` is set so screen readers announce errors assertively and successes
 * politely.
 */
import { cn } from '@/lib/utils'

interface FormAlertProps {
  variant: 'error' | 'success' | 'info'
  children: React.ReactNode
  className?: string
}

const ICONS: Record<FormAlertProps['variant'], string> = {
  error: 'error',
  success: 'check_circle',
  info: 'info',
}

export function FormAlert({ variant, children, className }: FormAlertProps) {
  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      aria-live={variant === 'error' ? 'assertive' : 'polite'}
      className={cn(
        'flex items-start gap-2 rounded-lg px-4 py-3 font-body text-body-md',
        {
          'bg-error-container text-on-error-container': variant === 'error',
          'bg-tertiary-fixed text-on-tertiary-fixed': variant === 'success',
          'bg-surface-container text-on-surface-variant': variant === 'info',
        },
        className
      )}
    >
      <span className="material-symbols-outlined text-[20px] shrink-0" aria-hidden="true">
        {ICONS[variant]}
      </span>
      <span className="leading-snug">{children}</span>
    </div>
  )
}
