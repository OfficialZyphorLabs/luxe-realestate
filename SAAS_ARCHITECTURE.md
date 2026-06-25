# LuxeReal SaaS — Architecture & Implementation Blueprint

> **Purpose:** Complete reference for transforming LuxeReal from a single-tenant app into a
> multi-organization SaaS platform where each real estate agency/brokerage operates in full
> isolation, managed by a single SuperAdmin and with flexible org-level admin delegation.

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Multi-Tenancy Strategy](#2-multi-tenancy-strategy)
3. [Database Design](#3-database-design)
4. [Authentication System](#4-authentication-system)
5. [Authorization & RBAC](#5-authorization--rbac)
6. [Role Hierarchy & Flows](#6-role-hierarchy--flows)
7. [Dashboard Architecture](#7-dashboard-architecture)
8. [API Architecture](#8-api-architecture)
9. [Scalability & Reliability](#9-scalability--reliability)
10. [Tech Stack Decisions](#10-tech-stack-decisions)
11. [Security Model](#11-security-model)
12. [Billing & Subscriptions](#12-billing--subscriptions)

---

## 1. System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          LuxeReal SaaS Platform                             │
│                                                                             │
│   ┌──────────────────┐   ┌──────────────────┐   ┌──────────────────────┐  │
│   │   Public Web     │   │  Org Dashboard   │   │  SuperAdmin Portal   │  │
│   │ luxereal.com     │   │ *.luxereal.com   │   │ admin.luxereal.com   │  │
│   │  (marketing)     │   │  or /org/slug    │   │  (platform control) │  │
│   └────────┬─────────┘   └────────┬─────────┘   └──────────┬───────────┘  │
│            │                      │                          │              │
│   ─────────┴──────────────────────┴──────────────────────────┴──────────   │
│                          Next.js App Router                                 │
│                     (unified codebase, path routing)                        │
│   ─────────────────────────────────────────────────────────────────────    │
│                                                                             │
│   ┌──────────────┐  ┌────────────────┐  ┌──────────────┐  ┌────────────┐  │
│   │  Auth Layer  │  │  API Routes    │  │  Middleware  │  │  Storage   │  │
│   │  (NextAuth)  │  │  (tRPC / REST) │  │  (tenant    │  │  (S3/R2)   │  │
│   │              │  │                │  │   resolver) │  │            │  │
│   └──────────────┘  └────────────────┘  └──────────────┘  └────────────┘  │
│                                                                             │
│   ─────────────────────────────────────────────────────────────────────    │
│                         Data Layer                                          │
│   ┌──────────────┐  ┌────────────────┐  ┌──────────────┐  ┌────────────┐  │
│   │  PostgreSQL  │  │     Redis      │  │  Prisma ORM  │  │  Resend    │  │
│   │  + RLS       │  │  (sessions,    │  │  (queries +  │  │  (email)   │  │
│   │              │  │   cache)       │  │   migrations)│  │            │  │
│   └──────────────┘  └────────────────┘  └──────────────┘  └────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Core Concepts

| Concept | Definition |
|---|---|
| **Organization (Tenant)** | A real estate agency/brokerage using the platform |
| **SuperAdmin** | Single platform owner — full control, no org boundary |
| **Org Admin** | User with admin rights within one organization |
| **Member** | Agent/staff within an organization |
| **Slug** | URL-safe identifier for each org (`/org/acme-realty`) |

---

## 2. Multi-Tenancy Strategy

### Chosen Model: **Path-based routing with Row-Level Security (RLS)**

```
URL structure:
  /                          → Public marketing site
  /org/[slug]/dashboard      → Org Admin/Member dashboard
  /org/[slug]/listings       → Org property listings
  /org/[slug]/members        → Member management
  /superadmin                → SuperAdmin portal (separate route group)
  /superadmin/organizations  → All orgs management
  /superadmin/users          → All users management
```

**Why path-based over subdomain-based:**
- Simpler SSL/cert management
- No DNS wildcard setup required
- Works on Vercel/Netlify free tiers
- Easier local development
- Can migrate to subdomains later by adding a redirect layer

### Tenant Isolation Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                    │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │  organizations table (tenants)                     │ │
│  │  id | slug | name | plan | created_at             │ │
│  └──────────────────────┬─────────────────────────────┘ │
│                         │ org_id FK on every table       │
│    ┌────────────────────┼─────────────────────────────┐  │
│    ▼                    ▼                             ▼  │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐ │
│  │  properties  │  │    leads     │  │  memberships   │ │
│  │  org_id FK   │  │  org_id FK   │  │  org_id FK     │ │
│  └──────────────┘  └──────────────┘  └────────────────┘ │
│                                                          │
│  Row-Level Security policies enforce:                    │
│  "You can only SELECT/INSERT/UPDATE/DELETE rows          │
│   where org_id = your current session org_id"            │
└─────────────────────────────────────────────────────────┘
```

### Tenant Resolution Flow (Middleware)

```
Incoming Request
      │
      ▼
┌─────────────────────┐
│  Next.js Middleware  │
│  (middleware.ts)     │
└──────────┬──────────┘
           │
           ▼
    ┌──────────────┐
    │ Parse path   │──── /org/[slug]/* ────► Extract slug from path
    └──────────────┘
           │
           ▼
    ┌──────────────────────────────┐
    │ Read JWT session token        │
    │ Verify: user.memberships      │
    │   includes this org slug?    │
    └──────────────┬───────────────┘
                   │
          ┌────────┴──────────┐
          │                   │
          ▼                   ▼
    ┌──────────────┐   ┌──────────────────┐
    │  Authorized  │   │  Unauthorized    │
    │  → set       │   │  → redirect to   │
    │  x-org-id    │   │  /login or /403  │
    │  header      │   │                  │
    └──────┬───────┘   └──────────────────┘
           │
           ▼
    Route Handler reads
    x-org-id from headers
    and scopes all DB queries
```

---

## 3. Database Design

### Complete Schema (Prisma SDL)

```prisma
// ─── PLATFORM LEVEL ───────────────────────────────────────

model Organization {
  id          String   @id @default(cuid())
  slug        String   @unique              // URL identifier
  name        String
  logoUrl     String?
  plan        Plan     @default(STARTER)
  status      OrgStatus @default(ACTIVE)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  memberships Membership[]
  properties  Property[]
  leads       Lead[]
  invitations Invitation[]
  subscription Subscription?
  settings    OrgSettings?

  @@map("organizations")
}

model User {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String?
  avatarUrl     String?
  emailVerified DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  isSuperAdmin  Boolean  @default(false)   // platform-level flag

  memberships   Membership[]
  accounts      Account[]                  // OAuth providers
  sessions      Session[]

  @@map("users")
}

// Junction: User ↔ Organization with role
model Membership {
  id             String     @id @default(cuid())
  userId         String
  organizationId String
  role           OrgRole    @default(MEMBER)
  joinedAt       DateTime   @default(now())
  invitedBy      String?

  user           User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  @@unique([userId, organizationId])        // one membership per user per org
  @@map("memberships")
}

model Invitation {
  id             String         @id @default(cuid())
  email          String
  organizationId String
  role           OrgRole        @default(MEMBER)
  token          String         @unique @default(cuid())
  expiresAt      DateTime
  acceptedAt     DateTime?
  invitedById    String

  organization   Organization   @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  @@map("invitations")
}

// ─── ORG LEVEL ────────────────────────────────────────────

model Property {
  id             String         @id @default(cuid())
  organizationId String                              // TENANT ISOLATION KEY
  slug           String
  title          String
  price          Float
  address        String
  city           String
  state          String
  beds           Int?
  baths          Int?
  sqft           Int?
  status         PropertyStatus @default(ACTIVE)
  createdById    String
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt

  organization   Organization   @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  images         PropertyImage[]
  leads          Lead[]

  @@unique([organizationId, slug])           // slug unique per org
  @@map("properties")
}

model Lead {
  id             String     @id @default(cuid())
  organizationId String                              // TENANT ISOLATION KEY
  propertyId     String?
  name           String
  email          String
  phone          String?
  message        String?
  status         LeadStatus @default(NEW)
  assignedTo     String?
  createdAt      DateTime   @default(now())

  organization   Organization @relation(fields: [organizationId], references: [id])
  property       Property?    @relation(fields: [propertyId], references: [id])

  @@map("leads")
}

model OrgSettings {
  id             String   @id @default(cuid())
  organizationId String   @unique
  primaryColor   String?
  customDomain   String?  @unique
  allowPublicListings Boolean @default(true)

  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  @@map("org_settings")
}

// ─── AUTH (NextAuth.js compatible) ────────────────────────

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verification_tokens")
}

// ─── BILLING ──────────────────────────────────────────────

model Subscription {
  id                   String             @id @default(cuid())
  organizationId       String             @unique
  stripeCustomerId     String             @unique
  stripeSubscriptionId String?            @unique
  plan                 Plan
  status               SubscriptionStatus
  currentPeriodEnd     DateTime?
  cancelAtPeriodEnd    Boolean            @default(false)

  organization         Organization       @relation(fields: [organizationId], references: [id])

  @@map("subscriptions")
}

// ─── ENUMS ────────────────────────────────────────────────

enum OrgRole {
  ADMIN
  MEMBER
}

enum OrgStatus {
  ACTIVE
  SUSPENDED
  DELETED
}

enum Plan {
  STARTER   // up to 5 members, 20 listings
  GROWTH    // up to 20 members, 100 listings
  ENTERPRISE // unlimited
}

enum PropertyStatus {
  DRAFT
  ACTIVE
  SOLD
  WITHDRAWN
}

enum LeadStatus {
  NEW
  CONTACTED
  QUALIFIED
  CLOSED_WON
  CLOSED_LOST
}

enum SubscriptionStatus {
  ACTIVE
  TRIALING
  PAST_DUE
  CANCELED
  INCOMPLETE
}
```

### Row-Level Security SQL Policies

```sql
-- Enable RLS on all tenant tables
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;

-- App role (used by Prisma connection)
CREATE ROLE app_user;

-- SuperAdmin bypasses all RLS (uses separate admin role)
CREATE ROLE superadmin_user;
GRANT ALL ON ALL TABLES IN SCHEMA public TO superadmin_user;

-- Property policy: org members only
CREATE POLICY org_isolation_properties ON properties
  FOR ALL TO app_user
  USING (organization_id = current_setting('app.current_org_id')::text);

-- Session variable set before each query in Prisma middleware
-- SET LOCAL app.current_org_id = '<org_id>';
```

---

## 4. Authentication System

### Auth Providers & Methods

```
┌─────────────────────────────────────────────────────────┐
│                    Auth Methods                          │
│                                                          │
│  ┌───────────────┐  ┌───────────────┐  ┌─────────────┐ │
│  │  Email +      │  │  Google OAuth │  │  Magic Link │ │
│  │  Password     │  │               │  │  (passwordless)│
│  └───────────────┘  └───────────────┘  └─────────────┘ │
│                           │                              │
│                    NextAuth.js v5                        │
│                 (Auth.js — App Router)                  │
│                           │                              │
│              ┌────────────┴────────────┐                │
│              │       JWT Session        │                │
│              │  {                       │                │
│              │    userId,               │                │
│              │    isSuperAdmin,         │                │
│              │    memberships: [        │                │
│              │      { orgId, orgSlug,   │                │
│              │        role }            │                │
│              │    ]                     │                │
│              │  }                       │                │
│              └──────────────────────────┘                │
└─────────────────────────────────────────────────────────┘
```

### Registration Flows

#### Flow 1 — New Organization (Self-Service)

```
User fills /register form
      │
      ▼
┌─────────────────────────────┐
│  POST /api/auth/register     │
│  body: { email, password,    │
│          orgName, orgSlug }  │
└──────────────┬──────────────┘
               │
               ▼
  ┌────────────────────────┐
  │  Validate uniqueness   │
  │  email + orgSlug       │
  └────────────┬───────────┘
               │
               ▼
  ┌────────────────────────────────┐
  │  DB Transaction:               │
  │  1. Create User                │
  │  2. Create Organization        │
  │  3. Create Membership          │
  │     (userId, orgId, role=ADMIN)│
  │  4. Create OrgSettings         │
  │  5. Create Subscription        │
  │     (plan=STARTER, status=TRIAL│
  └────────────┬───────────────────┘
               │
               ▼
  ┌────────────────────────┐
  │  Send verification     │
  │  email via Resend      │
  └────────────┬───────────┘
               │
               ▼
  Redirect → /org/[slug]/dashboard
```

#### Flow 2 — Invitation (Member joins existing Org)

```
Org Admin sends invite from dashboard
      │
      ▼
┌─────────────────────────────────┐
│  POST /api/org/[slug]/invite     │
│  body: { email, role: MEMBER }  │
│  auth: must be org ADMIN        │
└──────────────┬──────────────────┘
               │
               ▼
  ┌────────────────────────────────┐
  │  Create Invitation record      │
  │  { email, token, expiresAt     │
  │    +48h, orgId, role }         │
  └────────────┬───────────────────┘
               │
               ▼
  ┌────────────────────────────────┐
  │  Send invite email with link:  │
  │  /invite/accept?token=...      │
  └────────────┬───────────────────┘
               │
         User clicks link
               │
               ▼
  ┌────────────────────────────────┐
  │  GET /invite/accept?token=...  │
  │  Validate token & expiry       │
  └────────────┬───────────────────┘
               │
          ┌────┴────────────┐
          │                 │
    User exists        New user
          │                 │
          ▼                 ▼
  Create Membership   Create User →
  directly            then Membership
          │                 │
          └────────┬────────┘
                   ▼
         Mark invitation acceptedAt
                   │
                   ▼
        Redirect → /org/[slug]/dashboard
```

#### Flow 3 — SuperAdmin Access

```
SuperAdmin navigates to /superadmin
      │
      ▼
┌─────────────────────────────────┐
│  Middleware checks:              │
│  session.user.isSuperAdmin ===  │
│  true                           │
└──────────────┬──────────────────┘
               │
          ┌────┴────────┐
          │             │
         Yes            No
          │             │
          ▼             ▼
  /superadmin/*    Redirect /403
  (full access)
```

### Session JWT Structure

```typescript
interface LuxeRealSession {
  user: {
    id: string
    email: string
    name: string
    avatarUrl: string | null
    isSuperAdmin: boolean
    // Pre-loaded on login for fast middleware checks:
    memberships: Array<{
      orgId: string
      orgSlug: string
      orgName: string
      role: 'ADMIN' | 'MEMBER'
    }>
  }
}
```

---

## 5. Authorization & RBAC

### Permission Matrix

| Action | SuperAdmin | Org Admin | Org Member | Public |
|---|:---:|:---:|:---:|:---:|
| **Platform** | | | | |
| View all organizations | ✅ | ❌ | ❌ | ❌ |
| Suspend/delete org | ✅ | ❌ | ❌ | ❌ |
| View all users globally | ✅ | ❌ | ❌ | ❌ |
| Manage billing for any org | ✅ | ❌ | ❌ | ❌ |
| Set platform feature flags | ✅ | ❌ | ❌ | ❌ |
| Impersonate any user | ✅ | ❌ | ❌ | ❌ |
| **Organization** | | | | |
| View org settings | ✅ | ✅ (own) | ❌ | ❌ |
| Edit org settings | ✅ | ✅ (own) | ❌ | ❌ |
| Invite members | ✅ | ✅ (own) | ❌ | ❌ |
| Remove members | ✅ | ✅ (own) | ❌ | ❌ |
| Promote member to admin | ✅ | ✅ (own) | ❌ | ❌ |
| View members list | ✅ | ✅ (own) | ✅ (own) | ❌ |
| Manage org billing | ✅ | ✅ (own) | ❌ | ❌ |
| **Properties** | | | | |
| List/view properties | ✅ | ✅ (own org) | ✅ (own org) | ✅ (public) |
| Create property | ✅ | ✅ (own org) | ✅ (own org) | ❌ |
| Edit any org property | ✅ | ✅ (own org) | ❌ | ❌ |
| Edit own property | ✅ | ✅ | ✅ | ❌ |
| Delete property | ✅ | ✅ (own org) | ❌ | ❌ |
| **Leads** | | | | |
| View all org leads | ✅ | ✅ (own org) | ❌ | ❌ |
| View assigned leads | ✅ | ✅ | ✅ (assigned) | ❌ |
| Assign leads | ✅ | ✅ (own org) | ❌ | ❌ |
| Create lead (inquiry) | ✅ | ✅ | ✅ | ✅ |

### RBAC Implementation Pattern

```typescript
// lib/permissions.ts

export type Permission =
  | 'org:read' | 'org:write' | 'org:delete'
  | 'members:invite' | 'members:remove' | 'members:promote'
  | 'properties:create' | 'properties:edit-any' | 'properties:delete'
  | 'leads:view-all' | 'leads:assign'
  | 'billing:manage'
  | 'platform:superadmin'

const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  SUPERADMIN: ['platform:superadmin', /* all permissions */],
  ADMIN: [
    'org:read', 'org:write',
    'members:invite', 'members:remove', 'members:promote',
    'properties:create', 'properties:edit-any', 'properties:delete',
    'leads:view-all', 'leads:assign',
    'billing:manage',
  ],
  MEMBER: [
    'org:read',
    'properties:create',
    'leads:view-all',  // only assigned ones enforced at DB level
  ],
}

export function can(
  session: LuxeRealSession,
  permission: Permission,
  orgSlug?: string
): boolean {
  if (session.user.isSuperAdmin) return true
  if (!orgSlug) return false
  const membership = session.user.memberships.find(m => m.orgSlug === orgSlug)
  if (!membership) return false
  return ROLE_PERMISSIONS[membership.role]?.includes(permission) ?? false
}
```

---

## 6. Role Hierarchy & Flows

### Organizational Hierarchy

```
                    ┌─────────────────────┐
                    │     SUPERADMIN      │
                    │   (Platform Owner)  │
                    │  1 user, god-mode   │
                    └──────────┬──────────┘
                               │ manages all
               ┌───────────────┼───────────────┐
               │               │               │
               ▼               ▼               ▼
        ┌──────────┐    ┌──────────┐    ┌──────────┐
        │  Org A   │    │  Org B   │    │  Org C   │
        │(Agency 1)│    │(Agency 2)│    │(Agency 3)│
        └────┬─────┘    └────┬─────┘    └────┬─────┘
             │               │               │
          ┌──┴──┐         ┌──┴──┐         ┌──┴──┐
          │Admin│         │Admin│         │Admin│
          └──┬──┘         └─────┘         └─────┘
             │
     ┌───────┼───────┐
     │       │       │
  Member  Member  Member
 (Agent) (Agent) (Agent)
```

### User Lifecycle (Member)

```
Invited by Admin
      │
      ▼
  PENDING (invitation sent)
      │
      │ accepts invite
      ▼
  ACTIVE (member of org)
      │
      ├──── Admin promotes ──► ADMIN role
      │
      ├──── Admin demotes  ──► MEMBER role
      │
      └──── Admin removes ──► REMOVED (membership deleted)
```

### SuperAdmin Impersonation Flow

```
SuperAdmin clicks "View as Admin" on org page
      │
      ▼
POST /api/superadmin/impersonate
  body: { orgId, targetUserId? }
      │
      ▼
Create short-lived impersonation token (15min)
Store { impersonatorId, targetOrgId } in Redis
      │
      ▼
Set impersonation cookie
Redirect → /org/[slug]/dashboard
      │
      ▼
Banner shows: "Viewing as [Org Name] Admin — Exit"
      │
      ▼ User clicks Exit
DELETE /api/superadmin/impersonate
Clear cookie → back to SuperAdmin portal
```

---

## 7. Dashboard Architecture

### 7.1 SuperAdmin Dashboard — `/superadmin`

```
┌─────────────────────────────────────────────────────────────────┐
│  SuperAdmin Portal                              [Exit / Logout]  │
├─────────────────┬───────────────────────────────────────────────┤
│                 │                                                 │
│  NAVIGATION     │  MAIN CONTENT                                   │
│                 │                                                 │
│  ● Overview     │  ┌─────────────────────────────────────────┐   │
│  ● Organizations│  │  Platform Health                        │   │
│  ● All Users    │  │  ┌──────────┐ ┌──────────┐ ┌────────┐  │   │
│  ● Billing      │  │  │ 12 Orgs  │ │ 84 Users │ │ $4,200 │  │   │
│  ● Audit Log    │  │  │ (2 trial)│ │ (6 new)  │ │ MRR    │  │   │
│  ● Settings     │  │  └──────────┘ └──────────┘ └────────┘  │   │
│  ● Feature Flags│  └─────────────────────────────────────────┘   │
│                 │                                                 │
│                 │  ┌─────────────────────────────────────────┐   │
│                 │  │  Organizations                          │   │
│                 │  │  Search: [_____________] + New Org      │   │
│                 │  │  ┌──────────────────────────────────┐  │   │
│                 │  │  │ Name  | Plan  | Members | Status  │  │   │
│                 │  │  │ Acme  | GROWTH|    12   | ACTIVE  │  │   │
│                 │  │  │ Elite | STARTER|   3   | TRIAL   │  │   │
│                 │  │  │ Luxe  | ENT   |    45   | ACTIVE  │  │   │
│                 │  │  └──────────────────────────────────┘  │   │
│                 │  └─────────────────────────────────────────┘   │
│                 │                                                 │
│                 │  ┌─────────────────────────────────────────┐   │
│                 │  │  Recent Activity / Audit Log            │   │
│                 │  │  • Org "Acme" created — 2h ago          │   │
│                 │  │  • User john@... joined Elite — 5h ago  │   │
│                 │  │  • Org "Beta" suspended — 1d ago        │   │
│                 │  └─────────────────────────────────────────┘   │
└─────────────────┴───────────────────────────────────────────────┘
```

**SuperAdmin Dashboard Pages:**

| Route | Purpose |
|---|---|
| `/superadmin` | Platform stats: orgs, users, MRR, health |
| `/superadmin/organizations` | List, search, filter, create, suspend orgs |
| `/superadmin/organizations/[orgId]` | Single org deep-dive + impersonate |
| `/superadmin/users` | All users across all orgs |
| `/superadmin/billing` | Subscription overview, revenue |
| `/superadmin/audit-log` | All platform events with actor/target |
| `/superadmin/feature-flags` | Toggle features per org or globally |
| `/superadmin/settings` | Platform-level settings |

---

### 7.2 Org Admin Dashboard — `/org/[slug]`

```
┌─────────────────────────────────────────────────────────────────┐
│  🏠 LuxeReal          Acme Realty ▾          [Marcus] [Logout]  │
├─────────────────┬───────────────────────────────────────────────┤
│                 │                                                 │
│  NAVIGATION     │  MAIN CONTENT (Dashboard Home)                  │
│                 │                                                 │
│  ● Dashboard    │  Welcome back, Marcus                           │
│  ● Listings     │                                                 │
│  ● Leads        │  ┌──────────┐ ┌──────────┐ ┌────────────────┐  │
│  ● Members      │  │ 24       │ │ 8 new    │ │ $48M           │  │
│  ● Analytics    │  │ Listings │ │ Leads    │ │ Portfolio Value│  │
│  ● Settings     │  └──────────┘ └──────────┘ └────────────────┘  │
│  ─────────────  │                                                 │
│  ADMIN TOOLS    │  ┌─────────────────────────────────────────┐   │
│                 │  │  Recent Leads                           │   │
│  ● Invite       │  │  • Jane D. enquired 842 Bel Air — 1h   │   │
│    Member       │  │  • Tom R. requested tour — 3h           │   │
│  ● Org Settings │  │  • Sarah K. new contact — 1d            │   │
│  ● Billing      │  └─────────────────────────────────────────┘   │
│                 │                                                 │
│                 │  ┌─────────────────────────────────────────┐   │
│                 │  │  Team Activity                          │   │
│                 │  │  Marcus   — 3 new listings this week    │   │
│                 │  │  Emily    — 2 tours scheduled           │   │
│                 │  │  David    — 5 leads contacted           │   │
│                 │  └─────────────────────────────────────────┘   │
└─────────────────┴───────────────────────────────────────────────┘
```

**Org Admin Pages:**

| Route | Purpose |
|---|---|
| `/org/[slug]/dashboard` | Overview: stats, recent activity, team |
| `/org/[slug]/listings` | All org property listings (filter, search, bulk) |
| `/org/[slug]/listings/new` | Create new property listing |
| `/org/[slug]/listings/[id]/edit` | Edit a listing |
| `/org/[slug]/leads` | All leads: filter by status, agent, property |
| `/org/[slug]/leads/[id]` | Lead detail with timeline |
| `/org/[slug]/members` | Member roster, invite, role management |
| `/org/[slug]/analytics` | Performance charts, conversion funnels |
| `/org/[slug]/settings` | Org name, logo, branding, custom domain |
| `/org/[slug]/billing` | Plan, usage limits, payment method |

---

### 7.3 Member Dashboard — same routes, restricted UI

Member sees the same `/org/[slug]/*` routes but:
- **Members page**: read-only, no invite/remove controls
- **Listings**: can only edit/delete own listings
- **Leads**: only sees leads assigned to them
- **No access to**: Settings, Billing, analytics (or read-only analytics)
- **No admin tools** section in sidebar

The UI conditionally renders controls based on the session role — no separate route set needed.

---

## 8. API Architecture

### Route Structure

```
/api/
├── auth/
│   ├── [...nextauth]    ← NextAuth handler
│   ├── register         ← New org + user registration
│   └── invite/accept    ← Accept invitation token
│
├── org/[slug]/          ← All routes require org membership
│   ├── listings/
│   │   ├── GET          ← list (filter, pagination)
│   │   ├── POST         ← create (ADMIN | MEMBER)
│   │   └── [id]/
│   │       ├── GET      ← single listing
│   │       ├── PATCH    ← update (ADMIN | owner MEMBER)
│   │       └── DELETE   ← delete (ADMIN only)
│   │
│   ├── leads/
│   │   ├── GET          ← list (ADMIN: all | MEMBER: assigned)
│   │   ├── POST         ← create (public inquiry hits here too)
│   │   └── [id]/
│   │       ├── PATCH    ← update status/assign
│   │       └── DELETE   ← ADMIN only
│   │
│   ├── members/
│   │   ├── GET          ← list members
│   │   ├── POST         ← invite (ADMIN only)
│   │   └── [userId]/
│   │       ├── PATCH    ← change role (ADMIN only)
│   │       └── DELETE   ← remove (ADMIN only)
│   │
│   ├── settings/
│   │   ├── GET
│   │   └── PATCH        ← ADMIN only
│   │
│   └── billing/         ← ADMIN only
│
└── superadmin/          ← All routes require isSuperAdmin
    ├── organizations/
    │   ├── GET
    │   ├── POST
    │   └── [orgId]/
    │       ├── PATCH    ← update, suspend
    │       └── DELETE
    ├── users/
    ├── billing/
    └── impersonate/
```

### Middleware Pipeline

```
Request
  │
  ▼ 1. Rate Limiting (upstash/ratelimit)
  │
  ▼ 2. Session check (NextAuth getServerSession)
  │
  ▼ 3. Tenant resolution (parse /org/[slug])
  │
  ▼ 4. Membership verification (user in org?)
  │
  ▼ 5. Role check (has required permission?)
  │
  ▼ 6. Set DB context (SET LOCAL app.current_org_id)
  │
  ▼ 7. Route Handler (business logic)
  │
  ▼ 8. Response (with org_id in all returned data)
```

---

## 9. Scalability & Reliability

### Architecture for Scale

```
                         CDN (Vercel Edge / Cloudflare)
                                    │
                    ┌───────────────┴────────────────┐
                    │                                │
              Static Assets                   Dynamic Requests
              (images, CSS, JS)               (API routes, SSR)
                                                    │
                                      ┌─────────────┴──────────────┐
                                      │      Next.js App Router     │
                                      │   (serverless functions)    │
                                      └─────────────┬──────────────┘
                                                    │
                     ┌──────────────────────────────┼────────────────────────┐
                     │                              │                        │
              ┌──────┴──────┐              ┌────────┴──────┐         ┌───────┴──────┐
              │  PostgreSQL  │              │     Redis      │         │  File Store  │
              │  (Neon.tech  │              │  (Upstash)     │         │  (Cloudflare │
              │  or Supabase)│              │                │         │  R2 / S3)    │
              │              │              │  • Sessions    │         │              │
              │  • Primary   │              │  • Rate limits │         │  • Property  │
              │    RLS-based │              │  • Caching     │         │    images    │
              │    data      │              │  • Job queue   │         │  • Org logos │
              └──────────────┘              └────────────────┘         └──────────────┘
```

### Caching Strategy

| Layer | What | TTL | Tool |
|---|---|---|---|
| CDN | Static pages, public listings | 1h–24h | Vercel Edge Cache |
| API Response | Org listings (non-mutating) | 60s | Redis |
| Session | JWT memberships (avoid DB on every request) | Session lifetime | NextAuth JWT |
| DB Query | Org settings, plan limits | 5 min | Redis |
| Images | Property photos | CDN-eternal | Cloudflare R2 + CDN |

### Database Scaling Path

```
Phase 1 (0–1000 orgs):
  Single PostgreSQL instance (Neon or Supabase)
  Connection pooling via PgBouncer
  Read replicas for analytics queries

Phase 2 (1000–10000 orgs):
  Horizontal sharding by organization ID range
  OR migrate to Neon branching (per-org branches)
  Separate analytics DB (read-only replica)

Phase 3 (10000+ orgs):
  Consider dedicated DB per Enterprise-tier org
  Separate OLAP store (Snowflake/BigQuery) for analytics
  Event streaming via Kafka for audit logs
```

### Background Jobs & Queues

```
Queue Workers (via Inngest or Trigger.dev):

  invite-email-worker
    ├── triggered by: POST /api/org/invite
    └── sends: invitation email via Resend

  lead-notification-worker
    ├── triggered by: new lead created
    └── sends: email to assigned agent

  billing-sync-worker
    ├── triggered by: Stripe webhooks
    └── updates: subscription status in DB

  org-cleanup-worker
    ├── triggered by: cron daily
    └── deletes: expired invitations, soft-deleted data

  analytics-rollup-worker
    ├── triggered by: cron hourly
    └── updates: pre-computed org stats table
```

---

## 10. Tech Stack Decisions

| Concern | Choice | Why |
|---|---|---|
| Framework | Next.js (App Router) | Already in use, Server Components reduce API overhead |
| Auth | NextAuth.js v5 (Auth.js) | Flexible providers, JWT strategy, App Router native |
| Database | PostgreSQL (Neon or Supabase) | RLS support, Prisma ORM, serverless-friendly connection pooling |
| ORM | Prisma | Type-safe queries, migrations, multi-tenant middleware support |
| Cache / Sessions | Upstash Redis | Serverless-native, edge-compatible |
| Email | Resend | Modern API, React Email templates |
| File Storage | Cloudflare R2 | S3-compatible, free egress, cheap |
| Payments | Stripe | Industry standard, webhooks, subscription management |
| Background Jobs | Inngest or Trigger.dev | Serverless-friendly event queues |
| Deployment | Vercel | Next.js native, edge middleware, auto-scaling |
| Monitoring | Sentry + Vercel Analytics | Error tracking + Core Web Vitals |
| Rate Limiting | Upstash Ratelimit | Edge-native, per-org limits |

---

## 11. Security Model

### Defense in Depth

```
Layer 1: Network
  ├── Vercel WAF / Cloudflare DDoS protection
  ├── Rate limiting per IP and per org
  └── CORS restricted to platform domains

Layer 2: Authentication
  ├── Secure HTTP-only cookies for session tokens
  ├── CSRF protection (NextAuth built-in)
  ├── Email verification before org access
  └── OAuth 2.0 with PKCE

Layer 3: Authorization
  ├── Middleware tenant resolution before route handlers
  ├── RBAC permission checks in every API handler
  ├── RLS in PostgreSQL (defense against ORM bugs)
  └── SuperAdmin actions logged in audit table

Layer 4: Data
  ├── All PII encrypted at rest (Neon/Supabase handled)
  ├── Org_id always set before any DB query
  ├── Soft deletes (data never hard-deleted immediately)
  └── Backup strategy: daily snapshots + PITR (30 days)
```

### Audit Log Schema

```sql
CREATE TABLE audit_logs (
  id             TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  actor_id       TEXT NOT NULL,           -- user who did it
  actor_type     TEXT NOT NULL,           -- 'USER' | 'SUPERADMIN' | 'SYSTEM'
  organization_id TEXT,                  -- null for platform-level actions
  action         TEXT NOT NULL,           -- 'member.invited', 'property.deleted', etc.
  target_type    TEXT,                    -- 'User' | 'Property' | 'Organization'
  target_id      TEXT,
  metadata       JSONB,                   -- additional context
  ip_address     TEXT,
  user_agent     TEXT,
  created_at     TIMESTAMPTZ DEFAULT now()
);

-- Indexed for common queries:
CREATE INDEX audit_logs_org_idx ON audit_logs(organization_id, created_at DESC);
CREATE INDEX audit_logs_actor_idx ON audit_logs(actor_id, created_at DESC);
```

---

## 12. Billing & Subscriptions

### Plan Limits

| Feature | Starter | Growth | Enterprise |
|---|---|---|---|
| Members | 5 | 20 | Unlimited |
| Active Listings | 20 | 100 | Unlimited |
| Lead Management | Basic | Full | Full + CRM |
| Custom Domain | ❌ | ✅ | ✅ |
| Analytics | Basic | Advanced | Advanced + Export |
| Support | Email | Priority | Dedicated |
| Price/month | $49 | $149 | Custom |

### Stripe Integration Flow

```
New Org registers
      │
      ▼
Create Stripe Customer (POST /v1/customers)
      │
      ▼
Start 14-day trial (Stripe subscription: trial_end = +14 days)
      │
      ▼
User adds payment method
      │
      ▼
Trial converts to paid (Stripe handles automatically)
      │
      ▼ Stripe sends webhook: customer.subscription.updated
      │
      ▼
/api/webhooks/stripe updates DB subscription status
      │
      ▼ Plan limit checks run on every feature action:
      │  "Can this org create another listing?" → check against plan.maxListings
```

---

## Summary

The path from current app to full SaaS can be broken into 6 phases (see `SAAS_TODOS.md`):

```
Current App ──► Phase 1 ──► Phase 2 ──► Phase 3 ──► Phase 4 ──► Phase 5 ──► Full SaaS
(single tenant)  (DB/Auth)  (Org Mgmt)  (Dashboards) (Features) (Billing)   (Production)
```

The architecture is designed to:
- **Start simple** — path routing, single DB, one codebase
- **Scale horizontally** — stateless API, Redis caching, connection pooling
- **Never mix tenant data** — RLS as last line of defense, org_id on every query
- **Stay auditable** — every mutation logged, impersonation tracked
- **Upgrade gracefully** — subdomain routing, sharding, dedicated DBs all addable later
