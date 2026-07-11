'use client'

/**
 * MemberRowActions — per-row admin controls (change role, remove member) in a
 * portaled dropdown so it's never clipped by the table's scroll container.
 * Calls the members Server Actions; their revalidatePath refreshes the roster.
 * Self-rows only show "change role" (you can't remove yourself).
 */
import { useState, useTransition } from 'react'
import { updateMemberRole, removeMember } from '@/lib/actions/members'
import { ConfirmDialog } from '@/components/dashboard/ConfirmDialog'
import { DropdownMenu, DropdownItem } from '@/components/dashboard/DropdownMenu'
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
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const nextRole: OrgRole = currentRole === 'ADMIN' ? 'MEMBER' : 'ADMIN'

  function changeRole() {
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
    <div className="relative flex justify-end">
      <DropdownMenu label={`Actions for ${memberName}`} disabled={pending}>
        {(close) => (
          <>
            <DropdownItem
              icon={nextRole === 'ADMIN' ? 'shield_person' : 'person'}
              label={`Make ${nextRole === 'ADMIN' ? 'Admin' : 'Member'}`}
              onClick={() => { close(); changeRole() }}
            />
            {!isSelf && (
              <DropdownItem
                icon="person_remove"
                label="Remove"
                tone="danger"
                onClick={() => { close(); setConfirmOpen(true) }}
              />
            )}
          </>
        )}
      </DropdownMenu>

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
