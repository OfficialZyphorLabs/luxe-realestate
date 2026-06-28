/**
 * superadmin-nav.ts — Navigation config for the SuperAdmin portal sidebar.
 */
export interface SuperAdminNavItem {
  href: string
  label: string
  /** Material Symbols Outlined icon name. */
  icon: string
}

export const SUPERADMIN_NAV: SuperAdminNavItem[] = [
  { href: '/superadmin', label: 'Overview', icon: 'dashboard' },
  { href: '/superadmin/organizations', label: 'Organizations', icon: 'apartment' },
  { href: '/superadmin/users', label: 'Users', icon: 'group' },
  { href: '/superadmin/audit-log', label: 'Audit Log', icon: 'receipt_long' },
  { href: '/superadmin/feature-flags', label: 'Feature Flags', icon: 'flag' },
  { href: '/superadmin/settings', label: 'Settings', icon: 'settings' },
]
