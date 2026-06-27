'use client'

/**
 * SessionProvider.tsx — Client wrapper around NextAuth's SessionProvider so the
 * Server Component root layout can still provide session context to the tree.
 * Enables `useSession()` in any client component (navbar, dashboards, etc.).
 */
import { SessionProvider } from 'next-auth/react'

export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}
