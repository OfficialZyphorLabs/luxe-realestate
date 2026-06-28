'use client'

/**
 * InviteMemberButton — opens a modal to invite someone by email + role, posting
 * to the existing POST /api/org/[slug]/invite endpoint (which sends the email and
 * stores only a hashed token). On success it refreshes the page so the new
 * pending invitation appears. Admin-only — rendered only when the viewer is an admin.
 */
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/dashboard/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'

const ROLE_OPTIONS = [
  { value: 'MEMBER', label: 'Member' },
  { value: 'ADMIN', label: 'Admin' },
]

export function InviteMemberButton({ slug }: { slug: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('MEMBER')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  function reset() {
    setEmail('')
    setRole('MEMBER')
    setError(null)
    setSuccess(null)
  }

  async function submit() {
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await fetch(`/api/org/${slug}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        setError(data.message ?? 'Could not send the invitation.')
        return
      }
      setSuccess(data.message ?? 'Invitation sent.')
      setEmail('')
      router.refresh()
    } catch {
      setError('Network error — please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button size="sm" onClick={() => { reset(); setOpen(true) }}>
        <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
          person_add
        </span>
        Invite Member
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Invite a member"
        description="They'll receive an email with a secure link to join your organization."
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button size="sm" onClick={submit} disabled={loading || !email}>
              {loading ? 'Sending…' : 'Send invite'}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input
            id="invite-email"
            type="email"
            label="Email address"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Select label="Role" options={ROLE_OPTIONS} value={role} onChange={setRole} />
          {error && (
            <p className="rounded-lg bg-error-container/50 px-3 py-2 font-body text-caption text-on-error-container">
              {error}
            </p>
          )}
          {success && (
            <p className="rounded-lg bg-primary/10 px-3 py-2 font-body text-caption text-primary">
              {success}
            </p>
          )}
        </div>
      </Modal>
    </>
  )
}
