'use client'

/**
 * OrgShell — the org dashboard chrome: collapsible fixed desktop sidebar,
 * animated mobile drawer, and a sticky top bar with the org identity + user
 * menu. Holds the client state the shell needs (mobile drawer + desktop
 * collapse); all page content is passed through as `children` from the Server
 * Component layout.
 *
 * The desktop sidebar collapses to an icon rail; the choice is persisted in
 * localStorage and animated via a width/padding transition (no layout jump).
 */
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { OrgSidebarNav } from './OrgSidebarNav'
import { UserMenu } from './UserMenu'
import { ImpersonationBanner } from '@/components/dashboard/ImpersonationBanner'
import { orgHref } from '@/lib/dashboard-nav'
import { cn } from '@/lib/utils'

const COLLAPSE_KEY = 'luxe-sidebar-collapsed'

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

/** Org identity chip shown under the brand. Collapses to a centered icon. */
function OrgIdentity({
  orgName,
  planLabel,
  collapsed,
}: {
  orgName: string
  planLabel: string
  collapsed?: boolean
}) {
  if (collapsed) {
    return (
      <div
        className="flex h-10 w-10 items-center justify-center self-center rounded-xl bg-surface-container"
        title={`${orgName} · ${planLabel} plan`}
      >
        <span className="material-symbols-outlined text-[20px] text-secondary" aria-hidden="true">
          apartment
        </span>
      </div>
    )
  }
  return (
    <div className="flex items-center gap-2 rounded-xl bg-surface-container px-3 py-2">
      <span className="material-symbols-outlined text-[20px] text-secondary" aria-hidden="true">
        apartment
      </span>
      <div className="min-w-0">
        <p className="truncate font-body text-label-md font-semibold text-on-surface">{orgName}</p>
        <p className="font-body text-caption text-secondary">{planLabel} plan</p>
      </div>
    </div>
  )
}

export function OrgShell({ slug, orgName, planLabel, isAdmin, user, children, impersonating }: OrgShellProps) {
  const reduce = useReducedMotion()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  // Restore the persisted collapse preference after mount (avoids SSR mismatch).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (localStorage.getItem(COLLAPSE_KEY) === '1') setCollapsed(true)
  }, [])

  function toggleCollapsed() {
    setCollapsed((v) => {
      const next = !v
      localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0')
      return next
    })
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* ── Desktop sidebar (fixed, collapsible) ── */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 hidden flex-col gap-5 border-r border-outline-variant/20 bg-surface-container-lowest p-4 transition-[width] duration-300 ease-in-out lg:flex',
          collapsed ? 'lg:w-20' : 'lg:w-64'
        )}
      >
        {/* Brand + collapse toggle */}
        <div className={cn('flex items-center', collapsed ? 'justify-center' : 'justify-between')}>
          {!collapsed && (
            <span className="font-display text-headline-md font-bold text-primary">LuxeReal</span>
          )}
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="flex h-9 w-9 items-center justify-center rounded-full text-secondary transition-colors hover:bg-surface-container hover:text-primary"
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
              {collapsed ? 'chevron_right' : 'chevron_left'}
            </span>
          </button>
        </div>

        <div className="border-b border-outline-variant/20 pb-5">
          <OrgIdentity orgName={orgName} planLabel={planLabel} collapsed={collapsed} />
        </div>

        <OrgSidebarNav slug={slug} isAdmin={isAdmin} collapsed={collapsed} />

        <Link
          href="/"
          title={collapsed ? 'Back to site' : undefined}
          className={cn(
            'flex items-center px-3 font-body text-caption text-secondary transition-colors hover:text-primary',
            collapsed ? 'justify-center' : 'gap-2'
          )}
        >
          <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
            arrow_back
          </span>
          {!collapsed && 'Back to site'}
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
              className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[80%] flex-col gap-5 bg-surface-container-lowest p-4"
              initial={reduce ? false : { x: '-100%' }}
              animate={reduce ? undefined : { x: 0 }}
              exit={reduce ? undefined : { x: '-100%' }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="font-display text-headline-md font-bold text-primary">LuxeReal</span>
              <div className="border-b border-outline-variant/20 pb-5">
                <OrgIdentity orgName={orgName} planLabel={planLabel} />
              </div>
              <OrgSidebarNav slug={slug} isAdmin={isAdmin} onNavigate={() => setDrawerOpen(false)} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* ── Main column ── */}
      <div
        className={cn(
          'flex min-h-screen flex-col transition-[padding] duration-300 ease-in-out',
          collapsed ? 'lg:pl-20' : 'lg:pl-64'
        )}
      >
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
