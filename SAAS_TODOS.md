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

## Phase 1 — Authentication System
**Goal:** Users can register, log in, accept invites, and sessions carry org membership claims.
**Duration estimate:** 3–5 days

### NextAuth Configuration
- [ ] Create `src/app/api/auth/[...nextauth]/route.ts`
- [ ] Configure Credentials provider (email + password)
- [ ] Configure Google OAuth provider
- [ ] Build custom JWT callback — embed `isSuperAdmin` and `memberships[]` into token
- [ ] Build custom session callback — expose enriched user from JWT
- [ ] Configure Prisma adapter for NextAuth (account, session, verification token tables)

### Registration
- [ ] Create registration page: `/register`
  - Fields: Full Name, Email, Password, Organization Name, Organization Slug (auto-derived)
  - Real-time slug availability check (debounced API call)
  - Password strength indicator
- [ ] Create `POST /api/auth/register` route
  - Validate inputs with Zod
  - Check email + slug uniqueness
  - Hash password with bcryptjs
  - DB transaction: create User → Organization → Membership (ADMIN) → OrgSettings → Subscription (trial)
  - Send welcome email via Resend
  - Return session

### Login
- [ ] Create login page: `/login`
- [ ] Email/password form with error handling
- [ ] "Continue with Google" button
- [ ] Forgot password link (Phase 1 stub — full flow in Phase 2)
- [ ] Redirect to `/org/[slug]/dashboard` after login

### Invitation System
- [ ] Create `POST /api/org/[slug]/invite` — generate invitation token, store in DB, send email
- [ ] Create invitation email template (React Email)
- [ ] Create `/invite/accept?token=...` page
  - Validate token (exists, not expired, not already accepted)
  - If user exists → create membership, mark accepted, redirect to dashboard
  - If new user → show password-set form, create user + membership, redirect to dashboard
- [ ] Token expiry: 48 hours
- [ ] Re-send invite endpoint

### Password Reset (complete flow)
- [ ] Create `/forgot-password` page
- [ ] Create `POST /api/auth/forgot-password` — generate reset token, send email
- [ ] Create `/reset-password?token=...` page
- [ ] Create `POST /api/auth/reset-password` — validate token, update password, invalidate token

### Middleware (Tenant Resolution)
- [ ] Create `middleware.ts` at project root
  - Protect `/org/[slug]/*` — require authenticated session
  - Verify user is a member of the org from the slug
  - Protect `/superadmin/*` — require `isSuperAdmin === true`
  - Set `x-org-id` header for downstream route handlers
  - Redirect unauthenticated users to `/login?callbackUrl=...`
- [ ] Create `src/lib/auth.ts` — `getServerSession` wrapper with type-safety
- [ ] Create `src/lib/permissions.ts` — `can()` helper (see `SAAS_ARCHITECTURE.md §5`)

---

## Phase 2 — Organization & Member Management
**Goal:** Org Admins can manage their team; SuperAdmin can manage all orgs.
**Duration estimate:** 4–6 days

### Organization API Routes
- [ ] `GET /api/org/[slug]` — org details (members see public fields)
- [ ] `PATCH /api/org/[slug]` — update org (ADMIN only): name, logo, settings
- [ ] `DELETE /api/org/[slug]` — soft-delete org (ADMIN only, with confirmation)

### Members API
- [ ] `GET /api/org/[slug]/members` — list all members with roles
- [ ] `POST /api/org/[slug]/members/invite` — send invite email
- [ ] `PATCH /api/org/[slug]/members/[userId]` — update role (ADMIN → MEMBER or vice versa)
- [ ] `DELETE /api/org/[slug]/members/[userId]` — remove member from org

### Org Settings API
- [ ] `GET /api/org/[slug]/settings` — org settings
- [ ] `PATCH /api/org/[slug]/settings` — update settings (ADMIN only)
  - Org name, description, logo upload
  - Primary color (for white-labeling)
  - Allow/block public listing indexing

### SuperAdmin API
- [ ] `GET /api/superadmin/organizations` — list all orgs (paginated, filterable)
- [ ] `POST /api/superadmin/organizations` — create org manually (bypass normal registration)
- [ ] `PATCH /api/superadmin/organizations/[orgId]` — update any org, change plan, suspend
- [ ] `DELETE /api/superadmin/organizations/[orgId]` — hard delete (with audit log)
- [ ] `GET /api/superadmin/users` — list all users across all orgs
- [ ] `PATCH /api/superadmin/users/[userId]` — update user, assign/remove isSuperAdmin
- [ ] `POST /api/superadmin/impersonate` — create impersonation token, set cookie
- [ ] `DELETE /api/superadmin/impersonate` — clear impersonation, return to SuperAdmin

### Audit Log
- [ ] Create `src/lib/audit.ts` — `logAction(actor, action, target, metadata)` helper
- [ ] Wire into every mutation API route (member.invited, member.removed, org.updated, etc.)
- [ ] `GET /api/superadmin/audit-log` — paginated log with filters

### Logo Upload
- [ ] Set up Cloudflare R2 bucket (or AWS S3)
- [ ] Install `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner`
- [ ] Create `POST /api/upload/presign` — generate pre-signed upload URL
- [ ] Frontend: file input → upload to R2 directly (browser → R2), save URL to org record

---

## Phase 3 — Dashboard UI
**Goal:** Build all dashboard pages with correct role-gating and data display.
**Duration estimate:** 5–8 days

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

## Phase 4 — Core Feature Porting (Properties & Leads)
**Goal:** Port existing property and lead features into the multi-tenant system.
**Duration estimate:** 4–6 days

### Properties (multi-tenant)
- [ ] Add `organizationId` to all property DB queries
- [ ] Port existing property types/interfaces to use Prisma-generated types
- [ ] `GET /api/org/[slug]/listings` — paginated, filtered (status, beds, price range)
- [ ] `POST /api/org/[slug]/listings` — create (ADMIN | MEMBER), enforce plan listing limits
- [ ] `GET /api/org/[slug]/listings/[id]` — single listing detail
- [ ] `PATCH /api/org/[slug]/listings/[id]` — update (ADMIN: any | MEMBER: own only)
- [ ] `DELETE /api/org/[slug]/listings/[id]` — delete (ADMIN only)
- [ ] Property image upload flow (presigned URL → R2 → save array of URLs)
- [ ] `/org/[slug]/listings` — listings management page (table + grid toggle)
- [ ] `/org/[slug]/listings/new` — create listing form (full property form)
- [ ] `/org/[slug]/listings/[id]/edit` — edit form pre-populated
- [ ] Bulk actions: publish/unpublish/delete selected (ADMIN only)

### Leads / Inquiries (multi-tenant)
- [ ] `POST /api/org/[slug]/leads` — create lead from public inquiry form (no auth required)
- [ ] `GET /api/org/[slug]/leads` — list (ADMIN: all | MEMBER: assigned to them)
- [ ] `PATCH /api/org/[slug]/leads/[id]` — update status, assign to member (ADMIN only)
- [ ] Lead notification email on new inquiry (to ADMIN + assigned agent)
- [ ] `/org/[slug]/leads` — lead pipeline board (Kanban: NEW → CONTACTED → QUALIFIED → CLOSED)
- [ ] `/org/[slug]/leads/[id]` — lead detail with activity timeline, notes, contact info
- [ ] Lead assignment UI — dropdown to assign to any active member

### Public Listings (org white-label)
- [ ] `/org/[slug]/public` — public-facing listing page for the org (their branded catalog)
  - Shows all ACTIVE listings for that org
  - Inquiry form that creates a lead in that org
  - Uses org's logo and primary color
- [ ] Update public Contact form to route inquiry to correct org

---

## Phase 5 — Billing & Subscriptions
**Goal:** Stripe subscriptions gate plan features; SuperAdmin can override.
**Duration estimate:** 3–4 days

### Stripe Setup
- [ ] Install Stripe SDK (`npm install stripe @stripe/stripe-js`)
- [ ] Add env vars: `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`
- [ ] Create Stripe products + prices for Starter / Growth / Enterprise plans
- [ ] Add price IDs to plan config constants

### Subscription Lifecycle
- [ ] On org creation → create Stripe Customer → create trial subscription → store in DB
- [ ] `POST /api/org/[slug]/billing/portal` — create Stripe Customer Portal session (manage payment, cancel, upgrade)
- [ ] `POST /api/webhooks/stripe` — handle Stripe webhooks:
  - `customer.subscription.updated` → update plan + status in DB
  - `customer.subscription.deleted` → downgrade to free / suspend
  - `invoice.payment_failed` → email warning, grace period
  - `invoice.paid` → confirm active
- [ ] Plan limit enforcement middleware:
  - Check `org.plan.maxListings` before creating a listing
  - Check `org.plan.maxMembers` before sending invite
  - Return `402 Payment Required` with upgrade prompt if limit hit

### Billing UI
- [ ] `/org/[slug]/billing` — current plan card, usage meters, "Upgrade" / "Manage" button
- [ ] Usage meters: listings used / max, members used / max
- [ ] Plan comparison modal (Starter → Growth → Enterprise)
- [ ] "Upgrade" CTA → create Stripe Checkout session → redirect to Stripe
- [ ] Stripe Customer Portal integration (self-serve cancel/downgrade/update payment)
- [ ] SuperAdmin billing override: `/superadmin/organizations/[id]` → change plan without Stripe

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
