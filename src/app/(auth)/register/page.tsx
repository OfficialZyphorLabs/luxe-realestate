'use client'

/**
 * register/page.tsx — New-organization self-service signup.
 *
 * Flow: validate locally (same Zod schema as the server) → POST /api/auth/register
 * → on success immediately sign in with the just-created credentials → land on
 * the new org dashboard. The org slug auto-derives from the organization name
 * until the user edits it manually, and its availability is checked with a
 * debounced call to /api/auth/check-slug.
 */
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { PasswordField } from '@/components/auth/PasswordField'
import { FormAlert } from '@/components/auth/FormAlert'
import { AuthHeader } from '@/components/auth/AuthHeader'
import { AuthDivider } from '@/components/auth/AuthDivider'
import { GoogleButton } from '@/components/auth/GoogleButton'
import { registerSchema, slugify } from '@/lib/validations/auth'

type FieldErrors = Partial<Record<'name' | 'email' | 'password' | 'orgName' | 'orgSlug', string>>
type SlugStatus = 'idle' | 'checking' | 'available' | 'taken'

export default function RegisterPage() {
  const router = useRouter()

  const [form, setForm] = useState({ name: '', email: '', password: '', orgName: '', orgSlug: '' })
  const [slugEdited, setSlugEdited] = useState(false)
  const [slugStatus, setSlugStatus] = useState<SlugStatus>('idle')
  const [slugReason, setSlugReason] = useState<string>('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Keep slug in sync with org name until the user takes control of it.
  const derivedSlug = slugEdited ? form.orgSlug : slugify(form.orgName)

  // Debounced availability check whenever the effective slug changes.
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    const slug = derivedSlug
    if (!slug || slug.length < 3) {
      setSlugStatus('idle')
      return
    }
    setSlugStatus('checking')
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/auth/check-slug?slug=${encodeURIComponent(slug)}`)
        const data = await res.json()
        if (data.available) {
          setSlugStatus('available')
        } else {
          setSlugStatus('taken')
          setSlugReason(data.reason ?? 'Unavailable')
        }
      } catch {
        setSlugStatus('idle')
      }
    }, 400)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [derivedSlug])

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')

    const payload = { ...form, orgSlug: derivedSlug }
    const parsed = registerSchema.safeParse(payload)
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors
      setErrors({
        name: fieldErrors.name?.[0],
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
        orgName: fieldErrors.orgName?.[0],
        orgSlug: fieldErrors.orgSlug?.[0],
      })
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      })
      const data = await res.json()

      if (!res.ok) {
        if (data.fieldErrors) {
          setErrors({
            email: data.fieldErrors.email?.[0],
            orgSlug: data.fieldErrors.orgSlug?.[0],
          })
        }
        setFormError(data.message ?? 'Registration failed. Please try again.')
        setSubmitting(false)
        return
      }

      // Auto sign-in with the credentials we just registered.
      const signInRes = await signIn('credentials', {
        email: parsed.data.email,
        password: parsed.data.password,
        redirect: false,
      })
      if (signInRes?.error) {
        // Account exists but sign-in failed — send them to login.
        router.push('/login')
        return
      }
      router.push(`/org/${data.orgSlug}/dashboard`)
    } catch {
      setFormError('Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <>
      <AuthHeader
        title="Create your workspace"
        subtitle="Start your 14-day free trial — no credit card required."
      />

      {formError && (
        <FormAlert variant="error" className="mb-6">
          {formError}
        </FormAlert>
      )}

      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
        <Input
          id="name"
          label="Full name"
          autoComplete="name"
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
          error={errors.name}
          placeholder="Marcus Reeves"
        />
        <Input
          id="email"
          label="Work email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={(e) => update('email', e.target.value)}
          error={errors.email}
          placeholder="you@agency.com"
        />
        <PasswordField
          id="password"
          label="Password"
          autoComplete="new-password"
          value={form.password}
          onChange={(e) => update('password', e.target.value)}
          error={errors.password}
          showStrength
          placeholder="At least 8 characters"
        />

        <div className="h-px bg-outline-variant/30" />

        <Input
          id="orgName"
          label="Organization name"
          value={form.orgName}
          onChange={(e) => update('orgName', e.target.value)}
          error={errors.orgName}
          placeholder="Acme Realty"
        />

        {/* Slug field with live availability state */}
        <div className="flex flex-col gap-1.5">
          <Input
            id="orgSlug"
            label="Workspace URL"
            value={derivedSlug}
            onChange={(e) => {
              setSlugEdited(true)
              update('orgSlug', slugify(e.target.value))
            }}
            error={errors.orgSlug}
            placeholder="acme-realty"
          />
          <p className="font-body text-caption text-secondary">
            luxereal.com/org/<span className="font-semibold text-on-surface">{derivedSlug || 'your-slug'}</span>
            {slugStatus === 'checking' && <span className="ml-2">· checking…</span>}
            {slugStatus === 'available' && (
              <span className="ml-2 text-on-tertiary-fixed">· available</span>
            )}
            {slugStatus === 'taken' && <span className="ml-2 text-error">· {slugReason}</span>}
          </p>
        </div>

        <Button
          type="submit"
          size="lg"
          fullWidth
          disabled={submitting || slugStatus === 'taken'}
          className="mt-2"
        >
          {submitting ? 'Creating your workspace…' : 'Create workspace'}
        </Button>
      </form>

      <div className="my-6">
        <AuthDivider />
      </div>
      <GoogleButton callbackUrl="/" label="Sign up with Google" />

      <p className="mt-8 text-center font-body text-body-md text-secondary">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </>
  )
}
