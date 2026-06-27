/**
 * client.ts — Resend client singleton + shared send wrapper.
 *
 * Returns null when RESEND_API_KEY is absent so local development works without
 * an email provider: in that case `sendEmail` logs the message (including any
 * action link) to the server console instead of failing. Production MUST set the
 * key — transactional emails (invites, resets) are load-bearing there.
 */
import { Resend } from 'resend'

const resend: Resend | null = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

/** Default From identity. Override via EMAIL_FROM once a domain is verified. */
const FROM = process.env.EMAIL_FROM ?? 'LuxeReal <onboarding@resend.dev>'

export interface SendEmailParams {
  to: string
  subject: string
  html: string
  /** Plain-text fallback for clients that don't render HTML. */
  text?: string
}

/** Send an email, or log it in dev when Resend isn't configured. */
export async function sendEmail({ to, subject, html, text }: SendEmailParams): Promise<void> {
  if (!resend) {
    console.info(
      `[email:dev] Resend not configured — would send to ${to}\n` +
        `  Subject: ${subject}\n` +
        (text ? `  Text: ${text}\n` : '')
    )
    return
  }

  const { error } = await resend.emails.send({ from: FROM, to, subject, html, text })
  if (error) {
    // Surface as a server error; callers decide whether it's fatal to the flow.
    console.error('[email] Resend send failed:', error)
    throw new Error('Failed to send email')
  }
}

/** Absolute base URL for building links inside emails. */
export function getBaseUrl(): string {
  return (
    process.env.AUTH_URL ??
    process.env.NEXTAUTH_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    'http://localhost:3000'
  )
}
