'use client'

import Image from 'next/image'
import { useState } from 'react'
import type { Testimonial } from '@/types'

const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    name: 'Margaret Ashford',
    role: 'Acquired 3 Properties',
    quote:
      "LuxeReal didn't just find us a home — they found us a legacy. The attention to detail, the patience, the absolute discretion throughout the process was unlike anything we had experienced. We will never use another agency.",
    imageUrl:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: '2',
    name: 'James Harrington',
    role: 'Sold Estate in Beverly Hills',
    quote:
      'From the first call to closing, the team at LuxeReal operated with a level of professionalism I have come to expect only from the very best. They sold our estate at a price that exceeded our expectations.',
    imageUrl:
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&auto=format&fit=crop&q=80',
  },
]

export function TestimonialSection() {
  const [activeIndex, setActiveIndex] = useState(0)
  const testimonial = TESTIMONIALS[activeIndex]

  return (
    <section className="py-stack-lg">
      <div className="page-container">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          {/* Portrait */}
          <div className="relative w-full lg:w-5/12 aspect-[4/5] rounded-2xl overflow-hidden shadow-xl shrink-0">
            <Image
              src={testimonial.imageUrl}
              alt={`${testimonial.name} — client testimonial`}
              fill
              className="object-cover object-top transition-all duration-700"
              sizes="(max-width: 1024px) 100vw, 42vw"
            />
            {/* Quote overlay on image */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-primary/70 to-transparent">
              <span className="font-body text-label-md text-on-primary/80 uppercase tracking-widest">
                Client Testimonial
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col gap-8">
            <div>
              <span className="font-body text-label-md font-semibold uppercase tracking-widest text-on-primary-container">
                What Our Clients Say
              </span>
              <h2 className="font-display text-headline-lg font-semibold text-primary mt-2">
                What One Distinguished Client Has to Say
              </h2>
            </div>

            <blockquote className="border-l-4 border-tertiary-fixed-dim pl-6">
              <p className="font-body text-body-lg text-on-surface-variant leading-relaxed italic">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
            </blockquote>

            <div>
              <p className="font-display text-headline-md font-semibold text-primary">
                {testimonial.name}
              </p>
              <p className="font-body text-body-md text-secondary">{testimonial.role}</p>
            </div>

            {/* Navigation arrows */}
            <div className="flex items-center gap-4">
              <button
                onClick={() =>
                  setActiveIndex((activeIndex - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)
                }
                className="w-10 h-10 rounded-full border border-primary/30 flex items-center justify-center text-primary hover:bg-primary hover:text-on-primary transition-standard active:scale-95"
                aria-label="Previous testimonial"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              <button
                onClick={() => setActiveIndex((activeIndex + 1) % TESTIMONIALS.length)}
                className="w-10 h-10 rounded-full border border-primary/30 flex items-center justify-center text-primary hover:bg-primary hover:text-on-primary transition-standard active:scale-95"
                aria-label="Next testimonial"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
              <span className="font-body text-body-md text-secondary">
                {activeIndex + 1} / {TESTIMONIALS.length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
