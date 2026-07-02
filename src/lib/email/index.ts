/**
 * index.ts — High-level transactional email senders.
 *
 * Each function renders a template and dispatches it via the Resend wrapper. Link
 * URLs are built from the configured base URL so they're correct across local,
 * preview, and production environments.
 */
import { sendEmail, getBaseUrl } from '@/lib/email/client'
import {
  welcomeEmail,
  invitationEmail,
  passwordResetEmail,
  leadNotificationEmail,
} from '@/lib/email/templates'

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

/**
 * Notify one or more org recipients (admins + assigned agent) about a new lead.
 * Sends individually so one bad address doesn't drop the rest; failures are the
 * caller's concern (lead creation must still succeed).
 */
export async function sendLeadNotificationEmail(params: {
  recipients: string[]
  orgName: string
  orgSlug: string
  leadId: string
  leadName: string
  leadEmail: string
  leadPhone?: string | null
  propertyTitle?: string | null
  message?: string | null
}): Promise<void> {
  const leadUrl = `${getBaseUrl()}/org/${params.orgSlug}/leads/${params.leadId}`
  const { subject, html, text } = leadNotificationEmail({
    orgName: params.orgName,
    leadName: params.leadName,
    leadEmail: params.leadEmail,
    leadPhone: params.leadPhone,
    propertyTitle: params.propertyTitle,
    message: params.message,
    leadUrl,
  })
  await Promise.all(
    params.recipients.map((to) => sendEmail({ to, subject, html, text }))
  )
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
