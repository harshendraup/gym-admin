import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useCreateBodyMeasurement } from '@/hooks/useBodyMeasurements'
import type { ManagedUser } from '@/api/user-management.api'

const schema = z.object({
  recordedDate: z.string().min(1, 'Date is required'),
  weight: z.string().optional(),
  height: z.string().optional(),
  bodyFatPercentage: z.string().optional(),
  waist: z.string().optional(),
  chest: z.string().optional(),
  hips: z.string().optional(),
  arms: z.string().optional(),
  thigh: z.string().optional(),
  calf: z.string().optional(),
  notes: z.string().optional(),
})
type FormValues = z.infer<typeof schema>

interface RecordMeasurementDialogProps {
  open: boolean
  onClose: () => void
  member: ManagedUser
  /** Prefills weight/height from the member's most recent entry so trainers only type what changed. */
  lastWeight?: string | null
  lastHeight?: string | null
}

/** Logs one dated measurement entry — BMI is computed server-side from weight+height, never entered here. */
export function RecordMeasurementDialog({ open, onClose, member, lastWeight, lastHeight }: RecordMeasurementDialogProps) {
  const create = useCreateBodyMeasurement()
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (open) {
      reset({
        recordedDate: new Date().toISOString().slice(0, 10),
        weight: lastWeight ?? '',
        height: lastHeight ?? '',
        bodyFatPercentage: '',
        waist: '',
        chest: '',
        hips: '',
        arms: '',
        thigh: '',
        calf: '',
        notes: '',
      })
    }
  }, [open, lastWeight, lastHeight, reset])

  const onSubmit = (values: FormValues) => {
    create.mutate(
      {
        memberId: Number(member.id),
        recordedDate: values.recordedDate,
        weight: values.weight ? Number(values.weight) : undefined,
        height: values.height ? Number(values.height) : undefined,
        bodyFatPercentage: values.bodyFatPercentage ? Number(values.bodyFatPercentage) : undefined,
        waist: values.waist ? Number(values.waist) : undefined,
        chest: values.chest ? Number(values.chest) : undefined,
        hips: values.hips ? Number(values.hips) : undefined,
        arms: values.arms ? Number(values.arms) : undefined,
        thigh: values.thigh ? Number(values.thigh) : undefined,
        calf: values.calf ? Number(values.calf) : undefined,
        notes: values.notes || undefined,
      },
      { onSuccess: onClose }
    )
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record Measurement — {member.fullName ?? member.firstName}</DialogTitle>
          <DialogDescription>BMI is calculated automatically from weight and height.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Date</Label>
            <Input type="date" {...register('recordedDate')} />
            {errors.recordedDate && <p className="text-xs text-red-600">{errors.recordedDate.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Weight (kg)</Label>
              <Input type="number" step="0.1" {...register('weight')} />
            </div>
            <div className="space-y-1.5">
              <Label>Height (cm)</Label>
              <Input type="number" step="0.1" {...register('height')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Body Fat %</Label>
              <Input type="number" step="0.1" {...register('bodyFatPercentage')} />
            </div>
            <div className="space-y-1.5">
              <Label>Waist (cm)</Label>
              <Input type="number" step="0.1" {...register('waist')} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Chest (cm)</Label>
              <Input type="number" step="0.1" {...register('chest')} />
            </div>
            <div className="space-y-1.5">
              <Label>Hips (cm)</Label>
              <Input type="number" step="0.1" {...register('hips')} />
            </div>
            <div className="space-y-1.5">
              <Label>Arms (cm)</Label>
              <Input type="number" step="0.1" {...register('arms')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Thigh (cm)</Label>
              <Input type="number" step="0.1" {...register('thigh')} />
            </div>
            <div className="space-y-1.5">
              <Label>Calf (cm)</Label>
              <Input type="number" step="0.1" {...register('calf')} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea placeholder="Trainer observations..." {...register('notes')} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? 'Saving...' : 'Record Measurement'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
