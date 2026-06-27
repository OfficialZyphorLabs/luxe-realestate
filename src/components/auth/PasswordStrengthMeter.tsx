/**
 * PasswordStrengthMeter.tsx — Four-segment strength indicator.
 *
 * Purely a UX hint driven by `estimatePasswordStrength`; the authoritative rules
 * live in the Zod schema and are re-checked on the server. Hidden until the user
 * starts typing to avoid shouting "Very weak" at an empty field.
 */
import { cn } from '@/lib/utils'
import { estimatePasswordStrength } from '@/lib/auth/password'

interface PasswordStrengthMeterProps {
  password: string
}

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  if (!password) return null

  const { score, label } = estimatePasswordStrength(password)
  // Map score (0–4) to segment fill colour. Weak = error red, strong = primary.
  const segmentColor = (index: number) => {
    if (index >= score) return 'bg-outline-variant/40'
    if (score <= 1) return 'bg-error'
    if (score === 2) return 'bg-tertiary-fixed-dim'
    if (score === 3) return 'bg-secondary'
    return 'bg-primary'
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-1.5" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn('h-1 flex-1 rounded-full transition-colors duration-300', segmentColor(i))}
          />
        ))}
      </div>
      <p className="font-body text-caption text-secondary">
        Password strength: <span className="font-semibold text-on-surface">{label}</span>
      </p>
    </div>
  )
}
