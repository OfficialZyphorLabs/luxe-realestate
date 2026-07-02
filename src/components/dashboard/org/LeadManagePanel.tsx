'use client'

/**
 * LeadManagePanel — the interactive controls on the lead detail page: change
 * pipeline status, (admin-only) assign to a member, and add a timeline note.
 *
 * Each control calls its Server Action and refreshes the route so the
 * server-rendered timeline/badges update. Assignment is only rendered when the
 * viewer holds leads:assign (the page passes `canAssign` + the member list).
 */
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateLeadStatus, assignLead, addLeadNote } from '@/lib/actions/leads'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { LEAD_STATUSES, LEAD_STATUS_LABELS } from '@/lib/validations/lead'
import type { LeadStatus } from '@/generated/prisma'

interface MemberOption {
  id: string
  name: string | null
  email: string
}

interface LeadManagePanelProps {
  slug: string
  leadId: string
  currentStatus: LeadStatus
  currentAssigneeId: string | null
  canAssign: boolean
  members: MemberOption[]
}

const STATUS_OPTIONS = LEAD_STATUSES.map((s) => ({ value: s, label: LEAD_STATUS_LABELS[s] }))

export function LeadManagePanel({
  slug,
  leadId,
  currentStatus,
  currentAssigneeId,
  canAssign,
  members,
}: LeadManagePanelProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const [pending, startTransition] = useTransition()

  const assigneeOptions = [
    { value: '', label: 'Unassigned' },
    ...members.map((m) => ({ value: m.id, label: m.name ?? m.email })),
  ]

  function onStatusChange(value: string) {
    setError(null)
    startTransition(async () => {
      const res = await updateLeadStatus(slug, leadId, value as LeadStatus)
      if (res.ok) router.refresh()
      else setError(res.error)
    })
  }

  function onAssigneeChange(value: string) {
    setError(null)
    startTransition(async () => {
      const res = await assignLead(slug, leadId, value === '' ? null : value)
      if (res.ok) router.refresh()
      else setError(res.error)
    })
  }

  function submitNote() {
    if (!note.trim()) return
    setError(null)
    startTransition(async () => {
      const res = await addLeadNote(slug, leadId, note)
      if (res.ok) {
        setNote('')
        router.refresh()
      } else {
        setError(res.error)
      }
    })
  }

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5">
      <div>
        <Select
          label="Pipeline status"
          options={STATUS_OPTIONS}
          value={currentStatus}
          onChange={onStatusChange}
          disabled={pending}
        />
      </div>

      {canAssign && (
        <div>
          <Select
            label="Assigned agent"
            options={assigneeOptions}
            value={currentAssigneeId ?? ''}
            onChange={onAssigneeChange}
            disabled={pending}
          />
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label
          htmlFor="lead-note"
          className="font-body text-label-md text-xs font-semibold uppercase tracking-widest text-secondary"
        >
          Add a note
        </label>
        <textarea
          id="lead-note"
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Log a call, a viewing, next steps…"
          className="rounded-lg border border-outline-variant/50 bg-surface-container-low px-4 py-3 font-body text-body-md text-on-surface transition-standard placeholder:text-secondary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <div className="flex justify-end">
          <Button type="button" size="sm" onClick={submitNote} disabled={pending || !note.trim()}>
            {pending ? 'Saving…' : 'Add note'}
          </Button>
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-error-container/50 px-3 py-2 font-body text-caption text-on-error-container">
          {error}
        </p>
      )}
    </div>
  )
}
