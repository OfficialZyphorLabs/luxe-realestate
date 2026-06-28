import Image from 'next/image'
import { cn } from '@/lib/utils'
import { initials } from '@/lib/format'

/**
 * MemberAvatar — circular avatar that shows the user's photo, or falls back to
 * their initials on a tinted surface. Used in member rosters, the user menu, and
 * activity feeds.
 */
interface MemberAvatarProps {
  name?: string | null
  email?: string | null
  src?: string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZES = {
  sm: { box: 'h-8 w-8', text: 'text-caption', px: 32 },
  md: { box: 'h-10 w-10', text: 'text-label-md', px: 40 },
  lg: { box: 'h-14 w-14', text: 'text-headline-md', px: 56 },
} as const

export function MemberAvatar({ name, email, src, size = 'md', className }: MemberAvatarProps) {
  const s = SIZES[size]
  const label = name || email || 'User'

  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10',
        s.box,
        className
      )}
    >
      {src ? (
        <Image src={src} alt={label} fill sizes={`${s.px}px`} className="object-cover" />
      ) : (
        <span
          className={cn('font-body font-semibold text-primary', s.text)}
          aria-hidden="true"
        >
          {initials(name || email)}
        </span>
      )}
    </span>
  )
}
