import { cn } from '@/lib/utils'

/**
 * DataTable — a generic, presentational table.
 *
 * Deliberately stateless: filtering/sorting/pagination are driven page-side via
 * URL search params (the App Router idiom) rather than client state, so listing
 * pages stay server-rendered and shareable. Horizontally scrollable on small
 * screens so the page body never overflows.
 */
export interface Column<T> {
  /** Stable key for the column. */
  key: string
  header: React.ReactNode
  /** Cell renderer; defaults to nothing if omitted. */
  render: (row: T) => React.ReactNode
  align?: 'left' | 'right' | 'center'
  /** Extra classes applied to every cell in this column. */
  className?: string
  /** Hide below the `md` breakpoint to keep mobile tables readable. */
  hideOnMobile?: boolean
}

interface DataTableProps<T> {
  columns: Column<T>[]
  rows: T[]
  getRowKey: (row: T) => string
  /** Shown in place of the table body when there are no rows. */
  empty?: React.ReactNode
  className?: string
}

const ALIGN: Record<NonNullable<Column<unknown>['align']>, string> = {
  left: 'text-left',
  right: 'text-right',
  center: 'text-center',
}

export function DataTable<T>({ columns, rows, getRowKey, empty, className }: DataTableProps<T>) {
  if (rows.length === 0 && empty) {
    return <>{empty}</>
  }

  return (
    <div
      className={cn(
        'overflow-x-auto rounded-xl border border-outline-variant/30 bg-surface-container-lowest',
        className
      )}
    >
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-outline-variant/30 bg-surface-container-low">
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={cn(
                  'whitespace-nowrap px-5 py-3.5 font-body text-caption font-semibold uppercase tracking-widest text-secondary',
                  col.align && ALIGN[col.align],
                  col.hideOnMobile && 'hidden md:table-cell'
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={getRowKey(row)}
              className="border-b border-outline-variant/20 transition-colors last:border-0 hover:bg-surface-container-low/60"
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn(
                    'px-5 py-4 font-body text-body-md text-on-surface align-middle',
                    col.align && ALIGN[col.align],
                    col.hideOnMobile && 'hidden md:table-cell',
                    col.className
                  )}
                >
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
