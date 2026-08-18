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
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/ui/select'
import { useCreateProgramAssignment } from '@/hooks/useProgramAssignments'
import type { ManagedUser } from '@/api/user-management.api'
import type { TrainingProgramRecord } from '@/api/training-programs.api'

const schema = z.object({
  memberId: z.string().min(1, 'Select a member'),
  trainingProgramId: z.string().min(1, 'Select a training program'),
  trainerId: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
})
type FormValues = z.infer<typeof schema>

interface AssignTrainingProgramDialogProps {
  open: boolean
  onClose: () => void
  memberOptions: ManagedUser[]
  trainerOptions: ManagedUser[]
  programOptions: TrainingProgramRecord[]
  fixedMember?: ManagedUser
}

/**
 * Assigns an existing training-program template to a member — the
 * structural equivalent of CreateDietDialog, but the "plan" already
 * exists as a program and this step is purely the assignment record.
 * Program/trainer pickers are narrowed client-side to the selected
 * member's branch, mirroring diet's trainer-narrowing (the real
 * enforcement is still server-side).
 */
export function AssignTrainingProgramDialog({
  open,
  onClose,
  memberOptions,
  trainerOptions,
  programOptions,
  fixedMember,
}: AssignTrainingProgramDialogProps) {
  const [memberId, setMemberId] = useState('')
  const [trainerId, setTrainerId] = useState('')
  const [trainingProgramId, setTrainingProgramId] = useState('')
  const create = useCreateProgramAssignment()
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (open) {
      const initialMemberId = fixedMember ? fixedMember.id : ''
      reset({
        memberId: initialMemberId,
        trainingProgramId: '',
        trainerId: '',
        startDate: new Date().toISOString().slice(0, 10),
      })
      setMemberId(initialMemberId)
      setTrainerId('')
      setTrainingProgramId('')
    }
  }, [open, fixedMember, reset])

  const selectedMember = memberOptions.find((m) => m.id === memberId) ?? fixedMember
  const branchTrainers = useMemo(
    () => trainerOptions.filter((t) => t.branchId === selectedMember?.branchId),
    [trainerOptions, selectedMember?.branchId]
  )
  const branchPrograms = useMemo(
    () => programOptions.filter((p) => p.branchId === Number(selectedMember?.branchId)),
    [programOptions, selectedMember?.branchId]
  )

  const onSubmit = (values: FormValues) => {
    create.mutate(
      {
        memberId: Number(values.memberId),
        trainingProgramId: Number(values.trainingProgramId),
        trainerId: values.trainerId ? Number(values.trainerId) : undefined,
        startDate: values.startDate,
      },
      { onSuccess: onClose }
    )
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Assign Training Program</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {!fixedMember && (
            <div className="space-y-1.5">
              <Label>Member</Label>
              <Select
                value={memberId}
                onValueChange={(v) => {
                  setMemberId(v)
                  setValue('memberId', v)
                  setTrainerId('')
                  setValue('trainerId', '')
                  setTrainingProgramId('')
                  setValue('trainingProgramId', '')
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
              {errors.memberId && <p className="text-xs text-red-600">{errors.memberId.message}</p>}
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Training Program</Label>
            <Select
              value={trainingProgramId}
              onValueChange={(v) => { setTrainingProgramId(v); setValue('trainingProgramId', v) }}
              disabled={!selectedMember}
            >
              <SelectTrigger>
                <SelectValue placeholder={selectedMember ? 'Select a program...' : 'Choose a member first'} />
              </SelectTrigger>
              <SelectContent>
                {branchPrograms.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.trainingProgramId && <p className="text-xs text-red-600">{errors.trainingProgramId.message}</p>}
          </div>

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
            <Label>Start Date</Label>
            <Input type="date" {...register('startDate')} />
            {errors.startDate && <p className="text-xs text-red-600">{errors.startDate.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? 'Assigning...' : 'Assign Program'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
