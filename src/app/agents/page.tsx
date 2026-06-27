/**
 * agents/page.tsx — The full advisor directory ("Meet the Advisors").
 *
 * A dedicated home for LuxeReal's people: an editorial hero, a searchable/
 * filterable roster (AgentDirectory), and a recruitment CTA. Distinct from
 * `/about` (which tells the brand story and shows a 4-advisor teaser). Styling
 * follows DESIGN.md — display serif headings, token colors, stack spacing, and
 * the bg-primary rounded CTA banner pattern (§14 Home → CTABanner).
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { AgentDirectory } from '@/components/about/AgentDirectory'
import { Reveal } from '@/components/ui/Reveal'
import { AGENTS, AGENT_REGIONS } from '@/lib/data/agents'

export const metadata: Metadata = {
  title: 'Our Advisors — LuxeReal',
  description:
    'Meet the LuxeReal advisory team — specialists across Los Angeles, New York, Miami, and international luxury markets.',
}

export default function AgentsPage() {
  return (
    <div className="pt-20 min-h-screen">
      {/* ── Hero ── */}
      <section className="py-stack-lg">
        <div className="page-container">
          <Reveal>
          <div className="max-w-3xl">
            <span className="font-body text-label-md font-semibold uppercase tracking-widest text-on-primary-container">
              The LuxeReal Collective
            </span>
            <h1 className="font-display text-display-lg font-bold text-primary mt-3 leading-tight">
              The Advisors Behind Every Address.
            </h1>
            <p className="font-body text-body-lg text-secondary mt-6 leading-relaxed">
              Behind every legacy home is an advisor who understands it intimately. Our specialists
              pair deep local fluency with a global network — guiding discerning buyers and sellers
              through the most significant transactions of their lives.
            </p>
          </div>
          </Reveal>

          {/* Quick stats */}
          <Reveal delay={0.1}>
          <div className="mt-10 flex flex-wrap gap-x-12 gap-y-6">
            <div>
              <p className="font-display text-headline-lg font-semibold text-primary">{AGENTS.length}</p>
              <p className="font-body text-body-md text-secondary">Dedicated Advisors</p>
            </div>
            <div className="hidden sm:block w-px self-stretch bg-outline-variant/30" />
            <div>
              <p className="font-display text-headline-lg font-semibold text-primary">
                {AGENT_REGIONS.length}
              </p>
              <p className="font-body text-body-md text-secondary">Markets Served</p>
            </div>
            <div className="hidden sm:block w-px self-stretch bg-outline-variant/30" />
            <div>
              <p className="font-display text-headline-lg font-semibold text-primary">$4B+</p>
              <p className="font-body text-body-md text-secondary">Lifetime Sales</p>
            </div>
          </div>
          </Reveal>
        </div>
      </section>

      {/* ── Directory ── */}
      <AgentDirectory />

      {/* ── Join the team CTA ── */}
      <section className="py-stack-lg">
        <div className="page-container">
          <Reveal>
          <div className="relative overflow-hidden rounded-[40px] bg-primary px-8 py-16 text-center md:px-16">
            {/* Soft accent glow */}
            <div
              className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary-fixed/10 blur-3xl"
              aria-hidden="true"
            />
            <div className="relative">
              <span className="font-body text-label-md font-semibold uppercase tracking-widest text-on-primary/60">
                Build Your Career
              </span>
              <h2 className="font-display text-headline-lg font-semibold text-on-primary mt-3 max-w-2xl mx-auto leading-tight">
                Join a team that defines the standard of modern luxury real estate.
              </h2>
              <p className="font-body text-body-md text-on-primary/70 mt-4 max-w-xl mx-auto">
                We&rsquo;re always seeking exceptional advisors who share our commitment to
                discretion,
                integrity, and excellence.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-on-primary px-10 py-4 font-body text-label-md font-semibold text-primary transition-standard hover:bg-surface-dim active:scale-95"
                >
                  Apply to Join
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-on-primary/40 px-10 py-4 font-body text-label-md font-semibold text-on-primary transition-standard hover:bg-on-primary/10 active:scale-95"
                >
                  Work With an Advisor
                </Link>
              </div>
            </div>
          </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
