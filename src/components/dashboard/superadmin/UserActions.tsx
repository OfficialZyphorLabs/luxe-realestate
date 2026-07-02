'use client'

/**
 * UserActions — grant or revoke SuperAdmin status for a platform user.
 *
 * Renders as a small button in the users table. Shows a confirm dialog
 * before the mutation since granting SA is a high-privilege action.
 */
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { grantSuperAdmin, revokeSuperAdmin } from '@/lib/actions/superadmin'
import { ConfirmDialog } from '@/components/dashboard/ConfirmDialog'

interface UserActionsProps {
  userId: string
  userName: string | null
  isSuperAdmin: boolean
  /** The currently signed-in user's id — prevents self-revoke. */
  currentUserId: string
}

export function UserActions({ userId, userName, isSuperAdmin, currentUserId }: UserActionsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isSelf = userId === currentUserId

  function handleConfirm() {
    setOpen(false)
    setError(null)
    startTransition(async () => {
      const result = isSuperAdmin ? await revokeSuperAdmin(userId) : await grantSuperAdmin(userId)
      if (!result.ok) {
        setError(result.error)
      } else {
        router.refresh()
      }
    })
  }

  if (isSelf) {
    return (
      <span className="font-body text-caption text-secondary italic">You</span>
    )
  }

  return (
    <>
      {error && (
        <p className="mb-1 font-body text-caption text-error">{error}</p>
      )}
      <button
        type="button"
        disabled={isPending}
        onClick={() => setOpen(true)}
        className={[
          'inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-body text-caption font-semibold transition-colors disabled:opacity-50',
          isSuperAdmin
            ? 'bg-error-container text-on-error-container hover:bg-error/20'
            : 'bg-surface-variant text-on-surface-variant hover:bg-primary/10 hover:text-primary',
        ].join(' ')}
      >
        <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
          {isSuperAdmin ? 'remove_moderator' : 'admin_panel_settings'}
        </span>
        {isPending ? '…' : isSuperAdmin ? 'Revoke SA' : 'Grant SA'}
      </button>

      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleConfirm}
        title={isSuperAdmin ? 'Revoke Super-Admin' : 'Grant Super-Admin'}
        description={
          isSuperAdmin
            ? `Remove super-admin access for ${userName ?? 'this user'}? They will lose access to the SuperAdmin portal immediately.`
            : `Grant ${userName ?? 'this user'} super-admin access? They will have full platform control.`
        }
        loading={isPending}
        tone={isSuperAdmin ? 'danger' : 'default'}
        confirmLabel={isSuperAdmin ? 'Revoke' : 'Grant'}
      />
    </>
  )
}
