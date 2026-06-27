/**
 * layout.tsx — Shared shell for all (auth) screens.
 *
 * A cinematic two-column split (DESIGN.md "Sophisticated Warmth"): a navy brand
 * panel with a luxury interior and a rotating-free editorial quote on the left,
 * and the form column on the right. The brand panel collapses on < lg screens so
 * forms get the full width on mobile (responsive-first). The marketing Navbar /
 * Footer are suppressed for these routes via SiteChrome.
 */
import Link from 'next/link'
import Image from 'next/image'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
      {/* ── Brand panel (lg+) ── */}
      <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-primary p-12">
        <Image
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&auto=format&fit=crop&q=80"
          alt="A serene, light-filled luxury living space"
          fill
          priority
          sizes="50vw"
          className="object-cover opacity-35"
        />
        {/* Navy wash for text legibility over the photo */}
        <div className="absolute inset-0 bg-primary/60" aria-hidden="true" />

        <Link
          href="/"
          className="relative z-10 font-display text-headline-md font-semibold text-on-primary"
        >
          LuxeReal
        </Link>

        <blockquote className="relative z-10 max-w-md">
          <p className="font-display text-headline-lg leading-tight text-on-primary">
            “The space where your next chapter begins deserves a partner who understands legacy.”
          </p>
          <footer className="mt-4 font-body text-label-md uppercase tracking-widest text-on-primary/70">
            LuxeReal — Since 1994
          </footer>
        </blockquote>
      </aside>

      {/* ── Form column ── */}
      <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-margin-mobile py-12 md:px-12 lg:min-h-0">
        {/* Mobile-only wordmark (brand panel is hidden below lg) */}
        <Link
          href="/"
          className="mb-8 font-display text-headline-md font-semibold text-primary lg:hidden"
        >
          LuxeReal
        </Link>
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  )
}
