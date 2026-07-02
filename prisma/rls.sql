-- LuxeReal — Row-Level Security Policies
-- Run this AFTER the initial Prisma migration to lock down cross-tenant data access.
--
--   npx prisma db execute --file ./prisma/rls.sql
--
-- The app must issue:  SET LOCAL app.current_org_id = '<org_id>'
-- before every query so that these policies can evaluate correctly.
-- In Prisma this looks like:
--   await prisma.$executeRaw`SELECT set_config('app.current_org_id', ${orgId}, true)`
--
-- NOTE on column names: Prisma maps model *tables* via @@map (e.g. "properties")
-- but leaves *columns* in camelCase, so they must be double-quoted here
-- ("organizationId", not organization_id).
--
-- This script is idempotent — safe to run multiple times.

-- Enable RLS on all tenant-scoped tables (ENABLE is idempotent).
ALTER TABLE properties        ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads             ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships       ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations       ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_settings      ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images   ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_notes        ENABLE ROW LEVEL SECURITY;

-- The second argument `true` to current_setting() makes it return NULL instead
-- of throwing when the setting is unset — so the migration runner and seed
-- script (which never set app.current_org_id) pass through unfiltered.

DROP POLICY IF EXISTS org_isolation_properties ON properties;
CREATE POLICY org_isolation_properties ON properties
  FOR ALL
  USING ("organizationId" = current_setting('app.current_org_id', true));

DROP POLICY IF EXISTS org_isolation_leads ON leads;
CREATE POLICY org_isolation_leads ON leads
  FOR ALL
  USING ("organizationId" = current_setting('app.current_org_id', true));

DROP POLICY IF EXISTS org_isolation_memberships ON memberships;
CREATE POLICY org_isolation_memberships ON memberships
  FOR ALL
  USING ("organizationId" = current_setting('app.current_org_id', true));

DROP POLICY IF EXISTS org_isolation_invitations ON invitations;
CREATE POLICY org_isolation_invitations ON invitations
  FOR ALL
  USING ("organizationId" = current_setting('app.current_org_id', true));

DROP POLICY IF EXISTS org_isolation_org_settings ON org_settings;
CREATE POLICY org_isolation_org_settings ON org_settings
  FOR ALL
  USING ("organizationId" = current_setting('app.current_org_id', true));

DROP POLICY IF EXISTS org_isolation_property_images ON property_images;
CREATE POLICY org_isolation_property_images ON property_images
  FOR ALL
  USING (
    "propertyId" IN (
      SELECT id FROM properties
      WHERE "organizationId" = current_setting('app.current_org_id', true)
    )
  );

-- Lead notes inherit their tenant boundary from the parent lead.
DROP POLICY IF EXISTS org_isolation_lead_notes ON lead_notes;
CREATE POLICY org_isolation_lead_notes ON lead_notes
  FOR ALL
  USING (
    "leadId" IN (
      SELECT id FROM leads
      WHERE "organizationId" = current_setting('app.current_org_id', true)
    )
  );

-- Performance indexes for org-scoped scans NOT already created by the Prisma
-- schema. (properties, leads, and audit_logs are already indexed via @@index;
-- memberships' unique (userId, organizationId) doesn't help org-only lookups.)
CREATE INDEX IF NOT EXISTS idx_memberships_org_id ON memberships("organizationId");
CREATE INDEX IF NOT EXISTS idx_invitations_org_id ON invitations("organizationId");
