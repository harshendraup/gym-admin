import { useEffect, useMemo, useState } from 'react'
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
import { useCreateDiet } from '@/hooks/useDiets'
import type { ManagedUser } from '@/api/user-management.api'
import type { DietGoal, DietStatus } from '@/api/diets.api'

const GOALS: DietGoal[] = ['Weight Loss', 'Muscle Gain', 'Fat Loss', 'Fitness']
const STATUSES: DietStatus[] = ['Draft', 'Active', 'Completed']

const schema = z.object({
  clientId: z.string().min(1, 'Select a member'),
  trainerId: z.string().optional(),
  name: z.string().min(1, 'Plan name is required'),
  goal: z.enum(['Weight Loss', 'Muscle Gain', 'Fat Loss', 'Fitness']),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  caloriesTarget: z.string().optional(),
  proteinTarget: z.string().optional(),
  carbsTarget: z.string().optional(),
  fatTarget: z.string().optional(),
  waterTarget: z.string().optional(),
  status: z.enum(['Draft', 'Active', 'Completed']).optional(),
})
type FormValues = z.infer<typeof schema>

interface CreateDietDialogProps {
  open: boolean
  onClose: () => void
  memberOptions: ManagedUser[]
  /** Unfiltered by branch — narrowed to the selected member's branch internally. */
  trainerOptions: ManagedUser[]
  /** Preselects and locks the member (e.g. opened from a member's own detail page). */
  fixedMember?: ManagedUser
}

/**
 * Creates a diet plan for a specific member. businessId/branchId are never
 * sent — the backend derives both from the chosen client, and the trainer
 * picker here is narrowed to that same branch so the request can't fail on
 * the server's trainer/client mismatch check.
 */
export function CreateDietDialog({
  open,
  onClose,
  memberOptions,
  trainerOptions,
  fixedMember,
}: CreateDietDialogProps) {
  const [clientId, setClientId] = useState('')
  const [trainerId, setTrainerId] = useState('')
  const create = useCreateDiet()
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (open) {
      const initialClientId = fixedMember ? fixedMember.id : ''
      reset({
        clientId: initialClientId,
        trainerId: '',
        name: '',
        goal: 'Fitness',
        description: '',
        startDate: '',
        endDate: '',
        caloriesTarget: '',
        proteinTarget: '',
        carbsTarget: '',
        fatTarget: '',
        waterTarget: '',
        status: 'Draft',
      })
      setClientId(initialClientId)
      setTrainerId('')
    }
  }, [open, fixedMember, reset])

  const selectedMember = memberOptions.find((m) => m.id === clientId) ?? fixedMember
  const branchTrainers = useMemo(
    () => trainerOptions.filter((t) => t.branchId === selectedMember?.branchId),
    [trainerOptions, selectedMember?.branchId]
  )

  const onSubmit = (values: FormValues) => {
    create.mutate(
      {
        clientId: Number(values.clientId),
        trainerId: values.trainerId ? Number(values.trainerId) : undefined,
        name: values.name,
        goal: values.goal,
        description: values.description || undefined,
        startDate: values.startDate || undefined,
        endDate: values.endDate || undefined,
        caloriesTarget: values.caloriesTarget ? Number(values.caloriesTarget) : undefined,
        proteinTarget: values.proteinTarget ? Number(values.proteinTarget) : undefined,
        carbsTarget: values.carbsTarget ? Number(values.carbsTarget) : undefined,
        fatTarget: values.fatTarget ? Number(values.fatTarget) : undefined,
        waterTarget: values.waterTarget ? Number(values.waterTarget) : undefined,
        status: values.status,
      },
      { onSuccess: onClose }
    )
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Diet Plan</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {!fixedMember && (
            <div className="space-y-1.5">
              <Label>Member</Label>
              <Select
                value={clientId}
                onValueChange={(v) => {
                  setClientId(v)
                  setValue('clientId', v)
                  setTrainerId('')
                  setValue('trainerId', '')
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a member..." />
                </SelectTrigger>
                <SelectContent>
                  {memberOptions.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.fullName ?? m.firstName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.clientId && <p className="text-xs text-red-600">{errors.clientId.message}</p>}
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Trainer (optional)</Label>
            <Select
              value={trainerId}
              onValueChange={(v) => { setTrainerId(v); setValue('trainerId', v) }}
              disabled={!selectedMember}
            >
              <SelectTrigger>
                <SelectValue placeholder={selectedMember ? 'Select a trainer...' : 'Choose a member first'} />
              </SelectTrigger>
              <SelectContent>
                {branchTrainers.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.fullName ?? t.firstName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Plan Name</Label>
            <Input placeholder="Cutting Phase" {...register('name')} />
            {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Goal</Label>
            <Select defaultValue="Fitness" onValueChange={(v) => setValue('goal', v as DietGoal)}>
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

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Start Date</Label>
              <Input type="date" {...register('startDate')} />
            </div>
            <div className="space-y-1.5">
              <Label>End Date</Label>
              <Input type="date" {...register('endDate')} />
            </div>
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
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select defaultValue="Draft" onValueChange={(v) => setValue('status', v as DietStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? 'Creating...' : 'Create Diet Plan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
