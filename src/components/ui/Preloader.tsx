/**
 * Preloader.tsx — Tasteful first-load brand veil.
 *
 * Intentionally a Server Component with zero JS: all motion lives in CSS
 * (see globals.css `.preloader`), so the veil renders in the initial HTML
 * (covering content from first paint — no flash), self-dismisses via
 * animation-fill-mode even if JS never runs, and collapses to ~instant under
 * `prefers-reduced-motion`. `aria-hidden` keeps it out of the accessibility tree
 * since the real content sits behind it.
 */
export function Preloader() {
  return (
    <div className="preloader" aria-hidden="true">
      <div className="preloader__mark flex flex-col items-center gap-5">
        <span className="font-display text-display-lg font-bold text-primary">LuxeReal</span>
        <span className="block h-px w-32 overflow-hidden rounded-full bg-outline-variant/30">
          <span className="preloader__line block h-full bg-primary" />
        </span>
      </div>
    </div>
  )
}
