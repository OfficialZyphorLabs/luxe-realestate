<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

---

# LuxeReal Agent Instructions

## Critical — Read First

1. **Read `DESIGN.md`** before writing any UI code. It is the single source of truth for colors, spacing, typography, animation, components, and routes.
2. **Read `node_modules/next/dist/docs/`** before using any Next.js API — this is a non-standard version.
3. These two files together define every decision you need to make. Do not invent patterns not found in either.

---

## Project Overview

**LuxeReal** is a premium real estate platform. Design system: **Heritage & Horizon**. Aesthetic: Sophisticated Warmth — Modern Minimalist with cinematic motion.

Stack: Next.js (App Router) · TypeScript (strict) · Tailwind CSS v4 · Material Symbols Outlined icons

---

## Application Routes

| Route | Page |
|---|---|
| `/` | Home — hero, featured listings, value pillars, testimonials, CTA |
| `/properties` | Listings — filter bar, property grid, pagination |
| `/properties/[slug]` | Property Detail — gallery, specs, amenities, map, tour form |
| `/about` | About & Agents — story, values, agent grid, global reach |
| `/contact` | Contact — inquiry form, FAQ, sell section |

Route rule: lowercase, hyphenated, semantic. Never `/productListing`, `/productDetail`, or abbreviated forms.

---

## File Structure

```
src/
├── app/                    # App Router pages
├── components/
│   ├── layout/             # Navbar, Footer
│   ├── ui/                 # Button, Badge, Input, SectionHeader (atoms)
│   ├── property/           # PropertyCard, PropertyGrid, FilterBar, Gallery, Specs
│   ├── home/               # HeroSection, HeroSearchBar, FeaturedListings, ValuePillars
│   ├── about/              # AgentCard, AgentGrid, GlobalReach
│   └── contact/            # ContactForm, FAQItem, FAQSection
├── hooks/                  # useScrollShrink, useIntersectionReveal
├── lib/                    # utils.ts (cn helper)
└── types/                  # property.ts, index.ts
```

---

## TypeScript Rules

- **Strict mode** — no `any`, no `!` non-null assertions unless on confirmed DOM refs
- **Named exports only** — no default exports on components
- **Explicit Props interfaces** for every component
- **`'use client'`** only when: useState, useEffect, event handlers, or browser APIs are needed
- Server Components are the default — keep them server-side when possible
- Use `cn()` from `@/lib/utils` for conditional Tailwind classes (clsx + tailwind-merge)

---

## UI/UX Enforcement Rules

These are hard rules — not suggestions:

### Colors
- **Never hardcode hex values.** Use Tailwind color tokens defined in `DESIGN.md § 2`.
- Background default: `bg-surface` (`#fcf9f8`)
- Primary action color: `bg-primary` (`#041627`)
- Body text: `text-on-surface` (`#1b1c1c`)
- Secondary text (addresses, descriptions): `text-secondary` (`#5f5e5b`)

### Typography
- Headlines / prices: `font-display-lg` or `font-headline-*` (Playfair Display)
- Body / labels / buttons: `font-body-md`, `font-label-md` (Inter)
- Never mix font families outside these roles
- Label text: always add `uppercase tracking-widest` for eyebrow labels

### Spacing
- Page sections: always `py-stack-lg px-margin-desktop max-w-container-max mx-auto`
- Between sections: minimum `py-stack-lg` (48px) — never less

### Buttons
- Primary: `bg-primary text-on-primary rounded-full px-6 py-2` (nav) or `rounded-xl px-10 py-4` (CTA)
- Secondary: `border border-primary text-primary hover:bg-primary hover:text-on-primary`
- **Never change `border-radius` on hover**

### Cards
- Container: `rounded-xl overflow-hidden shadow-[0px_4px_20px_rgba(0,0,0,0.04)]`
- Hover: `hover:shadow-[0px_10px_40px_rgba(0,0,0,0.08)] transition-all duration-300`
- Add `group` class to the container when children need hover targeting

### Animation (Cinematography Rules)
- Image zoom on hover: `group-hover:scale-110 transition-transform duration-700`
- Section entrance: `IntersectionObserver` — sections start `opacity-0 translate-y-10`, reveal to `opacity-100 translate-y-0 duration-700`
- Navbar shrink on scroll: use `useScrollShrink` hook from `hooks/useScrollShrink.ts`
- Button press feedback: `active:scale-95`
- Card float: `hover:-translate-y-2 transition-standard`
- Smooth page feel: `duration-300` for hover, `duration-700` for reveals

### Glassmorphism
- Navbar: `bg-surface/80 backdrop-blur-md`
- Hero search bar: `glass-effect` class (defined in globals.css)

### Icons
- Use Material Symbols Outlined exclusively
- Set via: `font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24`
- For filled state (favorite active): `font-variation-settings: 'FILL' 1, 'wght' 400`
- `aria-label` required on icon-only buttons

---

## Reusable Hooks

### `useScrollShrink(threshold?: number)`
Tracks scroll position for navbar shrink. Returns boolean `isScrolled`.

### `useIntersectionReveal(threshold?: number)`
Returns `{ ref, isVisible }` for section entrance animations.

```tsx
const { ref, isVisible } = useIntersectionReveal()
<section
  ref={ref}
  className={cn(
    'transition-all duration-700',
    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
  )}
>
```

---

## Component Checklist (before marking a component done)

- [ ] Props interface defined with TypeScript
- [ ] Named export (not default)
- [ ] Uses only color tokens from `DESIGN.md`
- [ ] Uses spacing tokens (`py-stack-lg`, `px-margin-desktop`, etc.)
- [ ] Hover/focus animations follow `DESIGN.md § 7`
- [ ] `overflow-hidden` applied wherever image zoom is used
- [ ] `group` class used when child hover targets exist
- [ ] `alt` text on all images
- [ ] `aria-label` on icon-only interactive elements
- [ ] `'use client'` only if event handlers or hooks are present

---

## Do Not Do

- Do not hardcode `#041627` or any hex — use `text-primary`, `bg-primary`, etc.
- Do not use `!important`
- Do not create pages outside the 5 defined routes without updating `DESIGN.md`
- Do not use `default export` for components
- Do not change border-radius on hover
- Do not add `transition: all` to layout-affecting properties
- Do not use inline styles except for `font-variation-settings` on icons
- Do not use `<img>` without `alt`
- Do not invent new design patterns — check `DESIGN.md` first
