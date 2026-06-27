'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useScroll, useMotionValueEvent } from 'motion/react'
import { cn } from '@/lib/utils'
import { NavDesktopBody, NavMobileBody, MobileMenuPanel } from '@/components/ui/resizable-navbar'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { NavAuthControls } from '@/components/layout/NavAuthControls'

const NAV_LINKS = [
  { href: '/properties', label: 'Listings' },
  { href: '/about', label: 'Agents' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [visible, setVisible] = useState(false)

  const { scrollY } = useScroll()
  useMotionValueEvent(scrollY, 'change', (latest) => {
    const threshold = typeof window !== 'undefined' ? window.innerHeight * 0.5 : 400
    setVisible(latest > threshold)
  })

  const linkClass = (href: string) =>
    cn(
      'font-body text-label-md font-semibold transition-colors duration-200',
      visible
        ? 'text-on-primary/80 hover:text-on-primary'
        : pathname === href || pathname.startsWith(href + '/')
          ? 'text-primary border-b-2 border-primary pb-0.5'
          : 'text-secondary hover:text-primary'
    )

  return (
    <header className="fixed inset-x-0 top-0 z-50" aria-label="Main navigation">
      {/* ── Desktop ── */}
      <NavDesktopBody visible={visible}>
        {/* Logo */}
        <Link
          href="/"
          className={cn(
            'font-display text-headline-md font-semibold shrink-0 transition-colors duration-300',
            visible ? 'text-on-primary' : 'text-primary'
          )}
        >
          LuxeReal
        </Link>

        {/* Centered nav links */}
        <nav className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <ul className="flex items-center gap-8 pointer-events-auto">
            {NAV_LINKS.map((link) => (
              <li key={`${link.href}-${link.label}`}>
                <Link href={link.href} className={linkClass(link.href)}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3 shrink-0">
          {!visible && (
            <button
              className="hidden xl:flex items-center gap-1.5 bg-surface-container-low px-4 py-2 rounded-full font-body text-label-md text-secondary hover:text-primary transition-colors"
              aria-label="Search properties"
            >
              <span className="material-symbols-outlined text-[18px]">search</span>
              Search
            </button>
          )}
          <ThemeToggle visible={visible} />
          <NavAuthControls visible={visible} />
          <Link
            href="/contact"
            className={cn(
              'px-5 py-2 rounded-full font-body text-label-md font-semibold transition-standard active:scale-95 whitespace-nowrap',
              visible
                ? 'bg-on-primary text-primary hover:bg-surface-dim'
                : 'bg-primary text-on-primary hover:opacity-90'
            )}
          >
            List Your Property
          </Link>
        </div>
      </NavDesktopBody>

      {/* ── Mobile ── */}
      <NavMobileBody visible={visible}>
        <div className="flex items-center justify-between w-full">
          <Link
            href="/"
            className={cn(
              'font-display text-headline-md font-semibold transition-colors duration-300',
              visible ? 'text-on-primary' : 'text-primary'
            )}
          >
            LuxeReal
          </Link>

          <div className="flex items-center gap-1">
            <ThemeToggle visible={visible} />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={cn(
                'p-2 transition-colors',
                visible ? 'text-on-primary' : 'text-primary'
              )}
              aria-label="Toggle mobile menu"
              aria-expanded={mobileOpen}
            >
              <span className="material-symbols-outlined">
                {mobileOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>

        {/* Slide-down mobile menu */}
        <MobileMenuPanel isOpen={mobileOpen}>
          {NAV_LINKS.map((link) => (
            <Link
              key={`mobile-${link.href}-${link.label}`}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-3 rounded-xl font-body text-body-md text-on-primary/80 hover:text-on-primary hover:bg-primary-container/50 transition-standard"
            >
              {link.label}
            </Link>
          ))}
          <div className="border-t border-on-primary/10 mt-1 pt-3 space-y-1">
            <NavAuthControls visible={visible} variant="mobile" onNavigate={() => setMobileOpen(false)} />
            <Link
              href="/contact"
              onClick={() => setMobileOpen(false)}
              className="block w-full bg-on-primary text-primary px-5 py-3 rounded-xl font-body text-label-md font-semibold text-center hover:bg-surface-dim transition-standard active:scale-95"
            >
              List Your Property
            </Link>
          </div>
        </MobileMenuPanel>
      </NavMobileBody>
    </header>
  )
}
