import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'image' | 'status' | 'location'
  className?: string
}

export function Badge({ children, variant = 'status', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-body font-bold uppercase tracking-tighter',
        {
          'bg-primary/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-[10px]':
            variant === 'image',
          'bg-tertiary-fixed text-on-tertiary-fixed px-3 py-1 rounded text-caption tracking-wider':
            variant === 'status',
          'bg-surface/90 text-primary px-3 py-1 rounded text-caption': variant === 'location',
        },
        className
      )}
    >
      {children}
    </span>
  )
}
