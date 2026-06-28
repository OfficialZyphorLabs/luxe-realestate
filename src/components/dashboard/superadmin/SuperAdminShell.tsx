'use client'

/**
 * SuperAdminShell — platform portal chrome. Mirrors OrgShell structurally but
 * with distinct navy branding (no org identity) so it's unmistakably the
 * platform-control surface. Fixed desktop sidebar + animated mobile drawer + top bar.
 */
import { useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { SuperAdminNav } from './SuperAdminNav'
import { UserMenu } from '@/components/dashboard/org/UserMenu'

interface SuperAdminShellProps {
  user: { name: string | null; email: string; avatarUrl: string | null }
  children: React.ReactNode
}

function SidebarBrand() {
  return (
    <div className="flex flex-col gap-1 border-b border-on-primary/15 px-3 pb-5">
      <span className="font-display text-headline-md font-bold text-on-primary">LuxeReal</span>
      <span className="font-body text-caption font-semibold uppercase tracking-widest text-on-primary/50">
        Platform Control
      </span>
    </div>
  )
}

export function SuperAdminShell({ user, children }: SuperAdminShellProps) {
  const reduce = useReducedMotion()
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="min-h-screen bg-surface">
      {/* Desktop sidebar (navy) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col gap-6 bg-primary p-4 lg:flex">
        <SidebarBrand />
        <SuperAdminNav />
        <Link
          href="/"
          className="flex items-center gap-2 px-3 font-body text-caption text-on-primary/60 transition-colors hover:text-on-primary"
        >
          <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
            arrow_back
          </span>
          Back to site
        </Link>
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <div className="lg:hidden">
            <motion.div
              className="fixed inset-0 z-40 bg-primary/40 backdrop-blur-sm"
              initial={reduce ? false : { opacity: 0 }}
              animate={reduce ? undefined : { opacity: 1 }}
              exit={reduce ? undefined : { opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setDrawerOpen(false)}
              aria-hidden="true"
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[80%] flex-col gap-6 bg-primary p-4"
              initial={reduce ? false : { x: '-100%' }}
              animate={reduce ? undefined : { x: 0 }}
              exit={reduce ? undefined : { x: '-100%' }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <SidebarBrand />
              <SuperAdminNav onNavigate={() => setDrawerOpen(false)} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Main column */}
      <div className="flex min-h-screen flex-col lg:pl-64">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-outline-variant/20 bg-surface/80 px-4 py-3 backdrop-blur-md lg:px-8">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation"
            className="flex h-10 w-10 items-center justify-center rounded-full text-primary transition-colors hover:bg-surface-container lg:hidden"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <span className="font-display text-headline-md font-semibold text-primary lg:hidden">
            Platform
          </span>
          <div className="ml-auto">
            <UserMenu
              name={user.name}
              email={user.email}
              avatarUrl={user.avatarUrl}
              profileHref="/superadmin/settings"
            />
          </div>
        </header>

        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  )
}
