/**
 * AuthHeader.tsx — Title + subtitle block atop each auth form.
 *
 * Uses the display serif for the title and muted body text for the subtitle,
 * per the type roles in DESIGN.md §3.
 */
interface AuthHeaderProps {
  title: string
  subtitle?: React.ReactNode
}

export function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="font-display text-headline-lg font-bold text-primary">{title}</h1>
      {subtitle && <p className="mt-2 font-body text-body-md text-secondary">{subtitle}</p>}
    </div>
  )
}
