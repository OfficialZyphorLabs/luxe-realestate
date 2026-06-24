'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react'

export type Theme = 'light' | 'dark'
export type TransitionPhase = 'idle' | 'covering' | 'revealing'

interface ThemeContextValue {
  theme: Theme
  pendingTheme: Theme
  phase: TransitionPhase
  toggleTheme: () => void
  onCoverComplete: () => void
  onRevealComplete: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')
  const [pendingTheme, setPendingTheme] = useState<Theme>('dark')
  const [phase, setPhase] = useState<TransitionPhase>('idle')

  const toggleTheme = useCallback(() => {
    if (phase !== 'idle') return
    const next: Theme = theme === 'light' ? 'dark' : 'light'
    setPendingTheme(next)
    setPhase('covering')
  }, [theme, phase])

  const onCoverComplete = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
    setPhase('revealing')
  }, [])

  const onRevealComplete = useCallback(() => {
    setPhase('idle')
  }, [])

  return (
    <ThemeContext.Provider
      value={{ theme, pendingTheme, phase, toggleTheme, onCoverComplete, onRevealComplete }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}

/** Applies/removes the `dark` class on <html> whenever theme changes. Renders nothing. */
export function ThemeApplicator() {
  const { theme } = useTheme()
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])
  return null
}
