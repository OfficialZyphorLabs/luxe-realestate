# LuxeReal SaaS — Implementation Todos

> Phased breakdown of all work required to ship LuxeReal as a multi-tenant SaaS.
> Each phase is independently deployable and builds on the previous.
> See `SAAS_ARCHITECTURE.md` for full diagrams, schema, and design decisions.

---

## Phase 0 — Foundation & Infrastructure Setup
**Goal:** Prepare the repo, database, and toolchain before writing any feature code.
**Duration estimate:** 1–2 days

### Database & ORM
- [ ] Install and configure Prisma (`npm install prisma @prisma/client`)
- [ ] Set up PostgreSQL — choose hosting (Neon.tech recommended for serverless)
- [ ] Create `prisma/schema.prisma` with full multi-tenant schema (see `SAAS_ARCHITECTURE.md §3`)
- [ ] Write initial migration: `npx prisma migrate dev --name init`
- [ ] Seed script: create SuperAdmin user + test org
- [ ] Configure Prisma client singleton for Next.js (`src/lib/prisma.ts`)
- [ ] Enable Row-Level Security (RLS) policies via SQL migration file

### Auth Dependency
- [ ] Install NextAuth.js v5 (`npm install next-auth@beta`)
- [ ] Install bcryptjs for password hashing (`npm install bcryptjs @types/bcryptjs`)
- [ ] Install Resend for emails (`npm install resend`)
- [ ] Install Zod for input validation (`npm install zod`)

### Cache & Rate Limiting
- [ ] Set up Upstash Redis account (free tier works for dev)
- [ ] Install `@upstash/redis` and `@upstash/ratelimit`
- [ ] Create `src/lib/redis.ts` singleton

### Environment Variables
- [ ] Add to `.env.local`:
  - `DATABASE_URL` (PostgreSQL)
  - `NEXTAUTH_SECRET` (random 32-char string)
  - `NEXTAUTH_URL` (http://localhost:3000)
  - `RESEND_API_KEY`
  - `UPSTASH_REDIS_REST_URL`
  - `UPSTASH_REDIS_REST_TOKEN`
- [ ] Add `.env.example` with all keys (no values)
- [ ] Add `.env*.local` to `.gitignore`

---

## Phase 1 — Authentication System ✅ COMPLETE (code)
**Goal:** Users can register, log in, accept invites, and sessions carry org membership claims.
**Duration estimate:** 3–5 days

> **Status:** Implemented and verified (`tsc --noEmit`, `eslint`, `next build` all pass).
> Awaiting a provisioned database to run end-to-end (see "Required from you" at the
> bottom of this section). Notable deviations driven by the stack:
> - **Next.js 16 renamed `middleware.ts` → `proxy.ts`** — the tenant resolver lives
>   at `src/proxy.ts` and exports a `proxy` (the `auth()` wrapper).
> - Server-session helpers live at `src/lib/auth/session.ts` (not `src/lib/auth.ts`).
> - Invitation/reset tokens are stored **hashed** (SHA-256); the raw token only
>   travels in the email link.
> - Transactional emails use inlined HTML templates; React Email is deferred to
>   Phase 6 per the original plan.

### NextAuth Configuration
- [x] Create `src/app/api/auth/[...nextauth]/route.ts`
- [x] Configure Credentials provider (email + password) — timing-safe `authorize`
- [x] Configure Google OAuth provider (auto-enabled when `AUTH_GOOGLE_*` are set)
- [x] Build custom JWT callback — embed `isSuperAdmin` and `memberships[]` into token
- [x] Build custom session callback — expose enriched user from JWT
- [x] Configure Prisma adapter for NextAuth (account, session, verification token tables)

### Registration
- [x] Create registration page: `/register`
  - [x] Fields: Full Name, Email, Password, Organization Name, Organization Slug (auto-derived)
  - [x] Real-time slug availability check (debounced API call)
  - [x] Password strength indicator
- [x] Create `POST /api/auth/register` route
  - [x] Validate inputs with Zod
  - [x] Check email + slug uniqueness (+ reserved-slug list)
  - [x] Hash password with bcryptjs
  - [x] DB transaction: create User → Organization → OrgSettings → Subscription (trial) → Membership (ADMIN)
  - [x] Send welcome email via Resend (best-effort)
  - [x] Auto sign-in after registration

### Login
- [x] Create login page: `/login`
- [x] Email/password form with error handling (generic, enumeration-safe)
- [x] "Continue with Google" button
- [x] Forgot password link (full flow built — not a stub)
- [x] Redirect to `/org/[slug]/dashboard` after login

### Invitation System
- [x] Create `POST /api/org/[slug]/invite` — hashed token, RBAC-gated (members:invite), rate-limited
- [x] Create invitation email template (inlined HTML; React Email deferred to Phase 6)
- [x] Create `/invite/accept?token=...` page
  - [x] Validate token (exists, not expired, not already accepted)
  - [x] If user exists → create membership, mark accepted, sign in → dashboard
  - [x] If new user → name + password form, create user + membership → dashboard
- [x] Token expiry: 48 hours
- [x] Re-send invite (same endpoint replaces any pending invite — idempotent)

### Password Reset (complete flow)
- [x] Create `/forgot-password` page
- [x] Create `POST /api/auth/forgot-password` — hashed reset token, generic response
- [x] Create `/reset-password?token=...` page
- [x] Create `POST /api/auth/reset-password` — validate token, update password, invalidate token

### Proxy / Middleware (Tenant Resolution) — `src/proxy.ts`
- [x] Create `proxy.ts` (Next.js 16 replacement for `middleware.ts`)
  - [x] Protect `/org/[slug]/*` — require authenticated session
  - [x] Verify user is a member of the org from the slug
  - [x] Protect `/superadmin/*` — require `isSuperAdmin === true`
  - [x] Set `x-org-id` / `x-org-slug` headers for downstream route handlers
  - [x] Redirect unauthenticated users to `/login?callbackUrl=...`
- [x] Create `src/lib/auth/session.ts` — typed `getSession`/`requireAuth`/`requireOrgAccess`
- [x] Create `src/lib/permissions.ts` — `can()` helper (see `SAAS_ARCHITECTURE.md §5`)

### Extra hardening added this phase
- [x] `src/lib/rate-limit.ts` — Upstash sliding-window limits on register/login/reset/invite
- [x] `src/lib/api.ts` — uniform JSON error envelope; never leaks internals
- [x] Bcrypt timing-safe login (decoy hash) to defeat user-enumeration via timing

### Required from you before this phase can run end-to-end
1. Provision PostgreSQL (Neon.tech recommended) and set `DATABASE_URL` in `.env.local`.
2. Set `AUTH_SECRET` (`openssl rand -base64 32`) and `AUTH_URL=http://localhost:3000`.
3. (Optional) `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` to enable Google sign-in.
4. (Optional) `RESEND_API_KEY` to actually send email (otherwise it logs to console).
5. (Optional) `UPSTASH_REDIS_REST_URL` / `_TOKEN` to enforce rate limits.
6. Run the migration for the new `image` column + `password_reset_tokens` table:
   `npx prisma migrate dev --name auth_phase1`
7. (If not already) apply RLS + seed: `psql $DATABASE_URL -f prisma/rls.sql` then `npx prisma db seed`.

---

## Phase 2 — Organization & Member Management ✅ COMPLETE (functional scope)
**Goal:** Org Admins can manage their team; SuperAdmin can manage all orgs.
**Duration estimate:** 4–6 days

> **Status:** Implemented using Server Actions (Next.js App Router pattern) instead of
> separate REST route files. All capabilities are present — reads + writes — with full
> RBAC, audit logging, and impersonation. Deviations from the original spec:
> - REST route files (`/api/org/[slug]`, etc.) not created separately; functionality
>   is exposed via Server Actions in `lib/actions/{members,org,superadmin}.ts`.
> - Logo upload deferred — blocked on R2/S3 credentials (Phase 4 needs uploads too;
>   do them together when credentials are provisioned).

### Organization Management
- [x] Read org (`getOrgBySlug` — React `cache()`)
- [x] Update org settings — `updateOrgSettings` server action (name, logo URL, color, public toggle)
- [x] Soft-delete org (ADMIN) — `deleteOrg` server action
- [x] SuperAdmin: suspend / reactivate / hard-delete / change plan — `suspendOrg`, `reactivateOrg`, `softDeleteOrg`, `changeOrgPlan` actions

### Members Management
- [x] List members (`getOrgMembers`)
- [x] Invite member — `POST /api/org/[slug]/invite` (Phase 1)
- [x] Update role — `updateMemberRole` server action (ADMIN only, last-admin guard)
- [x] Remove member — `removeMember` server action (ADMIN only, self + last-admin guard)
- [x] Cancel invitation — `cancelInvitation` server action

### SuperAdmin Portal
- [x] List all orgs — `getAllOrganizations` (filterable by plan/status/search)
- [x] Org detail — `getOrganizationDetail` (members, subscription, usage, settings)
- [x] List all users — `getAllUsers` (searchable)
- [x] Grant / revoke SuperAdmin — `grantSuperAdmin` / `revokeSuperAdmin` actions
- [x] Suspend / reactivate org — `suspendOrg` / `reactivateOrg` actions
- [x] Soft-delete org — `softDeleteOrg` action
- [x] Change org plan — `changeOrgPlan` action (updates org + subscription)
- [x] Impersonation — `startImpersonation` sets `luxe-impersonation` cookie; org layout
      reads it to show `ImpersonationBanner`; `exitImpersonation` clears cookie + redirects

### Audit Log
- [x] `src/lib/audit.ts` — `logAction(params)` fire-and-forget helper, 13 typed actions
- [x] Wired into member mutations (role_changed, removed, invite_cancelled)
- [x] Wired into org mutations (settings_updated, deleted)
- [x] Wired into all SuperAdmin mutations (suspended, reactivated, deleted, plan_changed)
- [x] Wired into SA grant/revoke and impersonation lifecycle
- [x] `getAuditLogs` with search + action-type filter; audit-log page updated

### Logo Upload (deferred)
- [ ] Set up Cloudflare R2 bucket (or AWS S3)  — **blocked on credentials**
- [ ] Install `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner`
- [ ] Create `POST /api/upload/presign` — generate pre-signed upload URL
- [ ] Frontend: file input → upload to R2 directly (browser → R2), save URL to org record

---

## Phase 3 — Dashboard UI
**Goal:** Build all dashboard pages with correct role-gating and data display.
**Duration estimate:** 5–8 days

> **Status: ✅ Built.** Org dashboard (home, listings/leads placeholders, members
> with invite + role/remove server actions, settings, billing, analytics, profile)
> and the SuperAdmin portal (overview, organizations list + detail, users, audit
> log, feature-flags & settings placeholders) are live, all role-gated via
> `requireOrgAccess`/`requireSuperAdmin` + `can()`. Reads go through server-side
> data-access layers (`lib/data/dashboard.ts`, `lib/data/platform.ts`); mutations
> are Server Actions. Shared primitives live in `components/dashboard/`.
> **Deferred to their owning phases:** listings/leads CRUD (Phase 4), token-based
> impersonation + audit-log writes + logo upload (Phase 2), Stripe self-serve
> billing (Phase 5), feature-flag + platform-settings backends (later).

### Layout & Shell
- [ ] Create dashboard layout: `src/app/org/[slug]/layout.tsx`
  - Sidebar navigation (collapsible)
  - Header with org switcher (if user belongs to multiple orgs)
  - User avatar menu (profile, settings, logout)
  - Role-aware nav items (hide admin items for MEMBER)
- [ ] Create SuperAdmin layout: `src/app/superadmin/layout.tsx`
  - Distinct branding (no org branding)
  - All-org navigation
  - Impersonation banner component
- [ ] Mobile-responsive sidebar (hamburger menu on small screens)
- [ ] Active nav item highlighting

### SuperAdmin Dashboard Pages
- [ ] `/superadmin` — platform stats: total orgs, users, MRR, new signups (last 30d)
- [ ] `/superadmin/organizations` — table with search, filter by plan/status, pagination
- [ ] `/superadmin/organizations/[orgId]` — org detail: members list, listings count, billing status, "View as Admin" button
- [ ] `/superadmin/users` — all users table with org memberships shown
- [ ] `/superadmin/audit-log` — filterable log table
- [ ] `/superadmin/feature-flags` — toggle features per org or globally (simple JSON-backed)
- [ ] `/superadmin/settings` — platform settings (email sender name, maintenance mode, etc.)

### Org Admin Dashboard Pages
- [ ] `/org/[slug]/dashboard` — stats cards + recent leads + team activity feed
- [ ] `/org/[slug]/members` — member list (avatar, name, role badge, joined date)
  - Invite member button → modal with email + role selector
  - Change role dropdown (ADMIN only)
  - Remove member button with confirmation (ADMIN only)
  - Pending invitations section (resend / cancel)
- [ ] `/org/[slug]/settings` — org profile form (name, logo, color, description)
- [ ] `/org/[slug]/billing` — plan card, usage meters, upgrade/downgrade CTA (Stripe Portal link)
- [ ] `/org/[slug]/analytics` — charts: leads over time, listings by status, agent performance (ADMIN)

### Member Dashboard Pages
- [ ] `/org/[slug]/dashboard` — same route, filtered view (own stats only)
- [ ] Ensure all ADMIN-only controls are hidden/disabled for MEMBER role
- [ ] Member profile page: `/org/[slug]/profile` — update name, avatar, password

### Shared UI Components for Dashboard
- [ ] `StatCard` — icon + number + label + optional delta
- [ ] `DataTable` — sortable, filterable, paginated table
- [ ] `MemberAvatar` — avatar with fallback initials
- [ ] `RoleBadge` — ADMIN / MEMBER / SUPERADMIN pill
- [ ] `StatusBadge` — ACTIVE / TRIAL / SUSPENDED
- [ ] `ConfirmDialog` — reusable confirmation modal
- [ ] `InviteModal` — invite member form in a modal
- [ ] `PlanUsageMeter` — progress bar showing listings used / limit
- [ ] `ImpersonationBanner` — sticky top bar when SuperAdmin is impersonating
- [ ] `EmptyState` — no listings / no leads / no members states

---

## Phase 4 — Core Feature Porting (Properties & Leads) ✅ COMPLETE (functional scope)
**Goal:** Port existing property and lead features into the multi-tenant system.
**Duration estimate:** 4–6 days

> **Status:** Implemented. Property + lead CRUD, the Kanban pipeline, and the
> org white-label public catalog are live and build clean. Deviations from the
> original spec, all driven by the App Router / Server Actions pattern already
> established in Phases 2–3:
> - Property/lead **mutations are Server Actions** (`lib/actions/{properties,leads}.ts`),
>   not REST route files. The one REST route is the **public** lead endpoint
>   (`POST /api/org/[slug]/leads`) — it needs to accept anonymous, IP-rate-limited
>   submissions, which a Server Action can't gate as cleanly.
> - Schema gained `PropertyType` + `description`, a `LeadNote` model (timeline),
>   and `Lead.assignee`/`updatedAt` relations. **A migration must be generated
>   once a DB is provisioned** (`prisma migrate dev`); the client is already
>   generated and RLS updated for `lead_notes`.
> - **Image upload is still URL-based** (ordered image-URL manager) — direct R2
>   uploads remain blocked on credentials (bundled with the logo-upload item).
> - Bulk listing actions deferred (single-row actions cover the workflow).

### Properties (multi-tenant)
- [x] All property queries scoped by `organizationId` (`lib/data/properties.ts`) + RLS backstop
- [x] Prisma-generated types used throughout (no hand-rolled interfaces)
- [x] List — paginated + filtered (search, status) via `listProperties`
- [x] Create — `createProperty` action (ADMIN | MEMBER); plan-limit enforcement wired in Phase 5
- [x] Single listing detail — `getPropertyById` (tenant-scoped)
- [x] Update — `updateProperty` (ADMIN: any | MEMBER: own only)
- [x] Delete — `deleteProperty` (ADMIN only) + quick `setPropertyStatus`
- [ ] Property image upload flow (presigned URL → R2) — **URL-based for now; R2 deferred**
- [x] `/org/[slug]/listings` — management page (grid + table toggle, filters, pagination)
- [x] `/org/[slug]/listings/new` — create form (full PropertyForm)
- [x] `/org/[slug]/listings/[id]/edit` — pre-populated, ownership-gated
- [ ] Bulk actions — deferred (per-row publish/unpublish/delete implemented instead)

### Leads / Inquiries (multi-tenant)
- [x] `POST /api/org/[slug]/leads` — public inquiry → lead (no auth, IP rate-limited)
- [x] List — `listLeads` (ADMIN: all | MEMBER: assigned to them, enforced in data layer)
- [x] Update status + assign — `updateLeadStatus` / `assignLead` (assign is admin-only)
- [x] Lead notification email on new inquiry (to org admins) — best-effort
- [x] `/org/[slug]/leads` — Kanban pipeline board (New → Contacted → Qualified → Closed) + list view
- [x] `/org/[slug]/leads/[id]` — detail with contact, message, note timeline
- [x] Lead assignment UI — assignee dropdown on the detail panel

### Public Listings (org white-label)
- [x] `/org/[slug]/public` — branded catalog (logo + brand color), ACTIVE listings, inquiry form
  - Lives outside the auth-gated `(app)` route group; proxy-exempted
- [x] Inquiry form routes the lead to the correct org via the public API

---

## Phase 5 — Billing & Subscriptions ✅ COMPLETE (functional scope)
**Goal:** Stripe subscriptions gate plan features; SuperAdmin can override.
**Duration estimate:** 3–4 days

> **Status:** Implemented with **graceful degradation** — every Stripe touchpoint
> no-ops with a friendly message when keys are absent, so the app runs fully
> without billing configured. Self-serve checkout/portal are **Server Actions**
> (`lib/actions/billing.ts`) consistent with Phases 2–4; the webhook is the one
> REST endpoint (Stripe calls it). Deviations:
> - "Downgrade to free" on subscription deletion maps to **STARTER** (no free tier exists).
> - Stripe **Products/Prices must be created in the dashboard** and their ids set
>   as `STRIPE_PRICE_STARTER` / `STRIPE_PRICE_GROWTH` (ENTERPRISE is sales-led).
> - `@stripe/stripe-js` (client) not needed — checkout/portal redirect to hosted
>   Stripe URLs, so only the server `stripe` SDK is used.

### Stripe Setup
- [x] Install Stripe server SDK (`stripe`) — graceful when unconfigured
- [x] Env vars documented: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_*`
- [ ] Create Stripe Products + Prices — **manual dashboard step (needs Stripe account)**
- [x] Price IDs read into plan config (`lib/billing/plans.ts`) + reverse lookup for webhooks

### Subscription Lifecycle
- [x] On org creation → create Stripe Customer (best-effort) → trial subscription stored
- [x] Customer Portal — `createPortalSession` action (manage payment, cancel, upgrade)
- [x] `POST /api/webhooks/stripe` — signature-verified; handles:
  - `checkout.session.completed` + `customer.subscription.created/updated` → sync plan/status/period
  - `customer.subscription.deleted` → cancel + downgrade to Starter
  - `invoice.payment_failed` → PAST_DUE
  - `invoice.paid` → ACTIVE
- [x] Plan-limit enforcement (`assertWithinPlanLimit`):
  - Listing cap checked before create; member cap before invite → **HTTP 402**

### Billing UI
- [x] `/org/[slug]/billing` — plan card, usage meters, Change plan / Manage buttons + result banner
- [x] Usage meters: listings + members used / max (from Phase 3, retained)
- [x] Plan comparison modal (Starter → Growth → Enterprise)
- [x] "Change plan" → Stripe Checkout session → redirect
- [x] Customer Portal integration (self-serve cancel/downgrade/update payment)
- [x] SuperAdmin billing override — `changeOrgPlan` (Phase 2, updates org + subscription, no Stripe)

---

## Phase 6 — Production Hardening
**Goal:** The system is secure, observable, resilient, and ready for real customers.
**Duration estimate:** 3–5 days

### Security
- [ ] Add rate limiting to all auth endpoints (10 req/min per IP)
- [ ] Add rate limiting to invitation endpoints (5 invites/hour per org)
- [ ] Add rate limiting to public inquiry form (3 req/min per IP)
- [ ] Content Security Policy headers in `next.config.ts`
- [ ] CORS configuration for API routes
- [ ] Input sanitization on all user-submitted fields (XSS prevention)
- [ ] Audit: ensure every API route has explicit permission check (no route relies solely on middleware)
- [ ] SQL injection audit — Prisma parameterizes queries, but verify raw SQL in migrations

### Observability
- [ ] Install Sentry (`npm install @sentry/nextjs`)
- [ ] Configure Sentry error tracking + performance monitoring
- [ ] Add structured logging (`pino` or `winston`) to API routes
- [ ] Create `/api/health` endpoint for uptime monitoring
- [ ] Set up Vercel Analytics for Core Web Vitals

### Email Infrastructure
- [ ] Build React Email templates for all transactional emails:
  - Welcome / verify email
  - Invitation email
  - Password reset
  - Lead notification (to agent)
  - Trial expiring warning (3 days before)
  - Payment failed warning
  - Plan upgrade confirmation
- [ ] Test all email templates in different email clients

### Database
- [ ] Enable connection pooling (PgBouncer on Neon or Supabase built-in)
- [ ] Add database indexes for all `org_id` + `created_at` query patterns
- [ ] Set up automated daily backups
- [ ] Test RLS policies: write integration tests that verify cross-org data leakage is impossible

### Testing
- [ ] Integration tests for auth flows (register, login, invite accept)
- [ ] Integration tests for RBAC (MEMBER cannot do ADMIN actions, wrong org is rejected)
- [ ] Integration tests for RLS (direct SQL queries cannot access other org's data)
- [ ] Load test the tenant resolver middleware (target: < 10ms overhead)

### DevOps
- [ ] Set up staging environment on Vercel with separate DB
- [ ] Configure preview deployments for PRs (with separate ephemeral DB or seed data)
- [ ] Environment-specific feature flags (some features staging-only)
- [ ] Automate database migrations in CI/CD (`prisma migrate deploy`)
- [ ] Document runbook: how to onboard a new org manually, how to suspend an org, how to restore data

---

## Quick Reference — Critical Path

If you had to build the **minimum viable SaaS** (just enough to charge customers):

```
Phase 0 ──► Phase 1 ──► (Phase 2 — org API only) ──► (Phase 3 — dashboards) ──► Phase 5
(infra)     (auth)       (members management)          (UI for above)            (billing)
```

Skip Phase 4 lead/property porting initially — the existing public-facing pages
can still work by hard-coding a single org, then port to multi-tenant in Phase 4
once paying customers are onboard.

---

## Dependency Map

```
Phase 0 (infra)
  └─► Phase 1 (auth)
        └─► Phase 2 (org management)
              ├─► Phase 3 (dashboard UI)  ─── can run in parallel with Phase 4
              └─► Phase 4 (feature porting)
                    └─► Phase 5 (billing)
                          └─► Phase 6 (hardening)
```

Phases 3 and 4 are largely independent once Phase 2 is done.
Phase 6 can be partially done (Sentry, health check) as early as Phase 1.

---

## Estimated Total Timeline

| Phase | Work Days | Cumulative |
|---|---|---|
| 0 — Foundation | 2 | 2 |
| 1 — Authentication | 5 | 7 |
| 2 — Org Management | 5 | 12 |
| 3 — Dashboards | 7 | 19 |
| 4 — Feature Porting | 5 | 24 |
| 5 — Billing | 4 | 28 |
| 6 — Hardening | 5 | 33 |

**Total: ~33 working days (6–7 weeks solo, 3–4 weeks with 2 engineers)**
