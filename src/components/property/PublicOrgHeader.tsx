import Link from 'next/link'

/**
 * PublicOrgHeader — the branded top bar shared by an org's public catalog and
 * property detail pages. Logo/name link back to the catalog. Brand color is an
 * inline style (the sanctioned per-tenant theming exception).
 */
interface PublicOrgHeaderProps {
  slug: string
  name: string
  logoUrl: string | null
  brand: string
}

export function PublicOrgHeader({ slug, name, logoUrl, brand }: PublicOrgHeaderProps) {
  return (
    <header className="border-b border-outline-variant/20 bg-surface-container-lowest">
      <div className="mx-auto flex max-w-container-max items-center px-margin-mobile py-4 md:px-margin-desktop">
        <Link href={`/org/${slug}/public`} className="flex items-center gap-3">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={`${name} logo`} className="h-8 w-auto" />
          ) : (
            <span
              className="flex h-9 w-9 items-center justify-center rounded-lg font-display text-headline-md font-semibold text-white"
              style={{ backgroundColor: brand }}
            >
              {name.charAt(0)}
            </span>
          )}
          <span className="font-display text-headline-md font-semibold text-primary">{name}</span>
        </Link>
      </div>
    </header>
  )
}

/** "Powered by LuxeReal" footer shown on every public page (GTM backlink loop). */
export function PublicOrgFooter() {
  return (
    <footer className="border-t border-outline-variant/20 px-margin-mobile py-6 md:px-margin-desktop">
      <p className="mx-auto max-w-container-max font-body text-caption text-secondary">
        Powered by{' '}
        <Link href="/" className="font-semibold text-primary hover:underline">
          LuxeReal
        </Link>
      </p>
    </footer>
  )
}
