import Link from 'next/link'
import { AgentCard } from './AgentCard'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Reveal } from '@/components/ui/Reveal'
import { AGENTS } from '@/lib/data/agents'
import type { Agent } from '@/types'

interface AgentGridProps {
  /** Defaults to a teaser of the first four advisors (used on the About page). */
  agents?: Agent[]
}

export function AgentGrid({ agents = AGENTS.slice(0, 4) }: AgentGridProps) {
  return (
    <section className="py-stack-lg">
      <div className="page-container">
        <SectionHeader
          eyebrow="Our Team"
          title="Meet Our Specialists"
          action={
            <Link
              href="/agents"
              className="flex items-center gap-2 font-body text-label-md text-primary hover:gap-3 transition-standard"
            >
              View All Advisors
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          }
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {agents.map((agent, i) => (
            <Reveal key={agent.id} delay={(i % 4) * 0.08}>
              <AgentCard agent={agent} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
