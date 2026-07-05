import type { Metadata } from 'next'
import Script from 'next/script'
import { Inter, Playfair_Display } from 'next/font/google'
import { SiteChrome } from '@/components/layout/SiteChrome'
import { AuthSessionProvider } from '@/components/auth/SessionProvider'
import { SmoothScroll } from '@/components/providers/SmoothScroll'
import { Preloader } from '@/components/ui/Preloader'
import { ThemeProvider, ThemeApplicator } from '@/context/ThemeContext'
import { ThemeTransition } from '@/components/ui/ThemeTransition'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['600', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'LuxeReal — Find Your Legacy Home',
  description:
    'LuxeReal is a premium real estate platform connecting discerning buyers with exceptional properties. Since 1994.',
  keywords: ['luxury real estate', 'premium properties', 'homes for sale', 'LuxeReal'],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfairDisplay.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Warm up the font connections so the icon font arrives sooner. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* `display=block` renders icon glyphs invisibly (not as fallback ligature
            text like "location_on") until the font loads — kills the FOUT. The two
            Next lint rules below target *text* fonts: `block` is the right choice for
            a ligature icon font, and the link lives in the root layout so it loads
            site-wide (not per-page). */}
        {/* eslint-disable-next-line @next/next/google-font-display, @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-surface text-on-surface antialiased flex flex-col">
        {/* Synchronous guard: add `fonts-loading` to <html> before first paint and
            remove it once Material Symbols is ready (CSS hides icon boxes meanwhile).
            No-JS safe — if this never runs, icons fall back to display=block. The 3s
            timeout guarantees icons are never stuck hidden. Rendered via next/script
            (beforeInteractive) rather than a raw <script>, which React 19 refuses to
            execute and warns about in the dev overlay. */}
        <Script id="fonts-loading-guard" strategy="beforeInteractive">
          {`(function(){var d=document.documentElement;d.classList.add('fonts-loading');function done(){d.classList.remove('fonts-loading')}if(document.fonts&&document.fonts.load){document.fonts.load("24px 'Material Symbols Outlined'").then(done).catch(done);setTimeout(done,3000)}else{done()}})();`}
        </Script>
        <Preloader />
        <AuthSessionProvider>
          <ThemeProvider>
            <ThemeApplicator />
            <ThemeTransition />
            <SmoothScroll />
            <SiteChrome>{children}</SiteChrome>
          </ThemeProvider>
        </AuthSessionProvider>
      </body>
    </html>
  )
}
