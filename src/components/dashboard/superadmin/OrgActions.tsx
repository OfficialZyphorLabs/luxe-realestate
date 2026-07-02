'use client'

/**
 * OrgActions — SuperAdmin action panel for a single organization.
 *
 * Provides:
 *  - Suspend / Reactivate toggle (based on current status)
 *  - Plan selector dropdown (Starter / Growth / Enterprise)
 *  - Delete org (soft-delete, danger zone, confirm dialog)
 *
 * All mutations call Server Actions from lib/actions/superadmin.ts.
 * The panel is rendered in the org detail page's sidebar section.
 */
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { suspendOrg, reactivateOrg, softDeleteOrg, changeOrgPlan } from '@/lib/actions/superadmin'
import { ConfirmDialog } from '@/components/dashboard/ConfirmDialog'
import type { OrgStatus, Plan } from '@/generated/prisma'

interface OrgActionsProps {
  orgId: string
  orgName: string
  currentStatus: OrgStatus
  currentPlan: Plan
}

const PLANS: { value: Plan; label: string }[] = [
  { value: 'STARTER', label: 'Starter' },
  { value: 'GROWTH', label: 'Growth' },
  { value: 'ENTERPRISE', label: 'Enterprise' },
]

export function OrgActions({ orgId, orgName, currentStatus, currentPlan }: OrgActionsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [suspendOpen, setSuspendOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isSuspended = currentStatus === 'SUSPENDED'
  const isDeleted = currentStatus === 'DELETED'

  function run(fn: () => Promise<{ ok: true } | { ok: false; error: string }>) {
    setError(null)
    startTransition(async () => {
      const result = await fn()
      if (!result.ok) {
        setError(result.error)
      } else {
        router.refresh()
      }
    })
  }

  return (
    <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5">
      <h3 className="mb-4 font-display text-headline-md font-semibold text-primary">Admin Actions</h3>

      {error && (
        <p className="mb-3 rounded-lg bg-error-container px-3 py-2 font-body text-caption text-on-error-container">
          {error}
        </p>
      )}

      {/* Plan selector */}
      <div className="mb-4">
        <label className="mb-1.5 block font-body text-caption font-semibold uppercase tracking-wider text-secondary">
          Plan
        </label>
        <select
          className="w-full rounded-xl border border-outline-variant/30 bg-surface px-3 py-2 font-body text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
          defaultValue={currentPlan}
          disabled={isPending || isDeleted}
          onChange={(e) => {
            const plan = e.target.value as Plan
            if (plan !== currentPlan) run(() => changeOrgPlan(orgId, plan))
          }}
        >
          {PLANS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        {/* Suspend / Reactivate */}
        {!isDeleted && (
          <button
            type="button"
            disabled={isPending}
            onClick={() => setSuspendOpen(true)}
            className="flex items-center justify-center gap-2 rounded-xl border border-outline-variant/30 px-4 py-2.5 font-body text-label-md font-semibold text-on-surface transition-colors hover:bg-surface-container disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
              {isSuspended ? 'play_circle' : 'pause_circle'}
            </span>
            {isSuspended ? 'Reactivate Org' : 'Suspend Org'}
          </button>
        )}

        {/* Delete */}
        {!isDeleted && (
          <button
            type="button"
            disabled={isPending}
            onClick={() => setDeleteOpen(true)}
            className="flex items-center justify-center gap-2 rounded-xl border border-error/30 px-4 py-2.5 font-body text-label-md font-semibold text-error transition-colors hover:bg-error-container disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
              delete
            </span>
            Delete Org
          </button>
        )}

        {isDeleted && (
          <div className="rounded-xl bg-error-container px-4 py-2.5 text-center font-body text-label-md text-on-error-container">
            This organization has been deleted.
          </div>
        )}
      </div>

      {/* Suspend confirm */}
      <ConfirmDialog
        open={suspendOpen}
        onClose={() => setSuspendOpen(false)}
        onConfirm={() => {
          setSuspendOpen(false)
          run(() => (isSuspended ? reactivateOrg(orgId) : suspendOrg(orgId)))
        }}
        title={isSuspended ? 'Reactivate Organization' : 'Suspend Organization'}
        description={
          isSuspended
            ? `Reactivate ${orgName}? Members will regain access immediately.`
            : `Suspend ${orgName}? All org members will lose dashboard access until reactivated.`
        }
        loading={isPending}
        tone={isSuspended ? 'default' : 'danger'}
        confirmLabel={isSuspended ? 'Reactivate' : 'Suspend'}
      />

      {/* Delete confirm */}
      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => {
          setDeleteOpen(false)
          run(() => softDeleteOrg(orgId))
        }}
        title="Delete Organization"
        description={`Permanently delete ${orgName}? This marks the org as deleted. It cannot be undone from the portal.`}
        loading={isPending}
        tone="danger"
        confirmLabel="Delete"
      />
    </div>
  )
}
