'use client'

/**
 * OrgShell — the org dashboard chrome: fixed desktop sidebar, animated mobile
 * drawer, and a sticky top bar with the org identity + user menu. Holds the
 * mobile-drawer open state (the one piece of client state the shell needs); all
 * page content is passed through as `children` from the Server Component layout.
 */
import { useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { OrgSidebarNav } from './OrgSidebarNav'
import { UserMenu } from './UserMenu'
import { ImpersonationBanner } from '@/components/dashboard/ImpersonationBanner'
import { orgHref } from '@/lib/dashboard-nav'

interface OrgShellProps {
  slug: string
  orgName: string
  planLabel: string
  isAdmin: boolean
  user: { name: string | null; email: string; avatarUrl: string | null }
  children: React.ReactNode
  /** Set when a SuperAdmin is viewing this org in impersonation mode. */
  impersonating?: boolean
}

/** Brand + org identity block shown at the top of the sidebar. */
function SidebarHeader({ orgName, planLabel }: { orgName: string; planLabel: string }) {
  return (
    <div className="flex flex-col gap-3 border-b border-outline-variant/20 px-3 pb-5">
      <span className="font-display text-headline-md font-bold text-primary">LuxeReal</span>
      <div className="flex items-center gap-2 rounded-xl bg-surface-container px-3 py-2">
        <span className="material-symbols-outlined text-[20px] text-secondary" aria-hidden="true">
          apartment
        </span>
        <div className="min-w-0">
          <p className="truncate font-body text-label-md font-semibold text-on-surface">{orgName}</p>
          <p className="font-body text-caption text-secondary">{planLabel} plan</p>
        </div>
      </div>
    </div>
  )
}

export function OrgShell({ slug, orgName, planLabel, isAdmin, user, children, impersonating }: OrgShellProps) {
  const reduce = useReducedMotion()
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="min-h-screen bg-surface">
      {/* ── Desktop sidebar (fixed) ── */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col gap-6 border-r border-outline-variant/20 bg-surface-container-lowest p-4 lg:flex">
        <SidebarHeader orgName={orgName} planLabel={planLabel} />
        <OrgSidebarNav slug={slug} isAdmin={isAdmin} />
        <Link
          href="/"
          className="flex items-center gap-2 px-3 font-body text-caption text-secondary transition-colors hover:text-primary"
        >
          <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
            arrow_back
          </span>
          Back to site
        </Link>
      </aside>

      {/* ── Mobile drawer ── */}
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
              className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[80%] flex-col gap-6 bg-surface-container-lowest p-4"
              initial={reduce ? false : { x: '-100%' }}
              animate={reduce ? undefined : { x: 0 }}
              exit={reduce ? undefined : { x: '-100%' }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <SidebarHeader orgName={orgName} planLabel={planLabel} />
              <OrgSidebarNav slug={slug} isAdmin={isAdmin} onNavigate={() => setDrawerOpen(false)} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* ── Main column ── */}
      <div className="flex min-h-screen flex-col lg:pl-64">
        {impersonating && <ImpersonationBanner orgName={orgName} />}
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
            {orgName}
          </span>
          <div className="ml-auto">
            <UserMenu
              name={user.name}
              email={user.email}
              avatarUrl={user.avatarUrl}
              profileHref={orgHref(slug, 'profile')}
            />
          </div>
        </header>

        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  )
}
