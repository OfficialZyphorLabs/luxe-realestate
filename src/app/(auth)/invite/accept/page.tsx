'use client'

/**
 * invite/accept/page.tsx — Accept an organization invitation.
 *
 * On load it validates the token (GET) to learn the org, role, and whether the
 * invited email already has an account, then renders the right path:
 *   - Existing user → one-click accept, then sign in to land on the dashboard.
 *   - New user      → name + password form, accept, then auto sign-in.
 *
 * The raw token never leaves the URL; all redemption happens server-side.
 * `useSearchParams` → Suspense boundary.
 */
import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { PasswordField } from '@/components/auth/PasswordField'
import { FormAlert } from '@/components/auth/FormAlert'
import { AuthHeader } from '@/components/auth/AuthHeader'

interface InviteInfo {
  email: string
  role: 'ADMIN' | 'MEMBER'
  orgName: string
  orgSlug: string
  userExists: boolean
}

function AcceptInvite() {
  const router = useRouter()
  const token = useSearchParams().get('token') ?? ''

  // Lazily seed status from token presence so we never setState synchronously in
  // the effect for the "no token" case.
  const [status, setStatus] = useState<'loading' | 'invalid' | 'ready'>(token ? 'loading' : 'invalid')
  const [info, setInfo] = useState<InviteInfo | null>(null)
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Validate the token once on mount. The no-token case is handled by the lazy
  // initial state above, so the effect only runs the async lookup.
  useEffect(() => {
    if (!token) return
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`/api/invite/accept?token=${encodeURIComponent(token)}`)
        const data = await res.json()
        if (cancelled) return
        if (!res.ok) {
          setStatus('invalid')
          return
        }
        setInfo(data)
        setStatus('ready')
      } catch {
        if (!cancelled) setStatus('invalid')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [token])

  async function onAccept(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')
    if (!info) return

    // New users must provide name + password.
    if (!info.userExists && (name.trim().length < 2 || password.length < 8)) {
      setFormError('Enter your name and a password of at least 8 characters.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/invite/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          info.userExists ? { token } : { token, name: name.trim(), password }
        ),
      })
      const data = await res.json()
      if (!res.ok) {
        setFormError(data.message ?? 'Could not accept the invitation.')
        setSubmitting(false)
        return
      }

      const dashboard = `/org/${data.orgSlug}/dashboard`
      if (info.userExists) {
        // Existing account — sign in (fresh session carries the new membership).
        router.push(`/login?callbackUrl=${encodeURIComponent(dashboard)}`)
      } else {
        const signInRes = await signIn('credentials', {
          email: info.email,
          password,
          redirect: false,
        })
        router.push(signInRes?.error ? '/login' : dashboard)
      }
    } catch {
      setFormError('Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  if (status === 'loading') {
    return <AuthHeader title="Checking your invitation…" />
  }

  if (status === 'invalid' || !info) {
    return (
      <>
        <AuthHeader title="Invitation unavailable" />
        <FormAlert variant="error" className="mb-6">
          This invitation is invalid, has already been used, or has expired. Ask your
          administrator to send a new one.
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

  const roleLabel = info.role === 'ADMIN' ? 'an administrator' : 'a member'

  return (
    <>
      <AuthHeader
        title={`Join ${info.orgName}`}
        subtitle={
          <>
            You&apos;ve been invited to join <strong className="text-on-surface">{info.orgName}</strong> as{' '}
            {roleLabel}, using <strong className="text-on-surface">{info.email}</strong>.
          </>
        }
      />

      {formError && (
        <FormAlert variant="error" className="mb-6">
          {formError}
        </FormAlert>
      )}

      <form onSubmit={onAccept} noValidate className="flex flex-col gap-5">
        {!info.userExists && (
          <>
            <Input
              id="name"
              label="Full name"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
            <PasswordField
              id="password"
              label="Create a password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              showStrength
              placeholder="At least 8 characters"
            />
          </>
        )}

        <Button type="submit" size="lg" fullWidth disabled={submitting} className="mt-2">
          {submitting ? 'Joining…' : `Join ${info.orgName}`}
        </Button>
      </form>
    </>
  )
}

export default function InviteAcceptPage() {
  return (
    <Suspense fallback={<AuthHeader title="Checking your invitation…" />}>
      <AcceptInvite />
    </Suspense>
  )
}
