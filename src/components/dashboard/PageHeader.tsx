/**
 * PageHeader — consistent dashboard page title block with an optional actions
 * slot (e.g. an "Invite member" button). Presentational.
 */
interface PageHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-headline-lg font-semibold text-primary">{title}</h1>
        {description && <p className="mt-1 font-body text-body-md text-secondary">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-3">{actions}</div>}
    </div>
  )
}
