# LuxeReal — Product Roadmap & Gap Analysis

> What we have, what's missing, and what to build (in what order) to turn a
> working codebase into a product agencies will pay for. Business rationale for
> each item lives here; the money/market view is in [`BUSINESS_PLAN.md`](./BUSINESS_PLAN.md).

---

## 1. Honest current-state audit

### ✅ What's built and solid (the "hard parts" are done)
- **Multi-tenant SaaS core** — orgs, members, roles (ADMIN/MEMBER), invitations,
  super-admin portal, impersonation, audit log, Postgres row-level security.
- **Auth** — email/password + Google, hashed reset/invite tokens, rate limiting.
- **Properties** — CRUD, statuses, ordered images (by URL), listings manager
  (grid/table, filters, pagination), ownership rules, plan-limit enforcement.
- **Leads** — public inquiry capture, Kanban pipeline, assignment, note timeline,
  role-scoped visibility, admin email notifications.
- **White-label public catalog** — per-org branded listings page + inquiry form.
- **Billing** — Stripe subscriptions, checkout, customer portal, webhooks, plan
  limits, super-admin plan override.
- **Design system** — premium, consistent, responsive, dark-mode aware.

### 🟥 What's missing to be genuinely sellable
The product works but is **not yet a full replacement** for what agencies use.
The gaps below are what stand between "cool demo" and "take my money."

---

## 2. Gap analysis (grouped by theme)

### A. Media & presentation — _table stakes for real estate_
- **Real image/video uploads** (currently paste-a-URL only). Agents will not
  paste URLs — they upload from a phone. **Blocker #1.** Needs R2/S3 + upload UI.
- **Photo galleries, floor plans, virtual tours / video, 3D (Matterport embed).**
- **Public property detail page** (today the public catalog has no per-listing page).
- **SEO for listings** — per-listing metadata, `schema.org/RealEstateListing`,
  sitemaps, Open Graph images. Organic search is a top lead source in RE.

### B. Discovery & lead generation — _this is why they buy_
- **Public search & filters** (price, beds, type, location) on the catalog.
- **Map search / geolocation** (geocode addresses, map view, "draw a search").
- **IDX/MLS integration** — the single biggest competitive gap. Syndicate/import
  MLS listings so the site shows *the whole market*, not just their 20 listings.
- **Saved searches + buyer accounts + email alerts** (recurring engagement).
- **Listing syndication out** to Zillow/Realtor/portals.

### C. CRM depth — _this is why they stay (retention)_
- **Follow-up automation** — tasks, reminders, due dates on leads.
- **Email + SMS sequences / drip campaigns** (Twilio/Resend), templates.
- **Two-way email + calendar sync** (Gmail/Outlook), viewing scheduler.
- **Lead scoring & source tracking** (which channel produced the lead).
- **Activity feed & @mentions** for team collaboration.
- **Deal/transaction pipeline** (offer → escrow → closed) + commission tracking.

### D. AI — _the modern buying trigger & differentiator_
- **AI listing description writer** (from specs → polished copy; huge time-saver).
- **AI lead qualification chatbot** on the public site (24/7 capture).
- **Smart lead routing & next-best-action suggestions.**
- **AI image enhancement / virtual staging** (add-on revenue).
- **AVM / price estimate** widget for seller lead capture.

### E. Brand & white-label — _the premium promise_
- **Custom domains per org** (schema field exists; wire DNS + SSL, e.g. via Vercel).
- **Multiple public-site themes/templates** (not just one layout).
- **Configurable pages** (About, Team/Agents, Testimonials, Sold gallery).
- **Per-agent public profiles & vanity pages.**

### F. Trust, ops & scale — _required to sell to real businesses_
- **Onboarding wizard + demo data + import** (CSV/MLS) — first-run "wow."
- **Notifications center** (in-app + email digests).
- **Observability** — Sentry, structured logging, `/api/health`, uptime.
- **Data export / GDPR / consent, Fair Housing compliance** language.
- **Testing** — RBAC + RLS integration tests (cross-tenant leak prevention).
- **Migrations discipline** — move from `db push` to versioned migrations for prod.
- **Transactional email templates** finished (React Email), deliverability (SPF/DKIM).

---

## 3. Prioritized roadmap (impact × effort)

Scoring: **Impact** = does it win/keep customers? **Effort** = build cost.
Do high-impact / low-effort first.

| # | Feature | Impact | Effort | Why it sells |
|---|---|---|---|---|
| 1 | **Image/video uploads (R2/S3)** | 🔴 High | 🟡 Med | Non-negotiable; agents upload from phone |
| 2 | **Public property detail page + SEO** | 🔴 High | 🟢 Low | Turns catalog into a real lead engine |
| 3 | **Public search & filters** | 🔴 High | 🟢 Low | Buyers self-serve → more inquiries |
| 4 | **Custom domains** | 🔴 High | 🟡 Med | The core white-label promise + upsell |
| 5 | **AI listing description writer** | 🔴 High | 🟢 Low | Demo magic; time-saver; differentiator |
| 6 | **Onboarding wizard + demo data + CSV import** | 🔴 High | 🟡 Med | Activation & first-run "wow"; cuts churn |
| 7 | **CRM follow-ups (tasks/reminders)** | 🟠 Med-Hi | 🟡 Med | Daily-use habit → retention |
| 8 | **Map search / geolocation** | 🟠 Med-Hi | 🟡 Med | Expected UX in RE search |
| 9 | **Email/SMS sequences + templates** | 🟠 Med-Hi | 🔴 High | Lead nurture → closes → stickiness |
| 10 | **Viewing scheduler + calendar sync** | 🟠 Med | 🟡 Med | Removes back-and-forth; premium feel |
| 11 | **Analytics/reporting (funnel, agent perf.)** | 🟠 Med | 🟡 Med | Broker's ROI proof → renewal |
| 12 | **IDX/MLS integration** | 🔴 High | 🔴 High | Full-replacement; big moat — but hard/regional |
| 13 | **Observability + tests + prod migrations** | 🟠 Med | 🟡 Med | Reliability = trust = enterprise deals |
| 14 | **AI chatbot lead capture** | 🟠 Med | 🔴 High | 24/7 capture; modern differentiator |
| 15 | **Site themes/templates + editable pages** | 🟠 Med | 🔴 High | Broadens market beyond one look |

---

## 4. Recommended release plan

### 🎯 Milestone 1 — "Sellable MVP" ✅ SHIPPED (close the demo-killers)
Goal: an agency can sign up and run their entire public presence + lead flow.
- [x] Image uploads (#1) — S3-compatible (R2/S3), gated on credentials; URL fallback
- [x] Public property detail page + listing SEO (#2) — metadata, JSON-LD, sitemap, robots
- [x] Public search & filters (#3) — price/beds/type/city on the catalog
- [x] AI listing description writer (#5) — Anthropic, gated on `ANTHROPIC_API_KEY`
- [x] Onboarding checklist + demo data (#6) — "load sample listings" for instant activation
- [x] Transactional emails wired (invite/reset/welcome/lead) — deliverability needs a verified domain

**Outcome:** demoable, self-serve, "wow" first run → ready to charge design partners.

> **Verified by `next build` only** (no live DB/keys). Two gated features
> (uploads, AI) activate when their env vars are set; everything else runs today.
> **Video** upload deferred (images only). **CSV import** deferred to Milestone 2.

### 🚀 Milestone 2 — "Retention & Brand" (make them stay & pay more)
- Custom domains (#4)
- CRM follow-ups: tasks/reminders (#7)
- Map search (#8)
- Analytics/reporting (#11)
- Viewing scheduler + calendar sync (#10)

**Outcome:** daily-use habit + upsell lever (custom domain, higher tiers).

### 🌐 Milestone 3 — "Full replacement & scale"
- Email/SMS sequences (#9)
- IDX/MLS integration for the beachhead market (#12)
- Observability, tests, versioned migrations (#13)
- AI chatbot (#14), themes/templates (#15)

**Outcome:** replaces the whole stack → move upmarket, Enterprise deals.

> Milestone 1 items map cleanly onto continuing the existing phase structure
> (this repo is at end of Phase 5). Suggest **Phase 6 = Sellable MVP** rather
> than the current "hardening-only" Phase 6 — fold hardening into Milestone 3.

---

## 5. "Sellable MVP" definition of done (checklist)

- [x] Agents upload photos from any device (images; **needs R2/S3 keys** to activate — URL fallback otherwise). *Video deferred.*
- [x] Every listing has a public, shareable, SEO-optimized detail page (metadata + JSON-LD + sitemap)
- [x] Buyers can search/filter the public catalog
- [x] One-click AI-generated listing descriptions (**needs `ANTHROPIC_API_KEY`** to activate)
- [x] New agency reaches a branded, populated site in minutes (onboarding checklist + "load sample listings")
- [~] Transactional emails wired for all flows — **reliable delivery needs a verified domain** (`RESEND_API_KEY` + DNS)
- [x] Leads never leak: capture → pipeline → assigned → note timeline. *(Follow-up reminders = Milestone 2.)*
- [~] Billing, limits, trial→paid work in code — **verified by build only**; needs live DB + Stripe keys for a real run
- [~] Reliability: `/api/health` + error/404 boundaries shipped. *(Sentry + backups + tests = Milestone 3.)*

**Status:** MVP feature-complete in code and building clean. Remaining boxes
(`[~]`) are **operational** — they need credentials/infra you provision, not
more code. See `## What I need from you` in the chat summary / the env block below.

---

## 6. Deferred / explicitly out-of-scope (for now)
- Native mobile apps (PWA first; the web is responsive already)
- e-Signature / full transaction management (partner or integrate later)
- Multi-language / i18n (until we expand beyond English markets)
- Marketplace / lead-selling business (a later monetization layer)

---

_Reprioritize after each customer-interview batch — let real buyers reorder this._
