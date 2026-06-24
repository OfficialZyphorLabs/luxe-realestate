'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'

const INQUIRY_TYPES = [
  { value: 'buying', label: 'Buying' },
  { value: 'selling', label: 'Selling' },
  { value: 'renting', label: 'Renting' },
  { value: 'investment', label: 'Investment' },
  { value: 'other', label: 'Other' },
]

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    inquiryType: 'buying',
    message: '',
  })

  const handleChange =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
    }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-tertiary-fixed flex items-center justify-center">
          <span className="material-symbols-outlined text-[32px] text-on-tertiary-fixed">check_circle</span>
        </div>
        <h3 className="font-display text-headline-md font-semibold text-primary">
          Message Received
        </h3>
        <p className="font-body text-body-md text-secondary max-w-sm">
          Thank you for reaching out. A member of our concierge team will be in touch within 24
          hours.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Input
          id="fullName"
          label="Full Name"
          placeholder="John Doe"
          value={form.fullName}
          onChange={handleChange('fullName')}
          required
        />
        <Input
          id="email"
          type="email"
          label="Email Address"
          placeholder="john@example.com"
          value={form.email}
          onChange={handleChange('email')}
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Input
          id="phone"
          type="tel"
          label="Phone Number"
          placeholder="+1 (212) 000-0000"
          value={form.phone}
          onChange={handleChange('phone')}
        />
        <Select
          id="inquiryType"
          label="Inquiry Type"
          value={form.inquiryType}
          onChange={(val) => setForm((prev) => ({ ...prev, inquiryType: val }))}
          options={INQUIRY_TYPES}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="message"
          className="font-body text-label-md font-semibold text-secondary uppercase tracking-widest text-xs"
        >
          Message
        </label>
        <textarea
          id="message"
          rows={4}
          placeholder="How can we help you?"
          value={form.message}
          onChange={handleChange('message')}
          className="bg-surface-container-low border border-outline-variant/50 rounded-lg px-4 py-3 font-body text-body-md text-on-surface placeholder:text-secondary focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-standard resize-none"
        />
      </div>

      <Button type="submit" size="lg" fullWidth className="rounded-xl mt-2">
        Send Inquiry
      </Button>
    </form>
  )
}
