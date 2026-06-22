import Image from 'next/image'
import { HeroSearchBar } from './HeroSearchBar'

export function HeroSection() {
  return (
    <section className="relative min-h-[600px] lg:min-h-[720px] flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <Image
        src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1600&auto=format&fit=crop&q=80"
        alt="Luxury estate exterior — LuxeReal hero"
        fill
        className="object-cover object-center"
        priority
        sizes="100vw"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-primary/40" />

      {/* Content */}
      <div className="relative z-10 text-center px-6 py-24 w-full max-w-4xl mx-auto flex flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-4">
          <span className="font-body text-label-md text-on-primary/80 uppercase tracking-widest">
            Premium Real Estate
          </span>
          <h1 className="font-display text-display-lg font-bold text-on-primary drop-shadow-md leading-tight">
            Find Your Legacy Home.
          </h1>
          <p className="font-body text-body-lg text-on-primary/90 max-w-xl drop-shadow">
            Discover exceptional properties curated for the discerning buyer. Luxury defined by
            craftsmanship, location, and legacy.
          </p>
        </div>

        <HeroSearchBar />

        <p className="font-body text-body-md text-on-primary/60">
          Over 200 exclusive listings across prime locations worldwide
        </p>
      </div>
    </section>
  )
}
