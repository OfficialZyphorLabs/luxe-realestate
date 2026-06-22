'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useScrollShrink } from '@/hooks/useScrollShrink'

const NAV_LINKS = [
  { href: '/properties', label: 'Listings' },
  { href: '/about', label: 'Agents' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export function Navbar() {
  const isScrolled = useScrollShrink(50)
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-md transition-standard',
        isScrolled ? 'py-2 shadow-md' : 'py-4 shadow-sm'
      )}
    >
      <nav
        className="page-container flex items-center justify-between"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link href="/" className="font-display text-headline-md font-semibold text-primary">
          LuxeReal
        </Link>

        {/* Desktop nav links */}
        <ul className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
            return (
              <li key={`${link.href}-${link.label}`}>
                <Link
                  href={link.href}
                  className={cn(
                    'font-body text-label-md font-semibold transition-colors hover:text-primary',
                    isActive
                      ? 'text-primary border-b-2 border-primary pb-1'
                      : 'text-secondary'
                  )}
                >
                  {link.label}
                </Link>
              </li>
            )
          })}
        </ul>

        {/* Desktop right actions */}
        <div className="hidden md:flex items-center gap-3">
          <button
            className="flex items-center gap-1.5 bg-surface-container-low px-4 py-2 rounded-full font-body text-label-md text-secondary hover:text-primary transition-colors"
            aria-label="Search properties"
          >
            <span className="material-symbols-outlined text-[18px]">search</span>
            <span>Search</span>
          </button>
          <Link
            href="/contact"
            className="bg-primary text-on-primary px-5 py-2 rounded-full font-body text-label-md font-semibold hover:opacity-90 transition-standard active:scale-95"
          >
            List Your Property
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-primary"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle mobile menu"
          aria-expanded={mobileOpen}
        >
          <span className="material-symbols-outlined">{mobileOpen ? 'close' : 'menu'}</span>
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-surface border-t border-outline-variant/20 py-4">
          <div className="page-container flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={`mobile-${link.href}-${link.label}`}
                href={link.href}
                className="font-body text-body-md text-on-surface hover:text-primary transition-colors py-2"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/contact"
              className="bg-primary text-on-primary px-5 py-3 rounded-xl font-body text-label-md font-semibold text-center hover:opacity-90 transition-standard"
              onClick={() => setMobileOpen(false)}
            >
              List Your Property
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
