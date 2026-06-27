'use client'

/**
 * forgot-password/page.tsx — Request a password-reset link.
 *
 * The API always responds generically (it never reveals whether an email is
 * registered), so this page mirrors that: after submit it shows the same
 * confirmation regardless. That's the correct UX for an enumeration-safe flow.
 */
import { useState } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { FormAlert } from '@/components/auth/FormAlert'
import { AuthHeader } from '@/components/auth/AuthHeader'
import { forgotPasswordSchema } from '@/lib/validations/auth'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const parsed = forgotPasswordSchema.safeParse({ email })
    if (!parsed.success) {
      setError(parsed.error.flatten().fieldErrors.email?.[0] ?? 'Enter a valid email')
      return
    }

    setSubmitting(true)
    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      })
      // Always show success — the server response is intentionally generic.
      setSent(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (sent) {
    return (
      <>
        <AuthHeader
          title="Check your inbox"
          subtitle="If an account exists for that email, we've sent a link to reset your password. It expires in 1 hour."
        />
        <FormAlert variant="success" className="mb-6">
          Reset link sent. Be sure to check your spam folder.
        </FormAlert>
        <Link
          href="/login"
          className="font-body text-body-md font-semibold text-primary hover:underline"
        >
          ← Back to sign in
        </Link>
      </>
    )
  }

  return (
    <>
      <AuthHeader
        title="Reset your password"
        subtitle="Enter your email and we'll send you a link to set a new password."
      />

      {error && (
        <FormAlert variant="error" className="mb-6">
          {error}
        </FormAlert>
      )}

      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
        <Input
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            setError('')
          }}
          placeholder="you@agency.com"
        />
        <Button type="submit" size="lg" fullWidth disabled={submitting} className="mt-2">
          {submitting ? 'Sending…' : 'Send reset link'}
        </Button>
      </form>

      <p className="mt-8 text-center font-body text-body-md text-secondary">
        Remembered it?{' '}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </>
  )
}
