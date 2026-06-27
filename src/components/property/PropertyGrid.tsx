import { PropertyCard } from './PropertyCard'
import { Reveal } from '@/components/ui/Reveal'
import type { Property } from '@/types'

interface PropertyGridProps {
  properties: Property[]
}

export function PropertyGrid({ properties }: PropertyGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {properties.map((property, i) => (
        // Stagger by column (mod 3) so each row cascades left→right, regardless
        // of how far down the list a card sits.
        <Reveal key={property.id} delay={(i % 3) * 0.08}>
          <PropertyCard property={property} />
        </Reveal>
      ))}
    </div>
  )
}
