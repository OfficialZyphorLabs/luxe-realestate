'use client'

/**
 * OrgSettingsForm — edits org name, logo URL, brand color, and public-listing
 * visibility. Submits to the updateOrgSettings Server Action via useActionState,
 * surfacing inline success/error and a pending state.
 */
import { useActionState } from 'react'
import { updateOrgSettings, type FormState } from '@/lib/actions/org'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

interface OrgSettingsFormProps {
  slug: string
  defaults: {
    name: string
    logoUrl: string
    primaryColor: string
    allowPublicListings: boolean
  }
}

export function OrgSettingsForm({ slug, defaults }: OrgSettingsFormProps) {
  const action = updateOrgSettings.bind(null, slug)
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {})

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-6">
      <Input
        id="name"
        name="name"
        label="Organization name"
        defaultValue={defaults.name}
        required
      />
      <Input
        id="logoUrl"
        name="logoUrl"
        label="Logo URL"
        placeholder="https://…"
        defaultValue={defaults.logoUrl}
      />

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="primaryColor"
          className="font-body text-label-md text-xs font-semibold uppercase tracking-widest text-secondary"
        >
          Brand color
        </label>
        <div className="flex items-center gap-3">
          <input
            id="primaryColor"
            name="primaryColor"
            type="text"
            defaultValue={defaults.primaryColor}
            placeholder="#041627"
            className="flex-1 rounded-lg border border-outline-variant/50 bg-surface-container-low px-4 py-3 font-body text-body-md text-on-surface transition-standard focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <p className="font-body text-caption text-secondary">
          Used to white-label your public listing page. 6-digit hex, e.g. #041627.
        </p>
      </div>

      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          name="allowPublicListings"
          defaultChecked={defaults.allowPublicListings}
          className="h-5 w-5 rounded border-outline-variant/60 text-primary accent-primary"
        />
        <span className="font-body text-body-md text-on-surface">
          Allow this organization&rsquo;s listings to appear publicly
        </span>
      </label>

      {state.error && (
        <p className="rounded-lg bg-error-container/50 px-3 py-2 font-body text-caption text-on-error-container">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="rounded-lg bg-primary/10 px-3 py-2 font-body text-caption text-primary">
          {state.success}
        </p>
      )}

      <div>
        <Button type="submit" disabled={pending}>
          {pending ? 'Saving…' : 'Save changes'}
        </Button>
      </div>
    </form>
  )
}
