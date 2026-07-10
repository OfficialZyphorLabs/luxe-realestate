/**
 * sitemap.ts — dynamic sitemap covering the marketing pages plus every ACTIVE,
 * publicly-listed org's catalog and property detail pages (the SEO surface that
 * powers organic lead-gen). Marked force-dynamic so it's generated per request
 * (it reads the DB) rather than at build time, and it degrades to just the
 * static routes if the DB is unavailable.
 */
import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'
import { getBaseUrl } from '@/lib/email/client'

export const dynamic = 'force-dynamic'

const STATIC_ROUTES = ['', '/properties', '/about', '/agents', '/contact', '/pricing', '/terms', '/privacy', '/fair-housing']

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getBaseUrl()
  const now = new Date()

  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: path === '' ? 1 : 0.7,
  }))

  try {
    const orgs = await prisma.organization.findMany({
      where: { status: 'ACTIVE', settings: { allowPublicListings: true } },
      select: {
        slug: true,
        properties: {
          where: { status: 'ACTIVE' },
          select: { slug: true, updatedAt: true },
          take: 500,
        },
      },
      take: 1000,
    })

    for (const org of orgs) {
      entries.push({
        url: `${base}/org/${org.slug}/public`,
        lastModified: now,
        changeFrequency: 'daily',
        priority: 0.8,
      })
      for (const p of org.properties) {
        entries.push({
          url: `${base}/org/${org.slug}/public/${p.slug}`,
          lastModified: p.updatedAt,
          changeFrequency: 'weekly',
          priority: 0.6,
        })
      }
    }
  } catch (e) {
    // DB unavailable at request time — still return the static routes.
    console.error('[sitemap] failed to load org listings:', e)
  }

  return entries
}
