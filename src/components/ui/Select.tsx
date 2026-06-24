import { cn } from '@/lib/utils'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: SelectOption[]
  /** default — labeled form field with bg, border, rounded-lg; ghost — transparent inline for filter/search bars */
  variant?: 'default' | 'ghost'
  /** Material Symbol name shown as a leading icon (ghost variant) */
  icon?: string
  id?: string
  className?: string
}

export function Select({
  label,
  options,
  variant = 'default',
  icon,
  id,
  className,
  ...selectProps
}: SelectProps) {
  if (variant === 'ghost') {
    return (
      <div className={cn('relative flex items-center', className)}>
        {icon && (
          <span
            className="material-symbols-outlined text-[18px] text-secondary shrink-0 ml-3 pointer-events-none"
            aria-hidden="true"
          >
            {icon}
          </span>
        )}
        <select
          id={id}
          className="bg-transparent font-body text-body-md text-on-surface appearance-none cursor-pointer pl-2 pr-7 py-3 flex-1 min-w-0 focus:outline-none"
          {...selectProps}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span
          className="material-symbols-outlined pointer-events-none absolute right-2 text-[18px] text-secondary/60 shrink-0"
          aria-hidden="true"
        >
          expand_more
        </span>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label
          htmlFor={id}
          className="font-body text-xs font-semibold text-secondary uppercase tracking-widest"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg pl-4 pr-10 py-3 font-body text-body-md text-on-surface appearance-none cursor-pointer focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-standard"
          {...selectProps}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span
          className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[18px] text-secondary"
          aria-hidden="true"
        >
          expand_more
        </span>
      </div>
    </div>
  )
}
