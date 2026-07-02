'use client'

/**
 * PublicInquiryForm — the anonymous inquiry form on an org's white-label page.
 *
 * Posts to POST /api/org/[slug]/leads (the rate-limited public endpoint) and
 * swaps to a thank-you state on success. An optional propertyId ties the lead
 * to a specific listing. Presentational styling uses DESIGN tokens only.
 */
import { useState } from 'react'

interface PublicInquiryFormProps {
  slug: string
  /** When set, the inquiry is attached to this listing. */
  propertyId?: string
  propertyTitle?: string
}

export function PublicInquiryForm({ slug, propertyId, propertyTitle }: PublicInquiryFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/org/${slug}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, message, propertyId }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        setError(data.message ?? 'Something went wrong. Please try again.')
        return
      }
      setDone(true)
    } catch {
      setError('Network error — please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl bg-surface-container p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-tertiary-fixed">
          <span className="material-symbols-outlined text-[28px] text-on-tertiary-fixed" aria-hidden="true">
            mark_email_read
          </span>
        </div>
        <h3 className="mt-4 font-display text-headline-md font-semibold text-primary">Inquiry received</h3>
        <p className="mt-2 font-body text-body-md text-secondary">
          Thank you. A member of the team will be in touch shortly.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      {propertyTitle && (
        <p className="font-body text-body-md text-secondary">
          Inquiring about <span className="font-semibold text-on-surface">{propertyTitle}</span>
        </p>
      )}

      <Field id="inq-name" label="Full name" value={name} onChange={setName} required />
      <Field id="inq-email" label="Email" type="email" value={email} onChange={setEmail} required />
      <Field id="inq-phone" label="Phone (optional)" type="tel" value={phone} onChange={setPhone} />

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="inq-message"
          className="font-body text-label-md text-xs font-semibold uppercase tracking-widest text-secondary"
        >
          Message
        </label>
        <textarea
          id="inq-message"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us what you're looking for…"
          className="rounded-lg border border-outline-variant/50 bg-surface-container-low px-4 py-3 font-body text-body-md text-on-surface transition-standard placeholder:text-secondary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {error && (
        <p className="rounded-lg bg-error-container/50 px-3 py-2 font-body text-caption text-on-error-container">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || !name || !email}
        className="mt-1 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-body text-label-md font-semibold text-on-primary transition-standard hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? 'Sending…' : 'Send inquiry'}
      </button>
    </form>
  )
}

/** A labeled text input row for the inquiry form. */
function Field({
  id,
  label,
  value,
  onChange,
  type = 'text',
  required,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  required?: boolean
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="font-body text-label-md text-xs font-semibold uppercase tracking-widest text-secondary"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-outline-variant/50 bg-surface-container-low px-4 py-3 font-body text-body-md text-on-surface transition-standard placeholder:text-secondary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      />
    </div>
  )
}
