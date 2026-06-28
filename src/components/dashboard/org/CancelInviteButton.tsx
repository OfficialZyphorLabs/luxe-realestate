'use client'

/**
 * CancelInviteButton — revokes a pending invitation via the members Server
 * Action. Inline (no confirm) since an invite can simply be re-sent.
 */
import { useTransition } from 'react'
import { cancelInvitation } from '@/lib/actions/members'

export function CancelInviteButton({
  slug,
  invitationId,
}: {
  slug: string
  invitationId: string
}) {
  const [pending, startTransition] = useTransition()

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => cancelInvitation(slug, invitationId).then(() => undefined))}
      className="inline-flex items-center gap-1 rounded-full px-3 py-1 font-body text-caption font-semibold text-secondary transition-colors hover:bg-error-container/40 hover:text-on-error-container disabled:opacity-50"
    >
      <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
        close
      </span>
      {pending ? 'Cancelling…' : 'Cancel'}
    </button>
  )
}
