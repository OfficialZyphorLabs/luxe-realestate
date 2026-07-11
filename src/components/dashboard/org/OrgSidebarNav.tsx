'use client'

/**
 * OrgSidebarNav — the link list shared by the desktop sidebar and the mobile
 * drawer. Highlights the active route and hides admin-only items from members.
 */
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ORG_PRIMARY_NAV, ORG_ADMIN_NAV, orgHref, type OrgNavItem } from '@/lib/dashboard-nav'

interface OrgSidebarNavProps {
  slug: string
  isAdmin: boolean
  /** Icon-only rail mode (desktop collapsed sidebar). */
  collapsed?: boolean
  /** Called after a link is tapped (used to close the mobile drawer). */
  onNavigate?: () => void
}

export function OrgSidebarNav({ slug, isAdmin, collapsed = false, onNavigate }: OrgSidebarNavProps) {
  const pathname = usePathname()

  const renderItem = (item: OrgNavItem) => {
    const href = orgHref(slug, item.segment)
    const active = pathname === href || pathname.startsWith(`${href}/`)
    return (
      <Link
        key={item.segment}
        href={href}
        onClick={onNavigate}
        aria-current={active ? 'page' : undefined}
        // Native tooltip surfaces the label when collapsed to an icon rail.
        title={collapsed ? item.label : undefined}
        className={cn(
          'flex items-center rounded-xl px-3 py-2.5 font-body text-label-md font-semibold transition-colors',
          collapsed ? 'justify-center' : 'gap-3',
          active
            ? 'bg-primary text-on-primary'
            : 'text-secondary hover:bg-surface-container hover:text-primary'
        )}
      >
        <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
          {item.icon}
        </span>
        {!collapsed && item.label}
      </Link>
    )
  }

  return (
    <nav className="flex flex-1 flex-col gap-1" aria-label="Dashboard">
      {ORG_PRIMARY_NAV.map(renderItem)}

      {isAdmin && (
        <>
          {collapsed ? (
            <div className="mx-2 my-3 border-t border-outline-variant/20" aria-hidden="true" />
          ) : (
            <p className="mt-6 px-3 pb-1 font-body text-caption font-semibold uppercase tracking-widest text-on-surface-variant">
              Admin Tools
            </p>
          )}
          {ORG_ADMIN_NAV.map(renderItem)}
        </>
      )}
    </nav>
  )
}
