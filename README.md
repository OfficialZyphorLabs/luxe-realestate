# Luxe Real Estate

A modern, multi-tenant real estate SaaS platform built with [Next.js](https://nextjs.org), developed by [OfficialZyphorLabs](https://github.com/OfficialZyphorLabs).

## Overview

Luxe Real Estate ("LuxeReal") is a premium property listing and management platform. Agencies sign up, get their own organization workspace, publish listings to a public storefront, and manage inbound leads through a pipeline. It includes RBAC, a SuperAdmin console, Stripe billing, gated image uploads, and AI-assisted listing descriptions.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS v4 — design tokens in `DESIGN.md`
- **Database:** PostgreSQL + [Prisma v7](https://www.prisma.io) (WASM engine, client generated to `src/generated/prisma`)
- **Auth:** NextAuth v5 (credentials + RBAC), Postgres Row-Level Security for tenant isolation
- **Integrations (all gated / optional):** Stripe (billing), S3 / Cloudflare R2 (image storage), Anthropic (AI descriptions), Upstash (rate limiting), Resend (email)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy the example env and fill in at least `DATABASE_URL` and `AUTH_SECRET`:

```bash
cp .env.example .env.local
```

> Env vars live in **`.env.local`** (Next.js convention). Both `prisma.config.ts` and
> `prisma/seed.ts` load `.env.local` explicitly, so the Prisma CLI sees the same
> values the app does. Everything else (Stripe, S3/R2, Anthropic, Upstash, Resend)
> is optional — the app degrades gracefully when a key is absent.

### 3. Set up the database

See **[Database](#database)** below, then:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Database

Prisma v7 in this project reads its connection URL and seed command from
`prisma.config.ts` (not `package.json`). Two schema concerns live outside the
Prisma migration itself and must be applied separately after the tables exist:

- **`prisma/rls.sql`** — Postgres Row-Level Security policies for multi-tenant
  isolation. Idempotent; safe to run repeatedly.
- **`prisma/seed.ts`** — creates the SuperAdmin, a demo org, and demo users.

### First-time setup

```bash
# 1. Create the tables from the committed migration(s)
npx prisma migrate deploy

# 2. Apply Row-Level Security policies
npx prisma db execute --file ./prisma/rls.sql

# 3. Seed the SuperAdmin, demo org, and demo users
npx prisma db seed
```

### Reset everything and start clean

Use this when you want to wipe all data and rebuild. There are two levels.

#### A) Quick reset — keep the migration history *(recommended for day-to-day)*

`prisma migrate reset` drops all tables, replays every committed migration, and
runs the seed automatically. RLS is **not** part of a migration, so re-apply it
afterwards:

```bash
npx prisma migrate reset --force        # drops tables → replays migrations → seeds
npx prisma db execute --file ./prisma/rls.sql   # re-apply RLS policies
```

That's the whole loop. When it finishes you have a fresh, seeded database with
RLS in place.

#### B) Full nuke — also delete the migration files and regenerate them

Use this only when you actually want to throw away migration history and
recreate it from `schema.prisma` (e.g. after collapsing many WIP migrations).

```bash
# 1. Delete the old migration files
Remove-Item -Recurse -Force prisma/migrations        # PowerShell
# rm -rf prisma/migrations                            # bash

# 2. Drop every table/type (empties the public schema)
npx prisma db execute --file ./prisma/reset.sql

# 3. Generate a fresh migration from schema.prisma and apply it
npx prisma migrate dev --name init

# 4. Apply Row-Level Security policies
npx prisma db execute --file ./prisma/rls.sql

# 5. Seed the database
npx prisma db seed
```

### When you change `schema.prisma`

You changed a model and want the database to match. Pick one:

```bash
# Create a named migration + apply it + regenerate the client (keeps history):
npx prisma migrate dev --name describe_your_change

# …or push the schema without creating a migration file (fast, dev-only):
npx prisma db push
```

> After **any** schema change that touches a tenant-scoped table, re-run
> `npx prisma db execute --file ./prisma/rls.sql` so new tables are covered by RLS.

### Regenerating the Prisma client

The client is generated to `src/generated/prisma` (gitignored) and rebuilt by
`npm run build`. To regenerate it manually:

```bash
npx prisma generate
```

> **Machine note:** if `prisma generate` fails trying to reach
> `binaries.prisma.sh`, skip the engine auto-install:
>
> ```powershell
> $env:PRISMA_GENERATE_SKIP_AUTOINSTALL="true"; npx prisma generate   # PowerShell
> ```
> ```bash
> PRISMA_GENERATE_SKIP_AUTOINSTALL=true npx prisma generate            # bash
> ```

### Inspecting data

```bash
npx prisma studio
```

### Seeded credentials

After seeding, log in with:

| Role         | Email                     | Password          |
|--------------|---------------------------|-------------------|
| SuperAdmin   | `admin@luxereal.com`      | `SuperAdmin@123!` |
| Org Admin    | `orgadmin@acmerealty.com` | `OrgAdmin@123!`   |
| Agent/Member | `agent@acmerealty.com`    | `Member@123!`     |

### npm script shortcuts

| Script              | Runs                    |
|---------------------|-------------------------|
| `npm run db:generate` | `prisma generate`     |
| `npm run db:migrate`  | `prisma migrate dev`  |
| `npm run db:seed`     | `prisma db seed`      |
| `npm run db:studio`   | `prisma studio`       |

---

## Documentation

- **`AGENTS.md`** / **`CLAUDE.md`** — engineering + agent instructions.
- **`DESIGN.md`** — the single source of truth for the design system (colors, spacing, typography, motion, components).

## License

Licensed under the [Apache License 2.0](./LICENSE-APACHE-2.0).
Copyright 2026 OfficialZyphorLabs.

## Deploy

The easiest way to deploy is via [Vercel](https://vercel.com/new):

```bash
vercel deploy
```

See the [Next.js deployment docs](https://nextjs.org/docs/app/building-your-application/deploying) for more options.
