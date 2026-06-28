'use client'

/**
 * SuperAdminNav — sidebar links for the platform portal. The Overview ("/superadmin")
 * is matched exactly so it isn't highlighted on sub-routes. Rendered on the navy
 * sidebar, hence on-primary colors.
 */
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { SUPERADMIN_NAV } from '@/lib/superadmin-nav'

export function SuperAdminNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-1 flex-col gap-1" aria-label="Platform">
      {SUPERADMIN_NAV.map((item) => {
        const active =
          item.href === '/superadmin'
            ? pathname === '/superadmin'
            : pathname === item.href || pathname.startsWith(`${item.href}/`)
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 font-body text-label-md font-semibold transition-colors',
              active
                ? 'bg-on-primary/15 text-on-primary'
                : 'text-on-primary/70 hover:bg-on-primary/10 hover:text-on-primary'
            )}
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
              {item.icon}
            </span>
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
