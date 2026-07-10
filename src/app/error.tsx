'use client'

/**
 * error.tsx — root error boundary. Catches unhandled runtime errors in the app
 * tree and shows a recoverable fallback instead of a broken screen. Client
 * component (required by Next for error boundaries). Logs the error so it's
 * visible in the server/console and any error-tracking hook.
 */
import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Surfaced to the console + any monitoring integration.
    console.error('[app] unhandled error:', error)
  }, [error])

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-margin-mobile py-stack-lg">
      <div className="max-w-md text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-error-container">
          <span className="material-symbols-outlined text-[28px] text-on-error-container" aria-hidden="true">
            error
          </span>
        </div>
        <h1 className="mt-4 font-display text-headline-lg font-semibold text-primary">
          Something went wrong
        </h1>
        <p className="mt-3 font-body text-body-md text-secondary">
          An unexpected error occurred. You can try again, or head back home.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-body text-label-md font-semibold text-on-primary transition-standard hover:opacity-90 active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
              refresh
            </span>
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center rounded-xl border border-primary px-6 py-3 font-body text-label-md font-semibold text-primary transition-standard hover:bg-primary hover:text-on-primary active:scale-95"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  )
}
