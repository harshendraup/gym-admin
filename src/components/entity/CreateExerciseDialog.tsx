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
import { useCreateExercise } from '@/hooks/useExercises'
import type { ExerciseCategory, MuscleGroup, ExerciseDifficulty } from '@/api/exercises.api'

const CATEGORIES: ExerciseCategory[] = ['Strength', 'Cardio', 'Mobility', 'Flexibility', 'Balance']
const MUSCLE_GROUPS: MuscleGroup[] = [
  'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Full Body', 'Cardio',
]
const DIFFICULTIES: ExerciseDifficulty[] = ['Beginner', 'Intermediate', 'Advanced']

const schema = z.object({
  name: z.string().min(1, 'Exercise name is required'),
  category: z.enum(['Strength', 'Cardio', 'Mobility', 'Flexibility', 'Balance']),
  muscleGroup: z.string().optional(),
  difficultyLevel: z.string().optional(),
  equipment: z.string().optional(),
  videoUrl: z.string().optional(),
  instructions: z.string().optional(),
})
type FormValues = z.infer<typeof schema>

interface CreateExerciseDialogProps {
  open: boolean
  onClose: () => void
  /** When added from inside the program builder, hand the new exercise back so it can be added to the day immediately. */
  onCreated?: (exerciseId: number) => void
}

export function CreateExerciseDialog({ open, onClose, onCreated }: CreateExerciseDialogProps) {
  const create = useCreateExercise()
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (open) {
      reset({
        name: '',
        category: 'Strength',
        muscleGroup: '',
        difficultyLevel: '',
        equipment: '',
        videoUrl: '',
        instructions: '',
      })
    }
  }, [open, reset])

  const onSubmit = (values: FormValues) => {
    create.mutate(
      {
        name: values.name,
        category: values.category as ExerciseCategory,
        muscleGroup: (values.muscleGroup || undefined) as MuscleGroup | undefined,
        difficultyLevel: (values.difficultyLevel || undefined) as ExerciseDifficulty | undefined,
        equipment: values.equipment || undefined,
        videoUrl: values.videoUrl || undefined,
        instructions: values.instructions || undefined,
      },
      {
        onSuccess: (created) => {
          onCreated?.(created.id)
          onClose()
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Exercise</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Exercise Name</Label>
            <Input placeholder="Barbell Bench Press" {...register('name')} />
            {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select defaultValue="Strength" onValueChange={(v) => setValue('category', v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Muscle Group</Label>
              <Select onValueChange={(v) => setValue('muscleGroup', v)}>
                <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                <SelectContent>
                  {MUSCLE_GROUPS.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Difficulty</Label>
              <Select onValueChange={(v) => setValue('difficultyLevel', v)}>
                <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                <SelectContent>
                  {DIFFICULTIES.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Equipment</Label>
              <Input placeholder="Barbell, Bench" {...register('equipment')} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Video URL</Label>
            <Input placeholder="https://..." {...register('videoUrl')} />
          </div>

          <div className="space-y-1.5">
            <Label>Instructions</Label>
            <Textarea placeholder="Form cues, setup notes..." {...register('instructions')} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? 'Adding...' : 'Add Exercise'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
