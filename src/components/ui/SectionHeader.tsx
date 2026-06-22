import { cn } from '@/lib/utils'

interface SectionHeaderProps {
  eyebrow?: string
  title: string
  action?: React.ReactNode
  className?: string
  light?: boolean
}

export function SectionHeader({ eyebrow, title, action, className, light = false }: SectionHeaderProps) {
  return (
    <div className={cn('flex justify-between items-end mb-12', className)}>
      <div>
        {eyebrow && (
          <span
            className={cn(
              'block font-body text-label-md font-semibold uppercase tracking-widest mb-2',
              light ? 'text-on-primary-container' : 'text-on-primary-container'
            )}
          >
            {eyebrow}
          </span>
        )}
        <h2
          className={cn(
            'font-display text-headline-lg font-semibold',
            light ? 'text-on-primary' : 'text-primary'
          )}
        >
          {title}
        </h2>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}
