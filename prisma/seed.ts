/**
 * seed.ts — Deterministic, data-driven seed for local development & manual QA.
 *
 * Seeds a full, realistic slice of the platform so every role and feature can be
 * exercised by hand:
 *   • 2  SuperAdmins   (platform operators)
 *   • 5  Organizations (varied plans + statuses, incl. one SUSPENDED)
 *   • 5  Org Admins    (one per org)
 *   • 15 Members       (spread across the orgs)
 *   • 24 Listings      (every status + property type, with images)
 *   • Leads + notes, subscriptions, org settings, pending invitations, audit logs
 *
 * Design notes:
 *   - IDENTITIES are upserted (users, orgs, memberships, settings, subscriptions)
 *     so re-running the seed never duplicates an account and keeps ids stable.
 *   - VOLATILE content (properties, images, leads, notes, invitations, audit
 *     logs) is wiped and recreated each run, so the dataset is always the same
 *     regardless of how many times you seed. Safe to run repeatedly, and exactly
 *     what `prisma migrate reset` expects.
 *   - All passwords are shared per role (see the table printed at the end) to make
 *     manual testing painless.
 */
import { loadEnvConfig } from '@next/env'
import { PrismaClient } from '../src/generated/prisma'
import type { Plan, OrgStatus, SubscriptionStatus, PropertyStatus, PropertyType, LeadStatus } from '../src/generated/prisma'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

// tsx doesn't auto-load .env.local — load it the same way Next/Prisma config do.
loadEnvConfig(process.cwd())

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('DATABASE_URL is not set — add it to .env.local before seeding')
}

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

// ─── Shared credentials (kept simple for manual testing) ────────────────────
const PW = {
  SUPERADMIN: 'SuperAdmin@123!',
  ADMIN: 'OrgAdmin@123!',
  MEMBER: 'Member@123!',
} as const

// ─── Stock imagery (Unsplash — real-estate photos) ──────────────────────────
const IMG = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&q=80`
const PHOTO_POOL = [
  'photo-1568605114967-8130f3a36994',
  'photo-1512917774080-9991f1c4c750',
  'photo-1570129477492-45c003edd2be',
  'photo-1600596542815-ffad4c1539a9',
  'photo-1600585154340-be6161a56a0c',
  'photo-1600607687939-ce8a6c25118c',
  'photo-1600566753086-00f18fb6b3ea',
  'photo-1600047509807-ba8f99d2cdde',
  'photo-1613490493576-7fde63acd811',
  'photo-1605276374104-dee2a0ed3cd6',
  'photo-1580587771525-78b9dba3b914',
  'photo-1512915922686-57c11dde9b6b',
].map(IMG)

/** Deterministic rotating slice of the photo pool so each listing looks distinct. */
let photoCursor = 0
function nextImages(count: number): string[] {
  const out: string[] = []
  for (let i = 0; i < count; i++) {
    out.push(PHOTO_POOL[photoCursor % PHOTO_POOL.length])
    photoCursor++
  }
  return out
}

/** Slugify a listing title into a URL-safe, per-org unique slug. */
function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

const day = 24 * 60 * 60 * 1000
const daysFromNow = (n: number) => new Date(Date.now() + n * day)
const daysAgo = (n: number) => new Date(Date.now() - n * day)

// ─── Declarative dataset ────────────────────────────────────────────────────
// Each org bundles its people, listings, leads and billing so the shape of the
// seed reads top-to-bottom like the product itself.

interface ListingSeed {
  title: string
  price: number
  address: string
  city: string
  state: string
  beds?: number
  baths?: number
  sqft?: number
  type: PropertyType
  status: PropertyStatus
  /** email of the org member/admin who created it */
  by: string
  images: number
  description: string
}

interface LeadSeed {
  name: string
  email: string
  phone?: string
  message?: string
  status: LeadStatus
  /** listing title this lead enquired about (optional) */
  listing?: string
  /** email of the member the lead is assigned to (optional) */
  assignee?: string
  notes?: { by: string; body: string }[]
}

interface OrgSeed {
  slug: string
  name: string
  plan: Plan
  status: OrgStatus
  primaryColor: string
  customDomain?: string
  subscription: { plan: Plan; status: SubscriptionStatus; periodDays?: number }
  admin: { email: string; name: string }
  members: { email: string; name: string }[]
  listings: ListingSeed[]
  leads: LeadSeed[]
  invitations?: { email: string; role: 'ADMIN' | 'MEMBER' }[]
}

const ORGS: OrgSeed[] = [
  // ── 1) Acme Realty — STARTER, active, trialing ────────────────────────────
  {
    slug: 'acme-realty',
    name: 'Acme Realty',
    plan: 'STARTER',
    status: 'ACTIVE',
    primaryColor: '#041627',
    subscription: { plan: 'STARTER', status: 'TRIALING', periodDays: 14 },
    admin: { email: 'orgadmin@acmerealty.com', name: 'Marcus Reeves' },
    members: [
      { email: 'agent@acmerealty.com', name: 'Emily Chen' },
      { email: 'sofia@acmerealty.com', name: 'Sofia Martinez' },
      { email: 'daniel@acmerealty.com', name: 'Daniel Okafor' },
    ],
    listings: [
      { title: 'Sunlit Craftsman Bungalow', price: 685000, address: '412 Maple Grove Ln', city: 'Portland', state: 'OR', beds: 3, baths: 2, sqft: 1980, type: 'HOUSE', status: 'ACTIVE', by: 'agent@acmerealty.com', images: 3, description: 'A lovingly restored 1920s Craftsman with original built-ins, a chef’s kitchen, and a west-facing porch that catches the evening light.' },
      { title: 'Downtown Loft with Skyline Views', price: 540000, address: '88 Pearl St #1204', city: 'Portland', state: 'OR', beds: 1, baths: 1, sqft: 1100, type: 'APARTMENT', status: 'ACTIVE', by: 'sofia@acmerealty.com', images: 3, description: 'Floor-to-ceiling windows, polished concrete floors, and a private balcony overlooking the river. Walk to everything.' },
      { title: 'Riverside Modern Townhouse', price: 720000, address: '15 Willow Bend', city: 'Lake Oswego', state: 'OR', beds: 3, baths: 3, sqft: 2200, type: 'TOWNHOUSE', status: 'DRAFT', by: 'daniel@acmerealty.com', images: 2, description: 'Three levels of contemporary living with a rooftop terrace and two-car garage, steps from the waterfront trail.' },
      { title: 'Cozy Starter Cottage', price: 375000, address: '7 Birch Court', city: 'Gresham', state: 'OR', beds: 2, baths: 1, sqft: 1050, type: 'HOUSE', status: 'ACTIVE', by: 'agent@acmerealty.com', images: 3, description: 'The perfect first home — fenced backyard, updated systems, and a detached studio ready for a home office.' },
      { title: 'Historic Brick Estate', price: 1250000, address: '900 Heritage Row', city: 'Portland', state: 'OR', beds: 5, baths: 4, sqft: 4100, type: 'VILLA', status: 'SOLD', by: 'orgadmin@acmerealty.com', images: 3, description: 'A landmark residence with formal gardens, a carriage house, and meticulously preserved period detail throughout.' },
    ],
    leads: [
      { name: 'Rachel Kim', email: 'rachel.kim@example.com', phone: '+1 503-555-0142', message: 'Is the Craftsman still available for a weekend showing?', status: 'NEW', listing: 'Sunlit Craftsman Bungalow' },
      { name: 'Tom Bradley', email: 'tbradley@example.com', phone: '+1 503-555-0177', message: 'Interested in the downtown loft — what are the HOA fees?', status: 'CONTACTED', listing: 'Downtown Loft with Skyline Views', assignee: 'sofia@acmerealty.com', notes: [{ by: 'sofia@acmerealty.com', body: 'Called back — sending HOA docs and comps this afternoon.' }] },
      { name: 'Priya Nair', email: 'priya.nair@example.com', message: 'We are relocating and love the cottage. Can we do a video tour?', status: 'QUALIFIED', listing: 'Cozy Starter Cottage', assignee: 'agent@acmerealty.com', notes: [{ by: 'agent@acmerealty.com', body: 'Pre-approved up to $420k. Scheduling video tour Thursday.' }, { by: 'orgadmin@acmerealty.com', body: 'Strong buyer — prioritize.' }] },
      { name: 'George Hall', email: 'ghall@example.com', phone: '+1 503-555-0198', message: 'Was the brick estate a cash sale?', status: 'CLOSED_WON', listing: 'Historic Brick Estate', assignee: 'orgadmin@acmerealty.com' },
      { name: 'Anon Website Visitor', email: 'visitor@example.com', message: 'General question about your listings in Lake Oswego.', status: 'NEW' },
    ],
    invitations: [{ email: 'newagent@acmerealty.com', role: 'MEMBER' }],
  },

  // ── 2) Skyline Properties — GROWTH, active ────────────────────────────────
  {
    slug: 'skyline-properties',
    name: 'Skyline Properties',
    plan: 'GROWTH',
    status: 'ACTIVE',
    primaryColor: '#0b3d5c',
    customDomain: 'listings.skylineproperties.com',
    subscription: { plan: 'GROWTH', status: 'ACTIVE', periodDays: 30 },
    admin: { email: 'admin@skylineproperties.com', name: 'Priyanka Rao' },
    members: [
      { email: 'james@skylineproperties.com', name: 'James Whitfield' },
      { email: 'lena@skylineproperties.com', name: 'Lena Petrova' },
      { email: 'marco@skylineproperties.com', name: 'Marco Bellini' },
      { email: 'aisha@skylineproperties.com', name: 'Aisha Rahman' },
    ],
    listings: [
      { title: 'Glass Penthouse in the Sky', price: 3200000, address: '1 Skyline Tower #PH', city: 'Seattle', state: 'WA', beds: 4, baths: 4, sqft: 3800, type: 'PENTHOUSE', status: 'ACTIVE', by: 'admin@skylineproperties.com', images: 4, description: 'A full-floor penthouse wrapped in glass with 360° views of the Sound, Space Needle, and Cascades. Private elevator entry.' },
      { title: 'Belltown Corner Condo', price: 890000, address: '220 Bell St #808', city: 'Seattle', state: 'WA', beds: 2, baths: 2, sqft: 1350, type: 'CONDO', status: 'ACTIVE', by: 'james@skylineproperties.com', images: 3, description: 'Bright corner unit with wrap-around windows, a modern kitchen, and access to a rooftop deck and gym.' },
      { title: 'Queen Anne Victorian', price: 1650000, address: '512 Highland Dr', city: 'Seattle', state: 'WA', beds: 4, baths: 3, sqft: 3100, type: 'HOUSE', status: 'ACTIVE', by: 'lena@skylineproperties.com', images: 3, description: 'Grand Victorian on the hill with original woodwork, a wraparound porch, and postcard views of downtown.' },
      { title: 'Capitol Hill Investment Duplex', price: 1150000, address: '77 Pine Ridge', city: 'Seattle', state: 'WA', beds: 4, baths: 2, sqft: 2400, type: 'HOUSE', status: 'DRAFT', by: 'marco@skylineproperties.com', images: 2, description: 'Turnkey duplex in a walkable neighborhood — live in one unit, rent the other. Strong rental history.' },
      { title: 'Waterfront Live/Work Loft', price: 975000, address: '34 Dock Ave #2', city: 'Tacoma', state: 'WA', beds: 1, baths: 2, sqft: 1700, type: 'APARTMENT', status: 'WITHDRAWN', by: 'aisha@skylineproperties.com', images: 3, description: 'Industrial-chic loft on the waterfront with soaring ceilings, a mezzanine studio, and gated parking.' },
      { title: 'Suburban Family Home', price: 720000, address: '18 Elm Hollow', city: 'Bellevue', state: 'WA', beds: 4, baths: 3, sqft: 2650, type: 'HOUSE', status: 'ACTIVE', by: 'james@skylineproperties.com', images: 3, description: 'Spacious home in a top school district with an open floor plan, bonus room, and a landscaped backyard.' },
    ],
    leads: [
      { name: 'Victor Nash', email: 'vnash@example.com', phone: '+1 206-555-0110', message: 'Requesting a private tour of the penthouse.', status: 'QUALIFIED', listing: 'Glass Penthouse in the Sky', assignee: 'admin@skylineproperties.com', notes: [{ by: 'admin@skylineproperties.com', body: 'Verified proof of funds. Tour booked for Saturday 2pm.' }] },
      { name: 'Dana Fields', email: 'dfields@example.com', message: 'Do the Belltown condo fees include parking?', status: 'CONTACTED', listing: 'Belltown Corner Condo', assignee: 'james@skylineproperties.com' },
      { name: 'Omar Said', email: 'osaid@example.com', phone: '+1 206-555-0184', message: 'Interested in the duplex numbers.', status: 'NEW', listing: 'Capitol Hill Investment Duplex' },
      { name: 'Helen Cross', email: 'hcross@example.com', message: 'Loved the Victorian at the open house.', status: 'CONTACTED', listing: 'Queen Anne Victorian', assignee: 'lena@skylineproperties.com' },
      { name: 'Bill Turner', email: 'bturner@example.com', message: 'We decided to go another direction, thanks.', status: 'CLOSED_LOST', assignee: 'marco@skylineproperties.com' },
      { name: 'Grace Liu', email: 'gliu@example.com', phone: '+1 425-555-0155', message: 'Ready to make an offer on the Bellevue home.', status: 'CLOSED_WON', listing: 'Suburban Family Home', assignee: 'james@skylineproperties.com', notes: [{ by: 'james@skylineproperties.com', body: 'Offer accepted at asking. Closing in 30 days.' }] },
    ],
    invitations: [
      { email: 'contract-admin@skylineproperties.com', role: 'ADMIN' },
      { email: 'intern@skylineproperties.com', role: 'MEMBER' },
    ],
  },

  // ── 3) Coastal Estates — GROWTH, active ───────────────────────────────────
  {
    slug: 'coastal-estates',
    name: 'Coastal Estates',
    plan: 'GROWTH',
    status: 'ACTIVE',
    primaryColor: '#1f6f78',
    subscription: { plan: 'GROWTH', status: 'PAST_DUE', periodDays: -3 },
    admin: { email: 'admin@coastalestates.com', name: 'Isabella Moreau' },
    members: [
      { email: 'noah@coastalestates.com', name: 'Noah Bennett' },
      { email: 'maya@coastalestates.com', name: 'Maya Fischer' },
      { email: 'leo@coastalestates.com', name: 'Leo Alvarez' },
    ],
    listings: [
      { title: 'Oceanfront Villa with Infinity Pool', price: 4500000, address: '1 Shoreline Dr', city: 'Malibu', state: 'CA', beds: 5, baths: 6, sqft: 5200, type: 'VILLA', status: 'ACTIVE', by: 'admin@coastalestates.com', images: 4, description: 'A dramatic modern villa perched above the Pacific with an infinity pool, glass walls, and a private beach path.' },
      { title: 'Beach Bungalow Retreat', price: 1350000, address: '22 Sand Dollar Way', city: 'Santa Monica', state: 'CA', beds: 2, baths: 2, sqft: 1400, type: 'HOUSE', status: 'ACTIVE', by: 'noah@coastalestates.com', images: 3, description: 'A breezy bungalow two blocks from the sand, with a sun-drenched patio and freshly renovated interiors.' },
      { title: 'Marina View Condo', price: 980000, address: '400 Harbor Blvd #310', city: 'Marina del Rey', state: 'CA', beds: 2, baths: 2, sqft: 1250, type: 'CONDO', status: 'ACTIVE', by: 'maya@coastalestates.com', images: 3, description: 'Watch the boats from your private balcony. Resort-style amenities and a short walk to the boardwalk.' },
      { title: 'Cliffside Land Parcel', price: 2100000, address: 'Lot 9, Vista Ridge', city: 'Big Sur', state: 'CA', type: 'LAND', status: 'DRAFT', by: 'leo@coastalestates.com', images: 2, description: 'Two rare acres of buildable coastal land with unobstructed ocean views and approved architectural plans.' },
      { title: 'Mediterranean Hillside Estate', price: 3800000, address: '55 Cypress Terrace', city: 'Laguna Beach', state: 'CA', beds: 4, baths: 5, sqft: 4600, type: 'VILLA', status: 'SOLD', by: 'admin@coastalestates.com', images: 3, description: 'Terracotta and stone estate with tiered gardens, a wine cellar, and sweeping views of the coastline.' },
    ],
    leads: [
      { name: 'Sebastian Cole', email: 'scole@example.com', phone: '+1 310-555-0166', message: 'Serious buyer for the oceanfront villa.', status: 'QUALIFIED', listing: 'Oceanfront Villa with Infinity Pool', assignee: 'admin@coastalestates.com', notes: [{ by: 'admin@coastalestates.com', body: 'Concierge showing arranged. Buyer relocating from NYC.' }] },
      { name: 'Nina Petit', email: 'npetit@example.com', message: 'Is the beach bungalow pet friendly?', status: 'CONTACTED', listing: 'Beach Bungalow Retreat', assignee: 'noah@coastalestates.com' },
      { name: 'Raj Malhotra', email: 'rmalhotra@example.com', phone: '+1 310-555-0121', message: 'Interested in the marina condo financing options.', status: 'NEW', listing: 'Marina View Condo' },
      { name: 'Clara Voss', email: 'cvoss@example.com', message: 'Can I get the plans for the Big Sur land?', status: 'CONTACTED', listing: 'Cliffside Land Parcel', assignee: 'leo@coastalestates.com' },
    ],
  },

  // ── 4) Metro Urban Living — ENTERPRISE, active ────────────────────────────
  {
    slug: 'metro-urban-living',
    name: 'Metro Urban Living',
    plan: 'ENTERPRISE',
    status: 'ACTIVE',
    primaryColor: '#2b2d42',
    customDomain: 'homes.metrourban.com',
    subscription: { plan: 'ENTERPRISE', status: 'ACTIVE', periodDays: 30 },
    admin: { email: 'admin@metrourban.com', name: 'David Okonkwo' },
    members: [
      { email: 'zoe@metrourban.com', name: 'Zoe Anderson' },
      { email: 'ravi@metrourban.com', name: 'Ravi Sharma' },
      { email: 'hannah@metrourban.com', name: 'Hannah Weiss' },
      { email: 'chen@metrourban.com', name: 'Chen Wei' },
    ],
    listings: [
      { title: 'SoHo Cast-Iron Loft', price: 2750000, address: '120 Greene St #4', city: 'New York', state: 'NY', beds: 2, baths: 2, sqft: 2000, type: 'APARTMENT', status: 'ACTIVE', by: 'admin@metrourban.com', images: 3, description: 'A quintessential SoHo loft with 12-foot ceilings, cast-iron columns, and oversized artist windows.' },
      { title: 'Brooklyn Brownstone', price: 3400000, address: '88 Willow Pl', city: 'Brooklyn', state: 'NY', beds: 4, baths: 3, sqft: 3300, type: 'TOWNHOUSE', status: 'ACTIVE', by: 'zoe@metrourban.com', images: 4, description: 'A fully renovated brownstone in Brooklyn Heights with a garden, original moldings, and a chef’s kitchen.' },
      { title: 'Midtown High-Rise Studio', price: 620000, address: '400 Park Ave #1801', city: 'New York', state: 'NY', beds: 0, baths: 1, sqft: 620, type: 'CONDO', status: 'ACTIVE', by: 'ravi@metrourban.com', images: 3, description: 'An efficient, light-filled studio in a full-service building with a doorman, gym, and roof lounge.' },
      { title: 'Tribeca Penthouse Duplex', price: 8900000, address: '5 Franklin St #PH', city: 'New York', state: 'NY', beds: 4, baths: 5, sqft: 4800, type: 'PENTHOUSE', status: 'ACTIVE', by: 'admin@metrourban.com', images: 4, description: 'A trophy duplex penthouse with a 1,500 sq ft private terrace, home theater, and skyline views in every direction.' },
      { title: 'Long Island City Condo', price: 1050000, address: '10 Center Blvd #2205', city: 'Long Island City', state: 'NY', beds: 2, baths: 2, sqft: 1150, type: 'CONDO', status: 'DRAFT', by: 'hannah@metrourban.com', images: 2, description: 'Waterfront condo with Manhattan views, floor-to-ceiling glass, and best-in-class building amenities.' },
      { title: 'Harlem Restored Row House', price: 1980000, address: '250 W 130th St', city: 'New York', state: 'NY', beds: 5, baths: 4, sqft: 3600, type: 'TOWNHOUSE', status: 'SOLD', by: 'chen@metrourban.com', images: 3, description: 'A landmark row house restored to perfection with a rental unit, roof deck, and period charm intact.' },
    ],
    leads: [
      { name: 'Eleanor Wright', email: 'ewright@example.com', phone: '+1 212-555-0133', message: 'Requesting financials for the Tribeca penthouse.', status: 'QUALIFIED', listing: 'Tribeca Penthouse Duplex', assignee: 'admin@metrourban.com', notes: [{ by: 'admin@metrourban.com', body: 'Ultra-high-net-worth buyer. Attorney copied on all comms.' }, { by: 'zoe@metrourban.com', body: 'Building board package prepared.' }] },
      { name: 'Marcus Bell', email: 'mbell@example.com', message: 'Is the SoHo loft board-approval required?', status: 'CONTACTED', listing: 'SoHo Cast-Iron Loft', assignee: 'ravi@metrourban.com' },
      { name: 'Sana Iqbal', email: 'siqbal@example.com', phone: '+1 718-555-0175', message: 'We love the brownstone — what’s the tax picture?', status: 'QUALIFIED', listing: 'Brooklyn Brownstone', assignee: 'zoe@metrourban.com' },
      { name: 'Peter Novak', email: 'pnovak@example.com', message: 'Studio still available?', status: 'NEW', listing: 'Midtown High-Rise Studio' },
      { name: 'Lucia Romano', email: 'lromano@example.com', message: 'Closed on the Harlem row house — thank you!', status: 'CLOSED_WON', listing: 'Harlem Restored Row House', assignee: 'chen@metrourban.com' },
      { name: 'Frank Adler', email: 'fadler@example.com', message: 'Went with another firm.', status: 'CLOSED_LOST', assignee: 'hannah@metrourban.com' },
    ],
    invitations: [{ email: 'analyst@metrourban.com', role: 'MEMBER' }],
  },

  // ── 5) Sunset Realty Group — STARTER, SUSPENDED (edge-case testing) ────────
  {
    slug: 'sunset-realty',
    name: 'Sunset Realty Group',
    plan: 'STARTER',
    status: 'SUSPENDED',
    primaryColor: '#b5651d',
    subscription: { plan: 'STARTER', status: 'CANCELED', periodDays: -20 },
    admin: { email: 'admin@sunsetrealty.com', name: 'Gabriela Cruz' },
    members: [{ email: 'tyler@sunsetrealty.com', name: 'Tyler Brooks' }],
    listings: [
      { title: 'Desert Modern Retreat', price: 890000, address: '77 Cactus Bloom Rd', city: 'Scottsdale', state: 'AZ', beds: 3, baths: 3, sqft: 2400, type: 'HOUSE', status: 'ACTIVE', by: 'admin@sunsetrealty.com', images: 3, description: 'Clean-lined desert modern home with a negative-edge pool, mountain views, and drought-tolerant landscaping.' },
      { title: 'Old Town Adobe Condo', price: 415000, address: '12 Mission Plaza #5', city: 'Tucson', state: 'AZ', beds: 2, baths: 2, sqft: 1150, type: 'CONDO', status: 'DRAFT', by: 'tyler@sunsetrealty.com', images: 2, description: 'Charming adobe-style condo with a shaded courtyard, exposed beams, and walkable historic surroundings.' },
    ],
    leads: [
      { name: 'Owen Pierce', email: 'opierce@example.com', message: 'Is the desert home still listed? Your site shows suspended.', status: 'NEW', listing: 'Desert Modern Retreat' },
    ],
  },
]

// ─── Extra SuperAdmins (platform operators) ─────────────────────────────────
const SUPER_ADMINS = [
  { email: 'admin@luxereal.com', name: 'Alexandra Stone' },
  { email: 'owner@luxereal.com', name: 'Julian Vance' },
]

// ─── Seed helpers ────────────────────────────────────────────────────────────

/** Upsert a user with a role-appropriate password; returns the user id. */
async function upsertUser(
  email: string,
  name: string,
  passwordHash: string,
  isSuperAdmin = false
): Promise<string> {
  const user = await prisma.user.upsert({
    where: { email },
    update: { name, passwordHash, isSuperAdmin, emailVerified: new Date() },
    create: { email, name, passwordHash, isSuperAdmin, emailVerified: new Date() },
  })
  return user.id
}

/** Wipe volatile content so re-runs produce an identical dataset (FK-safe order). */
async function wipeVolatile() {
  await prisma.leadNote.deleteMany()
  await prisma.lead.deleteMany()
  await prisma.propertyImage.deleteMany()
  await prisma.property.deleteMany()
  await prisma.invitation.deleteMany()
  await prisma.auditLog.deleteMany()
}

async function main() {
  console.log('\n🌱  Seeding LuxeReal — full demo dataset\n')

  // Pre-hash the three shared passwords once (bcrypt is intentionally slow).
  const [superHash, adminHash, memberHash] = await Promise.all([
    bcrypt.hash(PW.SUPERADMIN, 12),
    bcrypt.hash(PW.ADMIN, 12),
    bcrypt.hash(PW.MEMBER, 12),
  ])

  await wipeVolatile()
  console.log('✓ Cleared volatile tables (properties, leads, notes, images, invitations, audit logs)')

  // ── SuperAdmins ────────────────────────────────────────────────────────────
  const superAdminIds: string[] = []
  for (const sa of SUPER_ADMINS) {
    superAdminIds.push(await upsertUser(sa.email, sa.name, superHash, true))
  }
  console.log(`✓ ${SUPER_ADMINS.length} SuperAdmins`)

  let orgCount = 0
  let adminCount = 0
  let memberCount = 0
  let listingCount = 0
  let leadCount = 0
  let noteCount = 0
  let inviteCount = 0

  for (const org of ORGS) {
    // Organization
    const organization = await prisma.organization.upsert({
      where: { slug: org.slug },
      update: { name: org.name, plan: org.plan, status: org.status },
      create: { slug: org.slug, name: org.name, plan: org.plan, status: org.status },
    })
    orgCount++

    // Settings (unique on organizationId)
    await prisma.orgSettings.upsert({
      where: { organizationId: organization.id },
      update: { primaryColor: org.primaryColor, customDomain: org.customDomain ?? null, allowPublicListings: true },
      create: {
        organizationId: organization.id,
        primaryColor: org.primaryColor,
        customDomain: org.customDomain ?? null,
        allowPublicListings: true,
      },
    })

    // Subscription
    await prisma.subscription.upsert({
      where: { organizationId: organization.id },
      update: {
        plan: org.subscription.plan,
        status: org.subscription.status,
        currentPeriodEnd: daysFromNow(org.subscription.periodDays ?? 30),
      },
      create: {
        organizationId: organization.id,
        stripeCustomerId: `cus_seed_${organization.id}`,
        stripeSubscriptionId: org.subscription.status === 'CANCELED' ? null : `sub_seed_${organization.id}`,
        plan: org.subscription.plan,
        status: org.subscription.status,
        currentPeriodEnd: daysFromNow(org.subscription.periodDays ?? 30),
      },
    })

    // Admin + members → build an email→userId map for this org
    const userIdByEmail: Record<string, string> = {}

    const adminId = await upsertUser(org.admin.email, org.admin.name, adminHash, false)
    userIdByEmail[org.admin.email] = adminId
    await prisma.membership.upsert({
      where: { userId_organizationId: { userId: adminId, organizationId: organization.id } },
      update: { role: 'ADMIN' },
      create: { userId: adminId, organizationId: organization.id, role: 'ADMIN' },
    })
    adminCount++

    for (const m of org.members) {
      const memberId = await upsertUser(m.email, m.name, memberHash, false)
      userIdByEmail[m.email] = memberId
      await prisma.membership.upsert({
        where: { userId_organizationId: { userId: memberId, organizationId: organization.id } },
        update: { role: 'MEMBER' },
        create: { userId: memberId, organizationId: organization.id, role: 'MEMBER' },
      })
      memberCount++
    }

    // Listings → map title→propertyId for lead linkage
    const propIdByTitle: Record<string, string> = {}
    for (const [i, l] of org.listings.entries()) {
      const createdById = userIdByEmail[l.by] ?? adminId
      const property = await prisma.property.create({
        data: {
          organizationId: organization.id,
          slug: slugify(l.title),
          title: l.title,
          description: l.description,
          price: l.price,
          address: l.address,
          city: l.city,
          state: l.state,
          beds: l.beds ?? null,
          baths: l.baths ?? null,
          sqft: l.sqft ?? null,
          propertyType: l.type,
          status: l.status,
          createdById,
          createdAt: daysAgo(org.listings.length - i + 2), // stagger for realistic ordering
          images: {
            create: nextImages(l.images).map((url, order) => ({ url, order })),
          },
        },
      })
      propIdByTitle[l.title] = property.id
      listingCount++
    }

    // Leads (+ notes)
    for (const [i, lead] of org.leads.entries()) {
      const created = await prisma.lead.create({
        data: {
          organizationId: organization.id,
          propertyId: lead.listing ? propIdByTitle[lead.listing] ?? null : null,
          name: lead.name,
          email: lead.email,
          phone: lead.phone ?? null,
          message: lead.message ?? null,
          status: lead.status,
          assignedTo: lead.assignee ? userIdByEmail[lead.assignee] ?? null : null,
          createdAt: daysAgo(org.leads.length - i),
        },
      })
      leadCount++

      for (const [j, note] of (lead.notes ?? []).entries()) {
        await prisma.leadNote.create({
          data: {
            leadId: created.id,
            authorId: userIdByEmail[note.by] ?? adminId,
            body: note.body,
            // Notes land an hour apart, just after the lead was created.
            createdAt: new Date(created.createdAt.getTime() + (j + 1) * 3600_000),
          },
        })
        noteCount++
      }
    }

    // Pending invitations
    for (const inv of org.invitations ?? []) {
      await prisma.invitation.create({
        data: {
          email: inv.email,
          organizationId: organization.id,
          role: inv.role,
          expiresAt: daysFromNow(7),
          invitedById: adminId,
        },
      })
      inviteCount++
    }

    console.log(
      `✓ ${org.name.padEnd(22)} [${org.plan}/${org.status}] — ` +
        `${org.members.length + 1} people, ${org.listings.length} listings, ${org.leads.length} leads`
    )
  }

  // ── Audit log samples (platform + org events) ────────────────────────────────
  const auditActor = superAdminIds[0]
  const firstOrg = await prisma.organization.findUnique({ where: { slug: 'sunset-realty' } })
  const auditSeed = [
    { action: 'org.created', targetType: 'Organization', actorType: 'SYSTEM' },
    { action: 'org.suspended', targetType: 'Organization', actorType: 'SUPERADMIN', organizationId: firstOrg?.id },
    { action: 'member.invited', targetType: 'User', actorType: 'USER' },
    { action: 'property.published', targetType: 'Property', actorType: 'USER' },
    { action: 'subscription.past_due', targetType: 'Organization', actorType: 'SYSTEM' },
  ]
  for (const [i, a] of auditSeed.entries()) {
    await prisma.auditLog.create({
      data: {
        actorId: auditActor,
        actorType: a.actorType,
        organizationId: a.organizationId ?? null,
        action: a.action,
        targetType: a.targetType,
        createdAt: daysAgo(auditSeed.length - i),
      },
    })
  }
  console.log(`✓ ${auditSeed.length} audit-log entries`)

  // ── Summary ──────────────────────────────────────────────────────────────
  console.log('\n─────────────────────────────────────────────')
  console.log('  Seed complete')
  console.log('─────────────────────────────────────────────')
  console.log(`  SuperAdmins : ${SUPER_ADMINS.length}`)
  console.log(`  Orgs        : ${orgCount}`)
  console.log(`  Org Admins  : ${adminCount}`)
  console.log(`  Members     : ${memberCount}`)
  console.log(`  Listings    : ${listingCount}`)
  console.log(`  Leads       : ${leadCount}  (+${noteCount} notes)`)
  console.log(`  Invitations : ${inviteCount}`)
  console.log('\n  Login credentials (password is shared per role):')
  console.log('  ┌ SuperAdmin')
  for (const sa of SUPER_ADMINS) console.log(`  │   ${sa.email.padEnd(32)} / ${PW.SUPERADMIN}`)
  console.log('  ├ Org Admins')
  for (const o of ORGS) console.log(`  │   ${o.admin.email.padEnd(32)} / ${PW.ADMIN}   (${o.name})`)
  console.log('  └ Members')
  for (const o of ORGS) for (const m of o.members) console.log(`      ${m.email.padEnd(32)} / ${PW.MEMBER}   (${o.name})`)
  console.log('')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
