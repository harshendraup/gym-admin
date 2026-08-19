import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/ui/select'
import { useCreateDietPlan, useUpdateDietPlan } from '@/hooks/useDietPlans'
import type { BranchRecord } from '@/api/branches.api'
import type { DietPlanGoal, DietPlanRecord } from '@/api/diet-plans.api'

const GOALS: DietPlanGoal[] = ['Weight Loss', 'Muscle Gain', 'Fat Loss', 'Fitness']

const schema = z.object({
  branchId: z.string().min(1, 'Select a branch'),
  name: z.string().min(1, 'Plan name is required'),
  goal: z.enum(['Weight Loss', 'Muscle Gain', 'Fat Loss', 'Fitness']),
  description: z.string().optional(),
  caloriesTarget: z.string().optional(),
  proteinTarget: z.string().optional(),
  carbsTarget: z.string().optional(),
  fatTarget: z.string().optional(),
  waterTarget: z.string().optional(),
})
type FormValues = z.infer<typeof schema>

interface CreateDietPlanDialogProps {
  open: boolean
  onClose: () => void
  /** Branches the acting user may create a plan for. Omit and pass fixedBranchId for a branch-locked role (sub_admin). */
  branchOptions?: BranchRecord[]
  fixedBranchId?: number
  /** When set, the dialog edits this template instead of creating a new one. */
  plan?: DietPlanRecord | null
}

/**
 * Builds a reusable diet plan template — no member/trainer here, that
 * pairing happens afterwards via AssignDietPlanDialog. Structural
 * equivalent of CreateTrainingProgramDialog minus the day/exercise tree.
 */
export function CreateDietPlanDialog({
  open,
  onClose,
  branchOptions,
  fixedBranchId,
  plan,
}: CreateDietPlanDialogProps) {
  const isEdit = !!plan
  const create = useCreateDietPlan()
  const update = useUpdateDietPlan(plan?.id ?? 0)
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })
  const branchId = watch('branchId')
  const goal = watch('goal')

  useEffect(() => {
    if (open) {
      const initialBranchId = plan ? String(plan.branchId) : fixedBranchId ? String(fixedBranchId) : ''
      reset({
        branchId: initialBranchId,
        name: plan?.name ?? '',
        goal: plan?.goal ?? 'Fitness',
        description: plan?.description ?? '',
        caloriesTarget: plan?.caloriesTarget ?? '',
        proteinTarget: plan?.proteinTarget ?? '',
        carbsTarget: plan?.carbsTarget ?? '',
        fatTarget: plan?.fatTarget ?? '',
        waterTarget: plan?.waterTarget ?? '',
      })
    }
  }, [open, plan, fixedBranchId, reset])

  const onSubmit = (values: FormValues) => {
    const payload = {
      name: values.name,
      goal: values.goal,
      description: values.description || undefined,
      caloriesTarget: values.caloriesTarget ? Number(values.caloriesTarget) : undefined,
      proteinTarget: values.proteinTarget ? Number(values.proteinTarget) : undefined,
      carbsTarget: values.carbsTarget ? Number(values.carbsTarget) : undefined,
      fatTarget: values.fatTarget ? Number(values.fatTarget) : undefined,
      waterTarget: values.waterTarget ? Number(values.waterTarget) : undefined,
    }

    if (isEdit) {
      update.mutate(payload, { onSuccess: onClose })
    } else {
      create.mutate({ ...payload, branchId: Number(values.branchId) }, { onSuccess: onClose })
    }
  }

  const isPending = create.isPending || update.isPending

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Diet Plan' : 'Create Diet Plan'}</DialogTitle>
        </DialogHeader>
        <p className="-mt-2 text-sm text-muted-foreground">
          Build a reusable nutrition template. You'll assign it to specific members afterwards.
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {!fixedBranchId && (
            <div className="space-y-1.5">
              <Label>Branch</Label>
              <Select
                value={branchId}
                disabled={isEdit}
                onValueChange={(v) => setValue('branchId', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a branch..." />
                </SelectTrigger>
                <SelectContent>
                  {branchOptions?.map((b) => (
                    <SelectItem key={b.id} value={String(b.id)}>{b.branchName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.branchId && <p className="text-xs text-red-600">{errors.branchId.message}</p>}
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Plan Name</Label>
            <Input placeholder="Lean Bulk Phase" {...register('name')} />
            {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Goal</Label>
            <Select value={goal} onValueChange={(v) => setValue('goal', v as DietPlanGoal)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GOALS.map((g) => (
                  <SelectItem key={g} value={g}>{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea placeholder="General instructions..." {...register('description')} />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Calories</Label>
              <Input type="number" placeholder="1800" {...register('caloriesTarget')} />
            </div>
            <div className="space-y-1.5">
              <Label>Protein (g)</Label>
              <Input type="number" placeholder="150" {...register('proteinTarget')} />
            </div>
            <div className="space-y-1.5">
              <Label>Carbs (g)</Label>
              <Input type="number" placeholder="120" {...register('carbsTarget')} />
            </div>
            <div className="space-y-1.5">
              <Label>Fat (g)</Label>
              <Input type="number" placeholder="50" {...register('fatTarget')} />
            </div>
            <div className="space-y-1.5">
              <Label>Water (L)</Label>
              <Input type="number" placeholder="3" {...register('waterTarget')} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Diet Plan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
