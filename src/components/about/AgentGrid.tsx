import Link from 'next/link'
import { AgentCard } from './AgentCard'
import { SectionHeader } from '@/components/ui/SectionHeader'
import type { Agent } from '@/types'

const AGENTS: Agent[] = [
  {
    id: '1',
    name: 'Marcus Williams',
    role: 'Senior Partner',
    specialty: 'Beverly Hills & Bel Air Estates',
    imageUrl:
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&auto=format&fit=crop&q=80',
    listings: 12,
    sales: 8,
  },
  {
    id: '2',
    name: 'Olivia Rodriguez',
    role: 'Lead Agent',
    specialty: 'Malibu Coastal Properties',
    imageUrl:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80',
    listings: 9,
    sales: 11,
  },
  {
    id: '3',
    name: 'Julian Chen',
    role: 'Associate Agent',
    specialty: 'Manhattan Luxury Penthouses',
    imageUrl:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&auto=format&fit=crop&q=80',
    listings: 7,
    sales: 6,
  },
  {
    id: '4',
    name: 'Sarah Jenkins',
    role: 'Client Relations',
    specialty: 'International Acquisitions',
    imageUrl:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&auto=format&fit=crop&q=80',
    listings: 5,
    sales: 9,
  },
]

interface AgentGridProps {
  agents?: Agent[]
}

export function AgentGrid({ agents = AGENTS }: AgentGridProps) {
  return (
    <section className="py-stack-lg">
      <div className="page-container">
        <SectionHeader
          eyebrow="Our Team"
          title="Meet Our Specialists"
          action={
            <Link
              href="/contact"
              className="flex items-center gap-2 font-body text-label-md text-primary hover:gap-3 transition-standard"
            >
              Work With Us
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          }
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      </div>
    </section>
  )
}
