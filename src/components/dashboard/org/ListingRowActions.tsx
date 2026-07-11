'use client'

/**
 * ListingRowActions — per-listing controls (edit, publish/unpublish, mark sold,
 * delete) in a portaled dropdown so it's never clipped by the table's scroll
 * container. Calls the property Server Actions; their revalidatePath refreshes
 * the list. Edit visibility and delete are gated by server-computed props.
 */
import { useState, useTransition } from 'react'
import Link from 'next/link'
import { setPropertyStatus, deleteProperty } from '@/lib/actions/properties'
import { ConfirmDialog } from '@/components/dashboard/ConfirmDialog'
import { DropdownMenu, DropdownItem } from '@/components/dashboard/DropdownMenu'
import type { PropertyStatus } from '@/generated/prisma'

interface ListingRowActionsProps {
  slug: string
  propertyId: string
  title: string
  status: PropertyStatus
  /** Viewer may edit this listing (edit-any, or it's their own). */
  canEdit: boolean
  /** Viewer may delete (admin / super-admin). */
  canDelete: boolean
}

export function ListingRowActions({
  slug,
  propertyId,
  title,
  status,
  canEdit,
  canDelete,
}: ListingRowActionsProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function changeStatus(next: PropertyStatus) {
    setError(null)
    startTransition(async () => {
      const res = await setPropertyStatus(slug, propertyId, next)
      if (!res.ok) setError(res.error)
    })
  }

  function confirmDelete() {
    setError(null)
    startTransition(async () => {
      const res = await deleteProperty(slug, propertyId)
      if (res.ok) setConfirmOpen(false)
      else setError(res.error)
    })
  }

  return (
    <div className="relative flex justify-end">
      <DropdownMenu label={`Actions for ${title}`} disabled={pending}>
        {(close) => (
          <>
            {canEdit && (
              <Link
                href={`/org/${slug}/listings/${propertyId}/edit`}
                role="menuitem"
                onClick={close}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-body text-body-md text-on-surface transition-colors hover:bg-surface-container-low"
              >
                <span className="material-symbols-outlined text-[20px] text-secondary" aria-hidden="true">
                  edit
                </span>
                Edit
              </Link>
            )}

            {canEdit && status !== 'ACTIVE' && (
              <DropdownItem icon="publish" label="Publish" onClick={() => { close(); changeStatus('ACTIVE') }} />
            )}
            {canEdit && status === 'ACTIVE' && (
              <>
                <DropdownItem icon="unpublished" label="Unpublish" onClick={() => { close(); changeStatus('DRAFT') }} />
                <DropdownItem icon="sell" label="Mark as sold" onClick={() => { close(); changeStatus('SOLD') }} />
              </>
            )}

            {canDelete && (
              <DropdownItem
                icon="delete"
                label="Delete"
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
        onConfirm={confirmDelete}
        title={`Delete "${title}"?`}
        description="This permanently removes the listing and its photos. This cannot be undone."
        confirmLabel="Delete listing"
        tone="danger"
        loading={pending}
      />
    </div>
  )
}
