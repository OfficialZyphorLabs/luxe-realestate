/**
 * agents.ts — Shared advisor roster.
 *
 * Single source of truth consumed by both the `/about` team teaser (first few)
 * and the full `/agents` directory. Centralizing it keeps the two surfaces in
 * sync and gives the directory a stable list to search/filter. (Phase 4 will
 * replace this static seed with per-org agents from the database.)
 */
import type { Agent } from '@/types'

export const AGENTS: Agent[] = [
  {
    id: '1',
    name: 'Marcus Williams',
    role: 'Senior Partner',
    specialty: 'Beverly Hills & Bel Air Estates',
    region: 'Los Angeles',
    imageUrl:
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&auto=format&fit=crop&q=80',
    phone: '+1 (310) 555-0142',
    email: 'marcus@luxereal.com',
    listings: 12,
    sales: 8,
  },
  {
    id: '2',
    name: 'Olivia Rodriguez',
    role: 'Lead Agent',
    specialty: 'Malibu Coastal Properties',
    region: 'Los Angeles',
    imageUrl:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80',
    phone: '+1 (310) 555-0188',
    email: 'olivia@luxereal.com',
    listings: 9,
    sales: 11,
  },
  {
    id: '3',
    name: 'Julian Chen',
    role: 'Associate Agent',
    specialty: 'Manhattan Luxury Penthouses',
    region: 'New York',
    imageUrl:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&auto=format&fit=crop&q=80',
    phone: '+1 (212) 555-0119',
    email: 'julian@luxereal.com',
    listings: 7,
    sales: 6,
  },
  {
    id: '4',
    name: 'Sarah Jenkins',
    role: 'Client Relations',
    specialty: 'International Acquisitions',
    region: 'International',
    imageUrl:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&auto=format&fit=crop&q=80',
    phone: '+44 20 7946 0321',
    email: 'sarah@luxereal.com',
    listings: 5,
    sales: 9,
  },
  {
    id: '5',
    name: 'David Okafor',
    role: 'Senior Advisor',
    specialty: 'Miami Waterfront & Islands',
    region: 'Miami',
    imageUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
    phone: '+1 (305) 555-0170',
    email: 'david@luxereal.com',
    listings: 10,
    sales: 7,
  },
  {
    id: '6',
    name: 'Elena Voss',
    role: 'Partner',
    specialty: 'Tribeca & SoHo Lofts',
    region: 'New York',
    imageUrl:
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&auto=format&fit=crop&q=80',
    phone: '+1 (212) 555-0204',
    email: 'elena@luxereal.com',
    listings: 8,
    sales: 13,
  },
  {
    id: '7',
    name: 'Thomas Beaumont',
    role: 'Associate Agent',
    specialty: 'Hollywood Hills Modern Homes',
    region: 'Los Angeles',
    imageUrl:
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&auto=format&fit=crop&q=80',
    phone: '+1 (323) 555-0156',
    email: 'thomas@luxereal.com',
    listings: 6,
    sales: 5,
  },
  {
    id: '8',
    name: 'Priya Nair',
    role: 'Lead Agent',
    specialty: 'Coral Gables & Brickell Towers',
    region: 'Miami',
    imageUrl:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&auto=format&fit=crop&q=80',
    phone: '+1 (305) 555-0233',
    email: 'priya@luxereal.com',
    listings: 11,
    sales: 10,
  },
]

/** Distinct regions for the directory filter, in a deliberate display order. */
export const AGENT_REGIONS: string[] = ['Los Angeles', 'New York', 'Miami', 'International']
