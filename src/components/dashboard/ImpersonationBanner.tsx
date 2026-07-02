/**
 * ImpersonationBanner — sticky top bar shown when a SuperAdmin is viewing an
 * org dashboard in impersonation mode (luxe-impersonation cookie is set).
 * "Exit" calls exitImpersonation() which clears the cookie and redirects back
 * to the SuperAdmin portal.
 */
import { exitImpersonation } from '@/lib/actions/superadmin'

interface ImpersonationBannerProps {
  orgName: string
}

export function ImpersonationBanner({ orgName }: ImpersonationBannerProps) {
  return (
    <div className="flex items-center justify-center gap-3 bg-primary px-4 py-2 text-center">
      <span className="material-symbols-outlined text-[18px] text-on-primary/80" aria-hidden="true">
        visibility
      </span>
      <p className="font-body text-label-md text-on-primary">
        Viewing as <span className="font-semibold">{orgName}</span> admin
      </p>
      <form action={exitImpersonation}>
        <button
          type="submit"
          className="rounded-full bg-on-primary/15 px-3 py-1 font-body text-caption font-semibold uppercase tracking-wider text-on-primary transition-colors hover:bg-on-primary/25"
        >
          Exit
        </button>
      </form>
    </div>
  )
}
