import { cn } from '@/lib/utils'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: { value: string; label: string }[]
}

export function Select({ label, options, className, id, ...props }: SelectProps) {
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
      <select
        id={id}
        className={cn(
          'bg-surface-container-low border border-outline-variant/50 rounded-lg px-4 py-3',
          'font-body text-body-md text-on-surface appearance-none cursor-pointer',
          'focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none',
          'transition-standard',
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
