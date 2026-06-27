/**
 * AuthDivider.tsx — Labelled rule ("or") separating credential and OAuth options.
 */
export function AuthDivider({ label = 'or' }: { label?: string }) {
  return (
    <div className="flex items-center gap-4" aria-hidden="true">
      <span className="h-px flex-1 bg-outline-variant/40" />
      <span className="font-body text-caption uppercase tracking-widest text-secondary">{label}</span>
      <span className="h-px flex-1 bg-outline-variant/40" />
    </div>
  )
}
