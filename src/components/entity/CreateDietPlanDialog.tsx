import { Fragment, useEffect, useMemo, useState } from 'react'
import {
  Plus, Trash2, ChevronDown, ChevronUp, Flame, Beef, Wheat, Droplet, GlassWater, Pill,
  CalendarDays, Sparkles, ListChecks, Info,
} from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/ui/select'
import { FoodPicker } from './FoodPicker'
import { useCreateDietPlan, useUpdateDietPlan } from '@/hooks/useDietPlans'
import { cn } from '@/lib/utils'
import type { BranchRecord } from '@/api/branches.api'
import type {
  DietPlanGoal, DietPlanRecord, PlanDayInput, MealInput, MealItemInput,
  MealAlternativeInput, SupplementInput,
} from '@/api/diet-plans.api'

const GOALS: DietPlanGoal[] = ['Weight Loss', 'Muscle Gain', 'Fat Loss', 'Fitness']
const MEAL_TYPES = ['Breakfast', 'Mid-Morning', 'Lunch', 'Pre-Workout', 'Post-Workout', 'Evening Snack', 'Dinner', 'Bedtime']

let localId = -1
function nextLocalId() {
  return localId--
}

interface BuilderMeal extends MealInput {
  localId: number
  items: (MealItemInput & { localId: number })[]
  alternatives: (MealAlternativeInput & { localId: number })[]
}
interface BuilderDay extends Omit<PlanDayInput, 'meals'> {
  localId: number
  meals: BuilderMeal[]
}

interface CreateDietPlanDialogProps {
  open: boolean
  onClose: () => void
  branchOptions?: BranchRecord[]
  fixedBranchId?: number
  plan?: DietPlanRecord | null
}

function sum(items: { calories: string | number; protein: string | number; carbs: string | number; fat: string | number }[]) {
  const totals = { calories: 0, protein: 0, carbs: 0, fat: 0 }
  for (const i of items) {
    totals.calories += Number(i.calories)
    totals.protein += Number(i.protein)
    totals.carbs += Number(i.carbs)
    totals.fat += Number(i.fat)
  }
  return totals
}

/**
 * The full nutrition plan builder — Overview (header + targets), Days (the
 * day → meal → food-item/alternative tree), Extras (supplements +
 * hydration), and Review. Structural editing on an already-Active plan
 * creates a new version server-side (see DietPlanService.update) rather
 * than mutating history, so this dialog never needs its own versioning UI.
 */
export function CreateDietPlanDialog({ open, onClose, branchOptions, fixedBranchId, plan }: CreateDietPlanDialogProps) {
  const isEdit = !!plan
  const create = useCreateDietPlan()
  const update = useUpdateDietPlan(plan?.id ?? 0)
  const isPending = create.isPending || update.isPending

  const [tab, setTab] = useState('overview')
  const [branchId, setBranchId] = useState('')
  const [name, setName] = useState('')
  const [goal, setGoal] = useState<DietPlanGoal>('Fitness')
  const [description, setDescription] = useState('')
  const [caloriesTarget, setCaloriesTarget] = useState('')
  const [proteinTarget, setProteinTarget] = useState('')
  const [carbsTarget, setCarbsTarget] = useState('')
  const [fatTarget, setFatTarget] = useState('')
  const [waterTarget, setWaterTarget] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const [days, setDays] = useState<BuilderDay[]>([])
  const [supplements, setSupplements] = useState<(SupplementInput & { localId: number })[]>([])
  const [hydrationMl, setHydrationMl] = useState('')

  useEffect(() => {
    if (!open) return
    setTab('overview')
    setBranchId(plan ? String(plan.branchId) : fixedBranchId ? String(fixedBranchId) : '')
    setName(plan?.name ?? '')
    setGoal(plan?.goal ?? 'Fitness')
    setDescription(plan?.description ?? '')
    setCaloriesTarget(plan?.caloriesTarget ?? '')
    setProteinTarget(plan?.proteinTarget ?? '')
    setCarbsTarget(plan?.carbsTarget ?? '')
    setFatTarget(plan?.fatTarget ?? '')
    setWaterTarget(plan?.waterTarget ?? '')
    setStartDate(plan?.startDate?.slice(0, 10) ?? '')
    setEndDate(plan?.endDate?.slice(0, 10) ?? '')
    setDays(
      (plan?.days ?? []).map((d) => ({
        localId: nextLocalId(),
        dayNumber: d.dayNumber,
        dayName: d.dayName ?? undefined,
        isRestDay: d.isRestDay,
        notes: d.notes ?? undefined,
        meals: d.meals.map((m) => ({
          localId: nextLocalId(),
          mealType: m.mealType,
          mealName: m.mealName ?? undefined,
          mealTime: m.mealTime ?? undefined,
          notes: m.notes ?? undefined,
          items: m.items.map((i) => ({
            localId: nextLocalId(),
            foodId: i.foodId ?? undefined,
            foodName: i.foodName,
            quantity: Number(i.quantity),
            unit: i.unit,
            calories: Number(i.calories),
            protein: Number(i.protein),
            carbs: Number(i.carbs),
            fat: Number(i.fat),
            sortOrder: i.sortOrder,
            notes: i.notes ?? undefined,
          })),
          alternatives: m.alternatives.map((a) => ({
            localId: nextLocalId(),
            foodId: a.foodId ?? undefined,
            foodName: a.foodName,
            quantity: Number(a.quantity),
            unit: a.unit,
            calories: Number(a.calories),
            protein: Number(a.protein),
            carbs: Number(a.carbs),
            fat: Number(a.fat),
            sortOrder: a.sortOrder,
          })),
        })),
      }))
    )
    setSupplements(
      (plan?.supplements ?? []).map((s) => ({
        localId: nextLocalId(),
        name: s.name,
        quantity: s.quantity,
        unit: s.unit ?? undefined,
        timing: s.timing ?? undefined,
        frequency: s.frequency ?? undefined,
        notes: s.notes ?? undefined,
        sortOrder: s.sortOrder,
      }))
    )
    setHydrationMl(plan?.hydration?.targetMl ?? '')
  }, [open, plan, fixedBranchId])

  const dayTotals = useMemo(
    () => days.map((d) => sum(d.meals.flatMap((m) => m.items))),
    [days]
  )
  const planTotals = useMemo(() => {
    if (dayTotals.length === 0) return null
    const t = dayTotals.reduce(
      (acc, d) => ({ calories: acc.calories + d.calories, protein: acc.protein + d.protein, carbs: acc.carbs + d.carbs, fat: acc.fat + d.fat }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    )
    return { calories: t.calories / dayTotals.length, protein: t.protein / dayTotals.length, carbs: t.carbs / dayTotals.length, fat: t.fat / dayTotals.length }
  }, [dayTotals])

  const addDay = () => {
    setDays((prev) => [
      ...prev,
      { localId: nextLocalId(), dayNumber: prev.length + 1, dayName: `Day ${prev.length + 1}`, isRestDay: false, meals: [] },
    ])
  }
  const removeDay = (localId: number) => setDays((prev) => prev.filter((d) => d.localId !== localId).map((d, i) => ({ ...d, dayNumber: i + 1 })))
  const addMeal = (dayLocalId: number) => {
    setDays((prev) => prev.map((d) => d.localId === dayLocalId
      ? { ...d, meals: [...d.meals, { localId: nextLocalId(), mealType: 'Breakfast', mealTime: '', items: [], alternatives: [] }] }
      : d))
  }
  const removeMeal = (dayLocalId: number, mealLocalId: number) => {
    setDays((prev) => prev.map((d) => d.localId === dayLocalId ? { ...d, meals: d.meals.filter((m) => m.localId !== mealLocalId) } : d))
  }
  const updateMeal = (dayLocalId: number, mealLocalId: number, patch: Partial<BuilderMeal>) => {
    setDays((prev) => prev.map((d) => d.localId === dayLocalId
      ? { ...d, meals: d.meals.map((m) => m.localId === mealLocalId ? { ...m, ...patch } : m) }
      : d))
  }
  const addMealItem = (dayLocalId: number, mealLocalId: number, item: MealItemInput) => {
    setDays((prev) => prev.map((d) => d.localId === dayLocalId
      ? { ...d, meals: d.meals.map((m) => m.localId === mealLocalId ? { ...m, items: [...m.items, { ...item, localId: nextLocalId() }] } : m) }
      : d))
  }
  const removeMealItem = (dayLocalId: number, mealLocalId: number, itemLocalId: number) => {
    setDays((prev) => prev.map((d) => d.localId === dayLocalId
      ? { ...d, meals: d.meals.map((m) => m.localId === mealLocalId ? { ...m, items: m.items.filter((i) => i.localId !== itemLocalId) } : m) }
      : d))
  }
  const addMealAlternative = (dayLocalId: number, mealLocalId: number, alt: MealAlternativeInput) => {
    setDays((prev) => prev.map((d) => d.localId === dayLocalId
      ? { ...d, meals: d.meals.map((m) => m.localId === mealLocalId ? { ...m, alternatives: [...m.alternatives, { ...alt, localId: nextLocalId() }] } : m) }
      : d))
  }
  const removeMealAlternative = (dayLocalId: number, mealLocalId: number, altLocalId: number) => {
    setDays((prev) => prev.map((d) => d.localId === dayLocalId
      ? { ...d, meals: d.meals.map((m) => m.localId === mealLocalId ? { ...m, alternatives: m.alternatives.filter((a) => a.localId !== altLocalId) } : m) }
      : d))
  }

  const addSupplement = () => setSupplements((prev) => [...prev, { localId: nextLocalId(), name: '', quantity: '' }])
  const updateSupplement = (localId: number, patch: Partial<SupplementInput>) =>
    setSupplements((prev) => prev.map((s) => (s.localId === localId ? { ...s, ...patch } : s)))
  const removeSupplement = (localId: number) => setSupplements((prev) => prev.filter((s) => s.localId !== localId))

  const canSubmit = name.trim().length > 0 && (isEdit || !!branchId)

  const buildPayload = () => ({
    name,
    goal,
    description: description || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    caloriesTarget: caloriesTarget ? Number(caloriesTarget) : undefined,
    proteinTarget: proteinTarget ? Number(proteinTarget) : undefined,
    carbsTarget: carbsTarget ? Number(carbsTarget) : undefined,
    fatTarget: fatTarget ? Number(fatTarget) : undefined,
    waterTarget: waterTarget ? Number(waterTarget) : undefined,
    planType: (days.length > 0 ? 'Custom' : 'Template') as 'Custom' | 'Template',
    days: days.length > 0
      ? days.map((d) => ({
          dayNumber: d.dayNumber,
          dayName: d.dayName,
          isRestDay: d.isRestDay,
          notes: d.notes,
          meals: d.meals.map((m) => ({
            mealType: m.mealType,
            mealName: m.mealName,
            mealTime: m.mealTime,
            notes: m.notes,
            items: m.items.map(({ localId: _lid, ...i }) => i),
            alternatives: m.alternatives.map(({ localId: _lid, ...a }) => a),
          })),
        }))
      : undefined,
    supplements: supplements.length > 0
      ? supplements.filter((s) => s.name).map(({ localId: _lid, ...s }) => s)
      : undefined,
    hydration: hydrationMl ? { targetMl: Number(hydrationMl) } : undefined,
  })

  const onSubmit = () => {
    if (!canSubmit) return
    const payload = buildPayload()
    if (isEdit) {
      update.mutate(payload, { onSuccess: onClose })
    } else {
      create.mutate({ ...payload, branchId: Number(branchId) }, { onSuccess: onClose })
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="flex max-h-[92vh] flex-col overflow-hidden p-0 sm:max-w-3xl">
        <div className="shrink-0 border-b border-slate-100 px-6 pb-4 pt-6">
          <DialogHeader>
            <DialogTitle>{isEdit ? `Edit "${plan?.name}"` : 'Create Diet Plan'}</DialogTitle>
          </DialogHeader>
          <p className="mt-1 text-sm text-muted-foreground">
            Build targets only for a quick macro template, or add days and meals for a full nutrition schedule.
          </p>
        </div>

        <Tabs value={tab} onValueChange={setTab} className="flex flex-1 flex-col overflow-hidden">
          <div className="shrink-0 border-b border-slate-100 bg-slate-50/60 px-6 py-2.5">
            <TabsList className="h-auto w-full justify-start gap-1 bg-transparent p-0">
              <BuilderTab value="overview" icon={Info} label="Overview & Targets" />
              <BuilderTab value="days" icon={CalendarDays} label="Days & Meals" count={days.length} />
              <BuilderTab value="extras" icon={Sparkles} label="Supplements & Hydration" />
              <BuilderTab value="review" icon={ListChecks} label="Review" />
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            <TabsContent value="overview" className="mt-0 space-y-5">
              <FormSection title="Basics" description="What this plan is called and who it's for.">
                {!fixedBranchId && !isEdit && (
                  <div className="space-y-1.5">
                    <Label>Branch</Label>
                    <Select value={branchId} onValueChange={setBranchId}>
                      <SelectTrigger><SelectValue placeholder="Select a branch..." /></SelectTrigger>
                      <SelectContent>
                        {branchOptions?.map((b) => <SelectItem key={b.id} value={String(b.id)}>{b.branchName}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label>Plan Name</Label>
                  <Input placeholder="Fat Loss — Priya" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Goal</Label>
                  <Select value={goal} onValueChange={(v) => setGoal(v as DietPlanGoal)}>
                    <SelectTrigger className="sm:w-56"><SelectValue /></SelectTrigger>
                    <SelectContent>{GOALS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Description</Label>
                  <Textarea placeholder="General instructions..." value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
              </FormSection>

              <FormSection title="Schedule" description="Optional — when this plan starts and ends for the member.">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Start Date</Label>
                    <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>End Date</Label>
                    <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                  </div>
                </div>
              </FormSection>

              <FormSection title="Daily Macro Targets" description="The headline numbers shown on every card for this plan.">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <div className="space-y-1.5"><Label className="flex items-center gap-1 text-xs text-slate-500"><Flame className="h-3.5 w-3.5" /> Calories</Label><Input type="number" placeholder="1800" value={caloriesTarget} onChange={(e) => setCaloriesTarget(e.target.value)} /></div>
                  <div className="space-y-1.5"><Label className="flex items-center gap-1 text-xs text-slate-500"><Beef className="h-3.5 w-3.5" /> Protein (g)</Label><Input type="number" placeholder="150" value={proteinTarget} onChange={(e) => setProteinTarget(e.target.value)} /></div>
                  <div className="space-y-1.5"><Label className="flex items-center gap-1 text-xs text-slate-500"><Wheat className="h-3.5 w-3.5" /> Carbs (g)</Label><Input type="number" placeholder="120" value={carbsTarget} onChange={(e) => setCarbsTarget(e.target.value)} /></div>
                  <div className="space-y-1.5"><Label className="flex items-center gap-1 text-xs text-slate-500"><Droplet className="h-3.5 w-3.5" /> Fat (g)</Label><Input type="number" placeholder="50" value={fatTarget} onChange={(e) => setFatTarget(e.target.value)} /></div>
                  <div className="space-y-1.5"><Label className="flex items-center gap-1 text-xs text-slate-500"><GlassWater className="h-3.5 w-3.5" /> Water (L)</Label><Input type="number" placeholder="3" value={waterTarget} onChange={(e) => setWaterTarget(e.target.value)} /></div>
                </div>
                {days.length > 0 && planTotals && (
                  <p className="rounded-lg bg-primary/5 px-3 py-2 text-xs text-slate-600">
                    From the meals you've built so far, the actual daily average is <span className="font-semibold text-slate-800">{Math.round(planTotals.calories)} kcal, {Math.round(planTotals.protein)}g protein</span> — compare that with the targets above.
                  </p>
                )}
              </FormSection>
            </TabsContent>

            <TabsContent value="days" className="space-y-3 mt-0">
              <p className="text-xs text-slate-500">
                Add a day, then meals inside it, then search or type in the foods that make up each meal. Leave this empty to keep a simple macro-only plan.
              </p>
              {days.length === 0 && (
                <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 py-10 text-center">
                  <CalendarDays className="h-6 w-6 text-slate-300" />
                  <p className="text-sm text-slate-400">No days yet — this plan stays "macro-only" until you add one.</p>
                </div>
              )}
              {days.map((day, dayIndex) => (
                <DayCard
                  key={day.localId}
                  day={day}
                  dayTotal={dayTotals[dayIndex]}
                  onRemove={() => removeDay(day.localId)}
                  onAddMeal={() => addMeal(day.localId)}
                  onRemoveMeal={(mealId) => removeMeal(day.localId, mealId)}
                  onUpdateMeal={(mealId, patch) => updateMeal(day.localId, mealId, patch)}
                  onAddItem={(mealId, item) => addMealItem(day.localId, mealId, item)}
                  onRemoveItem={(mealId, itemId) => removeMealItem(day.localId, mealId, itemId)}
                  onAddAlternative={(mealId, alt) => addMealAlternative(day.localId, mealId, alt)}
                  onRemoveAlternative={(mealId, altId) => removeMealAlternative(day.localId, mealId, altId)}
                />
              ))}
              <Button variant="outline" size="sm" onClick={addDay}>
                <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Day
              </Button>
            </TabsContent>

            <TabsContent value="extras" className="mt-0 space-y-5">
              <FormSection title="Hydration" description="Optional — a precise ml figure, shown to the member instead of the plain liters target from Overview.">
                <Input className="max-w-xs" type="number" placeholder="3000" value={hydrationMl} onChange={(e) => setHydrationMl(e.target.value)} />
              </FormSection>

              <FormSection title="Supplements" description="What the member should take, and when.">
                {supplements.length > 0 && (
                  <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-x-1.5 gap-y-2 text-xs font-medium text-slate-400">
                    <span>Name</span><span>Quantity</span><span>Timing</span><span />
                    {supplements.map((s) => (
                      <Fragment key={s.localId}>
                        <Input className="h-8 text-xs" placeholder="Whey Protein" value={s.name} onChange={(e) => updateSupplement(s.localId, { name: e.target.value })} />
                        <Input className="h-8 text-xs" placeholder="1 scoop" value={s.quantity} onChange={(e) => updateSupplement(s.localId, { quantity: e.target.value })} />
                        <Input className="h-8 text-xs" placeholder="Post-workout" value={s.timing ?? ''} onChange={(e) => updateSupplement(s.localId, { timing: e.target.value })} />
                        <Button size="sm" variant="outline" className="h-8 px-2" onClick={() => removeSupplement(s.localId)}>
                          <Trash2 className="h-3.5 w-3.5 text-red-500" />
                        </Button>
                      </Fragment>
                    ))}
                  </div>
                )}
                <Button variant="outline" size="sm" onClick={addSupplement}>
                  <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Supplement
                </Button>
              </FormSection>
            </TabsContent>

            <TabsContent value="review" className="mt-0 space-y-4">
              <div className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-slate-900">{name || 'Untitled plan'}</h4>
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">{goal}</span>
                </div>
                {(startDate || endDate) && (
                  <p className="mt-1 text-sm text-slate-500">{startDate || '—'} → {endDate || 'ongoing'}</p>
                )}
                <div className="mt-3 flex flex-wrap gap-4 border-t border-slate-100 pt-3 text-sm">
                  {caloriesTarget && <Stat icon={Flame} label={`${caloriesTarget} kcal`} />}
                  {proteinTarget && <Stat icon={Beef} label={`${proteinTarget}g protein`} />}
                  {carbsTarget && <Stat icon={Wheat} label={`${carbsTarget}g carbs`} />}
                  {fatTarget && <Stat icon={Droplet} label={`${fatTarget}g fat`} />}
                  {(waterTarget || hydrationMl) && <Stat icon={GlassWater} label={hydrationMl ? `${hydrationMl}ml water` : `${waterTarget}L water`} />}
                  {supplements.length > 0 && <Stat icon={Pill} label={`${supplements.length} supplement${supplements.length === 1 ? '' : 's'}`} />}
                </div>
              </div>

              {days.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    {days.length} day{days.length === 1 ? '' : 's'} · {days.reduce((a, d) => a + d.meals.length, 0)} meals total
                  </p>
                  {days.map((day) => (
                    <div key={day.localId} className="rounded-lg border border-slate-100 px-3 py-2">
                      <p className="text-sm font-semibold text-slate-800">{day.dayName || `Day ${day.dayNumber}`}</p>
                      <p className="text-xs text-slate-500">
                        {day.meals.length === 0 ? 'No meals added' : day.meals.map((m) => m.mealType).join(' · ')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
                  This will save as a macro-only plan — no day/meal schedule attached.
                </p>
              )}

              {isEdit && plan?.status === 'Active' && days.length > 0 && (
                <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                  This plan is currently Active and assigned. Saving structural changes will create Version {plan.version + 1} and archive the current version — history is preserved, nothing is lost.
                </p>
              )}
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="shrink-0 border-t border-slate-100 px-6 py-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="button" onClick={onSubmit} disabled={isPending || !canSubmit}>
            {isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Diet Plan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function BuilderTab({ value, icon: Icon, label, count }: { value: string; icon: any; label: string; count?: number }) {
  return (
    <TabsTrigger
      value={value}
      className="gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-slate-500 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm sm:text-sm"
    >
      <Icon className="h-3.5 w-3.5" /> {label} {!!count && <span className="text-slate-400">({count})</span>}
    </TabsTrigger>
  )
}

function FormSection({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/40 p-4">
      <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
      {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
      <div className="mt-3 space-y-3">{children}</div>
    </div>
  )
}

function Stat({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-slate-700">
      <Icon className="h-3.5 w-3.5 text-primary" /> {label}
    </span>
  )
}

function DayCard({
  day, dayTotal, onRemove, onAddMeal, onRemoveMeal, onUpdateMeal, onAddItem, onRemoveItem, onAddAlternative, onRemoveAlternative,
}: {
  day: BuilderDay
  dayTotal: { calories: number; protein: number; carbs: number; fat: number }
  onRemove: () => void
  onAddMeal: () => void
  onRemoveMeal: (mealLocalId: number) => void
  onUpdateMeal: (mealLocalId: number, patch: Partial<BuilderMeal>) => void
  onAddItem: (mealLocalId: number, item: MealItemInput) => void
  onRemoveItem: (mealLocalId: number, itemLocalId: number) => void
  onAddAlternative: (mealLocalId: number, alt: MealAlternativeInput) => void
  onRemoveAlternative: (mealLocalId: number, altLocalId: number) => void
}) {
  const [expanded, setExpanded] = useState(true)
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between gap-2 border-l-4 border-primary bg-primary/5 px-3 py-2.5">
        <button type="button" className="flex flex-1 items-center gap-2 text-left" onClick={() => setExpanded((e) => !e)}>
          {expanded ? <ChevronUp className="h-4 w-4 shrink-0 text-primary" /> : <ChevronDown className="h-4 w-4 shrink-0 text-primary" />}
          <span className="text-sm font-bold text-slate-900">{day.dayName || `Day ${day.dayNumber}`}</span>
          <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-slate-500">
            {Math.round(dayTotal.calories)} kcal · {Math.round(dayTotal.protein)}g protein
          </span>
        </button>
        <Button size="sm" variant="ghost" className="h-7 px-2 hover:bg-white hover:text-red-500" onClick={onRemove}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
      {expanded && (
        <div className="space-y-3 bg-white p-3">
          {day.meals.length === 0 && (
            <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-400">No meals in this day yet.</p>
          )}
          {day.meals.map((meal) => (
            <MealCard
              key={meal.localId}
              meal={meal}
              onRemove={() => onRemoveMeal(meal.localId)}
              onUpdate={(patch) => onUpdateMeal(meal.localId, patch)}
              onAddItem={(item) => onAddItem(meal.localId, item)}
              onRemoveItem={(itemId) => onRemoveItem(meal.localId, itemId)}
              onAddAlternative={(alt) => onAddAlternative(meal.localId, alt)}
              onRemoveAlternative={(altId) => onRemoveAlternative(meal.localId, altId)}
            />
          ))}
          <Button variant="outline" size="sm" onClick={onAddMeal}>
            <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Meal
          </Button>
        </div>
      )}
    </div>
  )
}

function MealCard({
  meal, onRemove, onUpdate, onAddItem, onRemoveItem, onAddAlternative, onRemoveAlternative,
}: {
  meal: BuilderMeal
  onRemove: () => void
  onUpdate: (patch: Partial<BuilderMeal>) => void
  onAddItem: (item: MealItemInput) => void
  onRemoveItem: (itemLocalId: number) => void
  onAddAlternative: (alt: MealAlternativeInput) => void
  onRemoveAlternative: (altLocalId: number) => void
}) {
  const totals = sum(meal.items)
  const [showAlternatives, setShowAlternatives] = useState(meal.alternatives.length > 0)

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3">
      <div className="flex flex-wrap items-end gap-2">
        <div className="space-y-1">
          <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Meal</span>
          <Select value={meal.mealType} onValueChange={(v) => onUpdate({ mealType: v })}>
            <SelectTrigger className="h-8 w-40 bg-white text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{MEAL_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Time</span>
          <Input
            className="h-8 w-28 bg-white text-xs"
            type="time"
            value={meal.mealTime ?? ''}
            onChange={(e) => onUpdate({ mealTime: e.target.value })}
          />
        </div>
        <span className="ml-auto rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 shadow-sm">
          {Math.round(totals.calories)} kcal · {Math.round(totals.protein)}g protein
        </span>
        <Button size="sm" variant="ghost" className="h-8 px-2 hover:bg-white hover:text-red-500" onClick={onRemove}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {meal.items.length > 0 && (
        <div className="mt-3 space-y-1 rounded-lg bg-white p-1.5">
          {meal.items.map((item) => (
            <div key={item.localId} className="flex items-center justify-between rounded-md px-2 py-1 text-xs">
              <span className="text-slate-700">{item.foodName} <span className="text-slate-400">— {item.quantity}{item.unit}</span></span>
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-500">{item.calories} kcal</span>
                <button type="button" onClick={() => onRemoveItem(item.localId)} className="text-slate-300 hover:text-red-500">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-2"><FoodPicker onAdd={onAddItem} /></div>

      <button
        type="button"
        className={cn(
          'mt-2 flex items-center gap-1 text-xs font-medium',
          showAlternatives ? 'text-primary' : 'text-slate-400 hover:text-slate-600'
        )}
        onClick={() => setShowAlternatives((v) => !v)}
      >
        {showAlternatives ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        Alternatives {meal.alternatives.length > 0 && `(${meal.alternatives.length})`}
      </button>

      {showAlternatives && (
        <div className="mt-2 space-y-2 rounded-lg border border-dashed border-violet-200 bg-violet-50/40 p-2">
          <p className="text-[11px] text-violet-500">A member can swap the main foods above for one of these instead.</p>
          {meal.alternatives.map((alt) => (
            <div key={alt.localId} className="flex items-center justify-between rounded-md bg-white px-2 py-1 text-xs">
              <span className="text-slate-700">OR {alt.foodName} <span className="text-slate-400">— {alt.quantity}{alt.unit}</span></span>
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-500">{alt.calories} kcal</span>
                <button type="button" onClick={() => onRemoveAlternative(alt.localId)} className="text-slate-300 hover:text-red-500">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
          <FoodPicker asAlternative onAdd={onAddAlternative} />
        </div>
      )}
    </div>
  )
}
