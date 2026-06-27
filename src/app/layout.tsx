import type { Metadata } from 'next'
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
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-surface text-on-surface antialiased flex flex-col">
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
