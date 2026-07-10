'use client'

/**
 * PropertyForm — create/edit form for a listing (Phase 4).
 *
 * A controlled client form that builds a typed PropertyInput and calls the
 * create/update Server Action (an object payload, so the ordered image list
 * survives). Numeric fields are kept as strings in state and coerced on submit;
 * validation errors surface inline. An embedded ImageUrlManager handles the
 * ordered image URLs until the R2 upload pipeline lands (Phase 4 deferred item).
 */
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { Route } from 'next'
import { createProperty, updateProperty } from '@/lib/actions/properties'
import {
  PROPERTY_STATUSES,
  PROPERTY_TYPES,
  PROPERTY_STATUS_LABELS,
  PROPERTY_TYPE_LABELS,
  type PropertyInput,
} from '@/lib/validations/property'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import type { PropertyStatus, PropertyType } from '@/generated/prisma'

export interface PropertyFormDefaults {
  title: string
  description: string
  price: string
  address: string
  city: string
  state: string
  beds: string
  baths: string
  sqft: string
  propertyType: PropertyType
  status: PropertyStatus
  images: string[]
}

interface PropertyFormProps {
  slug: string
  mode: 'create' | 'edit'
  /** Required in edit mode — the property being edited. */
  propertyId?: string
  defaults?: Partial<PropertyFormDefaults>
  /** True when object storage is configured → show direct file upload. */
  uploadEnabled?: boolean
}

const EMPTY: PropertyFormDefaults = {
  title: '',
  description: '',
  price: '',
  address: '',
  city: '',
  state: '',
  beds: '',
  baths: '',
  sqft: '',
  propertyType: 'HOUSE',
  status: 'DRAFT',
  images: [],
}

const TYPE_OPTIONS = PROPERTY_TYPES.map((t) => ({ value: t, label: PROPERTY_TYPE_LABELS[t] }))
const STATUS_OPTIONS = PROPERTY_STATUSES.map((s) => ({ value: s, label: PROPERTY_STATUS_LABELS[s] }))

export function PropertyForm({ slug, mode, propertyId, defaults, uploadEnabled = false }: PropertyFormProps) {
  const router = useRouter()
  const initial = { ...EMPTY, ...defaults }

  const [values, setValues] = useState<PropertyFormDefaults>(initial)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  /** Patch a single field. */
  function set<K extends keyof PropertyFormDefaults>(key: K, value: PropertyFormDefaults[K]) {
    setValues((v) => ({ ...v, [key]: value }))
  }

  /** Convert an optional numeric string field to number | null. */
  function num(value: string): number | null {
    if (value.trim() === '') return null
    return Number(value)
  }

  function submit() {
    setError(null)
    const payload: PropertyInput = {
      title: values.title,
      description: values.description,
      price: values.price.trim() === '' ? 0 : Number(values.price),
      address: values.address,
      city: values.city,
      state: values.state,
      beds: num(values.beds),
      baths: num(values.baths),
      sqft: num(values.sqft),
      propertyType: values.propertyType,
      status: values.status,
      images: values.images,
    }

    startTransition(async () => {
      const res =
        mode === 'create'
          ? await createProperty(slug, payload)
          : await updateProperty(slug, propertyId!, payload)

      if (!res.ok) {
        setError(res.error)
        return
      }
      // Back to the listings index; the action already revalidated it.
      router.push(`/org/${slug}/listings` as Route)
      router.refresh()
    })
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
      className="flex flex-col gap-8"
    >
      {/* ── Core details ── */}
      <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <Input
            id="title"
            label="Listing title"
            placeholder="Oceanfront Villa with Infinity Pool"
            value={values.title}
            onChange={(e) => set('title', e.target.value)}
            required
          />
        </div>

        <Input
          id="price"
          type="number"
          min={0}
          label="Price (USD)"
          placeholder="4750000"
          value={values.price}
          onChange={(e) => set('price', e.target.value)}
          required
        />
        <Select
          id="propertyType"
          label="Property type"
          options={TYPE_OPTIONS}
          value={values.propertyType}
          onChange={(v) => set('propertyType', v as PropertyType)}
        />

        <Input
          id="address"
          label="Street address"
          placeholder="742 Madison Avenue"
          value={values.address}
          onChange={(e) => set('address', e.target.value)}
          required
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            id="city"
            label="City"
            placeholder="New York"
            value={values.city}
            onChange={(e) => set('city', e.target.value)}
            required
          />
          <Input
            id="state"
            label="State / Region"
            placeholder="NY"
            value={values.state}
            onChange={(e) => set('state', e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-3 gap-4 md:col-span-2">
          <Input
            id="beds"
            type="number"
            min={0}
            label="Beds"
            value={values.beds}
            onChange={(e) => set('beds', e.target.value)}
          />
          <Input
            id="baths"
            type="number"
            min={0}
            label="Baths"
            value={values.baths}
            onChange={(e) => set('baths', e.target.value)}
          />
          <Input
            id="sqft"
            type="number"
            min={0}
            label="Sq. ft."
            value={values.sqft}
            onChange={(e) => set('sqft', e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label
            htmlFor="description"
            className="font-body text-label-md text-xs font-semibold uppercase tracking-widest text-secondary"
          >
            Description
          </label>
          <textarea
            id="description"
            rows={5}
            placeholder="Describe the property, its setting, and standout features…"
            value={values.description}
            onChange={(e) => set('description', e.target.value)}
            className="rounded-lg border border-outline-variant/50 bg-surface-container-low px-4 py-3 font-body text-body-md text-on-surface transition-standard placeholder:text-secondary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </section>

      {/* ── Images ── */}
      <section>
        <h2 className="mb-1 font-display text-headline-md font-semibold text-primary">Photos</h2>
        <p className="mb-4 font-body text-body-md text-secondary">
          {uploadEnabled
            ? 'Upload photos or paste image URLs — the first is used as the cover.'
            : 'Add image URLs — the first is used as the cover.'}
        </p>
        <ImageUrlManager
          images={values.images}
          onChange={(imgs) => set('images', imgs)}
          slug={slug}
          uploadEnabled={uploadEnabled}
        />
      </section>

      {/* ── Status + submit ── */}
      <section className="flex flex-col gap-5 border-t border-outline-variant/30 pt-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="w-full sm:max-w-xs">
          <Select
            id="status"
            label="Visibility"
            options={STATUS_OPTIONS}
            value={values.status}
            onChange={(v) => set('status', v as PropertyStatus)}
          />
          <p className="mt-1.5 font-body text-caption text-secondary">
            Only <span className="font-semibold">Active</span> listings show on your public page.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => router.push(`/org/${slug}/listings` as Route)}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? 'Saving…' : mode === 'create' ? 'Create listing' : 'Save changes'}
          </Button>
        </div>
      </section>

      {error && (
        <p className="rounded-lg bg-error-container/50 px-3 py-2 font-body text-caption text-on-error-container">
          {error}
        </p>
      )}
    </form>
  )
}

/**
 * ImageUrlManager — ordered list of image URLs with add / remove / reorder.
 * Presentational preview thumbnails use a plain <img> (with alt) to sidestep
 * next/image sizing config for arbitrary hosts inside a form.
 */
function ImageUrlManager({
  images,
  onChange,
  slug,
  uploadEnabled,
}: {
  images: string[]
  onChange: (images: string[]) => void
  slug: string
  uploadEnabled: boolean
}) {
  const [draft, setDraft] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  function add() {
    const url = draft.trim()
    if (!url) return
    onChange([...images, url])
    setDraft('')
  }

  /** Upload the chosen files to object storage and append their public URLs. */
  async function upload(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploadError(null)
    setUploading(true)
    try {
      const urls: string[] = []
      for (const file of Array.from(files)) {
        const body = new FormData()
        body.append('file', file)
        const res = await fetch(`/api/org/${slug}/upload`, { method: 'POST', body })
        const data = await res.json()
        if (!res.ok || !data.ok) {
          setUploadError(data.message ?? 'Upload failed.')
          break
        }
        urls.push(data.url)
      }
      if (urls.length) onChange([...images, ...urls])
    } catch {
      setUploadError('Upload failed — please try again.')
    } finally {
      setUploading(false)
    }
  }

  function remove(index: number) {
    onChange(images.filter((_, i) => i !== index))
  }

  /** Move an image one slot toward the front (dir -1) or back (dir +1). */
  function move(index: number, dir: -1 | 1) {
    const target = index + dir
    if (target < 0 || target >= images.length) return
    const next = [...images]
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  return (
    <div className="flex flex-col gap-4">
      {images.length > 0 && (
        <ul className="flex flex-col gap-2">
          {images.map((url, i) => (
            <li
              key={`${url}-${i}`}
              className="flex items-center gap-3 rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-2"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Listing photo ${i + 1}`}
                className="h-14 w-20 shrink-0 rounded-lg bg-surface-container object-cover"
              />
              <div className="min-w-0 flex-1">
                {i === 0 && (
                  <span className="mb-0.5 inline-flex rounded bg-tertiary-fixed px-2 py-0.5 font-body text-caption font-semibold uppercase tracking-wider text-on-tertiary-fixed">
                    Cover
                  </span>
                )}
                <p className="truncate font-body text-caption text-secondary">{url}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <IconBtn label="Move up" icon="arrow_upward" onClick={() => move(i, -1)} disabled={i === 0} />
                <IconBtn
                  label="Move down"
                  icon="arrow_downward"
                  onClick={() => move(i, 1)}
                  disabled={i === images.length - 1}
                />
                <IconBtn label="Remove image" icon="close" tone="danger" onClick={() => remove(i)} />
              </div>
            </li>
          ))}
        </ul>
      )}

      {uploadEnabled && (
        <div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-outline-variant/60 px-4 py-3 font-body text-label-md font-semibold text-primary transition-colors hover:bg-surface-container-low">
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
              {uploading ? 'progress_activity' : 'upload'}
            </span>
            {uploading ? 'Uploading…' : 'Upload photos'}
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                void upload(e.target.files)
                e.target.value = '' // allow re-selecting the same file
              }}
            />
          </label>
          {uploadError && (
            <p className="mt-2 font-body text-caption text-error">{uploadError}</p>
          )}
        </div>
      )}

      <div className="flex items-end gap-3">
        <div className="flex-1">
          <Input
            id="image-url"
            type="url"
            label={uploadEnabled ? '…or paste an image URL' : 'Image URL'}
            placeholder="https://images.example.com/photo.jpg"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                add()
              }
            }}
          />
        </div>
        <Button type="button" variant="secondary" size="sm" onClick={add} disabled={!draft.trim()}>
          Add
        </Button>
      </div>
    </div>
  )
}

/** Small square icon button used by the image manager. */
function IconBtn({
  label,
  icon,
  onClick,
  disabled,
  tone = 'default',
}: {
  label: string
  icon: string
  onClick: () => void
  disabled?: boolean
  tone?: 'default' | 'danger'
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-full transition-colors disabled:opacity-30',
        tone === 'danger'
          ? 'text-error hover:bg-error-container/50'
          : 'text-secondary hover:bg-surface-container hover:text-primary'
      )}
    >
      <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
        {icon}
      </span>
    </button>
  )
}
