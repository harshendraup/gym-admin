import { Flame, Beef, Wheat, Droplet, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DietPlanRecord, DietPlanGoal } from '@/api/diet-plans.api'

const GOAL_ACCENT: Record<DietPlanGoal, { stripe: string; text: string; chipBg: string }> = {
  'Weight Loss': { stripe: 'from-emerald-400 to-green-500', text: 'text-emerald-600', chipBg: 'bg-emerald-50' },
  'Muscle Gain': { stripe: 'from-sky-400 to-blue-500', text: 'text-blue-600', chipBg: 'bg-blue-50' },
  'Fat Loss': { stripe: 'from-orange-400 to-amber-500', text: 'text-orange-600', chipBg: 'bg-orange-50' },
  'Fitness': { stripe: 'from-primary to-violet-500', text: 'text-primary', chipBg: 'bg-primary/5' },
}

interface DietPlanTemplateCardProps {
  plan: DietPlanRecord
  onOpen: (plan: DietPlanRecord) => void
}

/**
 * Compact, clickable card for the Diet Plan Library grid — no member/
 * trainer/status here (those don't exist at the template level). Click
 * opens DietPlanDetailDialog for the full "modern UI" view + actions.
 */
export function DietPlanTemplateCard({ plan, onOpen }: DietPlanTemplateCardProps) {
  const accent = GOAL_ACCENT[plan.goal]

  const num = (value: string) => Number(value)
  const stats: string[] = []
  if (plan.caloriesTarget) stats.push(`${num(plan.caloriesTarget)} cal`)
  if (plan.proteinTarget) stats.push(`${num(plan.proteinTarget)}g protein`)
  if (plan.carbsTarget) stats.push(`${num(plan.carbsTarget)}g carbs`)
  if (plan.fatTarget) stats.push(`${num(plan.fatTarget)}g fat`)

  return (
    <button
      type="button"
      onClick={() => onOpen(plan)}
      className={cn(
        'group relative flex w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm',
        'transition-all duration-200 hover:-translate-y-1 hover:shadow-xl',
        !plan.isActive && 'opacity-60'
      )}
    >
      <div className={cn('h-1.5 w-full bg-gradient-to-r', accent.stripe)} />

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <span className={cn('inline-flex w-fit items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide', accent.chipBg, accent.text)}>
            {plan.goal}
          </span>
          <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-500" />
        </div>

        <h3 className="mt-2 text-base font-bold leading-tight text-slate-900">{plan.name}</h3>
        {plan.description && <p className="mt-1 line-clamp-2 text-sm text-slate-500">{plan.description}</p>}

        {stats.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-slate-100 pt-3 text-xs text-slate-500">
            {plan.caloriesTarget && (
              <span className="flex items-center gap-1">
                <Flame className={cn('h-3.5 w-3.5', accent.text)} /> {num(plan.caloriesTarget)} cal
              </span>
            )}
            {plan.proteinTarget && (
              <span className="flex items-center gap-1">
                <Beef className={cn('h-3.5 w-3.5', accent.text)} /> {num(plan.proteinTarget)}g
              </span>
            )}
            {plan.carbsTarget && (
              <span className="flex items-center gap-1">
                <Wheat className={cn('h-3.5 w-3.5', accent.text)} /> {num(plan.carbsTarget)}g
              </span>
            )}
            {plan.fatTarget && (
              <span className="flex items-center gap-1">
                <Droplet className={cn('h-3.5 w-3.5', accent.text)} /> {num(plan.fatTarget)}g
              </span>
            )}
          </div>
        )}

        {!plan.isActive && (
          <span className="mt-3 inline-flex w-fit items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">
            Archived
          </span>
        )}
      </div>
    </button>
  )
}
