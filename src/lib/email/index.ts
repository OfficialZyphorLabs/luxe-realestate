/**
 * index.ts — High-level transactional email senders.
 *
 * Each function renders a template and dispatches it via the Resend wrapper. Link
 * URLs are built from the configured base URL so they're correct across local,
 * preview, and production environments.
 */
import { sendEmail, getBaseUrl } from '@/lib/email/client'
import { welcomeEmail, invitationEmail, passwordResetEmail } from '@/lib/email/templates'

/** Welcome a freshly-registered org admin and point them at their dashboard. */
export async function sendWelcomeEmail(params: {
  to: string
  name: string
  orgName: string
  orgSlug: string
}): Promise<void> {
  const dashboardUrl = `${getBaseUrl()}/org/${params.orgSlug}/dashboard`
  const { subject, html, text } = welcomeEmail({
    name: params.name,
    orgName: params.orgName,
    dashboardUrl,
  })
  await sendEmail({ to: params.to, subject, html, text })
}

/** Email an invitee a one-time acceptance link. */
export async function sendInvitationEmail(params: {
  to: string
  orgName: string
  inviterName: string
  role: string
  token: string
}): Promise<void> {
  const acceptUrl = `${getBaseUrl()}/invite/accept?token=${encodeURIComponent(params.token)}`
  const { subject, html, text } = invitationEmail({
    orgName: params.orgName,
    inviterName: params.inviterName,
    role: params.role,
    acceptUrl,
  })
  await sendEmail({ to: params.to, subject, html, text })
}

/** Email a one-time password-reset link. */
export async function sendPasswordResetEmail(params: {
  to: string
  name: string | null
  token: string
}): Promise<void> {
  const resetUrl = `${getBaseUrl()}/reset-password?token=${encodeURIComponent(params.token)}`
  const { subject, html, text } = passwordResetEmail({ name: params.name, resetUrl })
  await sendEmail({ to: params.to, subject, html, text })
}
