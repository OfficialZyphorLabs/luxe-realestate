/**
 * ai/index.ts — Claude-powered helpers, with graceful gating.
 *
 * Like the Stripe/storage integrations, this degrades gracefully: when
 * ANTHROPIC_API_KEY is absent, `isAiConfigured()` is false and the UI hides the
 * "Generate with AI" affordance — nothing breaks.
 *
 * Model: defaults to Claude Opus 4.8 (`claude-opus-4-8`) per Anthropic guidance,
 * overridable via ANTHROPIC_MODEL (e.g. `claude-sonnet-5` / `claude-haiku-4-5`)
 * to tune the cost/quality tradeoff for this high-volume, low-complexity task.
 * Thinking is intentionally omitted — writing a listing blurb is not a reasoning
 * task, so we keep latency and cost down.
 */
import Anthropic from '@anthropic-ai/sdk'
import type { PropertyType } from '@/generated/prisma'
import { PROPERTY_TYPE_LABELS } from '@/lib/validations/property'

const DEFAULT_MODEL = 'claude-opus-4-8'

let client: Anthropic | null | undefined

/** The configured Anthropic client, or null when no API key is set. */
function getClient(): Anthropic | null {
  if (client !== undefined) return client
  const apiKey = process.env.ANTHROPIC_API_KEY
  client = apiKey ? new Anthropic({ apiKey }) : null
  return client
}

/** True when the AI features are configured (an API key is present). */
export function isAiConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY)
}

export interface ListingDescriptionInput {
  title: string
  propertyType: PropertyType
  price: number
  address: string
  city: string
  state: string
  beds: number | null
  baths: number | null
  sqft: number | null
}

export type AiResult = { ok: true; text: string } | { ok: false; error: string }

/**
 * Generate a polished, MLS-style marketing description from a listing's facts.
 * Returns a friendly error (never throws) so callers can surface it inline.
 */
export async function generateListingDescription(input: ListingDescriptionInput): Promise<AiResult> {
  const anthropic = getClient()
  if (!anthropic) return { ok: false, error: 'AI features are not configured.' }

  const facts = [
    `Title: ${input.title}`,
    `Type: ${PROPERTY_TYPE_LABELS[input.propertyType]}`,
    `Price: $${input.price.toLocaleString()}`,
    `Location: ${input.address}, ${input.city}, ${input.state}`,
    input.beds != null ? `Bedrooms: ${input.beds}` : null,
    input.baths != null ? `Bathrooms: ${input.baths}` : null,
    input.sqft != null ? `Size: ${input.sqft.toLocaleString()} sq ft` : null,
  ]
    .filter(Boolean)
    .join('\n')

  try {
    const response = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL || DEFAULT_MODEL,
      max_tokens: 600,
      system:
        'You are a luxury real-estate copywriter. Write a polished, evocative listing ' +
        'description (about 90–140 words, 1–2 short paragraphs) from the facts provided. ' +
        'Highlight lifestyle and standout features; be specific but never invent facts, ' +
        'amenities, or figures not given. No headings, no bullet points, no emojis — return ' +
        'only the description prose.',
      messages: [{ role: 'user', content: `Write a listing description for:\n\n${facts}` }],
    })

    // A safety refusal returns 200 with stop_reason "refusal" and no usable text.
    if (response.stop_reason === 'refusal') {
      return { ok: false, error: 'The request could not be completed. Please edit the details and retry.' }
    }

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('')
      .trim()

    if (!text) return { ok: false, error: 'No description was generated. Please try again.' }
    return { ok: true, text }
  } catch (e) {
    console.error('[ai] listing description failed:', e)
    return { ok: false, error: 'AI generation failed. Please try again.' }
  }
}
