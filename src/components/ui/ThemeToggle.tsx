'use client'

import { cn } from '@/lib/utils'
import { useTheme } from '@/context/ThemeContext'

interface ThemeToggleProps {
  /** Matches the navbar's `visible` (pill) state — adjusts color scheme to contrast against primary bg */
  visible?: boolean
  className?: string
}

export function ThemeToggle({ visible = false, className }: ThemeToggleProps) {
  const { theme, toggleTheme, phase } = useTheme()

  const isDark = theme === 'dark'
  const isTransitioning = phase !== 'idle'

  return (
    <button
      onClick={toggleTheme}
      disabled={isTransitioning}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={cn(
        'flex items-center justify-center w-9 h-9 rounded-full transition-standard active:scale-95 disabled:opacity-40',
        visible
          ? 'text-on-primary/80 hover:text-on-primary hover:bg-primary-container/40'
          : 'bg-surface-container-low text-secondary hover:text-primary hover:bg-surface-container',
        className
      )}
    >
      <span className="material-symbols-outlined text-[18px]">
        {isDark ? 'light_mode' : 'dark_mode'}
      </span>
    </button>
  )
}
