import { Flame, GlassWater, Pencil, Trash2, CalendarRange, UserRound, Dumbbell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { DietRecord, DietGoal, DietStatus } from '@/api/diets.api'

const GOAL_ACCENT: Record<DietGoal, { stripe: string; text: string; chipBg: string }> = {
  'Weight Loss': { stripe: 'from-emerald-400 to-green-500', text: 'text-emerald-600', chipBg: 'bg-emerald-50' },
  'Muscle Gain': { stripe: 'from-sky-400 to-blue-500', text: 'text-blue-600', chipBg: 'bg-blue-50' },
  'Fat Loss': { stripe: 'from-orange-400 to-amber-500', text: 'text-orange-600', chipBg: 'bg-orange-50' },
  'Fitness': { stripe: 'from-primary to-violet-500', text: 'text-primary', chipBg: 'bg-primary/5' },
}

const STATUS_DOT: Record<DietStatus, string> = {
  Draft: 'bg-slate-400',
  Active: 'bg-emerald-500',
  Completed: 'bg-blue-500',
}

// Fixed regardless of goal color, so a member row always reads as "member"
// and a trainer row always reads as "trainer" no matter which card it's on.
const PERSON_STYLE = {
  member: { bg: 'bg-violet-100', text: 'text-violet-700', label: 'Member', Icon: UserRound },
  trainer: { bg: 'bg-teal-100', text: 'text-teal-700', label: 'Coach', Icon: Dumbbell },
  unassigned: { bg: 'bg-slate-100', text: 'text-slate-400', label: 'Coach', Icon: Dumbbell },
} as const

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase()
}

interface DietPlanCardProps {
  diet: DietRecord
  memberLabel: string
  trainerLabel: string
  onEdit?: (d: DietRecord) => void
  onDelete?: (d: DietRecord) => void
  deleting?: boolean
}

export function DietPlanCard({ diet: d, memberLabel, trainerLabel, onEdit, onDelete, deleting }: DietPlanCardProps) {
  const accent = GOAL_ACCENT[d.goal]

  // Targets come back as decimal strings ("2800.00") — drop the trailing
  // zeros so a whole-number target doesn't overflow.
  const num = (value: string) => Number(value)

  const isTrainerAssigned = trainerLabel !== 'Unassigned'
  const trainerStyle = isTrainerAssigned ? PERSON_STYLE.trainer : PERSON_STYLE.unassigned

  const calories = d.caloriesTarget ? num(d.caloriesTarget) : null
  const protein = d.proteinTarget ? num(d.proteinTarget) : 0
  const carbs = d.carbsTarget ? num(d.carbsTarget) : 0
  const fat = d.fatTarget ? num(d.fatTarget) : 0

  // Approximate each macro's share of daily energy (protein/carbs = 4 kcal/g,
  // fat = 9 kcal/g) to size a proportional bar rather than three equal boxes.
  const macroKcal = { protein: protein * 4, carbs: carbs * 4, fat: fat * 9 }
  const totalMacroKcal = macroKcal.protein + macroKcal.carbs + macroKcal.fat
  const macroBar = totalMacroKcal > 0
    ? [
        { key: 'protein', label: 'Protein', grams: protein, pct: (macroKcal.protein / totalMacroKcal) * 100, dot: 'bg-rose-400' },
        { key: 'carbs', label: 'Carbs', grams: carbs, pct: (macroKcal.carbs / totalMacroKcal) * 100, dot: 'bg-amber-400' },
        { key: 'fat', label: 'Fat', grams: fat, pct: (macroKcal.fat / totalMacroKcal) * 100, dot: 'bg-sky-400' },
      ].filter((m) => m.grams > 0)
    : []

  const dateRange = d.startDate || d.endDate
    ? `${d.startDate?.slice(0, 10) ?? '—'} → ${d.endDate?.slice(0, 10) ?? 'ongoing'}`
    : null

  return (
    <div
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm',
        'transition-all duration-200 hover:-translate-y-1 hover:shadow-xl'
      )}
    >
      <div className={cn('h-1.5 w-full bg-gradient-to-r', accent.stripe)} />

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <span className={cn('inline-flex w-fit items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide', accent.chipBg, accent.text)}>
            {d.goal}
          </span>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className={cn('h-1.5 w-1.5 rounded-full', STATUS_DOT[d.status])} />
            <span>{d.status}</span>
          </div>
        </div>

        <h3 className="mt-2 text-lg font-bold leading-tight text-slate-900">{d.name}</h3>
        {d.description && <p className="mt-1 line-clamp-2 text-sm text-slate-500">{d.description}</p>}

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2.5">
            <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold', PERSON_STYLE.member.bg, PERSON_STYLE.member.text)}>
              {initials(memberLabel)}
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{PERSON_STYLE.member.label}</div>
              <div className="truncate text-sm font-medium text-slate-800">{memberLabel}</div>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold', trainerStyle.bg, trainerStyle.text)}>
              {isTrainerAssigned ? initials(trainerLabel) : <Dumbbell className="h-4 w-4" />}
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{trainerStyle.label}</div>
              <div className={cn('truncate text-sm font-medium', isTrainerAssigned ? 'text-slate-800' : 'text-slate-400')}>{trainerLabel}</div>
            </div>
          </div>
        </div>

        {dateRange && (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
            <CalendarRange className="h-3.5 w-3.5 text-slate-400" /> {dateRange}
          </div>
        )}

        {(calories !== null || macroBar.length > 0 || d.waterTarget) && (
          <div className="mt-4 border-t border-slate-100 pt-4">
            {calories !== null && (
              <div className="flex items-baseline gap-1.5">
                <Flame className={cn('h-4 w-4', accent.text)} />
                <span className="text-2xl font-extrabold tracking-tight text-slate-900">{calories}</span>
                <span className="text-xs font-medium text-slate-400">kcal / day</span>
              </div>
            )}

            {macroBar.length > 0 && (
              <div className="mt-2.5">
                <div className="flex h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  {macroBar.map((m) => (
                    <div key={m.key} className={m.dot} style={{ width: `${m.pct}%` }} />
                  ))}
                </div>
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                  {macroBar.map((m) => (
                    <div key={m.key} className="flex items-center gap-1 text-xs text-slate-500">
                      <span className={cn('h-1.5 w-1.5 rounded-full', m.dot)} />
                      {m.label} <span className="font-medium text-slate-700">{m.grams}g</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {d.waterTarget && (
              <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-600">
                <GlassWater className="h-3.5 w-3.5" /> {num(d.waterTarget)}L water
              </div>
            )}
          </div>
        )}

        {(onEdit || onDelete) && (
          <div className="mt-auto flex gap-2 pt-4">
            {onEdit && (
              <Button size="sm" variant="outline" className="flex-1" onClick={() => onEdit(d)}>
                <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
              </Button>
            )}
            {onDelete && (
              <Button size="sm" variant="destructive" onClick={() => onDelete(d)} disabled={deleting}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
