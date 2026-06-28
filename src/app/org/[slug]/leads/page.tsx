/**
 * Leads pipeline — placeholder until Phase 4 (leads porting).
 * The nav slot exists now; the Kanban pipeline + lead detail arrive in Phase 4.
 */
import { requireOrgAccess } from '@/lib/auth/session'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { EmptyState } from '@/components/dashboard/EmptyState'

export default async function OrgLeadsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  await requireOrgAccess(slug)

  return (
    <>
      <PageHeader title="Leads" description="Track and respond to inquiries on your listings." />
      <EmptyState
        icon="forum"
        title="Lead management is coming in Phase 4"
        description="The lead pipeline, assignment, and inquiry timeline arrive in the next phase."
      />
    </>
  )
}
