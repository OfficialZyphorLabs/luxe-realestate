'use client'

/**
 * HeroSection.tsx — Cinematic hero.
 *
 * Three layered, GPU-only motions (all transform/opacity):
 *  1. Ken-Burns — the background image slowly zooms (scale) in a gentle loop.
 *  2. Parallax — the image drifts down as you scroll past, via `useScroll`.
 *  3. Entrance — eyebrow → headline → copy → search → footnote stagger in on load.
 *
 * The image wrapper is oversized (-inset-y-[12%] + base zoom) so the parallax
 * translate never exposes an edge. Content/copy/image path are unchanged, and
 * the markup is server-rendered (client component still SSRs) so the <h1> stays
 * crawlable. Reduced-motion renders everything static.
 */
import Image from 'next/image'
import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { HeroSearchBar } from './HeroSearchBar'

// Stagger the text block on load.
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
}
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } },
}

export function HeroSection() {
  const reduce = useReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)

  // Drive parallax from this section's scroll progress.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '8%'])

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[600px] lg:min-h-[720px] flex items-center justify-center overflow-hidden"
    >
      {/* Parallax + Ken-Burns image layer (oversized to hide the drift) */}
      <motion.div
        className="absolute inset-x-0 -inset-y-[12%]"
        style={reduce ? undefined : { y: imageY }}
      >
        <motion.div
          className="relative h-full w-full"
          initial={reduce ? false : { scale: 1.08 }}
          animate={reduce ? undefined : { scale: 1.16 }}
          transition={
            reduce
              ? undefined
              : { duration: 20, ease: 'easeInOut', repeat: Infinity, repeatType: 'mirror' }
          }
        >
          <Image
            src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1600&auto=format&fit=crop&q=80"
            alt="Luxury estate exterior — LuxeReal hero"
            fill
            className="object-cover object-center"
            priority
            sizes="100vw"
          />
        </motion.div>
      </motion.div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-primary/40" />

      {/* Content */}
      <motion.div
        className="relative z-10 text-center px-6 py-24 w-full max-w-4xl mx-auto flex flex-col items-center gap-8"
        variants={reduce ? undefined : container}
        initial={reduce ? false : 'hidden'}
        animate={reduce ? undefined : 'show'}
      >
        <div className="flex flex-col items-center gap-4">
          <motion.span
            variants={reduce ? undefined : item}
            className="font-body text-label-md text-on-primary/80 uppercase tracking-widest"
          >
            Premium Real Estate
          </motion.span>
          <motion.h1
            variants={reduce ? undefined : item}
            className="font-display text-display-lg font-bold text-on-primary drop-shadow-md leading-tight"
          >
            Find Your Legacy Home.
          </motion.h1>
          <motion.p
            variants={reduce ? undefined : item}
            className="font-body text-body-lg text-on-primary/90 max-w-xl drop-shadow"
          >
            Discover exceptional properties curated for the discerning buyer. Luxury defined by
            craftsmanship, location, and legacy.
          </motion.p>
        </div>

        <motion.div variants={reduce ? undefined : item} className="w-full flex justify-center">
          <HeroSearchBar />
        </motion.div>

        <motion.p
          variants={reduce ? undefined : item}
          className="font-body text-body-md text-on-primary/60"
        >
          Over 200 exclusive listings across prime locations worldwide
        </motion.p>
      </motion.div>
    </section>
  )
}
