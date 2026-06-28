# LuxeReal — Master Design System & UI/UX Rules

> **Source of truth** for every UI decision in this application.
> Read this file before touching any component, page, or style.
> Design system name: **Heritage & Horizon**

---

## 1. Brand Identity

| Attribute | Value |
|---|---|
| Brand name | **LuxeReal** |
| Tagline | "Find Your Legacy Home" |
| Founded | Since 1994 |
| Aesthetic | **Sophisticated Warmth** — Modern Minimalist with Tactile elements |
| Emotional target | Immediate trust, calm, exclusivity |
| Audience | High-net-worth individuals, discerning home seekers |

The brand personality is **authoritative yet welcoming** — bridging traditional luxury heritage with modern digital clarity. Photography is the primary visual driver; whitespace is the primary structural tool.

---

## 2. Color Tokens

All colors are defined as Tailwind CSS custom tokens. Use the token name — never hardcode hex values in components.

### Primary Surface Palette

| Token | Hex | Usage |
|---|---|---|
| `primary` | `#041627` | Deep Navy — brand presence, text on light, primary actions |
| `primary-container` | `#1a2b3c` | Slate Blue — hover states, footer bg, dark sections |
| `on-primary` | `#ffffff` | Text/icons on primary backgrounds |
| `on-primary-container` | `#8192a7` | Muted blue — secondary text on dark surfaces |
| `primary-fixed` | `#d2e4fb` | Light blue tint — selections, highlights |
| `primary-fixed-dim` | `#b7c8de` | Slightly darker tint — dark mode primary text |
| `inverse-primary` | `#b7c8de` | Dark mode primary variant |

### Surface Palette

| Token | Hex | Usage |
|---|---|---|
| `surface` | `#fcf9f8` | **Main page background** — warm cream white |
| `background` | `#fcf9f8` | Same as surface |
| `surface-bright` | `#fcf9f8` | Brightest surface |
| `surface-dim` | `#dcd9d9` | Dimmed surface for overlays |
| `surface-container-lowest` | `#ffffff` | Pure white cards |
| `surface-container-low` | `#f6f3f2` | Filter bars, nav search bg |
| `surface-container` | `#f0eded` | Section alternates, input bg |
| `surface-container-high` | `#eae7e7` | Map containers, form sections |
| `surface-container-highest` | `#e5e2e1` | Bento cards, darkest surface container |
| `surface-variant` | `#e5e2e1` | Chip/badge surfaces |
| `on-surface` | `#1b1c1c` | Primary body text |
| `on-surface-variant` | `#44474c` | Secondary descriptive text |
| `inverse-surface` | `#303030` | Dark mode surface |
| `inverse-on-surface` | `#f3f0ef` | Dark mode on-surface text |

### Secondary Palette

| Token | Hex | Usage |
|---|---|---|
| `secondary` | `#5f5e5b` | Warm gray — addresses, secondary labels |
| `on-secondary` | `#ffffff` | Text on secondary |
| `secondary-container` | `#e5e2dd` | Light warm gray containers |
| `secondary-fixed` | `#e5e2dd` | Fixed secondary container |
| `secondary-fixed-dim` | `#c9c6c2` | Dimmed secondary |
| `on-secondary-container` | `#656461` | Text on secondary containers |

### Tertiary / Accent Palette

| Token | Hex | Usage |
|---|---|---|
| `tertiary` | `#1e1408` | Deep brown — decorative |
| `on-tertiary` | `#ffffff` | Text on tertiary |
| `tertiary-container` | `#34281b` | Dark brown container |
| `tertiary-fixed` | `#f4dfcb` | **Warm Sand / Beige** — icon backgrounds, value card accents |
| `tertiary-fixed-dim` | `#d7c3b0` | **Sand** — dividers, testimonial border, subtle accents |
| `on-tertiary-fixed` | `#241a0e` | Text on warm sand |
| `on-tertiary-container` | `#a08e7d` | Muted brown text on dark container |

### Outline & Borders

| Token | Hex | Usage |
|---|---|---|
| `outline` | `#74777d` | Default border, icon color |
| `outline-variant` | `#c4c6cd` | Subtle dividers, card borders (`/20` or `/30` opacity) |
| `surface-tint` | `#4f6073` | Tint overlay on surfaces |

### Error

| Token | Hex | Usage |
|---|---|---|
| `error` | `#ba1a1a` | Error states, favorite-filled icon |
| `on-error` | `#ffffff` | Text on error |
| `error-container` | `#ffdad6` | Error bg |
| `on-error-container` | `#93000a` | Error text |

---

## 3. Typography

Two fonts only. No exceptions.

| Role | Font | Weights |
|---|---|---|
| **Headings / Display** | Playfair Display | 600, 700 |
| **Body / Labels / UI** | Inter | 400, 600, 700 |

### Type Scale

| Token | Font | Size | Line Height | Weight | Letter Spacing | Usage |
|---|---|---|---|---|---|---|
| `display-lg` | Playfair Display | 48px | 56px | 700 | -0.02em | Hero headlines, price on detail page |
| `headline-lg` | Playfair Display | 32px | 40px | 600 | — | Section headings desktop |
| `headline-lg-mobile` | Playfair Display | 28px | 36px | 600 | — | Section headings mobile |
| `headline-md` | Playfair Display | 24px | 32px | 600 | — | Card titles, sidebar headers |
| `body-lg` | Inter | 18px | 28px | 400 | — | Hero subtext, long descriptions |
| `body-md` | Inter | 16px | 24px | 400 | — | Standard body text, addresses |
| `label-md` | Inter | 14px | 20px | 600 | 0.05em | Nav links, button text, spec labels |
| `caption` | Inter | 12px | 16px | 400 | — | Badge text, small metadata |

### Typography Rules

- Large display headlines use **tighter** letter spacing (-0.02em) for a high-fashion editorial look
- Labels and tags use Inter **semi-bold** + **increased letter-spacing** + **uppercase** to distinguish from body
- Mobile: scale down display/headline ~15-20% (use `headline-lg-mobile`)
- Price values on cards: Playfair Display (`font-display-lg text-headline-md`)
- Address/specs on cards: Inter (`font-body-md text-secondary`)

---

## 4. Spacing System

All spacing is based on an **8px base unit**.

| Token | Value | Usage |
|---|---|---|
| `base` | 8px | Icon gaps, micro-spacing |
| `stack-sm` | 12px | Tight stacking within components |
| `stack-md` | 24px | Between elements within a section |
| `stack-lg` | 48px | **Between sections** — never less than this |
| `gutter` | 24px | Grid column gap |
| `margin-desktop` | 64px | Page side padding (desktop) |
| `margin-mobile` | 20px | Page side padding (mobile) |
| `container-max` | 1280px | Max page content width |

### Grid System

| Breakpoint | Columns | Gutter | Side Margin |
|---|---|---|---|
| Desktop (1440px+) | 12 | 24px | 64px |
| Tablet (768px–1024px) | 8 | 20px | 40px |
| Mobile (<768px) | 4 | 16px | 20px |

All page content: `max-w-container-max mx-auto px-margin-desktop`

---

## 5. Border Radius

| Token | Value | Usage |
|---|---|---|
| `DEFAULT` | 4px (0.25rem) | Minimal rounding, badge text containers |
| `lg` | 8px (0.5rem) | **Buttons**, inputs, select elements |
| `xl` | 12px (0.75rem) | Filter bars, form containers |
| `2xl` | 16px (1rem) | Section containers, hero search bar |
| `xl` (Tailwind `rounded-2xl`) | 1rem | Property gallery, CTA sections |
| `[40px]` | 40px | CTA banner sections |
| `full` | 9999px | Pills, avatar circles, nav search |

**Rule:** Cards and primary sections use 16px (rounded-xl minimum). Buttons and inputs use 8px. Pills use `rounded-full`. Never change border-radius on hover.

---

## 6. Elevation & Shadow

| Level | CSS | Usage |
|---|---|---|
| L0 | none | Flat, no shadow |
| L1 | `shadow-[0px_4px_20px_rgba(0,0,0,0.04)]` | **Property cards** (default state) |
| L2 | `shadow-[0px_10px_40px_rgba(0,0,0,0.08)]` | Cards on hover, dropdowns, sidebar |
| L3 | `shadow-xl` | Modals, testimonial image, tour form |

Use `shadow-sm` on navbar. Always pair shadow with `bg-surface-container-lowest` or `bg-surface` for cards — never shadow on colored backgrounds.

---

## 7. Motion & Animation System

All transitions use the **standard easing** curve: `cubic-bezier(0.4, 0, 0.2, 1)` (Material Design standard).

```css
.transition-standard { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
```

### Named Animation Patterns

| Pattern | Implementation | Where Used |
|---|---|---|
| **Card image zoom** | `group-hover:scale-110 transition-transform duration-700` | All property card images |
| **Card lift** | `hover:shadow-[0px_10px_40px_rgba(0,0,0,0.08)] transition-all duration-300` | Property cards |
| **Float up** | `hover:-translate-y-2 transition-standard` | Value/pillar cards |
| **Section reveal** | `IntersectionObserver` → `opacity-0 translate-y-10` → `opacity-100 translate-y-0 duration-700` | All `<section>` tags |
| **Navbar shrink** | `scroll > 50 → py-2 shadow-md` | Fixed navbar on scroll |
| **Button press** | `active:scale-95` | All buttons micro-interaction |
| **Arrow slide** | `hover:gap-4 transition-all` | "View All" links with arrow |
| **FAQ accordion** | `rotate(180deg)` on chevron, height reveal | FAQ items |
| **Image hover reveal** | `opacity-0 group-hover:opacity-100 transition-opacity` | Gallery "View All" overlay |
| **Globe spin** | `animate-[spin_60s_linear_infinite]` | About page global reach |
| **Glassmorphism** | `bg-surface/80 backdrop-blur-md` | Navbar, hero search bar |

### Animation Rules

- **Never** use `transition: all` for performance-sensitive animations — use `transition-transform` or `transition-colors` where possible
- Section entrance animations use `duration-700` — slower feels more premium
- Hover micro-interactions use `duration-300` — snappy feedback
- Image zoom always uses `duration-700` — cinematic, not jarring
- Glassmorphism blur: always `backdrop-blur-md` (12px)
- Do not add animations to text content — only structural/visual elements

---

## 8. Component Specifications

### 8.1 Navbar (TopNavBar)

```
Structure: Fixed, full-width, max-w-container-max centered
Background: bg-surface/80 backdrop-blur-md
Default: py-4 shadow-sm
Scrolled (>50px): py-2 shadow-md
z-index: z-50

Left: Logo (Playfair Display, headline-md, text-primary)
Center: Nav links (Inter label-md, text-secondary → hover:text-primary)
Active link: border-b-2 border-primary pb-1 text-primary
Right: Search pill (hidden on mobile) + "List Your Property" pill button
Mobile: hamburger menu (md:hidden)
```

### 8.2 Footer

```
Background: bg-primary
Text: text-on-primary
Structure: max-w-container-max mx-auto
Row 1: Logo + legal links (text-on-primary/70 → hover:text-on-primary)
Row 2 (bordered): copyright text + social icons
Social icons: material-symbols-outlined (public, mail, call)
```

### 8.3 PropertyCard

```
Container: bg-surface-container-lowest rounded-xl overflow-hidden
           shadow-[0px_4px_20px_rgba(0,0,0,0.04)]
           hover:shadow-[0px_10px_40px_rgba(0,0,0,0.08)]
           transition-all duration-300
           group (for child hover targets)

Image area: relative h-64 overflow-hidden
  Image: w-full h-full object-cover group-hover:scale-110 transition-transform duration-700
  Badges: absolute top-4 left-4 flex gap-2
    Badge: bg-primary/80 backdrop-blur text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter
  Favorite: absolute top-4 right-4 w-10 h-10 rounded-full bg-surface/20 backdrop-blur

Body: p-6
  Price: font-display-lg text-headline-md text-primary
  Address: font-body-md text-secondary mb-4
  Specs row: flex items-center gap-4, border-y border-outline-variant/20 py-3
    Spec: material-symbols-outlined text-[18px/20px] + font-label-md text-label-md
  CTA button: full-width, border border-primary text-primary rounded-lg
              hover:bg-primary hover:text-on-primary
              group-hover:bg-primary group-hover:text-on-primary
```

### 8.4 Buttons

```
Primary:
  bg-primary text-on-primary px-6 py-2 rounded-full (nav)
  bg-primary text-on-primary px-10 py-4 rounded-xl (hero/CTA)
  hover:opacity-90 OR hover:bg-primary-container
  transition-standard

Secondary (outline):
  border border-primary text-primary
  hover:bg-primary hover:text-on-primary
  rounded-full OR rounded-xl depending on context

Ghost (on dark):
  bg-transparent border border-white text-white
  hover:bg-white/10

Inverse (on primary bg):
  bg-surface text-primary hover:bg-surface-dim
```

### 8.5 Input Fields / Forms

```
Background: bg-surface OR bg-surface-container-low
Border: border-outline-variant/50 OR border-tertiary-fixed-dim
Radius: rounded-lg
Padding: px-4 py-3
Focus: focus:border-primary focus:ring-1 focus:ring-primary focus:ring-0 (choose consistently)
Text: font-body-md text-on-surface
Placeholder: placeholder:text-secondary OR placeholder:text-on-surface-variant
Labels: font-label-md text-label-md text-secondary (above input)
```

### 8.6 Section Layout Pattern

Every content section follows this pattern:

```html
<section class="py-stack-lg px-margin-desktop max-w-container-max mx-auto">
  <!-- Section Header -->
  <div class="flex justify-between items-end mb-stack-lg">
    <div>
      <span class="font-label-md text-label-md text-on-primary-container tracking-widest uppercase">Eyebrow Label</span>
      <h2 class="font-display-lg text-headline-lg text-primary mt-2">Section Title</h2>
    </div>
    <!-- Optional action -->
  </div>
  <!-- Content -->
</section>
```

Alternating background sections use `bg-surface-container-low py-stack-lg`.

### 8.7 Badge / Chip

```
For Sale / New Listing (on image):
  bg-primary/80 backdrop-blur text-white
  px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter

Status tags (in content):
  bg-tertiary-fixed text-on-tertiary-fixed OR bg-secondary-container text-on-secondary-container
  px-3 py-1 rounded font-label-md text-caption uppercase tracking-wider

Location chips (compact):
  bg-surface/90 text-primary px-3 py-1 rounded font-label-md text-caption
```

### 8.8 Hero Section

```
Height: min-h-[600px] (varies: ~921px homepage)
Image: absolute inset-0 object-cover
Overlay: absolute inset-0 bg-primary/20 (subtle)
Content: relative z-10, centered, text-white
Headline: drop-shadow-md for readability over image

Search bar (glassmorphism):
  glass-effect (backdrop-filter: blur(12px); background: rgba(252,249,248,0.85))
  p-base rounded-2xl shadow-xl max-w-4xl
  Divided sections with border-r border-outline-variant/30
```

### 8.9 Gallery Grid (Property Detail)

```
grid grid-cols-12 gap-4 h-[600px] overflow-hidden rounded-xl
Main image: col-span-8 (lg) — group hover scale-105 duration-700
Secondary images: col-span-4 grid-rows-2 gap-4
  Each: rounded-xl overflow-hidden, hover reveal overlay
```

### 8.10 Agent Card

```
group relative bg-surface-container rounded-xl overflow-hidden shadow-sm
hover:shadow-xl transition-all

Image area: aspect-[3/4] overflow-hidden
  group-hover:scale-110 transition-transform duration-500

Body: p-6 bg-surface border-t border-outline-variant/10
  Role: font-label-md text-caption text-on-primary-container uppercase
  Name: font-display-lg text-headline-md text-primary
  Specialty: font-body-md text-secondary
  Button: full-width rounded-full outline
          group-hover:bg-primary group-hover:text-on-primary
```

---

## 9. Page Routing (Next.js App Router)

Production route naming — all lowercase, hyphenated, semantic:

| Page | Route | File |
|---|---|---|
| Home / Landing | `/` | `app/page.tsx` |
| Property Listings | `/properties` | `app/properties/page.tsx` |
| Property Detail | `/properties/[slug]` | `app/properties/[slug]/page.tsx` |
| About | `/about` | `app/about/page.tsx` |
| Agents Directory | `/agents` | `app/agents/page.tsx` |
| Contact & Inquiry | `/contact` | `app/contact/page.tsx` |

**Authenticated app routes (Phase 1+3)** — these render their own sidebar shell
(no marketing Navbar/Footer; see `components/layout/SiteChrome.tsx`):

| Area | Route | Notes |
|---|---|---|
| Auth | `/login`, `/register`, `/forgot-password`, `/reset-password`, `/invite/accept` | Full-screen auth shell |
| Org dashboard | `/org/[slug]/{dashboard,listings,leads,members,analytics,settings,billing,profile}` | Role-aware sidebar; `settings`/`billing` are admin-only |
| SuperAdmin | `/superadmin`, `/superadmin/{organizations,organizations/[orgId],users,audit-log,feature-flags,settings}` | Distinct navy "Platform Control" shell |

Dashboard UI primitives live in `components/dashboard/` (StatCard, DataTable,
RoleBadge, StatusBadge, MemberAvatar, EmptyState, Modal, ConfirmDialog,
PlanUsageMeter, ImpersonationBanner, BarChart, PageHeader).

> **Note:** `/about` tells the brand story and shows a 4-advisor teaser; `/agents`
> is the full, searchable advisor directory. The nav "Agents" item links to
> `/agents`, "About" to `/about` — they must use distinct hrefs so only one is
> highlighted as active at a time.

**Route naming rules:**
- Use `/properties` not `/listings` or `/product-listing`
- Use `/properties/[slug]` not `/properties/[id]` — slugs are SEO-friendly
- No camelCase in routes (`/propertyDetail` ❌ → `/properties/[slug]` ✓)
- No abbreviations (`/prop` ❌)

---

## 10. Folder & File Architecture

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (navbar + footer)
│   ├── page.tsx                  # Home
│   ├── properties/
│   │   ├── page.tsx              # Listings
│   │   └── [slug]/
│   │       └── page.tsx          # Property Detail
│   ├── about/
│   │   └── page.tsx
│   ├── contact/
│   │   └── page.tsx
│   └── globals.css               # Tailwind base + custom CSS
│
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── ui/                       # Atomic, stateless primitives
│   │   ├── Button.tsx
│   │   ├── Badge.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   └── SectionHeader.tsx
│   ├── property/                 # Property-domain components
│   │   ├── PropertyCard.tsx
│   │   ├── PropertyGrid.tsx
│   │   ├── PropertyFilterBar.tsx
│   │   ├── PropertyGallery.tsx
│   │   ├── PropertySpecs.tsx
│   │   ├── AmenityItem.tsx
│   │   └── SimilarProperties.tsx
│   ├── home/                     # Home-page-specific sections
│   │   ├── HeroSection.tsx
│   │   ├── HeroSearchBar.tsx
│   │   ├── FeaturedListings.tsx
│   │   ├── ValuePillars.tsx
│   │   └── TestimonialSection.tsx
│   ├── about/
│   │   ├── AgentCard.tsx
│   │   ├── AgentGrid.tsx          # About-page advisor teaser (first 4)
│   │   ├── AgentDirectory.tsx     # /agents searchable + region-filterable roster
│   │   └── GlobalReach.tsx
│   └── contact/
│       ├── ContactForm.tsx
│       ├── FAQItem.tsx
│       └── FAQSection.tsx
│
├── hooks/
│   ├── useScrollShrink.ts        # Navbar shrink on scroll
│   └── useIntersectionReveal.ts  # Section entrance animation
│
├── lib/
│   └── utils.ts                  # cn() class merge utility
│
└── types/
    ├── property.ts               # Property, Agent interfaces
    └── index.ts
```

---

## 11. TypeScript Rules

```typescript
// Always define Props interfaces
interface PropertyCardProps {
  id: string
  slug: string
  title: string
  price: number
  address: string
  beds: number
  baths: number
  sqft: number
  imageUrl: string
  badges?: string[]
  isFavorited?: boolean
  onFavoriteToggle?: (id: string) => void
}

// Use cn() for conditional class merging
import { cn } from '@/lib/utils'
// cn() = clsx + tailwind-merge

// Named exports only — no default exports for components
export function PropertyCard({ ... }: PropertyCardProps) { ... }

// Server Components by default
// Add 'use client' only when: useState, useEffect, event handlers, browser APIs

// Strict null checks — never use `!` non-null assertion except on confirmed refs
// Use optional chaining: property?.agent?.name
```

---

## 12. Tailwind CSS Configuration

The full token set lives in `tailwind.config.ts`. Key extensions:

```typescript
// tailwind.config.ts
theme: {
  extend: {
    colors: { /* all tokens from DESIGN.md section 2 */ },
    fontFamily: {
      'display-lg': ['Playfair Display', 'serif'],
      'headline-lg': ['Playfair Display', 'serif'],
      'headline-md': ['Playfair Display', 'serif'],
      'body-lg': ['Inter', 'sans-serif'],
      'body-md': ['Inter', 'sans-serif'],
      'label-md': ['Inter', 'sans-serif'],
      'caption': ['Inter', 'sans-serif'],
    },
    fontSize: {
      'display-lg': ['48px', { lineHeight: '56px', letterSpacing: '-0.02em', fontWeight: '700' }],
      'headline-lg': ['32px', { lineHeight: '40px', fontWeight: '600' }],
      'headline-lg-mobile': ['28px', { lineHeight: '36px', fontWeight: '600' }],
      'headline-md': ['24px', { lineHeight: '32px', fontWeight: '600' }],
      'body-lg': ['18px', { lineHeight: '28px', fontWeight: '400' }],
      'body-md': ['16px', { lineHeight: '24px', fontWeight: '400' }],
      'label-md': ['14px', { lineHeight: '20px', letterSpacing: '0.05em', fontWeight: '600' }],
      'caption': ['12px', { lineHeight: '16px', fontWeight: '400' }],
    },
    spacing: {
      'base': '8px',
      'stack-sm': '12px',
      'stack-md': '24px',
      'stack-lg': '48px',
      'gutter': '24px',
      'margin-desktop': '64px',
      'margin-mobile': '20px',
      'container-max': '1280px',
    },
    borderRadius: {
      'DEFAULT': '0.25rem',
      'lg': '0.5rem',
      'xl': '0.75rem',
      'full': '9999px',
    },
  }
}
```

Global CSS additions in `globals.css`:

```css
.glass-effect {
  backdrop-filter: blur(12px);
  background-color: rgba(252, 249, 248, 0.85);
}
.transition-standard {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
```

---

## 13. Icons

Use **Material Symbols Outlined** only. Loaded via Google Fonts.

```html
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1" rel="stylesheet" />
```

Key icons used across pages:

| Icon | Usage |
|---|---|
| `search` | Navbar search, hero search button |
| `bed` | Bedroom count |
| `bathtub` | Bathroom count |
| `square_foot` | Square footage |
| `landscape` | Lot size |
| `location_on` | Address, map pin |
| `favorite` | Save/wishlist property |
| `arrow_forward` | CTA links, pagination |
| `chevron_left/right` | Carousel, pagination |
| `grid_view` | Grid view toggle |
| `map` | Map view toggle |
| `filter_list` | Filter apply button |
| `photo_camera` | Photo count on gallery |
| `pool` | Infinity pool amenity |
| `verified_user` | Trust pillar |
| `insights` | Market expertise |
| `concierge` | Premium service |
| `expand_more` | FAQ accordion |
| `menu` | Mobile hamburger |

---

## 14. Page-by-Page Section Inventory

### Home (`/`)

1. **Navbar** — fixed, glassmorphism
2. **HeroSection** — full-bleed image, dark overlay, centered headline + subtext, glassmorphism SearchBar
3. **FeaturedListings** — eyebrow + headline, 3-col PropertyCard grid, "View All" link
4. **ValuePillars** — `bg-surface-container-low`, 3-col icon + title + text cards, float-up hover
5. **TestimonialSection** — 50/50 split: portrait with quote overlay + testimonial text + nav arrows
6. **CTABanner** — `bg-primary rounded-[40px]`, blur accent, two buttons
7. **Footer**

### Properties (`/properties`)

1. **Navbar**
2. **PageHeader** — display-lg title + description, Grid/Map view toggle
3. **PropertyFilterBar** — `bg-surface-container-low rounded-xl`, 4 select dropdowns + Apply button
4. **PropertyGrid** — 3-col responsive grid of PropertyCards with favorite toggle
5. **Pagination** — prev/next chevrons + numbered pages + count label
6. **Footer**

### Property Detail (`/properties/[slug]`)

1. **Navbar** (shrinks on scroll)
2. **PropertyGallery** — 12-col grid: large image (col-span-8) + 2 stacked small (col-span-4), photo count badge
3. **PropertyDetail layout** — `flex-col lg:flex-row gap-12`
   - **Left**: Title + badges, price, key specs grid, description text, AmenityGrid, MapEmbed
   - **Right**: Sticky TourScheduleSidebar — in-person/video toggle, form, agent contact card
4. **SimilarProperties** — 3-col PropertyCard grid (compact variant)
5. **Footer**

### About (`/about`)

1. **Navbar**
2. **OurStory** — 5/12 + 7/12 split: text with eyebrow "Since 1994" + glass card overlay stat
3. **CoreValues** — `bg-surface-container-low`, 3-col: Integrity, Discretion, Excellence
4. **AgentGrid** — 4-col teaser of advisors; "View All Advisors" → `/agents`
5. **GlobalReach** — `bg-primary` section: office grid + spinning globe visual
6. **Footer**

### Agents (`/agents`)

1. **Navbar**
2. **AgentsHero** — eyebrow + display-lg title + intro + quick stat row (advisors, markets, sales)
3. **AgentDirectory** — `bg-surface-container-low` filter bar (search + region select) + responsive
   4-col AgentCard grid + live result count + EmptyState
4. **JoinTeamCTA** — `bg-primary rounded-[40px]` recruitment banner with two CTAs
5. **Footer**

### Contact (`/contact`)

1. **Navbar**
2. **ContactHero** — 5/12 contact info + 7/12 map background image with gradient fade
3. **InquiryForm** — 2-col card: `bg-primary` info panel + form panel
4. **SellSection** — bento: `md:col-span-2` global visibility card + `bg-primary` email capture card
5. **FAQSection** — 1/3 intro + 2/3 accordion items
6. **Footer**

---

## 15. Reusable Hooks

### `useScrollShrink`

Drives navbar shrink behavior:

```typescript
export function useScrollShrink(threshold = 50) {
  const [isScrolled, setIsScrolled] = useState(false)
  useEffect(() => {
    const handler = () => setIsScrolled(window.scrollY > threshold)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [threshold])
  return isScrolled
}
```

### `useIntersectionReveal`

Drives section entrance animations:

```typescript
export function useIntersectionReveal(threshold = 0.1) {
  const ref = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true) },
      { threshold }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [threshold])
  return { ref, isVisible }
}
// Usage: className={cn('transition-all duration-700', isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10')}
```

---

## 16. Accessibility Rules

- All images must have descriptive `alt` text (property photos, agent portraits)
- Color contrast: `text-on-surface` (#1b1c1c) on `surface` (#fcf9f8) — meets WCAG AA
- Focus states: always use `focus:ring-1 focus:ring-primary` on interactive inputs
- Keyboard navigation: buttons and links must be reachable
- `aria-label` on icon-only buttons (favorite, nav arrows)
- FAQ accordion: use `aria-expanded` and `aria-controls`
- Navbar mobile: `aria-label="Main navigation"`

---

## 17. Do's and Don'ts

### Do
- Use `group` class on card containers to enable child hover targets
- Use `overflow-hidden` on card image wrappers to contain the scale-110 zoom
- Keep section padding consistent: `py-stack-lg px-margin-desktop max-w-container-max mx-auto`
- Apply `transition-all duration-300` for hover states, `duration-700` for entrance animations
- Use `backdrop-blur-md` with `bg-surface/80` for the glassmorphism nav effect
- Type all component props with explicit TypeScript interfaces
- Use `'use client'` only when strictly necessary

### Don't
- Never hardcode color hex values — use tokens
- Never use `!important`
- Never change `border-radius` on hover
- Never use `transition: all` on layout-affecting properties like `width` or `height`
- Never use inline styles except for `font-variation-settings` on Material Symbols
- Never use default exports on components
- Never use `<img>` without `alt` text
- Never nest sections more than 2 levels deep
- Never add drop shadows to colored/dark backgrounds

---

*This document is the single source of truth for LuxeReal UI. Update it when design decisions change.*
