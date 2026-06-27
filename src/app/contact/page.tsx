'use client'

import { useState } from 'react'
import { ContactForm } from '@/components/contact/ContactForm'
import { FAQSection } from '@/components/contact/FAQSection'
import { Reveal } from '@/components/ui/Reveal'

export default function ContactPage() {
  const [sellEmail, setSellEmail] = useState('')

  return (
    <div className="pt-20 min-h-screen">
      {/* Contact Hero */}
      <section className="py-stack-lg">
        <div className="page-container">
          <Reveal>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Contact info */}
            <div className="lg:col-span-5">
              <span className="font-body text-label-md font-semibold uppercase tracking-widest text-on-primary-container">
                Get in Touch
              </span>
              <h1 className="font-display text-display-lg font-bold text-primary mt-3 leading-tight">
                Let&apos;s Find Your Next Chapter.
              </h1>

              <div className="mt-10 flex flex-col gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[18px] text-primary">location_on</span>
                  </div>
                  <div>
                    <p className="font-body text-label-md font-semibold text-on-surface uppercase tracking-widest text-xs">
                      Headquarters
                    </p>
                    <p className="font-body text-body-md text-secondary mt-1">
                      742 Madison Avenue, 4th Floor
                      <br />
                      New York, NY 10065
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[18px] text-primary">call</span>
                  </div>
                  <div>
                    <p className="font-body text-label-md font-semibold text-on-surface uppercase tracking-widest text-xs">
                      Phone
                    </p>
                    <a
                      href="tel:+12125550198"
                      className="font-body text-body-md text-secondary mt-1 hover:text-primary transition-colors block"
                    >
                      +1 (212) 555-0198
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[18px] text-primary">mail</span>
                  </div>
                  <div>
                    <p className="font-body text-label-md font-semibold text-on-surface uppercase tracking-widest text-xs">
                      Email
                    </p>
                    <a
                      href="mailto:concierge@luxereal.com"
                      className="font-body text-body-md text-secondary mt-1 hover:text-primary transition-colors block"
                    >
                      concierge@luxereal.com
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: map placeholder */}
            <div className="lg:col-span-7 relative h-72 lg:h-96 rounded-2xl overflow-hidden bg-surface-container-high">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="material-symbols-outlined text-[48px] text-outline/40">map</span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-surface/60 to-transparent" />
            </div>
          </div>
          </Reveal>
        </div>
      </section>

      {/* Inquiry Form */}
      <section className="py-stack-lg bg-surface-container-low">
        <div className="page-container">
          <Reveal>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm">
            {/* Left: dark info panel */}
            <div className="lg:col-span-5 bg-primary p-10 flex flex-col justify-between gap-8">
              <div>
                <h2 className="font-display text-headline-lg font-semibold text-on-primary">
                  General Inquiry
                </h2>
                <p className="font-body text-body-md text-on-primary/70 mt-3 leading-relaxed">
                  Whether you&apos;re looking for a private viewing or have a question about a
                  listing, our dedicated concierge team is ready to assist you within 24 hours.
                </p>
              </div>

              <div className="flex items-center gap-4 bg-primary-container/50 rounded-xl p-4">
                <div className="w-12 h-12 rounded-full bg-primary-fixed/20 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px] text-on-primary">
                    person
                  </span>
                </div>
                <div>
                  <p className="font-body text-label-md font-semibold text-on-primary">
                    Julian Thorne
                  </p>
                  <p className="font-body text-caption text-on-primary/60 uppercase tracking-widest">
                    Director of Client Relations
                  </p>
                </div>
              </div>
            </div>

            {/* Right: form */}
            <div className="lg:col-span-7 p-10">
              <ContactForm />
            </div>
          </div>
          </Reveal>
        </div>
      </section>

      {/* Sell Section */}
      <section className="py-stack-lg">
        <div className="page-container">
          <Reveal>
          <div className="text-center mb-10">
            <span className="font-body text-label-md font-semibold uppercase tracking-widest text-on-primary-container">
              Sell with Us
            </span>
            <h2 className="font-display text-headline-lg font-semibold text-primary mt-2">
              Sell with Excellence
            </h2>
            <p className="font-body text-body-md text-secondary mt-3 max-w-md mx-auto">
              Leverage our global network and data-driven marketing to list your property for its
              true value.
            </p>
          </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Global Visibility card */}
            <Reveal className="md:col-span-2">
            <div className="bg-surface-container rounded-2xl p-8 flex flex-col gap-4 h-full">
              <div className="w-10 h-10 rounded-xl bg-tertiary-fixed flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px] text-on-tertiary-fixed">
                  language
                </span>
              </div>
              <h3 className="font-display text-headline-md font-semibold text-primary">
                Global Visibility
              </h3>
              <p className="font-body text-body-md text-secondary leading-relaxed">
                Your property will be showcased across our exclusive international network, reaching
                ultra-high-net-worth investors from New York to Dubai.
              </p>
              <button className="flex items-center gap-2 font-body text-label-md text-primary hover:gap-3 transition-standard mt-2">
                Start Valuation
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
            </Reveal>

            {/* Email capture card */}
            <Reveal delay={0.1}>
            <div className="bg-primary rounded-2xl p-8 flex flex-col gap-5 h-full">
              <div>
                <h3 className="font-display text-headline-md font-semibold text-on-primary">
                  List Your Estate
                </h3>
                <p className="font-body text-body-md text-on-primary/70 mt-2">
                  Ready to move forward? Schedule a private consultation with our valuation
                  experts.
                </p>
              </div>
              <div className="flex flex-col gap-3 mt-auto">
                <input
                  type="email"
                  value={sellEmail}
                  onChange={(e) => setSellEmail(e.target.value)}
                  placeholder="Email for a callback"
                  className="bg-primary-container/50 border border-on-primary/20 rounded-lg px-4 py-3 font-body text-body-md text-on-primary placeholder:text-on-primary/50 focus:outline-none focus:border-on-primary/50 transition-standard"
                />
                <button className="bg-surface text-primary px-5 py-3 rounded-lg font-body text-label-md font-semibold hover:bg-surface-dim transition-standard active:scale-95">
                  Submit
                </button>
              </div>
            </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <Reveal>
        <FAQSection />
      </Reveal>
    </div>
  )
}
