'use client'

/**
 * MemberRowActions — per-row admin controls (change role, remove member).
 * A client island rendered inside the server table cell. Calls the members
 * Server Actions; the action's `revalidatePath` refreshes the roster. Self-rows
 * only show "change role" (you can't remove yourself).
 */
import { useEffect, useRef, useState, useTransition } from 'react'
import { updateMemberRole, removeMember } from '@/lib/actions/members'
import { ConfirmDialog } from '@/components/dashboard/ConfirmDialog'
import type { OrgRole } from '@/generated/prisma'

interface MemberRowActionsProps {
  slug: string
  membershipId: string
  memberName: string
  currentRole: OrgRole
  isSelf: boolean
}

export function MemberRowActions({
  slug,
  membershipId,
  memberName,
  currentRole,
  isSelf,
}: MemberRowActionsProps) {
  const [open, setOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const nextRole: OrgRole = currentRole === 'ADMIN' ? 'MEMBER' : 'ADMIN'

  function changeRole() {
    setOpen(false)
    setError(null)
    startTransition(async () => {
      const res = await updateMemberRole(slug, membershipId, nextRole)
      if (!res.ok) setError(res.error)
    })
  }

  function confirmRemove() {
    setError(null)
    startTransition(async () => {
      const res = await removeMember(slug, membershipId)
      if (res.ok) setConfirmOpen(false)
      else setError(res.error)
    })
  }

  return (
    <div ref={ref} className="relative flex justify-end">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Actions for ${memberName}`}
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={pending}
        className="flex h-8 w-8 items-center justify-center rounded-full text-secondary transition-colors hover:bg-surface-container hover:text-primary disabled:opacity-50"
      >
        <span className="material-symbols-outlined text-[20px]">more_vert</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-30 mt-1 w-48 overflow-hidden rounded-xl bg-surface-container-lowest py-1 shadow-[0_8px_40px_rgba(4,22,39,0.14),0_0_0_1px_rgba(4,22,39,0.07)]"
        >
          <button
            type="button"
            role="menuitem"
            onClick={changeRole}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-body text-body-md text-on-surface transition-colors hover:bg-surface-container-low"
          >
            <span className="material-symbols-outlined text-[20px] text-secondary" aria-hidden="true">
              {nextRole === 'ADMIN' ? 'shield_person' : 'person'}
            </span>
            Make {nextRole === 'ADMIN' ? 'Admin' : 'Member'}
          </button>
          {!isSelf && (
            <button
              type="button"
              role="menuitem"
              onClick={() => { setOpen(false); setConfirmOpen(true) }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-body text-body-md text-error transition-colors hover:bg-error-container/40"
            >
              <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                person_remove
              </span>
              Remove
            </button>
          )}
        </div>
      )}

      {error && (
        <p className="absolute right-0 top-full z-20 mt-1 w-56 rounded-lg bg-error-container px-3 py-2 font-body text-caption text-on-error-container shadow-md">
          {error}
        </p>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmRemove}
        title={`Remove ${memberName}?`}
        description="They will immediately lose access to this organization. This cannot be undone."
        confirmLabel="Remove member"
        tone="danger"
        loading={pending}
      />
    </div>
  )
}
