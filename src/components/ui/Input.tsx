import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className, id, ...props }: InputProps) {
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
      <input
        id={id}
        className={cn(
          'bg-surface-container-low border border-outline-variant/50 rounded-lg px-4 py-3',
          'font-body text-body-md text-on-surface placeholder:text-secondary',
          'focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none',
          'transition-standard',
          error && 'border-error focus:ring-error',
          className
        )}
        {...props}
      />
      {error && <p className="text-caption text-error font-body">{error}</p>}
    </div>
  )
}
