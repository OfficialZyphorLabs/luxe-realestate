# LuxeReal — Roles, Permissions & Application Flows

A field guide to **who does what** in LuxeReal, the exact permission each role
holds, wireframe skeletons for every role, and an end-to-end map of the whole
application. This mirrors the real code: the permission matrix comes from
[`src/lib/permissions.ts`](src/lib/permissions.ts), the guards from
[`src/lib/auth/session.ts`](src/lib/auth/session.ts), and the nav from
[`src/lib/dashboard-nav.ts`](src/lib/dashboard-nav.ts).

---

## 1. The three roles at a glance

LuxeReal is **multi-tenant**: many independent real-estate agencies
("organizations") share one platform, fully isolated from one another. There are
three actors:

| Role | Scope | Lives where | Think of them as… |
|------|-------|-------------|-------------------|
| **SuperAdmin** | The whole **platform** (all orgs) | `isSuperAdmin = true` on the `User` | The LuxeReal company operator / support team |
| **Org Admin** | **One** organization | A `Membership` with `role = ADMIN` | The agency owner / broker-in-charge |
| **Member** | **One** organization (limited) | A `Membership` with `role = MEMBER` | A real-estate agent working listings & leads |

> A single person can be a Member of one org and an Admin of another — role is
> per-membership, not per-user. `isSuperAdmin` is the one exception: it is a
> platform-wide flag that bypasses every org check.

---

## 2. Who is responsible for what

```
                         ┌───────────────────────────────┐
                         │          SUPERADMIN           │
                         │  (LuxeReal platform operator) │
                         │                               │
                         │ • Onboard / suspend orgs      │
                         │ • Manage all users            │
                         │ • Impersonate an org (support)│
                         │ • Feature flags & audit log   │
                         │ • Platform-wide settings      │
                         └───────────────┬───────────────┘
                                         │ oversees every org
              ┌──────────────────────────┼──────────────────────────┐
              ▼                          ▼                          ▼
    ┌───────────────────┐      ┌───────────────────┐      ┌───────────────────┐
    │    ORG ADMIN      │      │    ORG ADMIN      │      │    ORG ADMIN      │
    │  (Acme Realty)    │      │  (Skyline Props)  │      │  (Coastal Estates)│
    │                   │      │                   │      │                   │
    │ • Invite/remove   │      │        …          │      │        …          │
    │   members         │      └───────────────────┘      └───────────────────┘
    │ • Manage billing  │
    │ • Edit ANY listing│
    │ • See ALL leads   │
    │ • Org settings    │
    └─────────┬─────────┘
              │ leads a team of
     ┌────────┼────────┐
     ▼        ▼        ▼
  ┌──────┐ ┌──────┐ ┌──────┐
  │MEMBER│ │MEMBER│ │MEMBER│   Agents:
  │      │ │      │ │      │   • Create listings
  └──────┘ └──────┘ └──────┘   • Work THEIR leads
                               • View team roster (read-only)
```

**One-line summary of responsibility:**

- **SuperAdmin** keeps the *platform* healthy and its *tenants* in good standing.
- **Org Admin** runs *their agency* — people, money, and the full book of business.
- **Member** does the *day-to-day agent work* — listings and their own leads.

---

## 3. Permission matrix (source of truth)

Straight from `ROLE_PERMISSIONS` in `src/lib/permissions.ts`. ✅ = granted,
— = denied. **SuperAdmin bypasses this table entirely** and is allowed
everything, in every org.

| Permission            | What it gates                              | Org Admin | Member |
|-----------------------|--------------------------------------------|:---------:|:------:|
| `org:read`            | View the org dashboard & data              | ✅ | ✅ |
| `org:write`           | Edit org name / branding / settings        | ✅ | — |
| `org:delete`          | Delete the organization                    | ✅ | — |
| `members:read`        | View the member roster                     | ✅ | ✅ |
| `members:invite`      | Send invitations                           | ✅ | — |
| `members:remove`      | Remove a member                            | ✅ | — |
| `members:promote`     | Change a member's role                     | ✅ | — |
| `properties:create`   | Create a listing                           | ✅ | ✅ |
| `properties:edit-any` | Edit **any** listing (not just own)        | ✅ | — |
| `properties:delete`   | Delete a listing                           | ✅ | — |
| `leads:view-all`      | See leads in the pipeline                  | ✅ | ✅* |
| `leads:assign`        | Assign leads to teammates                  | ✅ | — |
| `billing:manage`      | Manage subscription / payment              | ✅ | — |
| `platform:superadmin` | Access the SuperAdmin console              | — | — |

\* **Member scoping:** Members hold `leads:view-all` and `properties:create`, but
they may only *act on their own* leads/listings. That finer boundary is enforced
at the **data layer** (query filters + Postgres Row-Level Security), not by the
permission table — so a Member can open the pipeline but can't edit a colleague's
listing or reassign someone else's lead.

**Defense in depth** — every sensitive action is checked three times:
1. `proxy.ts` — coarse gate: *are you logged in and a member of this org?*
2. `can()` / `require*()` — per-action permission check in server code.
3. Postgres **RLS** — last line of defense if an ORM query ever leaks scope.

---

## 4. What each role can do (concretely)

### 4.1 SuperAdmin — `/superadmin/*`
- **Dashboard** (`/superadmin`) — platform KPIs: total orgs, users, MRR-style stats.
- **Organizations** (`/superadmin/organizations`) — list every org; open one
  (`/superadmin/organizations/[orgId]`) to inspect it, change status
  (ACTIVE / SUSPENDED / DELETED), and **impersonate** it for support.
- **Users** (`/superadmin/users`) — search/manage every user across all tenants.
- **Feature flags** (`/superadmin/feature-flags`) — toggle platform capabilities.
- **Audit log** (`/superadmin/audit-log`) — immutable record of platform/org events.
- **Settings** (`/superadmin/settings`) — platform-wide configuration.
- **Impersonation** — enter an org as a read/act proxy; a banner shows it's active,
  and it's recorded in the audit log. (See `src/lib/impersonation.ts`.)

### 4.2 Org Admin — `/org/[slug]/*`
- **Dashboard** — org KPIs, onboarding checklist, recent activity.
- **Listings** — create, **edit any**, publish/unpublish, mark sold/withdrawn, delete.
- **Leads** — full pipeline (Kanban), **assign** leads to any member, add notes.
- **Members** — invite, promote/demote, remove; view the roster.
- **Analytics** — org-wide performance.
- **Org Settings** *(admin-only nav)* — name, branding/primary color, public-listings toggle, custom domain.
- **Billing** *(admin-only nav)* — plan, subscription status, Stripe portal.

### 4.3 Member (Agent) — `/org/[slug]/*`
- **Dashboard** — their view of org activity.
- **Listings** — create new listings; edit/manage **their own** listings.
- **Leads** — see the pipeline; work the leads **assigned to them**; add notes.
- **Members** — view the roster (read-only — no invite/remove/promote).
- **Analytics** — view.
- ❌ No **Org Settings**, no **Billing**, no **SuperAdmin** console (hidden from nav *and* blocked server-side).

---

## 5. Wireframe skeletons

### 5.1 SuperAdmin console

```
┌──────────────────────────────────────────────────────────────────┐
│ LuxeReal · SUPERADMIN                               [ Alexandra ▾] │
├───────────────┬────────────────────────────────────────────────────┤
│  ▸ Dashboard  │   Platform Overview                                │
│  ▸ Orgs       │   ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐      │
│  ▸ Users      │   │ Orgs 5 │ │Users 22│ │Active 4│ │Susp'd 1│      │
│  ▸ Flags      │   └────────┘ └────────┘ └────────┘ └────────┘      │
│  ▸ Audit log  │                                                    │
│  ▸ Settings   │   Organizations                       [ Search… ] │
│               │   ┌──────────────────────────────────────────────┐ │
│               │   │ Acme Realty     STARTER   ACTIVE    [Manage ▸]│ │
│               │   │ Skyline Props   GROWTH    ACTIVE    [Manage ▸]│ │
│               │   │ Sunset Realty   STARTER   SUSPENDED [Manage ▸]│ │
│               │   └──────────────────────────────────────────────┘ │
└───────────────┴────────────────────────────────────────────────────┘
        │
        └── click "Manage" → /superadmin/organizations/[orgId]
            ┌──────────────────────────────────────────────────────┐
            │ Skyline Properties                                    │
            │ Plan: GROWTH   Status: [ ACTIVE ▾ ]   Members: 5      │
            │ [ Suspend org ]  [ Impersonate → enter dashboard ]    │
            │ Recent audit events · Subscription · Members preview  │
            └──────────────────────────────────────────────────────┘
```

### 5.2 Org Admin dashboard

```
┌──────────────────────────────────────────────────────────────────┐
│ ⌂ LuxeReal                                          [ Marcus ▾ ]  │
│  Acme Realty · STARTER                                             │
├───────────────┬────────────────────────────────────────────────────┤
│  ▸ Dashboard  │  Welcome back, Marcus                              │
│  ▸ Listings   │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  ▸ Leads      │  │Listings │ │ Active  │ │  Leads  │ │  Team   │   │
│  ▸ Members    │  │   5     │ │   3     │ │   5     │ │   4     │   │
│  ▸ Analytics  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘   │
│  ───────────  │                                                    │
│  ▸ Settings ⚙ │  Onboarding checklist  ▸ Add listing ▸ Invite team│
│  ▸ Billing 💳 │  Recent leads · Recent listings · Activity feed    │
│               │                                                    │
│  ‹ collapse   │                                                    │
└───────────────┴────────────────────────────────────────────────────┘
   (Settings + Billing appear ONLY for admins — adminOnly nav items)
```

### 5.3 Member (Agent) dashboard

```
┌──────────────────────────────────────────────────────────────────┐
│ ⌂ LuxeReal                                          [ Emily ▾ ]   │
│  Acme Realty · STARTER                                             │
├───────────────┬────────────────────────────────────────────────────┤
│  ▸ Dashboard  │  Welcome back, Emily                               │
│  ▸ Listings   │  ┌─────────┐ ┌─────────┐                           │
│  ▸ Leads      │  │My leads │ │My listgs│    (scoped to Emily)      │
│  ▸ Members    │  │   2     │ │   2     │                           │
│  ▸ Analytics  │  └─────────┘ └─────────┘                           │
│               │                                                    │
│  (no Settings │  My assigned leads · My listings · [+ New listing] │
│   no Billing) │                                                    │
└───────────────┴────────────────────────────────────────────────────┘
   Members never see Settings / Billing / SuperAdmin — hidden + server-blocked.
```

### 5.4 Leads pipeline (Admin sees all · Member sees own)

```
  NEW            CONTACTED       QUALIFIED      CLOSED WON     CLOSED LOST
┌──────────┐   ┌──────────┐    ┌──────────┐   ┌──────────┐   ┌──────────┐
│ Rachel K │   │ Tom B.   │    │ Priya N. │   │ George H │   │ Bill T.  │
│ Craftsman│   │ Loft     │    │ Cottage  │   │ Estate   │   │ —        │
│ ⌂ unassg │   │ ◉ Sofia  │    │ ◉ Emily  │   │ ◉ Marcus │   │ ◉ Marco  │
└──────────┘   └──────────┘    └──────────┘   └──────────┘   └──────────┘
   drag → move status   ·   ◉ assignee   ·   click card → lead detail + notes
   Admin: assign to anyone · Member: only cards assigned to them are actionable
```

---

## 6. End-to-end application flow

### 6.1 Lifecycle of an organization

```
SuperAdmin/self-serve         Org Admin                     Member                 Public
─────────────────────         ──────────                    ──────                 ──────
 register / create org
        │
        ▼
   Org created (STARTER)
        │
        ├──────────────► Admin logs in → Dashboard
        │                     │
        │                     ├─ Invite members ──────────► Member accepts invite
        │                     │   (email + token)              (/invite/accept)
        │                     │                                     │
        │                     ├─ Create/publish listings ◄──────────┤ creates own listings
        │                     │        │                            │
        │                     │        ▼                            │
        │                     │   Listing ACTIVE ──────────────────────────► visible on
        │                     │                                     │        public storefront
        │                     │                                     │        /org/[slug]/public
        │                     │                                     │              │
        │                     │                                     │              ▼
        │                     │                              Lead created ◄── visitor submits
        │                     │                              (status NEW)      enquiry form
        │                     │        │                            │
        │                     ├─ Assign lead ─────────────► Member works lead
        │                     │                              (notes, status→)
        │                     │                                     │
        │                     ▼                                     ▼
        │              CLOSED_WON / CLOSED_LOST  ◄──────── pipeline progresses
        │
        ├─ Admin manages Billing (upgrade STARTER→GROWTH→ENTERPRISE via Stripe)
        │
        ▼
 SuperAdmin can SUSPEND the org at any time
        │  (SUSPENDED → public storefront + access restricted)
        ▼
 SuperAdmin can DELETE (soft) the org
```

### 6.2 Request authorization path (every protected request)

```
Browser ──► proxy.ts ───────────────► Server Component / Route Handler ──► Prisma ──► Postgres
             │  (edge gate)                 │  require*() + can()             │        │
             │                              │                                 │        ▼
             ▼                              ▼                                 ▼    RLS policy
   Logged in? Member of        Has the specific permission        Query scoped   filters rows
   this org? else redirect     for THIS action? else 403/redirect  to org / user  by org_id
```

### 6.3 The two "surfaces" of the app

```
 ┌─────────────────────────── PUBLIC (no login) ───────────────────────────┐
 │  /                    marketing home                                     │
 │  /properties          global catalog + /properties/[slug] detail          │
 │  /pricing /about /agents /contact /terms /privacy /fair-housing          │
 │  /org/[slug]/public   an agency's storefront + /[listingSlug] detail      │
 │  /login /register /forgot-password /reset-password /invite/accept        │
 └───────────────────────────────────────┬──────────────────────────────────┘
                                          │ authenticate
                     ┌────────────────────┴────────────────────┐
                     ▼                                          ▼
 ┌──────────── ORG WORKSPACE (members) ──────────┐  ┌──── PLATFORM (superadmins) ────┐
 │  /org/[slug]/dashboard                          │  │  /superadmin                   │
 │  /org/[slug]/listings  (+ /new, /[id]/edit)     │  │  /superadmin/organizations     │
 │  /org/[slug]/leads     (+ /[id])                │  │  /superadmin/users             │
 │  /org/[slug]/members                            │  │  /superadmin/feature-flags     │
 │  /org/[slug]/analytics                          │  │  /superadmin/audit-log         │
 │  /org/[slug]/settings   (admin only)            │  │  /superadmin/settings          │
 │  /org/[slug]/billing    (admin only)            │  └────────────────────────────────┘
 │  /org/[slug]/profile                            │
 └─────────────────────────────────────────────────┘
```

---

## 7. How to test each role (with the seeded data)

Log in at `/login`. All passwords are shared per role.

| To test as… | Use | Then go to |
|-------------|-----|------------|
| **SuperAdmin** | `admin@luxereal.com` / `SuperAdmin@123!` | `/superadmin` — manage orgs, impersonate, view audit log |
| **Org Admin** (active org) | `admin@skylineproperties.com` / `OrgAdmin@123!` | `/org/skyline-properties/dashboard` — full admin: invite, billing, edit any listing |
| **Member** (agent) | `agent@acmerealty.com` / `Member@123!` | `/org/acme-realty/dashboard` — verify Settings/Billing are hidden; only own leads actionable |
| **Suspended org** | `admin@sunsetrealty.com` / `OrgAdmin@123!` | `/org/sunset-realty/...` — verify suspended-state behavior |
| **Public storefront** | *(no login)* | `/org/skyline-properties/public` — browse active listings, submit an enquiry (creates a NEW lead) |

**Suggested manual test pass:**
1. **SuperAdmin** → suspend/reactivate an org; impersonate one; confirm the audit log records it.
2. **Org Admin** → invite a member, publish a DRAFT listing, assign a NEW lead, move it across the Kanban, open Billing.
3. **Member** → confirm Settings/Billing/SuperAdmin are absent; create a listing; work an assigned lead; confirm you can't touch a teammate's lead.
4. **Public** → open a storefront, submit an enquiry, then see it appear as a NEW lead in that org's pipeline.

---

*This document reflects the code as of the current commit. If the permission
matrix in `src/lib/permissions.ts` changes, update §3 to match.*
