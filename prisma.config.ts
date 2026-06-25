import { defineConfig } from 'prisma/config'

// Prisma v7 — connection URL for migrations/introspection lives here.
// The PrismaClient at runtime gets its connection via the PrismaPg adapter
// in src/lib/prisma.ts (which reads DATABASE_URL from the environment).
export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
})
