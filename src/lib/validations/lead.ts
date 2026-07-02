/**
 * lead.ts — Zod schemas + display config for leads (inquiries).
 *
 * `publicLeadSchema` guards the UNAUTHENTICATED public inquiry endpoint, so it
 * is deliberately strict about lengths to blunt spam/abuse. The status tuple is
 * drift-checked against the Prisma-generated enum.
 */
import { z } from 'zod'
import type { LeadStatus } from '@/generated/prisma'

/** Pipeline stages, left-to-right board order. Drift-checked against Prisma. */
export const LEAD_STATUSES = [
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'CLOSED_WON',
  'CLOSED_LOST',
] as const satisfies readonly LeadStatus[]

/** Human labels for the pipeline columns / status badges. */
export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  QUALIFIED: 'Qualified',
  CLOSED_WON: 'Closed — Won',
  CLOSED_LOST: 'Closed — Lost',
}

/** The four columns shown on the Kanban board (terminal states share a column). */
export const LEAD_PIPELINE_COLUMNS = ['NEW', 'CONTACTED', 'QUALIFIED', 'CLOSED_WON'] as const

/**
 * Public inquiry payload — submitted by anonymous visitors on an org's
 * white-label page. Email is normalized; free-text is length-capped.
 */
export const publicLeadSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name.').max(100, 'Name is too long.'),
  email: z.string().trim().toLowerCase().email('Enter a valid email address.').max(254),
  phone: z.string().trim().max(40, 'Phone number is too long.').optional().or(z.literal('')),
  message: z.string().trim().max(2000, 'Message is too long.').optional().or(z.literal('')),
  /** Optional listing the inquiry is about (validated as belonging to the org). */
  propertyId: z.string().trim().optional().or(z.literal('')),
})

export type PublicLeadInput = z.infer<typeof publicLeadSchema>

/** A note added to a lead from the dashboard. */
export const leadNoteSchema = z.object({
  body: z.string().trim().min(1, 'Write something first.').max(2000, 'Note is too long.'),
})

/** Filters for the leads list/board (URL-driven). */
export const leadFilterSchema = z.object({
  query: z.string().trim().optional(),
  status: z.enum(LEAD_STATUSES).optional(),
  view: z.enum(['board', 'list']).default('board'),
})
