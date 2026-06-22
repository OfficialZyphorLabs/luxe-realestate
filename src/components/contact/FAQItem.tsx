'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { FAQItem as FAQItemType } from '@/types'

interface FAQItemProps {
  item: FAQItemType
}

export function FAQItem({ item }: FAQItemProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-outline-variant/30 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left"
        aria-expanded={open}
        aria-controls={`faq-${item.id}`}
      >
        <span className="font-body text-body-md font-semibold text-on-surface pr-4">
          {item.question}
        </span>
        <span
          className={cn(
            'material-symbols-outlined text-[22px] text-secondary shrink-0 transition-transform duration-300',
            open && 'rotate-180'
          )}
        >
          expand_more
        </span>
      </button>

      <div
        id={`faq-${item.id}`}
        className={cn(
          'overflow-hidden transition-all duration-300',
          open ? 'max-h-96 pb-5 opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <p className="font-body text-body-md text-secondary leading-relaxed">{item.answer}</p>
      </div>
    </div>
  )
}
