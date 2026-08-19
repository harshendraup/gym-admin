import { AlertTriangle, RefreshCw, Salad } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DietPlanCard } from './DietPlanCard'
import type { DietRecord } from '@/api/diets.api'

interface DietPlanGridProps {
  data: DietRecord[] | undefined
  isLoading: boolean
  isError?: boolean
  errorMessage?: string
  onRetry?: () => void
  emptyMessage?: string
  memberLabel: (clientId: number) => string
  trainerLabel: (trainerId: number | null) => string
  onEdit?: (d: DietRecord) => void
  onDelete?: (d: DietRecord) => void
  deletingId?: number | null
}

/** The card-grid body shared by the Admin/Sub-Admin Diet Plans pages — mirrors MembershipPlanGrid's shape. */
export function DietPlanGrid({
  data, isLoading, isError, errorMessage = 'Something went wrong while loading diet plans.',
  onRetry, emptyMessage = 'No diet plans yet.', memberLabel, trainerLabel, onEdit, onDelete, deletingId,
}: DietPlanGridProps) {
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
          <Salad className="h-5 w-5 text-slate-500" />
        </div>
        <p className="text-sm text-slate-500">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {data.map((d) => (
        <DietPlanCard
          key={d.id}
          diet={d}
          memberLabel={memberLabel(d.clientId)}
          trainerLabel={trainerLabel(d.trainerId)}
          onEdit={onEdit}
          onDelete={onDelete}
          deleting={deletingId === d.id}
        />
      ))}
    </div>
  )
}
