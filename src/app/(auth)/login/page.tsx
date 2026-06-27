'use client'

/**
 * login/page.tsx — Email/password sign-in with Google as an alternative.
 *
 * On success we resolve a sensible destination: an explicit `callbackUrl` if
 * present, otherwise the user's first org dashboard (or the super-admin portal).
 * Errors are intentionally generic ("invalid email or password") to avoid
 * leaking which accounts exist.
 *
 * `useSearchParams` requires a Suspense boundary during prerender, so the form
 * lives in a child wrapped by <Suspense>.
 */
import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn, getSession } from 'next-auth/react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { PasswordField } from '@/components/auth/PasswordField'
import { FormAlert } from '@/components/auth/FormAlert'
import { AuthHeader } from '@/components/auth/AuthHeader'
import { AuthDivider } from '@/components/auth/AuthDivider'
import { GoogleButton } from '@/components/auth/GoogleButton'
import { loginSchema } from '@/lib/validations/auth'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl')
  // Surface NextAuth provider/callback errors (e.g. OAuth failures) generically.
  const oauthError = searchParams.get('error')

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [formError, setFormError] = useState(oauthError ? 'Sign-in failed. Please try again.' : '')
  const [submitting, setSubmitting] = useState(false)

  /** Pick where to land after a successful credential sign-in. */
  async function resolveDestination(): Promise<string> {
    if (callbackUrl && callbackUrl.startsWith('/')) return callbackUrl
    const session = await getSession()
    if (session?.user.isSuperAdmin) return '/superadmin'
    const first = session?.user.memberships?.[0]
    return first ? `/org/${first.orgSlug}/dashboard` : '/'
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')

    const parsed = loginSchema.safeParse(form)
    if (!parsed.success) {
      const f = parsed.error.flatten().fieldErrors
      setErrors({ email: f.email?.[0], password: f.password?.[0] })
      return
    }

    setSubmitting(true)
    const res = await signIn('credentials', {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    })

    if (res?.error) {
      setFormError('Invalid email or password.')
      setSubmitting(false)
      return
    }

    router.push(await resolveDestination())
  }

  return (
    <>
      <AuthHeader title="Welcome back" subtitle="Sign in to your LuxeReal workspace." />

      {formError && (
        <FormAlert variant="error" className="mb-6">
          {formError}
        </FormAlert>
      )}

      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
        <Input
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={(e) => {
            setForm((s) => ({ ...s, email: e.target.value }))
            setErrors((x) => ({ ...x, email: undefined }))
          }}
          error={errors.email}
          placeholder="you@agency.com"
        />
        <div className="flex flex-col gap-1.5">
          <PasswordField
            id="password"
            label="Password"
            autoComplete="current-password"
            value={form.password}
            onChange={(e) => {
              setForm((s) => ({ ...s, password: e.target.value }))
              setErrors((x) => ({ ...x, password: undefined }))
            }}
            error={errors.password}
            placeholder="Your password"
          />
          <Link
            href="/forgot-password"
            className="self-end font-body text-caption font-semibold text-secondary hover:text-primary transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" size="lg" fullWidth disabled={submitting} className="mt-2">
          {submitting ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      <div className="my-6">
        <AuthDivider />
      </div>
      <GoogleButton callbackUrl={callbackUrl ?? '/'} />

      <p className="mt-8 text-center font-body text-body-md text-secondary">
        New to LuxeReal?{' '}
        <Link href="/register" className="font-semibold text-primary hover:underline">
          Create a workspace
        </Link>
      </p>
    </>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="h-96" aria-hidden="true" />}>
      <LoginForm />
    </Suspense>
  )
}
