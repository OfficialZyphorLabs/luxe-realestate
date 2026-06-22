import Link from 'next/link'
import { FAQItem } from './FAQItem'
import type { FAQItem as FAQItemType } from '@/types'

const FAQ_ITEMS: FAQItemType[] = [
  {
    id: '1',
    question: 'How do I schedule a private property viewing?',
    answer:
      'Simply fill out our inquiry form or call our concierge line. We will arrange a private showing at a time that suits you, including after-hours and weekend appointments for our clients.',
  },
  {
    id: '2',
    question: 'What are the fees for listing a property with LuxeReal?',
    answer:
      'Our commission structure is tailored to the individual property and market conditions. We discuss all fees transparently during your initial consultation — there are no hidden charges.',
  },
  {
    id: '3',
    question: 'Do you handle international property acquisitions?',
    answer:
      'Yes. With offices on four continents and deep relationships in every major luxury market, we regularly assist clients with cross-border transactions from sourcing to closing.',
  },
  {
    id: '4',
    question: 'How long does the selling process typically take?',
    answer:
      'Our premium listings typically receive qualified offers within 30-60 days of listing. We focus on quality over speed — ensuring the right buyer at the right price rather than a rushed sale.',
  },
  {
    id: '5',
    question: 'Can I get a property valuation before committing to selling?',
    answer:
      'Absolutely. We offer complimentary, no-obligation valuations conducted by our senior agents. We will provide a comprehensive market analysis and positioning strategy for your property.',
  },
]

export function FAQSection() {
  return (
    <section className="py-stack-lg">
      <div className="page-container">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Intro */}
          <div className="lg:col-span-1">
            <span className="font-body text-label-md font-semibold uppercase tracking-widest text-on-primary-container">
              FAQ
            </span>
            <h2 className="font-display text-headline-lg font-semibold text-primary mt-2">
              Frequently Asked Questions
            </h2>
            <p className="font-body text-body-md text-secondary mt-4 leading-relaxed">
              Find quick answers to the most common questions about the luxury home buying and
              selling process.
            </p>
            <div className="mt-8 bg-surface-container rounded-xl p-5">
              <p className="font-body text-body-md text-on-surface font-semibold">
                Can&apos;t find what you&apos;re looking for?
              </p>
              <Link
                href="mailto:concierge@luxereal.com"
                className="flex items-center gap-2 mt-3 font-body text-label-md text-primary hover:gap-3 transition-standard"
              >
                Email Support
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
            </div>
          </div>

          {/* Accordion */}
          <div className="lg:col-span-2">
            {FAQ_ITEMS.map((item) => (
              <FAQItem key={item.id} item={item} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
