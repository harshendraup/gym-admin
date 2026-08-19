import { AlertTriangle, RefreshCw, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MembershipPlanCard } from './MembershipPlanCard'
import type { MembershipRecord } from '@/api/memberships.api'

interface MembershipPlanGridProps {
  data: MembershipRecord[] | undefined
  isLoading: boolean
  isError?: boolean
  errorMessage?: string
  onRetry?: () => void
  emptyMessage?: string
  branchLabel: (branchId: number | null) => string
  onEdit?: (m: MembershipRecord) => void
  onDelete?: (m: MembershipRecord) => void
  deletingId?: number | null
}

/** The card-grid body shared by all three Memberships pages — a pricing-card layout instead of a data table, since these cards are what a member actually sees. */
export function MembershipPlanGrid({
  data, isLoading, isError, errorMessage = 'Something went wrong while loading membership plans.',
  onRetry, emptyMessage = 'No membership plans yet.', branchLabel, onEdit, onDelete, deletingId,
}: MembershipPlanGridProps) {
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-red-200 bg-red-50/60 py-16">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100">
          <AlertTriangle className="h-5 w-5 text-red-500" />
        </div>
        <p className="text-sm text-red-700">{errorMessage}</p>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Retry
          </Button>
        )}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-80 animate-pulse rounded-2xl border border-slate-200 bg-slate-50" />
        ))}
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 py-16 text-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
          <CreditCard className="h-5 w-5 text-slate-500" />
        </div>
        <p className="text-sm text-slate-500">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {data.map((m) => (
        <MembershipPlanCard
          key={m.id}
          membership={m}
          branchLabel={branchLabel(m.branchId)}
          onEdit={onEdit}
          onDelete={onDelete}
          deleting={deletingId === m.id}
        />
      ))}
    </div>
  )
}
