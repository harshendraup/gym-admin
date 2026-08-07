import type { ColumnDef } from '@tanstack/react-table'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import DataTable from '@/components/data-table/DataTable'
import { Button } from '@/components/ui/button'

interface EntityListPageProps<TData> {
  title: string
  description?: string
  columns: ColumnDef<TData>[]
  data: TData[] | undefined
  isLoading: boolean
  isError?: boolean
  errorMessage?: string
  onRetry?: () => void
  emptyMessage?: string
  toolbar?: React.ReactNode
  actions?: React.ReactNode
  pagination?: { page: number; pageCount: number; onPageChange: (page: number) => void }
}

/**
 * The one reusable list-page shell every list screen (members, branches,
 * admins, sub-admins) is built from: title/description/actions header,
 * optional toolbar row, then either an inline error state or `DataTable`
 * (which already owns loading skeletons, the empty state, and pagination).
 */
export function EntityListPage<TData>({
  title,
  description,
  columns,
  data,
  isLoading,
  isError,
  errorMessage = 'Something went wrong while loading this data.',
  onRetry,
  emptyMessage,
  toolbar,
  actions,
  pagination,
}: EntityListPageProps<TData>) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          {description && (
            <p className="mt-1 text-sm" style={{ color: '#64748B' }}>
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {toolbar && <div className="flex flex-wrap gap-3">{toolbar}</div>}

      {isError ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-red-200 bg-red-50/60 py-16">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100">
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          <p className="text-sm text-red-700">{errorMessage}</p>
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              Retry
            </Button>
          )}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={data ?? []}
          isLoading={isLoading}
          emptyMessage={emptyMessage}
          pagination={pagination}
        />
      )}
    </div>
  )
}
