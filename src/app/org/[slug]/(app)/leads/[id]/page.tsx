/**
 * Lead detail (Phase 4) — contact info, the original inquiry, a notes timeline,
 * and the management panel (status / assignment / add-note).
 *
 * Access mirrors the data layer: non-admins can only open leads assigned to
 * them (getLeadById returns null otherwise → 404). Assignment controls +
 * member list are provided only when the viewer holds leads:assign.
 */
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireOrgAccess } from '@/lib/auth/session'
import { can, isAdminOf } from '@/lib/permissions'
import { getOrgBySlug, getOrgMembers } from '@/lib/data/dashboard'
import { getLeadById } from '@/lib/data/leads'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { MemberAvatar } from '@/components/dashboard/MemberAvatar'
import { LeadManagePanel } from '@/components/dashboard/org/LeadManagePanel'
import { formatDate, formatRelativeTime } from '@/lib/format'

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>
}) {
  const { slug, id } = await params
  const session = await requireOrgAccess(slug)
  const org = await getOrgBySlug(slug)
  if (!org) notFound()

  const scope = { viewerId: session.user.id, canViewAll: isAdminOf(session, slug) }
  const lead = await getLeadById(org.id, id, scope)
  if (!lead) notFound()

  const canAssign = can(session, 'leads:assign', slug)
  const members = canAssign
    ? (await getOrgMembers(org.id)).map((m) => ({
        id: m.user.id,
        name: m.user.name,
        email: m.user.email,
      }))
    : []

  return (
    <>
      <PageHeader
        title={lead.name}
        description={
          <>
            Received {formatDate(lead.createdAt)} · <StatusBadge status={lead.status} />
          </>
        }
        actions={
          <Link
            href={`/org/${slug}/leads`}
            className="inline-flex items-center gap-1 font-body text-label-md font-semibold text-primary transition-all hover:gap-2"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
              arrow_back
            </span>
            Back to leads
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: contact + inquiry + timeline */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Contact card */}
          <section className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5">
            <h2 className="mb-4 font-display text-headline-md font-semibold text-primary">Contact</h2>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Email">
                <a href={`mailto:${lead.email}`} className="text-primary hover:underline">
                  {lead.email}
                </a>
              </Field>
              <Field label="Phone">
                {lead.phone ? (
                  <a href={`tel:${lead.phone}`} className="text-primary hover:underline">
                    {lead.phone}
                  </a>
                ) : (
                  <span className="text-secondary/70">Not provided</span>
                )}
              </Field>
              <Field label="Interested in">
                {lead.property ? (
                  <Link
                    href={`/org/${slug}/listings/${lead.property.id}/edit`}
                    className="text-primary hover:underline"
                  >
                    {lead.property.title}
                  </Link>
                ) : (
                  <span className="text-secondary/70">General inquiry</span>
                )}
              </Field>
              <Field label="Assigned to">
                {lead.assignee ? (
                  <span className="inline-flex items-center gap-2">
                    <MemberAvatar
                      name={lead.assignee.name}
                      email={lead.assignee.email}
                      src={lead.assignee.avatarUrl}
                      size="sm"
                    />
                    {lead.assignee.name ?? lead.assignee.email}
                  </span>
                ) : (
                  <span className="text-secondary/70">Unassigned</span>
                )}
              </Field>
            </dl>

            {lead.message && (
              <div className="mt-5 border-t border-outline-variant/20 pt-4">
                <p className="mb-1 font-body text-label-md text-xs font-semibold uppercase tracking-widest text-secondary">
                  Message
                </p>
                <p className="whitespace-pre-line font-body text-body-md text-on-surface">{lead.message}</p>
              </div>
            )}
          </section>

          {/* Timeline */}
          <section className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5">
            <h2 className="mb-4 font-display text-headline-md font-semibold text-primary">Activity</h2>
            {lead.notes.length === 0 ? (
              <p className="font-body text-body-md text-secondary">
                No notes yet. Use the panel to log your first update.
              </p>
            ) : (
              <ul className="flex flex-col gap-4">
                {lead.notes.map((n) => (
                  <li key={n.id} className="flex gap-3">
                    <MemberAvatar name={n.author.name} email={n.author.email} src={n.author.avatarUrl} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="font-body text-caption text-secondary">
                        <span className="font-semibold text-on-surface">
                          {n.author.name ?? n.author.email}
                        </span>{' '}
                        · {formatRelativeTime(n.createdAt)}
                      </p>
                      <p className="mt-1 whitespace-pre-line font-body text-body-md text-on-surface">{n.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Right: management panel */}
        <div className="lg:col-span-1">
          <LeadManagePanel
            slug={slug}
            leadId={lead.id}
            currentStatus={lead.status}
            currentAssigneeId={lead.assignedTo}
            canAssign={canAssign}
            members={members}
          />
        </div>
      </div>
    </>
  )
}

/** A labeled field in the contact card's definition list. */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="font-body text-label-md text-xs font-semibold uppercase tracking-widest text-secondary">
        {label}
      </dt>
      <dd className="mt-1 font-body text-body-md text-on-surface">{children}</dd>
    </div>
  )
}
