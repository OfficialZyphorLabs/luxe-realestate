'use client'

/**
 * LeadPipeline — a Kanban board of leads grouped into pipeline columns.
 *
 * Rather than drag-and-drop (which needs a DnD lib and is poor for keyboard/AT
 * users), each card carries an accessible "move" menu that calls the
 * updateLeadStatus Server Action; its revalidatePath re-renders the board. The
 * page maps DB rows to the plain `PipelineLead` shape below so this client
 * island stays serialization-safe and decoupled from Prisma types.
 */
import { useEffect, useRef, useState, useTransition } from 'react'
import Link from 'next/link'
import { updateLeadStatus } from '@/lib/actions/leads'
import { MemberAvatar } from '@/components/dashboard/MemberAvatar'
import { LEAD_STATUS_LABELS, LEAD_STATUSES } from '@/lib/validations/lead'
import { formatRelativeTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { LeadStatus } from '@/generated/prisma'

export interface PipelineLead {
  id: string
  name: string
  email: string
  status: LeadStatus
  propertyTitle: string | null
  assigneeName: string | null
  assigneeEmail: string | null
  assigneeAvatar: string | null
  createdAtIso: string
}

/** Board columns — the two terminal states share a "Closed" column. */
const COLUMNS: { key: string; label: string; statuses: LeadStatus[] }[] = [
  { key: 'NEW', label: 'New', statuses: ['NEW'] },
  { key: 'CONTACTED', label: 'Contacted', statuses: ['CONTACTED'] },
  { key: 'QUALIFIED', label: 'Qualified', statuses: ['QUALIFIED'] },
  { key: 'CLOSED', label: 'Closed', statuses: ['CLOSED_WON', 'CLOSED_LOST'] },
]

export function LeadPipeline({ slug, leads }: { slug: string; leads: PipelineLead[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {COLUMNS.map((col) => {
        const items = leads.filter((l) => col.statuses.includes(l.status))
        return (
          <section
            key={col.key}
            className="flex flex-col rounded-2xl bg-surface-container-low p-3"
            aria-label={`${col.label} leads`}
          >
            <header className="mb-3 flex items-center justify-between px-1">
              <h2 className="font-body text-label-md font-semibold uppercase tracking-widest text-secondary">
                {col.label}
              </h2>
              <span className="rounded-full bg-surface-container px-2 py-0.5 font-body text-caption font-semibold text-secondary">
                {items.length}
              </span>
            </header>

            <div className="flex flex-col gap-2">
              {items.length === 0 ? (
                <p className="rounded-xl border border-dashed border-outline-variant/40 px-3 py-6 text-center font-body text-caption text-secondary">
                  No leads
                </p>
              ) : (
                items.map((lead) => <LeadCard key={lead.id} slug={slug} lead={lead} />)
              )}
            </div>
          </section>
        )
      })}
    </div>
  )
}

/** A single lead card with a link to detail + a status-move menu. */
function LeadCard({ slug, lead }: { slug: string; lead: PipelineLead }) {
  return (
    <article className="group relative rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-3 shadow-[0px_2px_10px_rgba(0,0,0,0.03)] transition-shadow hover:shadow-[0px_8px_24px_rgba(0,0,0,0.06)]">
      <div className="flex items-start justify-between gap-2">
        <Link href={`/org/${slug}/leads/${lead.id}`} className="min-w-0 flex-1">
          <p className="truncate font-body text-label-md font-semibold text-on-surface">{lead.name}</p>
          <p className="truncate font-body text-caption text-secondary">
            {lead.propertyTitle ?? 'General inquiry'}
          </p>
        </Link>
        <MoveMenu slug={slug} leadId={lead.id} current={lead.status} />
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="font-body text-caption text-secondary">{formatRelativeTime(lead.createdAtIso)}</span>
        {lead.assigneeName || lead.assigneeEmail ? (
          <MemberAvatar
            name={lead.assigneeName}
            email={lead.assigneeEmail ?? ''}
            src={lead.assigneeAvatar}
            size="sm"
          />
        ) : (
          <span className="font-body text-caption text-secondary/70">Unassigned</span>
        )}
      </div>
    </article>
  )
}

/** Dropdown to move a lead to another pipeline stage. */
function MoveMenu({ slug, leadId, current }: { slug: string; leadId: string; current: LeadStatus }) {
  const [open, setOpen] = useState(false)
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

  function move(status: LeadStatus) {
    setOpen(false)
    setError(null)
    startTransition(async () => {
      const res = await updateLeadStatus(slug, leadId, status)
      if (!res.ok) setError(res.error)
    })
  }

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Move lead to another stage"
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={pending}
        className="flex h-7 w-7 items-center justify-center rounded-full text-secondary transition-colors hover:bg-surface-container hover:text-primary disabled:opacity-50"
      >
        <span className="material-symbols-outlined text-[18px]">more_horiz</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-30 mt-1 w-44 overflow-hidden rounded-xl bg-surface-container-lowest py-1 shadow-[0_8px_40px_rgba(4,22,39,0.14),0_0_0_1px_rgba(4,22,39,0.07)]"
        >
          <p className="px-3 py-1.5 font-body text-caption font-semibold uppercase tracking-widest text-on-surface-variant">
            Move to
          </p>
          {LEAD_STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              role="menuitem"
              onClick={() => move(s)}
              disabled={s === current}
              className={cn(
                'flex w-full items-center justify-between px-3 py-2 text-left font-body text-body-md transition-colors',
                s === current
                  ? 'cursor-default text-secondary/60'
                  : 'text-on-surface hover:bg-surface-container-low'
              )}
            >
              {LEAD_STATUS_LABELS[s]}
              {s === current && (
                <span className="material-symbols-outlined text-[16px] text-primary" aria-hidden="true">
                  check
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {error && (
        <p className="absolute right-0 top-full z-20 mt-1 w-52 rounded-lg bg-error-container px-3 py-2 font-body text-caption text-on-error-container shadow-md">
          {error}
        </p>
      )}
    </div>
  )
}
