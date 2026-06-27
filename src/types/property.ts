export interface Property {
  id: string
  slug: string
  title: string
  price: number
  address: string
  city: string
  state: string
  beds: number
  baths: number
  sqft: number
  lotSize?: number
  yearBuilt?: number
  imageUrl: string
  images?: string[]
  badges?: string[]
  isFavorited?: boolean
  description?: string
  amenities?: string[]
  propertyType?: string
  style?: string
  garage?: number
  pool?: boolean
  agent?: Agent
}

export interface Agent {
  id: string
  name: string
  role: string
  specialty: string
  imageUrl: string
  /** Primary market region — used to filter the Agents directory. */
  region?: string
  phone?: string
  email?: string
  listings?: number
  sales?: number
}

export interface FilterOptions {
  location: string
  propertyType: string
  beds: string
  priceRange: string
}

export interface Testimonial {
  id: string
  name: string
  role: string
  quote: string
  imageUrl: string
}

export interface FAQItem {
  id: string
  question: string
  answer: string
}
