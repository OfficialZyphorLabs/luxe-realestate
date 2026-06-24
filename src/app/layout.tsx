import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
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
        <ThemeProvider>
          <ThemeApplicator />
          <ThemeTransition />
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}
