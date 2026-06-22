import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'inverse'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  children: React.ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-body text-label-md font-semibold tracking-wide transition-standard active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
        {
          'bg-primary text-on-primary hover:opacity-90': variant === 'primary',
          'border border-primary text-primary hover:bg-primary hover:text-on-primary':
            variant === 'secondary',
          'bg-transparent border border-white text-white hover:bg-white/10': variant === 'ghost',
          'bg-surface text-primary hover:bg-surface-dim': variant === 'inverse',
        },
        {
          'px-4 py-1.5 rounded-full text-sm': size === 'sm',
          'px-6 py-2 rounded-full': size === 'md',
          'px-10 py-4 rounded-xl text-base': size === 'lg',
        },
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
