/**
 * dashboard-nav.ts — Navigation config for the org dashboard sidebar.
 *
 * Segments are appended to `/org/[slug]/`. `adminOnly` items are hidden for the
 * MEMBER role (DESIGN/SAAS — "role-aware nav items"). Centralized so the sidebar
 * and any breadcrumbs stay in sync.
 */
export interface OrgNavItem {
  segment: string
  label: string
  /** Material Symbols Outlined icon name. */
  icon: string
  adminOnly?: boolean
}

/** Primary navigation, visible to every member. */
export const ORG_PRIMARY_NAV: OrgNavItem[] = [
  { segment: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { segment: 'listings', label: 'Listings', icon: 'home_work' },
  { segment: 'leads', label: 'Leads', icon: 'forum' },
  { segment: 'members', label: 'Members', icon: 'group' },
  { segment: 'analytics', label: 'Analytics', icon: 'insights' },
]

/** Admin-only tools, shown under a divider. */
export const ORG_ADMIN_NAV: OrgNavItem[] = [
  { segment: 'settings', label: 'Org Settings', icon: 'settings', adminOnly: true },
  { segment: 'billing', label: 'Billing', icon: 'credit_card', adminOnly: true },
]

/** Build the absolute href for a nav item within an org. */
export function orgHref(slug: string, segment: string): string {
  return `/org/${slug}/${segment}`
}
