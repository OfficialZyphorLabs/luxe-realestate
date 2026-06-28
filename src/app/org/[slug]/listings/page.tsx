/**
 * Listings management — placeholder until Phase 4 (property porting).
 * The nav slot exists now so the IA is complete; full CRUD lands in Phase 4.
 */
import { requireOrgAccess } from '@/lib/auth/session'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { EmptyState } from '@/components/dashboard/EmptyState'

export default async function OrgListingsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  await requireOrgAccess(slug)

  return (
    <>
      <PageHeader title="Listings" description="Manage your organization's property listings." />
      <EmptyState
        icon="home_work"
        title="Listings management is coming in Phase 4"
        description="Creating, editing, and publishing properties — scoped to your organization — arrives in the next phase."
      />
    </>
  )
}
