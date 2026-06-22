import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import type { Agent } from '@/types'

interface AgentCardProps {
  agent: Agent
}

export function AgentCard({ agent }: AgentCardProps) {
  return (
    <article className="group relative bg-surface-container rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
      {/* Portrait */}
      <div className="aspect-[3/4] relative overflow-hidden">
        <Image
          src={agent.imageUrl}
          alt={`${agent.name} — ${agent.role}`}
          fill
          className="object-cover object-top group-hover:scale-110 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
      </div>

      {/* Info */}
      <div className="p-6 bg-surface border-t border-outline-variant/10 flex flex-col gap-3">
        <div>
          <span className="font-body text-caption text-on-primary-container uppercase tracking-widest font-semibold">
            {agent.role}
          </span>
          <h3 className="font-display text-headline-md font-semibold text-primary mt-1">
            {agent.name}
          </h3>
          <p className="font-body text-body-md text-secondary mt-1">{agent.specialty}</p>
        </div>

        {(agent.listings !== undefined || agent.sales !== undefined) && (
          <div className="flex gap-6 py-2 border-t border-outline-variant/20">
            {agent.listings !== undefined && (
              <div>
                <p className="font-display text-headline-md font-semibold text-primary">
                  {agent.listings}
                </p>
                <p className="font-body text-caption text-secondary">Active Listings</p>
              </div>
            )}
            {agent.sales !== undefined && (
              <div>
                <p className="font-display text-headline-md font-semibold text-primary">
                  {agent.sales}
                </p>
                <p className="font-body text-caption text-secondary">Sales This Year</p>
              </div>
            )}
          </div>
        )}

        <Button
          variant="secondary"
          fullWidth
          className="rounded-full group-hover:bg-primary group-hover:text-on-primary"
        >
          Contact Agent
        </Button>
      </div>
    </article>
  )
}
