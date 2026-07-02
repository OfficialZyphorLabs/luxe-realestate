/**
 * property.ts — Zod schemas + display config for property listings.
 *
 * Shared by the client PropertyForm (instant UX validation) and the property
 * Server Actions (the real security boundary). The status/type tuples are
 * `satisfies`-checked against the Prisma-generated enums so this file fails to
 * compile if the schema and the DB ever drift apart.
 */
import { z } from 'zod'
import type { PropertyStatus, PropertyType } from '@/generated/prisma'

/** Every property status, in workflow order. Drift-checked against Prisma. */
export const PROPERTY_STATUSES = [
  'DRAFT',
  'ACTIVE',
  'SOLD',
  'WITHDRAWN',
] as const satisfies readonly PropertyStatus[]

/** Every property type. Drift-checked against Prisma. */
export const PROPERTY_TYPES = [
  'HOUSE',
  'APARTMENT',
  'CONDO',
  'TOWNHOUSE',
  'VILLA',
  'PENTHOUSE',
  'LAND',
] as const satisfies readonly PropertyType[]

/** Human labels for statuses (badges, selects). */
export const PROPERTY_STATUS_LABELS: Record<PropertyStatus, string> = {
  DRAFT: 'Draft',
  ACTIVE: 'Active',
  SOLD: 'Sold',
  WITHDRAWN: 'Withdrawn',
}

/** Human labels for property types. */
export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  HOUSE: 'House',
  APARTMENT: 'Apartment',
  CONDO: 'Condo',
  TOWNHOUSE: 'Townhouse',
  VILLA: 'Villa',
  PENTHOUSE: 'Penthouse',
  LAND: 'Land',
}

/** Optional non-negative integer coerced from a form field ("" → null). */
const optionalCount = z
  .number({ message: 'Enter a number.' })
  .int('Must be a whole number.')
  .min(0, 'Cannot be negative.')
  .max(1_000_000, 'That value looks too large.')
  .nullable()

/**
 * Canonical listing payload. The client sends a typed object (not FormData) so
 * the `images` array survives intact; the action re-parses with this schema.
 */
export const propertyInputSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters.').max(120, 'Title is too long.'),
  description: z.string().trim().max(4000, 'Description is too long.').default(''),
  price: z
    .number({ message: 'Enter a price.' })
    .positive('Price must be greater than zero.')
    .max(1_000_000_000, 'Price looks too large.'),
  address: z.string().trim().min(3, 'Enter a street address.').max(200, 'Address is too long.'),
  city: z.string().trim().min(1, 'Enter a city.').max(100, 'City is too long.'),
  state: z.string().trim().min(1, 'Enter a state/region.').max(100, 'State is too long.'),
  beds: optionalCount,
  baths: optionalCount,
  sqft: optionalCount,
  propertyType: z.enum(PROPERTY_TYPES),
  status: z.enum(PROPERTY_STATUSES),
  // Ordered list of image URLs; first is the cover. Empty is allowed (drafts).
  images: z.array(z.string().trim().url('Each image must be a valid URL.')).max(20, 'Up to 20 images.').default([]),
})

export type PropertyInput = z.infer<typeof propertyInputSchema>

/** Filters accepted by the listings page (all optional, URL-driven). */
export const propertyFilterSchema = z.object({
  query: z.string().trim().optional(),
  status: z.enum(PROPERTY_STATUSES).optional(),
  page: z.coerce.number().int().min(1).default(1),
})
