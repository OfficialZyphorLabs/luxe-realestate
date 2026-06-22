import Link from 'next/link'
import { PropertyGrid } from './PropertyGrid'
import { SectionHeader } from '@/components/ui/SectionHeader'
import type { Property } from '@/types'

interface SimilarPropertiesProps {
  properties: Property[]
}

export function SimilarProperties({ properties }: SimilarPropertiesProps) {
  if (properties.length === 0) return null

  return (
    <section className="py-stack-lg">
      <SectionHeader
        eyebrow="You May Also Like"
        title="Similar Properties"
        action={
          <Link
            href="/properties"
            className="flex items-center gap-2 font-body text-label-md text-primary hover:gap-3 transition-standard"
          >
            View All
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
        }
      />
      <PropertyGrid properties={properties.slice(0, 3)} />
    </section>
  )
}
