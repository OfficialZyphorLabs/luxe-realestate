-- LuxeReal — hard database reset.
-- Drops EVERY table, type, and object in the `public` schema so the database
-- can be rebuilt from scratch by Prisma. This is DESTRUCTIVE — it deletes all
-- data and (implicitly) all Row-Level Security policies.
--
-- Run with:
--   npx prisma db execute --file ./prisma/reset.sql
--
-- Then recreate the schema + policies + seed data (see README § Database).

DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
