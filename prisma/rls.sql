-- LuxeReal — Row-Level Security Policies
-- Run this AFTER the initial Prisma migration to lock down cross-tenant data access.
--
--   psql $DATABASE_URL -f prisma/rls.sql
--
-- The app must issue:  SET LOCAL app.current_org_id = '<org_id>'
-- before every query so that these policies can evaluate correctly.
-- In Prisma middleware this looks like:
--   await prisma.$executeRaw`SELECT set_config('app.current_org_id', ${orgId}, true)`

-- Enable RLS on all tenant-scoped tables
ALTER TABLE properties        ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads             ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships       ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations       ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_settings      ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images   ENABLE ROW LEVEL SECURITY;

-- The second argument `true` makes current_setting() return NULL instead of
-- throwing when the setting has not been set — this lets queries from the
-- migration runner or seed script pass through unfiltered.

CREATE POLICY org_isolation_properties ON properties
  FOR ALL
  USING (organization_id = current_setting('app.current_org_id', true));

CREATE POLICY org_isolation_leads ON leads
  FOR ALL
  USING (organization_id = current_setting('app.current_org_id', true));

CREATE POLICY org_isolation_memberships ON memberships
  FOR ALL
  USING (organization_id = current_setting('app.current_org_id', true));

CREATE POLICY org_isolation_invitations ON invitations
  FOR ALL
  USING (organization_id = current_setting('app.current_org_id', true));

CREATE POLICY org_isolation_org_settings ON org_settings
  FOR ALL
  USING (organization_id = current_setting('app.current_org_id', true));

CREATE POLICY org_isolation_property_images ON property_images
  FOR ALL
  USING (
    property_id IN (
      SELECT id FROM properties
      WHERE organization_id = current_setting('app.current_org_id', true)
    )
  );

-- Performance indexes supporting org_id-scoped queries
CREATE INDEX IF NOT EXISTS idx_properties_org_id   ON properties(organization_id);
CREATE INDEX IF NOT EXISTS idx_leads_org_id         ON leads(organization_id);
CREATE INDEX IF NOT EXISTS idx_memberships_org_id   ON memberships(organization_id);
CREATE INDEX IF NOT EXISTS idx_invitations_org_id   ON invitations(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_ts    ON audit_logs(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_ts  ON audit_logs(actor_id, created_at DESC);
