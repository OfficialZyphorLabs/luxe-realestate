/**
 * templates.ts — Brand-aligned HTML email templates.
 *
 * Emails can't load web fonts or external CSS reliably, so styles are inlined
 * and colors are taken from the LuxeReal "Heritage & Horizon" palette (DESIGN.md
 * §2): deep navy #041627 on warm cream #fcf9f8, with a serif heading stack to
 * echo Playfair Display where available. All dynamic values are HTML-escaped to
 * prevent injection into the markup.
 */

const NAVY = '#041627'
const CREAM = '#fcf9f8'
const SAND = '#f4dfcb'
const TEXT = '#1b1c1c'
const MUTED = '#5f5e5b'

/** Minimal HTML-entity escaping for interpolated user-supplied strings. */
function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Shared shell: header wordmark, content slot, footer. */
function layout(contentHtml: string): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:${CREAM};font-family:Helvetica,Arial,sans-serif;color:${TEXT};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CREAM};padding:32px 0;">
      <tr><td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.04);">
          <tr>
            <td style="background:${NAVY};padding:28px 40px;">
              <span style="font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:700;color:#ffffff;letter-spacing:-0.01em;">LuxeReal</span>
            </td>
          </tr>
          <tr><td style="padding:40px;">${contentHtml}</td></tr>
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #eae7e7;">
              <p style="margin:0;font-size:12px;line-height:18px;color:${MUTED};">
                LuxeReal — Find Your Legacy Home. Since 1994.<br/>
                If you didn't expect this email, you can safely ignore it.
              </p>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`
}

/** Primary CTA button (table-based for email-client compatibility). */
function button(label: string, href: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0;">
    <tr><td style="border-radius:12px;background:${NAVY};">
      <a href="${esc(href)}" style="display:inline-block;padding:14px 32px;font-size:14px;font-weight:600;letter-spacing:0.03em;color:#ffffff;text-decoration:none;border-radius:12px;">${esc(label)}</a>
    </td></tr>
  </table>`
}

function heading(text: string): string {
  return `<h1 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:26px;line-height:32px;font-weight:700;color:${NAVY};">${esc(text)}</h1>`
}

function paragraph(text: string): string {
  return `<p style="margin:0 0 16px;font-size:15px;line-height:24px;color:${TEXT};">${text}</p>`
}

/** Small monospace fallback link shown beneath every CTA. */
function fallbackLink(href: string): string {
  return `<p style="margin:16px 0 0;font-size:12px;line-height:18px;color:${MUTED};">
    Or paste this link into your browser:<br/>
    <span style="word-break:break-all;color:${NAVY};">${esc(href)}</span>
  </p>`
}

export interface RenderedEmail {
  subject: string
  html: string
  text: string
}

/** Welcome email sent after a new organization registers. */
export function welcomeEmail(params: { name: string; orgName: string; dashboardUrl: string }): RenderedEmail {
  const { name, orgName, dashboardUrl } = params
  const html = layout(
    heading(`Welcome to LuxeReal, ${esc(name)}`) +
      paragraph(`Your organization <strong>${esc(orgName)}</strong> is ready. Your 14-day trial has started — invite your team and list your first property to get going.`) +
      button('Open your dashboard', dashboardUrl) +
      fallbackLink(dashboardUrl) +
      `<div style="margin-top:24px;padding:16px;background:${SAND};border-radius:12px;">
        <p style="margin:0;font-size:13px;line-height:20px;color:${TEXT};">Tip: head to <strong>Members</strong> to invite agents, then <strong>Settings</strong> to brand your space.</p>
      </div>`
  )
  return {
    subject: `Welcome to LuxeReal, ${name}`,
    html,
    text: `Welcome to LuxeReal, ${name}. Your organization ${orgName} is ready. Open your dashboard: ${dashboardUrl}`,
  }
}

/** Invitation email sent when an admin invites someone to their org. */
export function invitationEmail(params: {
  orgName: string
  inviterName: string
  role: string
  acceptUrl: string
}): RenderedEmail {
  const { orgName, inviterName, role, acceptUrl } = params
  const roleLabel = role === 'ADMIN' ? 'an administrator' : 'a member'
  const html = layout(
    heading(`You're invited to ${esc(orgName)}`) +
      paragraph(`${esc(inviterName)} has invited you to join <strong>${esc(orgName)}</strong> on LuxeReal as ${roleLabel}.`) +
      paragraph('Accept the invitation to set up your account and get started. This link expires in 48 hours.') +
      button('Accept invitation', acceptUrl) +
      fallbackLink(acceptUrl)
  )
  return {
    subject: `${inviterName} invited you to ${orgName} on LuxeReal`,
    html,
    text: `${inviterName} invited you to join ${orgName} on LuxeReal as ${roleLabel}. Accept (expires in 48h): ${acceptUrl}`,
  }
}

/** Lead-notification email sent to org admins/agents when a new inquiry lands. */
export function leadNotificationEmail(params: {
  orgName: string
  leadName: string
  leadEmail: string
  leadPhone?: string | null
  propertyTitle?: string | null
  message?: string | null
  leadUrl: string
}): RenderedEmail {
  const { orgName, leadName, leadEmail, leadPhone, propertyTitle, message, leadUrl } = params

  // Definition-list rows for whatever the inquiry included.
  const row = (label: string, value: string) =>
    `<tr>
      <td style="padding:6px 0;font-size:13px;color:${MUTED};width:120px;vertical-align:top;">${esc(label)}</td>
      <td style="padding:6px 0;font-size:14px;color:${TEXT};">${value}</td>
    </tr>`
  const rows =
    row('Name', esc(leadName)) +
    row('Email', `<a href="mailto:${esc(leadEmail)}" style="color:${NAVY};">${esc(leadEmail)}</a>`) +
    (leadPhone ? row('Phone', esc(leadPhone)) : '') +
    (propertyTitle ? row('Interested in', esc(propertyTitle)) : row('Interested in', 'General inquiry'))

  const html = layout(
    heading(`New inquiry for ${esc(orgName)}`) +
      paragraph('You have a new lead. Details below — respond promptly to win the client.') +
      `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:8px 0 4px;">${rows}</table>` +
      (message
        ? `<div style="margin:16px 0;padding:16px;background:${CREAM};border-radius:12px;">
            <p style="margin:0 0 6px;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:${MUTED};">Message</p>
            <p style="margin:0;font-size:14px;line-height:22px;color:${TEXT};">${esc(message)}</p>
          </div>`
        : '') +
      button('View lead', leadUrl) +
      fallbackLink(leadUrl)
  )

  return {
    subject: `New inquiry from ${leadName} — ${orgName}`,
    html,
    text: `New inquiry for ${orgName}. ${leadName} (${leadEmail}${leadPhone ? `, ${leadPhone}` : ''})${
      propertyTitle ? ` about ${propertyTitle}` : ''
    }. View: ${leadUrl}`,
  }
}

/** Password-reset email. */
export function passwordResetEmail(params: { name: string | null; resetUrl: string }): RenderedEmail {
  const { name, resetUrl } = params
  const greeting = name ? `Hi ${esc(name)},` : 'Hi,'
  const html = layout(
    heading('Reset your password') +
      paragraph(greeting) +
      paragraph('We received a request to reset your LuxeReal password. Click below to choose a new one. This link expires in 1 hour and can be used once.') +
      button('Reset password', resetUrl) +
      fallbackLink(resetUrl) +
      paragraph(`<span style="font-size:13px;color:${MUTED};">If you didn't request this, no action is needed — your password stays the same.</span>`)
  )
  return {
    subject: 'Reset your LuxeReal password',
    html,
    text: `Reset your LuxeReal password (expires in 1 hour): ${resetUrl}`,
  }
}
