/**
 * SuperAdmin — feature flags. The flag store (simple JSON-backed, per-org or
 * global) lands in a later phase; this page reserves the IA slot.
 */
import { PageHeader } from '@/components/dashboard/PageHeader'
import { EmptyState } from '@/components/dashboard/EmptyState'

export default function SuperAdminFeatureFlagsPage() {
  return (
    <>
      <PageHeader
        title="Feature Flags"
        description="Toggle features globally or per organization."
      />
      <EmptyState
        icon="flag"
        title="Feature flags are coming soon"
        description="Global and per-org feature toggles will be configurable here in a later phase."
      />
    </>
  )
}
