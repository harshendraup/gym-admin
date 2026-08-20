import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table'
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react'

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[]
  data: TData[]
  isLoading?: boolean
  pagination?: {
    page: number
    pageCount: number
    onPageChange: (page: number) => void
  }
  emptyMessage?: string
}

export default function DataTable<TData>({
  columns,
  data,
  isLoading,
  pagination,
  emptyMessage = 'No records found',
}: DataTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  })

  return (
    <div
      className="overflow-hidden rounded-2xl"
      style={{
        background: 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(59,130,246,0.15)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
      }}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr
                key={hg.id}
                style={{
                  background: 'linear-gradient(180deg, #eef4ff 0%, #e2ecff 100%)',
                  borderBottom: '1.5px solid rgba(59,130,246,0.25)',
                }}
              >
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider"
                    style={{ color: '#2952a3' }}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                  {columns.map((_, j) => (
                    <td key={j} className="px-5 py-3.5">
                      <div className="skeleton h-4 w-full rounded-lg" />
                    </td>
                  ))}
                </tr>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl"
                      style={{ background: 'rgba(59,130,246,0.08)' }}
                    >
                      <Inbox className="h-5 w-5" style={{ color: '#94a3b8' }} />
                    </div>
                    <p className="text-sm" style={{ color: '#64748b' }}>{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="group relative transition-colors duration-200 ease-out hover:bg-primary/[0.05]"
                  style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}
                >
                  {row.getVisibleCells().map((cell, i) => (
                    <td key={cell.id} className="relative px-5 py-3.5">
                      {i === 0 && (
                        <span className="absolute left-0 top-0 h-full w-0.5 scale-y-0 bg-primary transition-transform duration-200 ease-out group-hover:scale-y-100" />
                      )}
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.pageCount > 1 && (
        <div
          className="flex items-center justify-between px-5 py-3.5"
          style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}
        >
          <p className="text-xs" style={{ color: '#64748b' }}>
            Page {pagination.page} of {pagination.pageCount}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 disabled:opacity-30"
              style={{
                background: 'rgba(255,255,255,0.6)',
                border: '1px solid rgba(59,130,246,0.15)',
                color: '#64748b',
              }}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.pageCount}
              className="flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 disabled:opacity-30"
              style={{
                background: 'rgba(255,255,255,0.6)',
                border: '1px solid rgba(59,130,246,0.15)',
                color: '#64748b',
              }}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
