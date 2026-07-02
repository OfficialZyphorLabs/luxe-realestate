'use client'

/**
 * ListingRowActions — per-listing controls (edit, publish/unpublish, mark sold,
 * delete) shown as a dropdown in the table row and on grid cards. A client
 * island calling the property Server Actions; their revalidatePath refreshes
 * the list. Edit visibility and delete are gated by props the server computes
 * (ownership + role), so members can't see controls they can't use.
 */
import { useEffect, useRef, useState, useTransition } from 'react'
import Link from 'next/link'
import { setPropertyStatus, deleteProperty } from '@/lib/actions/properties'
import { ConfirmDialog } from '@/components/dashboard/ConfirmDialog'
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

  function changeStatus(next: PropertyStatus) {
    setOpen(false)
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
    <div ref={ref} className="relative flex justify-end">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Actions for ${title}`}
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
          className="absolute right-0 top-full z-30 mt-1 w-52 overflow-hidden rounded-xl bg-surface-container-lowest py-1 shadow-[0_8px_40px_rgba(4,22,39,0.14),0_0_0_1px_rgba(4,22,39,0.07)]"
        >
          {canEdit && (
            <Link
              href={`/org/${slug}/listings/${propertyId}/edit`}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-body text-body-md text-on-surface transition-colors hover:bg-surface-container-low"
            >
              <span className="material-symbols-outlined text-[20px] text-secondary" aria-hidden="true">
                edit
              </span>
              Edit
            </Link>
          )}

          {canEdit && status !== 'ACTIVE' && (
            <MenuButton icon="publish" label="Publish" onClick={() => changeStatus('ACTIVE')} />
          )}
          {canEdit && status === 'ACTIVE' && (
            <>
              <MenuButton icon="unpublished" label="Unpublish" onClick={() => changeStatus('DRAFT')} />
              <MenuButton icon="sell" label="Mark as sold" onClick={() => changeStatus('SOLD')} />
            </>
          )}

          {canDelete && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false)
                setConfirmOpen(true)
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-body text-body-md text-error transition-colors hover:bg-error-container/40"
            >
              <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                delete
              </span>
              Delete
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

/** A single dropdown menu item button. */
function MenuButton({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-body text-body-md text-on-surface transition-colors hover:bg-surface-container-low"
    >
      <span className="material-symbols-outlined text-[20px] text-secondary" aria-hidden="true">
        {icon}
      </span>
      {label}
    </button>
  )
}
