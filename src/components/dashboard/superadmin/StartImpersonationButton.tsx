'use client'

/**
 * StartImpersonationButton — triggers the impersonation flow.
 *
 * Calls startImpersonation (Server Action) which sets the luxe-impersonation
 * cookie and redirects into the org dashboard with the banner visible.
 */
import { useTransition } from 'react'
import { startImpersonation } from '@/lib/actions/superadmin'

interface StartImpersonationButtonProps {
  orgSlug: string
}

export function StartImpersonationButton({ orgSlug }: StartImpersonationButtonProps) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => startImpersonation(orgSlug))}
      className="inline-flex items-center gap-2 rounded-xl border border-outline-variant/30 bg-surface px-4 py-2 font-body text-label-md font-semibold text-on-surface transition-colors hover:bg-surface-container disabled:opacity-60"
    >
      <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
        visibility
      </span>
      {isPending ? 'Opening…' : 'View as Admin'}
    </button>
  )
}
