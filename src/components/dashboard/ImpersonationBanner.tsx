import Link from 'next/link'

/**
 * ImpersonationBanner — sticky top bar shown when a super-admin is viewing an
 * org as its admin (SAAS_ARCHITECTURE.md §6, impersonation flow). Presentational:
 * the org layout renders it when an impersonation context is active, and "Exit"
 * returns to the SuperAdmin portal. (Wiring the cookie/token is Phase 2.)
 */
interface ImpersonationBannerProps {
  orgName: string
  /** Where "Exit" returns to — defaults to the SuperAdmin portal. */
  exitHref?: string
}

export function ImpersonationBanner({ orgName, exitHref = '/superadmin' }: ImpersonationBannerProps) {
  return (
    <div className="sticky top-0 z-40 flex items-center justify-center gap-3 bg-primary px-4 py-2 text-center">
      <span className="material-symbols-outlined text-[18px] text-on-primary/80" aria-hidden="true">
        visibility
      </span>
      <p className="font-body text-label-md text-on-primary">
        Viewing as <span className="font-semibold">{orgName}</span> admin
      </p>
      <Link
        href={exitHref}
        className="rounded-full bg-on-primary/15 px-3 py-1 font-body text-caption font-semibold uppercase tracking-wider text-on-primary transition-colors hover:bg-on-primary/25"
      >
        Exit
      </Link>
    </div>
  )
}
