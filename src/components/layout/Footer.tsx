import Link from 'next/link'

const FOOTER_LINKS = [
  { href: '/pricing', label: 'Pricing' },
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms of Service' },
  { href: '/fair-housing', label: 'Fair Housing' },
]

export function Footer() {
  return (
    <footer className="bg-primary text-on-primary">
      <div className="page-container py-10">
        {/* Top row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-8 border-b border-on-primary/10">
          <Link href="/" className="font-display text-headline-md font-semibold text-on-primary">
            LuxeReal
          </Link>
          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap gap-6">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-body text-label-md text-on-primary/70 hover:text-on-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6">
          <p className="font-body text-body-md text-on-primary/60">
            &copy; {new Date().getFullYear()} LuxeReal Estate. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="mailto:concierge@luxereal.com"
              aria-label="Email us"
              className="text-on-primary/70 hover:text-on-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[22px]">mail</span>
            </a>
            <a
              href="tel:+12125550198"
              aria-label="Call us"
              className="text-on-primary/70 hover:text-on-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[22px]">call</span>
            </a>
            <a
              href="#"
              aria-label="Visit our website"
              className="text-on-primary/70 hover:text-on-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[22px]">public</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
