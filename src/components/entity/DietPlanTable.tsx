import { useState } from 'react'
import {
  ChevronDown, ChevronRight, Flame, GlassWater, Pencil, Trash2, AlertTriangle, RefreshCw, Salad, Activity,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useDietProgress } from '@/hooks/useDietTracking'
import type { DietAssignmentRecord, DietAssignmentStatus } from '@/api/diet-assignments.api'
import type { DietPlanRecord } from '@/api/diet-plans.api'

const STATUS_BADGE: Record<DietAssignmentStatus, 'secondary' | 'success' | 'default'> = {
  Draft: 'secondary',
  Active: 'success',
  Completed: 'default',
}

const ADHERENCE_STYLE = {
  Good: 'text-emerald-600 bg-emerald-50',
  'Needs Attention': 'text-amber-600 bg-amber-50',
  'At Risk': 'text-red-600 bg-red-50',
} as const

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase()
}

interface DietPlanTableProps {
  data: DietAssignmentRecord[] | undefined
  planLookup: (dietPlanId: number) => DietPlanRecord | undefined
  isLoading: boolean
  isError?: boolean
  errorMessage?: string
  onRetry?: () => void
  emptyMessage?: string
  memberLabel: (memberId: number) => string
  trainerLabel: (trainerId: number | null) => string
  onEdit?: (a: DietAssignmentRecord) => void
  onDelete?: (a: DietAssignmentRecord) => void
  deletingId?: number | null
}

/**
 * Tabular replacement for the assignment card grid — one row per member,
 * with an expand chevron revealing the detail a card used to show
 * up-front (macros, hydration, description, live adherence).
 */
export function DietPlanTable({
  data, planLookup, isLoading, isError, errorMessage = 'Something went wrong while loading diet plan assignments.',
  onRetry, emptyMessage = 'No diet plans assigned yet.', memberLabel, trainerLabel, onEdit, onDelete, deletingId,
}: DietPlanTableProps) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set())

  const toggle = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

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
            <tr
              style={{
                background: 'linear-gradient(180deg, #eef4ff 0%, #e2ecff 100%)',
                borderBottom: '1.5px solid rgba(59,130,246,0.25)',
              }}
            >
              <th className="w-10 px-3 py-3" />
              <th className="px-3 py-3 text-left text-[11px] font-bold uppercase tracking-wider" style={{ color: '#2952a3' }}>Member</th>
              <th className="px-3 py-3 text-left text-[11px] font-bold uppercase tracking-wider" style={{ color: '#2952a3' }}>Plan</th>
              <th className="px-3 py-3 text-left text-[11px] font-bold uppercase tracking-wider" style={{ color: '#2952a3' }}>Coach</th>
              <th className="px-3 py-3 text-left text-[11px] font-bold uppercase tracking-wider" style={{ color: '#2952a3' }}>Calories</th>
              <th className="px-3 py-3 text-left text-[11px] font-bold uppercase tracking-wider" style={{ color: '#2952a3' }}>Duration</th>
              <th className="px-3 py-3 text-left text-[11px] font-bold uppercase tracking-wider" style={{ color: '#2952a3' }}>Adherence</th>
              <th className="px-3 py-3 text-left text-[11px] font-bold uppercase tracking-wider" style={{ color: '#2952a3' }}>Status</th>
              <th className="px-3 py-3 text-right text-[11px] font-bold uppercase tracking-wider" style={{ color: '#2952a3' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                  {Array.from({ length: 9 }).map((_, j) => (
                    <td key={j} className="px-3 py-3.5"><div className="skeleton h-4 w-full rounded-lg" /></td>
                  ))}
                </tr>
              ))
            ) : !data || data.length === 0 ? (
              <tr>
                <td colSpan={9}>
                  <div className="flex flex-col items-center justify-center gap-3 py-16">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: 'rgba(59,130,246,0.08)' }}>
                      <Salad className="h-5 w-5" style={{ color: '#94a3b8' }} />
                    </div>
                    <p className="text-sm" style={{ color: '#64748b' }}>{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((a) => {
                const plan = planLookup(a.dietPlanId)
                const isOpen = expanded.has(a.id)
                const member = memberLabel(a.memberId)
                const trainer = trainerLabel(a.trainerId)
                const isTrainerAssigned = trainer !== 'Unassigned'
                const num = (v: string) => Number(v)

                return (
                  <FragmentRow key={a.id}>
                    <tr
                      className="group cursor-pointer transition-colors duration-200 ease-out hover:bg-primary/[0.05]"
                      style={{ borderBottom: isOpen ? 'none' : '1px solid rgba(0,0,0,0.04)' }}
                      onClick={() => toggle(a.id)}
                    >
                      <td className="px-3 py-3">
                        <button type="button" className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                          {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </button>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700">
                            {initials(member)}
                          </div>
                          <span className="truncate font-medium text-slate-900">{member}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="min-w-0">
                          <div className="truncate font-medium text-slate-800">{plan?.name ?? 'Deleted plan'}</div>
                          <div className="text-xs text-slate-400">{plan?.goal ?? '—'}</div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        {isTrainerAssigned ? (
                          <span className="text-slate-700">{trainer}</span>
                        ) : (
                          <span className="text-slate-400">Unassigned</span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        {plan?.caloriesTarget ? (
                          <span className="flex items-center gap-1 font-semibold text-slate-800">
                            <Flame className="h-3.5 w-3.5 text-orange-500" /> {num(plan.caloriesTarget)} kcal
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-xs text-slate-500">
                        {a.startDate.slice(0, 10)} → {a.endDate?.slice(0, 10) ?? 'ongoing'}
                      </td>
                      <td className="px-3 py-3">
                        <AdherenceCell assignmentId={a.status === 'Active' ? a.id : undefined} />
                      </td>
                      <td className="px-3 py-3">
                        <Badge variant={STATUS_BADGE[a.status]}>{a.status}</Badge>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          {onEdit && (
                            <Button size="sm" variant="outline" className="h-7 px-2" onClick={() => onEdit(a)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          {onDelete && (
                            <Button size="sm" variant="destructive" className="h-7 px-2" onClick={() => onDelete(a)} disabled={deletingId === a.id}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {isOpen && (
                      <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                        <td colSpan={9} className="bg-slate-50/70 px-6 py-4">
                          <ExpandedDetail plan={plan} description={plan?.description} />
                        </td>
                      </tr>
                    )}
                  </FragmentRow>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function FragmentRow({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

function AdherenceCell({ assignmentId }: { assignmentId: number | undefined }) {
  const { data: progress } = useDietProgress(assignmentId)
  if (!assignmentId) return <span className="text-slate-300">—</span>
  if (!progress) return <span className="text-slate-300">…</span>
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold', ADHERENCE_STYLE[progress.status])}>
      <Activity className="h-3 w-3" /> {progress.mealAdherencePct}%
    </span>
  )
}

function ExpandedDetail({ plan, description }: { plan: DietPlanRecord | undefined; description?: string | null }) {
  if (!plan) return <p className="text-sm text-slate-400">This plan was deleted from the library.</p>

  const num = (v: string) => Number(v)
  const protein = plan.proteinTarget ? num(plan.proteinTarget) : 0
  const carbs = plan.carbsTarget ? num(plan.carbsTarget) : 0
  const fat = plan.fatTarget ? num(plan.fatTarget) : 0
  const macroKcal = { protein: protein * 4, carbs: carbs * 4, fat: fat * 9 }
  const totalMacroKcal = macroKcal.protein + macroKcal.carbs + macroKcal.fat
  const macroBar = totalMacroKcal > 0
    ? [
        { key: 'protein', label: 'Protein', grams: protein, pct: (macroKcal.protein / totalMacroKcal) * 100, dot: 'bg-rose-400' },
        { key: 'carbs', label: 'Carbs', grams: carbs, pct: (macroKcal.carbs / totalMacroKcal) * 100, dot: 'bg-amber-400' },
        { key: 'fat', label: 'Fat', grams: fat, pct: (macroKcal.fat / totalMacroKcal) * 100, dot: 'bg-sky-400' },
      ].filter((m) => m.grams > 0)
    : []

  const mealCount = plan.days.reduce((acc, d) => acc + d.meals.length, 0)

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
      <div className="sm:col-span-2">
        {description && <p className="text-sm text-slate-600">{description}</p>}
        {macroBar.length > 0 ? (
          <div className="mt-3">
            <div className="flex h-2 w-full overflow-hidden rounded-full bg-slate-200">
              {macroBar.map((m) => <div key={m.key} className={m.dot} style={{ width: `${m.pct}%` }} />)}
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
              {macroBar.map((m) => (
                <div key={m.key} className="flex items-center gap-1.5 text-xs text-slate-600">
                  <span className={cn('h-1.5 w-1.5 rounded-full', m.dot)} />
                  {m.label} <span className="font-semibold text-slate-800">{m.grams}g</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="mt-2 text-xs text-slate-400">No macro breakdown set for this plan.</p>
        )}
        {mealCount > 0 && (
          <p className="mt-3 text-xs text-slate-500">
            {plan.days.length} day{plan.days.length === 1 ? '' : 's'} scheduled · {mealCount} meals total
          </p>
        )}
      </div>
      <div className="flex flex-col gap-2">
        {plan.waterTarget && (
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-600">
            <GlassWater className="h-3.5 w-3.5" /> {num(plan.waterTarget)}L water / day
          </span>
        )}
        {plan.supplements.length > 0 && (
          <span className="text-xs text-slate-500">{plan.supplements.length} supplement{plan.supplements.length === 1 ? '' : 's'} in plan</span>
        )}
      </div>
    </div>
  )
}
