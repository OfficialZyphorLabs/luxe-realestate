/**
 * not-found.tsx — global 404 page. Server component; renders under the root
 * layout (marketing chrome is suppressed by SiteChrome only for app routes, so
 * a public 404 keeps the nav/footer).
 */
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-margin-mobile py-stack-lg">
      <div className="max-w-md text-center">
        <p className="font-display text-display-lg font-bold text-primary">404</p>
        <h1 className="mt-2 font-display text-headline-lg font-semibold text-primary">
          Page not found
        </h1>
        <p className="mt-3 font-body text-body-md text-secondary">
          The page you’re looking for doesn’t exist or may have moved.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-body text-label-md font-semibold text-on-primary transition-standard hover:opacity-90 active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
            home
          </span>
          Back to home
        </Link>
      </div>
    </div>
  )
}
