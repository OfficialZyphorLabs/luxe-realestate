import { defineConfig } from 'prisma/config'
import { loadEnvConfig } from '@next/env'

// Prisma's CLI only auto-loads `.env`, but our vars live in `.env.local` (Next's
// convention). Use Next's own loader so this config sees the same environment the
// app does — otherwise DATABASE_URL is undefined here and `migrate` fails.
loadEnvConfig(process.cwd())

// Prisma v7 — connection URL for migrations/introspection lives here.
// The PrismaClient at runtime gets its connection via the PrismaPg adapter
// in src/lib/prisma.ts (which reads the pooled DATABASE_URL).
//
// Migrations need a DIRECT (non-pooled) connection — Neon's pooled endpoint
// runs through PgBouncer, which breaks migration locks/prepared statements.
// Prefer DIRECT_URL when set; fall back to DATABASE_URL for local/non-pooled DBs.
export default defineConfig({
  datasource: {
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
  },
  // Prisma v7 reads the seed command here (no longer from package.json).
  migrations: {
    seed: 'tsx ./prisma/seed.ts',
  },
})
