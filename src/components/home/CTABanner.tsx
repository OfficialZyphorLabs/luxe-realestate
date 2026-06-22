import Link from 'next/link'

export function CTABanner() {
  return (
    <section className="py-stack-lg">
      <div className="page-container">
        <div className="relative bg-primary rounded-[40px] overflow-hidden px-10 py-16 flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Decorative blur accent */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-primary-fixed/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-8 w-48 h-48 bg-tertiary-fixed/5 rounded-full blur-3xl pointer-events-none" />

          {/* Text */}
          <div className="relative z-10 text-center md:text-left">
            <span className="font-body text-label-md text-on-primary/70 uppercase tracking-widest">
              Ready to Begin?
            </span>
            <h2 className="font-display text-headline-lg font-semibold text-on-primary mt-2">
              Ready to list your masterpiece?
            </h2>
            <p className="font-body text-body-md text-on-primary/70 mt-2">
              Let our experts bring your property to the world's most qualified buyers.
            </p>
          </div>

          {/* CTAs */}
          <div className="relative z-10 flex flex-col sm:flex-row gap-4 shrink-0">
            <Link
              href="/contact"
              className="bg-surface text-primary px-8 py-4 rounded-xl font-body text-label-md font-semibold hover:bg-surface-dim transition-standard active:scale-95"
            >
              Get a Valuation
            </Link>
            <Link
              href="/properties"
              className="bg-transparent border border-white text-white px-8 py-4 rounded-xl font-body text-label-md font-semibold hover:bg-white/10 transition-standard active:scale-95"
            >
              Browse Listings
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
