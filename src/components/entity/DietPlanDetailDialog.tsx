import { Flame, Pencil, Trash2, UserPlus, Archive } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { DietPlanRecord, DietPlanGoal } from '@/api/diet-plans.api'

const GOAL_ACCENT: Record<DietPlanGoal, { gradient: string; text: string; chipBg: string }> = {
  'Weight Loss': { gradient: 'from-emerald-400 to-green-500', text: 'text-emerald-600', chipBg: 'bg-emerald-50' },
  'Muscle Gain': { gradient: 'from-sky-400 to-blue-500', text: 'text-blue-600', chipBg: 'bg-blue-50' },
  'Fat Loss': { gradient: 'from-orange-400 to-amber-500', text: 'text-orange-600', chipBg: 'bg-orange-50' },
  'Fitness': { gradient: 'from-primary to-violet-500', text: 'text-primary', chipBg: 'bg-primary/5' },
}

interface DietPlanDetailDialogProps {
  open: boolean
  onClose: () => void
  plan: DietPlanRecord | null
  onEdit: (plan: DietPlanRecord) => void
  onDelete: (plan: DietPlanRecord) => void
  onAssign: (plan: DietPlanRecord) => void
  deleting?: boolean
}

/** The "best modern UI" full view of one diet plan template, opened by clicking a DietPlanTemplateCard. */
export function DietPlanDetailDialog({
  open,
  onClose,
  plan,
  onEdit,
  onDelete,
  onAssign,
  deleting,
}: DietPlanDetailDialogProps) {
  if (!plan) return null
  const accent = GOAL_ACCENT[plan.goal]

  const num = (value: string) => Number(value)
  const calories = plan.caloriesTarget ? num(plan.caloriesTarget) : null
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

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-lg">
        <DialogTitle className="sr-only">{plan.name}</DialogTitle>
        <div className={cn('bg-gradient-to-br px-6 pb-6 pt-7', accent.gradient)}>
          <span className="inline-flex w-fit items-center rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
            {plan.goal}
          </span>
          <h2 className="mt-2.5 text-2xl font-extrabold leading-tight text-white">{plan.name}</h2>
          {plan.description && (
            <p className="mt-1.5 text-sm text-white/85">{plan.description}</p>
          )}
          {!plan.isActive && (
            <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-black/20 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white">
              <Archive className="h-3 w-3" /> Archived
            </span>
          )}
        </div>

        <div className="space-y-5 px-6 py-5">
          {calories !== null && (
            <div className="flex items-baseline gap-1.5">
              <Flame className={cn('h-5 w-5', accent.text)} />
              <span className="text-3xl font-extrabold tracking-tight text-slate-900">{calories}</span>
              <span className="text-sm font-medium text-slate-400">kcal / day target</span>
            </div>
          )}

          {macroBar.length > 0 && (
            <div>
              <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                {macroBar.map((m) => (
                  <div key={m.key} className={m.dot} style={{ width: `${m.pct}%` }} />
                ))}
              </div>
              <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5">
                {macroBar.map((m) => (
                  <div key={m.key} className="flex items-center gap-1.5 text-sm text-slate-600">
                    <span className={cn('h-2 w-2 rounded-full', m.dot)} />
                    {m.label} <span className="font-semibold text-slate-900">{m.grams}g</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {plan.waterTarget && (
            <div className="rounded-lg bg-sky-50 px-3 py-2 text-sm text-sky-700">
              Water target: <span className="font-semibold">{num(plan.waterTarget)}L / day</span>
            </div>
          )}

          {calories === null && macroBar.length === 0 && !plan.waterTarget && (
            <p className="text-sm text-slate-400">No nutrition targets set for this plan.</p>
          )}
        </div>

        <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/60 px-6 py-4 sm:flex-row">
          <Button className="flex-1" onClick={() => onAssign(plan)}>
            <UserPlus className="mr-1.5 h-4 w-4" /> Assign to Member
          </Button>
          <Button variant="outline" onClick={() => onEdit(plan)}>
            <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
          </Button>
          <Button variant="destructive" onClick={() => onDelete(plan)} disabled={deleting}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
