'use client'

/**
 * reset-password/page.tsx — Set a new password from an emailed token.
 *
 * Reads the one-time `token` from the URL, collects a new password (with a
 * confirm field + strength meter), and POSTs to /api/auth/reset-password. On
 * success it points the user to sign in. A missing/used/expired token surfaces a
 * generic error. `useSearchParams` → Suspense boundary.
 */
import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { PasswordField } from '@/components/auth/PasswordField'
import { FormAlert } from '@/components/auth/FormAlert'
import { AuthHeader } from '@/components/auth/AuthHeader'
import { resetPasswordSchema } from '@/lib/validations/auth'

function ResetForm() {
  const token = useSearchParams().get('token') ?? ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [fieldError, setFieldError] = useState('')
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFieldError('')
    setFormError('')

    if (password !== confirm) {
      setFieldError('Passwords do not match')
      return
    }
    const parsed = resetPasswordSchema.safeParse({ token, password })
    if (!parsed.success) {
      const f = parsed.error.flatten().fieldErrors
      setFieldError(f.password?.[0] ?? f.token?.[0] ?? 'Invalid input')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      })
      const data = await res.json()
      if (!res.ok) {
        setFormError(data.message ?? 'Could not reset your password.')
        setSubmitting(false)
        return
      }
      setDone(true)
    } catch {
      setFormError('Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  if (!token) {
    return (
      <>
        <AuthHeader title="Invalid link" />
        <FormAlert variant="error" className="mb-6">
          This password-reset link is missing its token. Please request a new one.
        </FormAlert>
        <Link
          href="/forgot-password"
          className="font-body text-body-md font-semibold text-primary hover:underline"
        >
          Request a new link
        </Link>
      </>
    )
  }

  if (done) {
    return (
      <>
        <AuthHeader title="Password updated" subtitle="You can now sign in with your new password." />
        <FormAlert variant="success" className="mb-6">
          Your password has been reset successfully.
        </FormAlert>
        <Link
          href="/login"
          className="inline-flex font-body text-body-md font-semibold text-primary hover:underline"
        >
          Continue to sign in →
        </Link>
      </>
    )
  }

  return (
    <>
      <AuthHeader title="Choose a new password" subtitle="Make it strong — at least 8 characters." />

      {formError && (
        <FormAlert variant="error" className="mb-6">
          {formError}
        </FormAlert>
      )}

      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
        <PasswordField
          id="password"
          label="New password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            setFieldError('')
          }}
          showStrength
          placeholder="At least 8 characters"
        />
        <PasswordField
          id="confirm"
          label="Confirm password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => {
            setConfirm(e.target.value)
            setFieldError('')
          }}
          error={fieldError}
          placeholder="Re-enter your password"
        />
        <Button type="submit" size="lg" fullWidth disabled={submitting} className="mt-2">
          {submitting ? 'Updating…' : 'Reset password'}
        </Button>
      </form>
    </>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="h-96" aria-hidden="true" />}>
      <ResetForm />
    </Suspense>
  )
}
