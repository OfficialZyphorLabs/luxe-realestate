'use client'

/**
 * ProfileForms — the two self-service forms on the profile page: edit
 * name/avatar, and change password. Both use useActionState against the profile
 * Server Actions with inline success/error + pending states.
 */
import { useActionState } from 'react'
import { updateProfile, changePassword, type FormState } from '@/lib/actions/profile'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

function Alert({ state }: { state: FormState }) {
  if (state.error) {
    return (
      <p className="rounded-lg bg-error-container/50 px-3 py-2 font-body text-caption text-on-error-container">
        {state.error}
      </p>
    )
  }
  if (state.success) {
    return (
      <p className="rounded-lg bg-primary/10 px-3 py-2 font-body text-caption text-primary">
        {state.success}
      </p>
    )
  }
  return null
}

export function ProfileDetailsForm({
  defaults,
}: {
  defaults: { name: string; avatarUrl: string }
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(updateProfile, {})
  return (
    <form action={action} className="flex flex-col gap-5">
      <Input id="name" name="name" label="Full name" defaultValue={defaults.name} />
      <Input
        id="avatarUrl"
        name="avatarUrl"
        label="Avatar URL"
        placeholder="https://…"
        defaultValue={defaults.avatarUrl}
      />
      <Alert state={state} />
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? 'Saving…' : 'Save profile'}
        </Button>
      </div>
    </form>
  )
}

export function PasswordForm({ hasPassword }: { hasPassword: boolean }) {
  const [state, action, pending] = useActionState<FormState, FormData>(changePassword, {})
  return (
    <form action={action} className="flex flex-col gap-5">
      {hasPassword && (
        <Input
          id="currentPassword"
          name="currentPassword"
          type="password"
          label="Current password"
          autoComplete="current-password"
        />
      )}
      <Input
        id="newPassword"
        name="newPassword"
        type="password"
        label="New password"
        autoComplete="new-password"
      />
      <Alert state={state} />
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? 'Updating…' : hasPassword ? 'Change password' : 'Set password'}
        </Button>
      </div>
    </form>
  )
}
