# LuxeReal — Go-To-Market Plan

> How we get the first 10, then 100, then 1,000 paying agencies. Pairs with
> [`BUSINESS_PLAN.md`](./BUSINESS_PLAN.md) (why/who/pricing) and
> [`PRODUCT_ROADMAP.md`](./PRODUCT_ROADMAP.md) (what to build).

---

## 1. GTM thesis

LuxeReal is a **low-touch, self-serve SaaS with a design-led wedge.** We win by
showing, not telling: a broker sees a gorgeous branded site spun up in minutes
and immediately understands the value. So our GTM is built around **letting people
experience the product fast** (free trial, interactive demo, template gallery)
and **proof** (real agencies, real sites, testimonials).

Sales motion by segment:
- **Solo agents & small teams → self-serve** (trial → paywall). No sales calls.
- **Boutique brokerages (5–20) → self-serve + light human touch** (onboarding call).
- **Enterprise / multi-office → sales-assisted** (demo, migration, custom pricing).

---

## 2. The funnel

```
Awareness → Interest → Trial (activation) → Paid → Expansion → Advocacy
   SEO/social   demo/gallery   wizard+demo data   Stripe   upsells   referrals
```

Key conversion levers and where the product must help:
- **Activation is everything.** The onboarding wizard + demo data (Roadmap #6) is
  a GTM feature, not just product polish — it's what turns a trial into a habit.
- **Time-to-"wow" < 10 minutes.** Signup → branded site with sample listings.
- **Trial → paid** already works via Stripe (14-day trial built).

---

## 3. Phase-by-phase plan

### Phase A — Design partners (first 10 agencies)
**Goal:** proof, testimonials, and brutal product feedback.
- Hand-recruit 10 boutique/luxury agencies (network, LinkedIn, local BNI/realtor
  groups, DMs to agents with ugly websites).
- Offer: **free for 6–12 months** in exchange for feedback + a testimonial + logo.
- White-glove onboarding (do it *with* them; watch where they struggle).
- Deliverable: 3–5 public LuxeReal sites you can show as living demos.

### Phase B — Early traction (to ~100 paying)
**Goal:** validate self-serve + willingness to pay.
- Turn on paid plans; keep a founder-led onboarding call for anyone who wants it.
- Content + SEO engine (see channels). Publish the design-partner case studies.
- Launch on Product Hunt, real-estate subreddits, agent Facebook groups, LinkedIn.
- Referral program (both sides get a discount).

### Phase C — Scale (to ~1,000+)
**Goal:** repeatable, mostly self-serve acquisition.
- Double down on the 2–3 channels that actually converted.
- Paid acquisition once CAC/LTV proven; partnerships (see below).
- Move upmarket with IDX/MLS + Enterprise features.

---

## 4. Channels (ranked for a bootstrapped start)

| Channel | Why it fits RE | Effort | Priority |
|---|---|---|---|
| **SEO / content** ("best real estate website builder", "IDX website", how-tos) | Agents Google tools constantly | High (compounds) | 🔴 Now |
| **The product itself as marketing** — "Powered by LuxeReal" on every public site + backlinks | Free viral loop | Low | 🔴 Now |
| **Direct outreach** to agents with weak websites | Concrete, personal, high-intent | Med | 🔴 Now |
| **Real-estate communities** (Reddit, FB groups, Lion's/Inman, local boards) | Where agents hang out | Med | 🟠 Next |
| **Referrals / affiliate** (agents refer agents; brokers refer their agents) | RE is a referral culture | Low | 🟠 Next |
| **Partnerships** (photographers, staging co's, MLS boards, coaches) | They sit next to our buyer | Med | 🟠 Next |
| **Template gallery / free tools** (free AVM widget, free "website grader") | Top-of-funnel lead magnets | Med | 🟡 Later |
| **Paid ads** (Google/Meta/LinkedIn) | Scales once CAC proven | $$$ | 🟡 Later |

**Highest-leverage free loop:** every published public site carries a subtle
"Powered by LuxeReal" link → SEO backlinks + curious visitors → signups. Make it
removable only on higher tiers (also a monetization lever).

---

## 5. Positioning & messaging

**Headline options to test:**
- "Your brokerage's website + CRM, beautiful and in one place."
- "The website luxury agents deserve — with a CRM that actually gets used."
- "Stop paying for a website *and* a CRM. Get both, branded to you."

**Message per persona:**
- **Broker/Owner:** "Look like a $15k agency site. Never lose a lead. See what
  every agent is doing — for less than your current CRM alone."
- **Agent:** "List a property in 2 minutes from your phone. Every inquiry lands
  in one pipeline. Look premium instantly."
- **Admin:** "Onboard a new agent in one click. One tool, one login, one bill."

**Proof to collect early:** before/after website screenshots, "leads captured in
first 30 days," time-to-launch, testimonial quotes with headshots + logos.

---

## 6. Metrics that matter (instrument these)

| Stage | Metric | Target (early) |
|---|---|---|
| Acquisition | Signups / week | grow WoW |
| **Activation** | % trials that publish a site + add a listing | > 50% |
| Conversion | Trial → paid | > 15–25% |
| Revenue | MRR, ARPA | ↑ |
| **Retention** | Logo churn (monthly) | < 3–5% |
| Retention | 3-month net revenue retention | > 100% (with upsells) |
| Referral | % new customers from referral | rising |
| Efficiency | CAC payback | < 12 months |

> Product implication: we need **product analytics** (activation events) and
> **billing analytics** — a near-term instrumentation task, not an afterthought.

---

## 7. Launch checklist (before "open the doors")
- [ ] Sellable-MVP features shipped (see `PRODUCT_ROADMAP.md` Milestone 1)
- [ ] Marketing homepage clearly states who it's for + pricing + a live demo
- [ ] Public template gallery / 3+ live design-partner sites to show
- [ ] Self-serve signup → trial → paywall works flawlessly in production
- [ ] Transactional emails deliver reliably (verified domain, SPF/DKIM)
- [ ] Help docs / FAQ / onboarding guide
- [ ] Error tracking + uptime monitoring live
- [ ] Terms, Privacy, data-handling / Fair Housing statements published
- [ ] Referral mechanism + "Powered by LuxeReal" backlink loop enabled

---

## 8. First 30 / 60 / 90 days (suggested)
- **Days 1–30:** finish Sellable-MVP items #1–3, #5–6; recruit 5 design partners.
- **Days 31–60:** onboard 10 design partners; ship custom domains; publish 3 case
  studies; start SEO content; set up analytics.
- **Days 61–90:** open paid self-serve; Product Hunt + community launch; referral
  program; iterate on activation from real funnel data.

---

_GTM is a set of experiments. Kill channels that don't convert; pour into the ones
that do. Revisit monthly against the metrics above._
