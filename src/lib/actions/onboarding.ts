'use server'

/**
 * onboarding.ts — first-run helpers.
 *
 * `loadSampleListings` seeds a fresh org with a few ACTIVE demo properties so
 * the dashboard and public catalog look alive within seconds of signup — the
 * activation "wow" the GTM plan hinges on. It only runs when the org has zero
 * listings, so it can never clobber real data.
 */
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { can } from '@/lib/permissions'
import { logAction } from '@/lib/audit'
import { slugify } from '@/lib/validations/auth'
import { getOrgBySlug } from '@/lib/data/dashboard'
import { countOrgProperties } from '@/lib/data/properties'
import type { PropertyType } from '@/generated/prisma'

export type ActionResult = { ok: true } | { ok: false; error: string }

interface Sample {
  title: string
  price: number
  address: string
  city: string
  state: string
  beds: number
  baths: number
  sqft: number
  propertyType: PropertyType
  description: string
  image: string
}

// Unsplash images (images.unsplash.com is allow-listed in next.config).
const SAMPLES: Sample[] = [
  {
    title: 'Oceanfront Villa with Infinity Pool',
    price: 8750000,
    address: '18 Cliffside Drive',
    city: 'Malibu',
    state: 'CA',
    beds: 5,
    baths: 6,
    sqft: 6200,
    propertyType: 'VILLA',
    description:
      'Perched above the Pacific, this architectural villa frames the horizon through walls of glass. An infinity pool spills toward the ocean while sunset light pours across open living spaces designed for effortless entertaining.',
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Park Avenue Penthouse',
    price: 12500000,
    address: '740 Park Avenue, PH',
    city: 'New York',
    state: 'NY',
    beds: 4,
    baths: 5,
    sqft: 4800,
    propertyType: 'PENTHOUSE',
    description:
      'A full-floor penthouse crowning one of Manhattan’s most storied addresses. Sun-flooded corner rooms, a private elevator landing, and skyline views in every direction define this rare offering.',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Modern Hillside Estate',
    price: 6400000,
    address: '2255 Summit Ridge',
    city: 'Beverly Hills',
    state: 'CA',
    beds: 6,
    baths: 7,
    sqft: 7500,
    propertyType: 'HOUSE',
    description:
      'Clean lines and warm materials meet sweeping canyon views in this hillside estate. Floor-to-ceiling glass dissolves the line between indoors and out, opening to terraced gardens and a resort-style pool.',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Waterfront Contemporary Townhouse',
    price: 3200000,
    address: '55 Harbor Walk',
    city: 'Miami',
    state: 'FL',
    beds: 3,
    baths: 4,
    sqft: 3100,
    propertyType: 'TOWNHOUSE',
    description:
      'A crisp, light-filled townhouse on the water’s edge, with a private dock and rooftop terrace. Thoughtfully designed interiors balance minimalist calm with the energy of waterfront living.',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
  },
]

export async function loadSampleListings(slug: string): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user) return { ok: false, error: 'You must be signed in.' }
  if (!can(session, 'properties:create', slug)) return { ok: false, error: 'You do not have permission.' }

  const org = await getOrgBySlug(slug)
  if (!org) return { ok: false, error: 'Organization not found.' }

  // Only seed a truly empty org — never risk clobbering real listings.
  const existing = await countOrgProperties(org.id)
  if (existing > 0) {
    return { ok: false, error: 'Samples are only available before you add your own listings.' }
  }

  for (let i = 0; i < SAMPLES.length; i++) {
    const s = SAMPLES[i]
    await prisma.property.create({
      data: {
        organizationId: org.id,
        slug: `${slugify(s.title)}-${i + 1}`,
        title: s.title,
        description: s.description,
        price: s.price,
        address: s.address,
        city: s.city,
        state: s.state,
        beds: s.beds,
        baths: s.baths,
        sqft: s.sqft,
        propertyType: s.propertyType,
        status: 'ACTIVE',
        createdById: session.user.id,
        images: { create: [{ url: s.image, order: 0 }] },
      },
    })
  }

  await logAction({
    actorId: session.user.id,
    actorType: 'USER',
    organizationId: org.id,
    action: 'property.created',
    targetType: 'Organization',
    targetId: org.id,
    metadata: { seededSamples: SAMPLES.length },
  })

  revalidatePath(`/org/${slug}/dashboard`)
  revalidatePath(`/org/${slug}/listings`)
  revalidatePath(`/org/${slug}/public`)
  return { ok: true }
}
