import Link from 'next/link'
import { PropertyGrid } from '@/components/property/PropertyGrid'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Reveal } from '@/components/ui/Reveal'
import type { Property } from '@/types'

const FEATURED_PROPERTIES: Property[] = [
  {
    id: '1',
    slug: '742-evergreen-terrace',
    title: 'The Glass House',
    price: 4750000,
    address: '742 Evergreen Terrace, Beverly Hills, CA',
    city: 'Beverly Hills',
    state: 'CA',
    beds: 5,
    baths: 6,
    sqft: 7200,
    imageUrl:
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop&q=80',
    badges: ['For Sale', 'New Listing'],
  },
  {
    id: '2',
    slug: '150-ocean-drive',
    title: 'The Lux LakeHouse',
    price: 8500000,
    address: '150 Coastal Bluff Rd, Malibu, CA',
    city: 'Malibu',
    state: 'CA',
    beds: 4,
    baths: 5,
    sqft: 5800,
    imageUrl:
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=80',
    badges: ['For Sale'],
  },
  {
    id: '3',
    slug: '200-central-park-west',
    title: 'Skyline',
    price: 11400000,
    address: '200 Central Park West, New York, NY',
    city: 'New York',
    state: 'NY',
    beds: 4,
    baths: 3,
    sqft: 3900,
    imageUrl:
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&auto=format&fit=crop&q=80',
    badges: ['For Sale'],
  },
]

export function FeaturedListings() {
  return (
    <section className="py-stack-lg">
      <div className="page-container">
        <Reveal>
          <SectionHeader
            eyebrow="Featured Listings"
            title="Curated for the Discerning Buyer"
            action={
              <Link
                href="/properties"
                className="flex items-center gap-2 font-body text-label-md text-primary hover:gap-3 transition-standard"
              >
                View All Listings
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
            }
          />
        </Reveal>
        <PropertyGrid properties={FEATURED_PROPERTIES} />
      </div>
    </section>
  )
}
