# LuxeReal — Business Plan

> A strategic view of LuxeReal as a commercial product: who buys it, why, how we
> make money, and how we win. Companion docs: [`PRODUCT_ROADMAP.md`](./PRODUCT_ROADMAP.md)
> (what to build) and [`GO_TO_MARKET.md`](./GO_TO_MARKET.md) (how to sell).
>
> _Market figures below are directional estimates and must be validated before
> any funding or hiring decision — treat them as hypotheses, not facts._

---

## 1. One-line pitch

**LuxeReal is an all-in-one, white-label platform that gives boutique and luxury
real-estate agencies a beautiful branded website, a listings manager, and a lead
CRM — in one subscription, without a web developer.**

Think **"Luxury Presence meets Follow Up Boss," but self-serve and affordable.**

---

## 2. The problem we solve

A small brokerage or independent luxury agent today has to stitch together:

| Need | What they use now | Pain |
|---|---|---|
| A branded website | Squarespace / Wix / a $5–15k agency build | Generic, slow to change, not real-estate-aware |
| Listing management | Spreadsheets, the MLS back-office | No control over presentation, no own-brand catalog |
| Lead capture & follow-up | Inbox, WhatsApp, sticky notes | Leads leak, no pipeline, no accountability |
| A CRM | Follow Up Boss / kvCORE ($50–500/mo) | Expensive, over-built, ugly, steep learning curve |
| Team management | — | No roles, no oversight of who did what |

They pay **3–5 separate tools** and still get a disjointed, off-brand experience.
The luxury segment feels this most acutely — **presentation is the product**, and
today's tools look like accounting software.

**LuxeReal collapses website + listings + leads + team into one subscription
with a genuinely premium design.**

---

## 3. Why this is sellable (our unfair advantages)

1. **Design is the moat.** The "Heritage & Horizon" system already looks like a
   $15k custom build. In luxury real estate, aesthetics *are* the buying trigger.
   Most competitors (kvCORE, LionDesk, Placester) look dated and utilitarian.
2. **Genuinely multi-tenant + white-label from day one.** Each agency gets its
   own branded public catalog (`/org/[slug]/public`) with their logo and colors.
   Custom-domain support is one step away (the schema field already exists).
3. **All-in-one, not another point tool.** Website *and* CRM *and* team roles in
   one place — fewer logins, one bill, one source of truth.
4. **Modern, fast foundation.** Next.js 16 + Postgres + Stripe + RBAC + audit
   logging + row-level tenant isolation are already built — the "boring hard
   parts" of SaaS are done, so we can move fast on features that sell.
5. **Self-serve.** Sign up → branded site + CRM in minutes. Competitors often
   require a sales call and onboarding fees.

---

## 4. Target customer (ICP)

### Primary ICP — "The boutique luxury brokerage"
- 2–20 agents, independent or a small franchise office
- Sells $1M+ homes; brand & presentation matter enormously
- Currently overpaying for a generic website + a clunky CRM
- Decision-maker: **the broker/owner** (not IT) — buys on look + simplicity

### Secondary ICPs
- **Solo top-producing agents** who want to look bigger than they are
- **Property management firms** (rentals) — needs a listings + inquiry funnel
- **New developments / sales galleries** — a branded catalog for one project
- **Real-estate teams inside a larger franchise** wanting their own micro-brand

### Buyer personas
| Persona | Cares about | Buying trigger |
|---|---|---|
| **Broker/Owner** | Brand, lead volume, team accountability, price | "Our website is embarrassing / leads are leaking" |
| **Agent** | Easy listing entry, not losing leads, looking premium | "I close from my phone, tools must be fast" |
| **Office admin** | One tool, easy onboarding of new agents | "I waste hours moving data between apps" |

---

## 5. Market (validate these)

- **US:** ~1.5M NAR members; hundreds of thousands of small teams/brokerages.
- **Global proptech / real-estate-SaaS:** a multi-billion-dollar, fast-growing
  category (agent CRMs, IDX websites, transaction tools).
- **Serviceable niche (our beachhead):** boutique + luxury agencies and
  top-producer solo agents in English-speaking markets (US, UK, UAE, AU, CA).
- **Bottoms-up sanity check:** 2,000 paying orgs × ~$150/mo ≈ **$3.6M ARR**.
  10,000 orgs × $150 ≈ **$18M ARR**. The niche is big enough for a strong
  bootstrapped or venture-scale business.

> **Action:** validate with 15–20 broker interviews before heavy investment.

---

## 6. Competitive landscape

| Competitor | What they do | Where we win | Where they win (today) |
|---|---|---|---|
| **Luxury Presence** | High-end agent websites | Self-serve, cheaper, includes CRM | Brand, done-for-you, SEO, integrations |
| **Follow Up Boss** | Best-in-class RE CRM | All-in-one + website + design | Deep CRM, integrations, mindshare |
| **kvCORE / BoldTrail** | All-in-one platform | Design, simplicity, price | IDX/MLS, scale, lead products |
| **Placester / AgentFire** | RE websites + IDX | Design, modern stack, multi-tenant | IDX, SEO, template library |
| **Squarespace/Wix** | Generic websites | RE-aware CRM + listings + leads | Ecosystem, cheap, familiar |

**Positioning statement:**
> _For boutique and luxury real-estate agencies who are tired of ugly, expensive,
> stitched-together tools, LuxeReal is the all-in-one branded website + CRM that
> looks like a custom build and runs itself — unlike kvCORE or a Squarespace +
> Follow Up Boss combo, LuxeReal is beautiful, self-serve, and one bill._

**Biggest strategic gap to close vs. incumbents:** **IDX/MLS integration** (see
`PRODUCT_ROADMAP.md`). Without listing syndication we win on brand + CRM; with it
we're a full replacement.

---

## 7. Pricing & packaging

Current plans (Starter/Growth/Enterprise) are the right shape. Proposed
market-ready packaging (validate willingness-to-pay in interviews):

| Plan | Price (mo, billed annually) | Seats | Listings | Key gates |
|---|---|---|---|---|
| **Starter** | $49–79 | up to 3 | 25 | Branded catalog, CRM, 1 subdomain |
| **Growth** | $149–199 | up to 15 | 150 | Custom domain, analytics, email seq., integrations |
| **Enterprise** | Custom | Unlimited | Unlimited | IDX/MLS, SSO, multi-office, API, priority support |

**Monetization levers beyond the base subscription:**
- **Custom domain / white-label** as a paid upgrade (already schema-supported).
- **Per-seat overages** for growing teams.
- **Add-ons:** AI listing copy, SMS credits, virtual staging, extra storage.
- **Setup/migration fee** for Enterprise (also a services revenue line).
- **Lead-gen marketplace** (later): charge for qualified buyer leads.

**Pricing principles:** anchor on "replaces a $15k website + a $200/mo CRM,"
annual billing default (cash + retention), 14-day trial (already built), no
credit card to start.

---

## 8. Revenue model & simple projections (illustrative)

Assumptions: $150 blended ARPA/mo, 3% monthly churn, self-serve + light sales.

| Milestone | Paying orgs | MRR | ARR |
|---|---|---|---|
| Pilot (design partners) | 10 | $1.5k | $18k |
| Early traction | 100 | $15k | $180k |
| Product-market fit signal | 500 | $75k | $900k |
| Scale | 2,000 | $300k | $3.6M |

**Unit economics targets:** LTV:CAC ≥ 3:1, gross margin ≥ 80% (typical SaaS),
CAC payback < 12 months. Churn is the #1 risk in SMB SaaS — the roadmap's
"stickiness" features (CRM depth, integrations, data lock-in via listings) exist
largely to defend retention.

---

## 9. Key risks & mitigations

| Risk | Mitigation |
|---|---|
| **No IDX/MLS = not a full replacement** | Prioritize IDX for the beachhead market; partner/aggregate feeds |
| **SMB churn is high** | Deepen CRM value, integrations, and data lock-in; annual billing |
| **Crowded CRM market** | Don't compete on CRM depth — win on design + all-in-one + price |
| **Solo-founder execution bandwidth** | Ruthless roadmap prioritization (see impact×effort table) |
| **Trust/compliance (fair housing, GDPR, data)** | Build data export, consent, audit (partly done) early |
| **Commoditization by AI website builders** | Lean into RE-specific workflows + CRM, not generic pages |

---

## 10. 12-month objective

**Reach ~100 paying agencies and clear product-market-fit signals** (retention >
90% at 3 months, organic referrals, willingness to pay annually) by:
1. Shipping the "sellable MVP" gap-closers (media uploads, maps, public search,
   custom domains, richer CRM, AI listing copy) — see `PRODUCT_ROADMAP.md`.
2. Landing 10 design-partner agencies for testimonials + case studies.
3. Standing up the self-serve funnel + content SEO — see `GO_TO_MARKET.md`.

---

_This is a living document. Revisit after every 10 customer interviews._
