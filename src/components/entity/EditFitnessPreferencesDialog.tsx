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
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { useSaveMemberFitnessPreferences } from '@/hooks/useMemberFitnessPreferences'
import type { FitnessLevel, MemberFitnessPreferenceRecord } from '@/api/member-fitness-preferences.api'
import type { ManagedUser } from '@/api/user-management.api'

const FITNESS_LEVELS: FitnessLevel[] = ['Beginner', 'Intermediate', 'Advanced']
const WORKOUT_TYPES = ['Strength', 'Cardio', 'HIIT', 'Functional', 'Mobility']

const schema = z.object({
  fitnessLevel: z.enum(['Beginner', 'Intermediate', 'Advanced']).optional(),
  previousGymExperience: z.string().optional(),
  workoutFrequency: z.string().optional(),
  preferredDays: z.string().optional(),
  preferredDuration: z.string().optional(),
  preferredTime: z.string().optional(),
  preferredWorkoutTypes: z.array(z.string()).optional(),
  favoriteExercises: z.string().optional(),
  avoidExercises: z.string().optional(),
  availableEquipment: z.string().optional(),
  injuries: z.string().optional(),
  physicalLimitations: z.string().optional(),
  exerciseRestrictions: z.string().optional(),
  mobilityLimitations: z.string().optional(),
  fitnessAssessmentNotes: z.string().optional(),
})
type FormValues = z.infer<typeof schema>

function toCsv(list: string[] | null | undefined) {
  return (list ?? []).join(', ')
}
function fromCsv(value: string | undefined): string[] | undefined {
  const items = (value ?? '').split(',').map((s) => s.trim()).filter(Boolean)
  return items.length > 0 ? items : undefined
}

interface EditFitnessPreferencesDialogProps {
  open: boolean
  onClose: () => void
  member: ManagedUser
  preferences?: MemberFitnessPreferenceRecord | null
}

/** Fitness-scoped counterpart to NutritionAssessmentDialog — level, experience, workout prefs, injuries/limitations. */
export function EditFitnessPreferencesDialog({ open, onClose, member, preferences }: EditFitnessPreferencesDialogProps) {
  const save = useSaveMemberFitnessPreferences()
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (!open) return
    reset({
      fitnessLevel: preferences?.fitnessLevel ?? undefined,
      previousGymExperience: preferences?.previousGymExperience ?? '',
      workoutFrequency: preferences?.workoutFrequency ? String(preferences.workoutFrequency) : '',
      preferredDays: toCsv(preferences?.preferredDays),
      preferredDuration: preferences?.preferredDuration ? String(preferences.preferredDuration) : '',
      preferredTime: preferences?.preferredTime ?? '',
      preferredWorkoutTypes: preferences?.preferredWorkoutTypes ?? [],
      favoriteExercises: toCsv(preferences?.favoriteExercises),
      avoidExercises: toCsv(preferences?.avoidExercises),
      availableEquipment: toCsv(preferences?.availableEquipment),
      injuries: preferences?.injuries ?? '',
      physicalLimitations: preferences?.physicalLimitations ?? '',
      exerciseRestrictions: preferences?.exerciseRestrictions ?? '',
      mobilityLimitations: preferences?.mobilityLimitations ?? '',
      fitnessAssessmentNotes: preferences?.fitnessAssessmentNotes ?? '',
    })
  }, [open, preferences, reset])

  const fitnessLevel = watch('fitnessLevel')
  const selectedTypes = watch('preferredWorkoutTypes') ?? []

  const toggleWorkoutType = (type: string) => {
    const next = selectedTypes.includes(type)
      ? selectedTypes.filter((t) => t !== type)
      : [...selectedTypes, type]
    setValue('preferredWorkoutTypes', next)
  }

  const onSubmit = (values: FormValues) => {
    save.mutate(
      {
        memberId: Number(member.id),
        fitnessLevel: values.fitnessLevel,
        previousGymExperience: values.previousGymExperience || undefined,
        workoutFrequency: values.workoutFrequency ? Number(values.workoutFrequency) : undefined,
        preferredDays: fromCsv(values.preferredDays),
        preferredDuration: values.preferredDuration ? Number(values.preferredDuration) : undefined,
        preferredTime: values.preferredTime || undefined,
        preferredWorkoutTypes: values.preferredWorkoutTypes?.length ? values.preferredWorkoutTypes : undefined,
        favoriteExercises: fromCsv(values.favoriteExercises),
        avoidExercises: fromCsv(values.avoidExercises),
        availableEquipment: fromCsv(values.availableEquipment),
        injuries: values.injuries || undefined,
        physicalLimitations: values.physicalLimitations || undefined,
        exerciseRestrictions: values.exerciseRestrictions || undefined,
        mobilityLimitations: values.mobilityLimitations || undefined,
        fitnessAssessmentNotes: values.fitnessAssessmentNotes || undefined,
      },
      { onSuccess: onClose }
    )
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="flex max-h-[92vh] flex-col overflow-hidden sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Fitness Profile — {member.fullName ?? member.firstName}</DialogTitle>
        </DialogHeader>

        <form className="flex-1 space-y-6 overflow-y-auto pr-1" onSubmit={(e) => e.preventDefault()}>
          <Section title="Level & Experience">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Field label="Fitness Level">
                <Select value={fitnessLevel} onValueChange={(v) => setValue('fitnessLevel', v as FitnessLevel)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{FITNESS_LEVELS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Workouts / Week"><Input type="number" {...register('workoutFrequency')} /></Field>
              <Field label="Preferred Duration (min)"><Input type="number" {...register('preferredDuration')} /></Field>
              <Field label="Preferred Days"><Input placeholder="Mon, Wed, Fri" {...register('preferredDays')} /></Field>
              <Field label="Preferred Time"><Input placeholder="6:00 AM" {...register('preferredTime')} /></Field>
            </div>
            <Field label="Previous Gym Experience"><Textarea rows={2} {...register('previousGymExperience')} /></Field>
          </Section>

          <Section title="Workout Preferences">
            <div className="flex flex-wrap gap-1.5">
              {WORKOUT_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleWorkoutType(type)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    selectedTypes.includes(type)
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Favorite Exercises (comma-separated)"><Textarea rows={2} {...register('favoriteExercises')} /></Field>
              <Field label="Exercises to Avoid (comma-separated)"><Textarea rows={2} {...register('avoidExercises')} /></Field>
            </div>
            <Field label="Available Equipment (comma-separated)"><Input placeholder="Dumbbells, resistance bands..." {...register('availableEquipment')} /></Field>
          </Section>

          <Section title="Health & Limitations">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Injuries"><Textarea rows={2} {...register('injuries')} /></Field>
              <Field label="Physical Limitations"><Textarea rows={2} {...register('physicalLimitations')} /></Field>
              <Field label="Exercise Restrictions"><Textarea rows={2} {...register('exerciseRestrictions')} /></Field>
              <Field label="Mobility Limitations"><Textarea rows={2} {...register('mobilityLimitations')} /></Field>
            </div>
            <Field label="Fitness Assessment Notes"><Textarea rows={2} {...register('fitnessAssessmentNotes')} /></Field>
          </Section>

          {errors.fitnessLevel && <p className="text-xs text-red-600">Invalid fitness level</p>}
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="button" disabled={save.isPending} onClick={handleSubmit(onSubmit)}>
            {save.isPending ? 'Saving...' : 'Save Fitness Profile'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  )
}
