/**
 * robots.ts — robots.txt. Public marketing + org catalog pages are crawlable;
 * the API and the SuperAdmin portal are disallowed. Org dashboards redirect
 * anonymous visitors to /login, so they're naturally excluded from indexing.
 */
import type { MetadataRoute } from 'next'
import { getBaseUrl } from '@/lib/email/client'

export default function robots(): MetadataRoute.Robots {
  const base = getBaseUrl()
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/superadmin'],
    },
    sitemap: `${base}/sitemap.xml`,
  }
}
