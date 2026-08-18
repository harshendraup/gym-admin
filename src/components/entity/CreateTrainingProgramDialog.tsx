import { useEffect, useState } from 'react'
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
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
import { CreateExerciseDialog } from './CreateExerciseDialog'
import { useExercises } from '@/hooks/useExercises'
import { useCreateTrainingProgram } from '@/hooks/useTrainingPrograms'
import type { BranchRecord } from '@/api/branches.api'
import type {
  TrainingProgramGoal, TrainingProgramDifficulty, ProgramDayInput,
} from '@/api/training-programs.api'

const GOALS: TrainingProgramGoal[] = ['Weight Loss', 'Muscle Gain', 'General Fitness', 'Rehab']
const DIFFICULTIES: TrainingProgramDifficulty[] = ['Beginner', 'Intermediate', 'Advanced']

interface ExerciseDraft {
  key: string
  exerciseId: string
  sets: string
  reps: string
  restSeconds: string
  notes: string
}

interface DayDraft {
  key: string
  dayName: string
  restDay: boolean
  exercises: ExerciseDraft[]
}

let draftKeySeq = 0
const nextKey = () => String(draftKeySeq++)

function emptyExercise(): ExerciseDraft {
  return { key: nextKey(), exerciseId: '', sets: '', reps: '', restSeconds: '', notes: '' }
}

function emptyDay(dayNumber: number): DayDraft {
  return { key: nextKey(), dayName: `Day ${dayNumber}`, restDay: false, exercises: [emptyExercise()] }
}

interface CreateTrainingProgramDialogProps {
  open: boolean
  onClose: () => void
  /** Branches the acting user may create a program for. Omit and pass fixedBranchId for a branch-locked role (sub_admin). */
  branchOptions?: BranchRecord[]
  fixedBranchId?: number
}

/**
 * Builds a training program template — name/goal/duration plus a Day 1 /
 * Day 2 / ... structure, each day holding a set of exercises with their
 * prescription (sets/reps/rest). Days live as local draft state rather
 * than react-hook-form's field arrays, since the exercise-within-day
 * nesting is two levels deep; the whole draft is assembled into one
 * payload on submit, matching what the backend's nested `days` array
 * expects.
 */
export function CreateTrainingProgramDialog({
  open,
  onClose,
  branchOptions,
  fixedBranchId,
}: CreateTrainingProgramDialogProps) {
  const { data: exercises = [] } = useExercises()
  const create = useCreateTrainingProgram()
  const [addExerciseOpen, setAddExerciseOpen] = useState(false)

  const [branchId, setBranchId] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [goal, setGoal] = useState<TrainingProgramGoal>('General Fitness')
  const [durationWeeks, setDurationWeeks] = useState('')
  const [difficultyLevel, setDifficultyLevel] = useState<TrainingProgramDifficulty>('Beginner')
  const [days, setDays] = useState<DayDraft[]>([emptyDay(1)])
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setBranchId(fixedBranchId ? String(fixedBranchId) : '')
      setName('')
      setDescription('')
      setGoal('General Fitness')
      setDurationWeeks('')
      setDifficultyLevel('Beginner')
      setDays([emptyDay(1)])
      setError('')
    }
  }, [open, fixedBranchId])

  const updateDay = (key: string, patch: Partial<DayDraft>) =>
    setDays((prev) => prev.map((d) => (d.key === key ? { ...d, ...patch } : d)))

  const updateExercise = (dayKey: string, exKey: string, patch: Partial<ExerciseDraft>) =>
    setDays((prev) =>
      prev.map((d) =>
        d.key !== dayKey
          ? d
          : { ...d, exercises: d.exercises.map((e) => (e.key === exKey ? { ...e, ...patch } : e)) }
      )
    )

  const addDay = () => setDays((prev) => [...prev, emptyDay(prev.length + 1)])
  const removeDay = (key: string) => setDays((prev) => prev.filter((d) => d.key !== key))
  const addExercise = (dayKey: string) =>
    setDays((prev) =>
      prev.map((d) => (d.key === dayKey ? { ...d, exercises: [...d.exercises, emptyExercise()] } : d))
    )
  const removeExercise = (dayKey: string, exKey: string) =>
    setDays((prev) =>
      prev.map((d) => (d.key === dayKey ? { ...d, exercises: d.exercises.filter((e) => e.key !== exKey) } : d))
    )
  const moveDay = (index: number, direction: -1 | 1) =>
    setDays((prev) => {
      const next = [...prev]
      const target = index + direction
      if (target < 0 || target >= next.length) return prev
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })

  const onSubmit = () => {
    setError('')
    if (!branchId) return setError('Select a branch')
    if (!name.trim()) return setError('Program name is required')

    const payloadDays: ProgramDayInput[] = days.map((d, dayIndex) => ({
      dayNumber: dayIndex + 1,
      dayName: d.dayName || undefined,
      restDay: d.restDay,
      orderIndex: dayIndex,
      exercises: d.restDay
        ? []
        : d.exercises
            .filter((e) => e.exerciseId)
            .map((e, exIndex) => ({
              exerciseId: Number(e.exerciseId),
              sets: e.sets ? Number(e.sets) : undefined,
              reps: e.reps || undefined,
              restSeconds: e.restSeconds ? Number(e.restSeconds) : undefined,
              notes: e.notes || undefined,
              orderIndex: exIndex,
            })),
    }))

    create.mutate(
      {
        branchId: Number(branchId),
        name: name.trim(),
        description: description || undefined,
        goal,
        durationWeeks: durationWeeks ? Number(durationWeeks) : undefined,
        difficultyLevel,
        days: payloadDays,
      },
      { onSuccess: onClose }
    )
  }

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Training Program</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {!fixedBranchId && (
              <div className="space-y-1.5">
                <Label>Branch</Label>
                <Select value={branchId} onValueChange={setBranchId}>
                  <SelectTrigger><SelectValue placeholder="Select a branch..." /></SelectTrigger>
                  <SelectContent>
                    {branchOptions?.map((b) => (
                      <SelectItem key={b.id} value={String(b.id)}>{b.branchName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-1.5">
              <Label>Program Name</Label>
              <Input placeholder="Push Pull Legs" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea placeholder="Overview, notes for the coaching staff..." value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Goal</Label>
                <Select value={goal} onValueChange={(v) => setGoal(v as TrainingProgramGoal)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {GOALS.map((g) => (
                      <SelectItem key={g} value={g}>{g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Difficulty</Label>
                <Select value={difficultyLevel} onValueChange={(v) => setDifficultyLevel(v as TrainingProgramDifficulty)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DIFFICULTIES.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Duration (weeks)</Label>
                <Input type="number" placeholder="8" value={durationWeeks} onChange={(e) => setDurationWeeks(e.target.value)} />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base">Program Days</Label>
                <Button type="button" size="sm" variant="outline" onClick={addDay}>
                  <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Day
                </Button>
              </div>

              {days.map((day, dayIndex) => (
                <div key={day.key} className="rounded-lg border p-3 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col">
                      <Button type="button" size="icon" variant="ghost" className="h-4 w-6" disabled={dayIndex === 0} onClick={() => moveDay(dayIndex, -1)}>
                        <ChevronUp className="h-3 w-3" />
                      </Button>
                      <Button type="button" size="icon" variant="ghost" className="h-4 w-6" disabled={dayIndex === days.length - 1} onClick={() => moveDay(dayIndex, 1)}>
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground w-14">Day {dayIndex + 1}</span>
                    <Input
                      className="flex-1"
                      placeholder="Push Day"
                      value={day.dayName}
                      onChange={(e) => updateDay(day.key, { dayName: e.target.value })}
                    />
                    <label className="flex items-center gap-1.5 text-xs whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="h-3.5 w-3.5 rounded border-input"
                        checked={day.restDay}
                        onChange={(e) => updateDay(day.key, { restDay: e.target.checked })}
                      />
                      Rest day
                    </label>
                    {days.length > 1 && (
                      <Button type="button" size="icon" variant="ghost" onClick={() => removeDay(day.key)}>
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    )}
                  </div>

                  {!day.restDay && (
                    <div className="space-y-2 pl-8">
                      {day.exercises.map((ex) => (
                        <div key={ex.key} className="grid grid-cols-[1.6fr_0.6fr_0.7fr_0.7fr_auto] gap-2 items-center">
                          <Select value={ex.exerciseId} onValueChange={(v) => updateExercise(day.key, ex.key, { exerciseId: v })}>
                            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Exercise..." /></SelectTrigger>
                            <SelectContent>
                              {exercises.map((x) => (
                                <SelectItem key={x.id} value={String(x.id)}>{x.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input className="h-8 text-xs" placeholder="Sets" type="number" value={ex.sets} onChange={(e) => updateExercise(day.key, ex.key, { sets: e.target.value })} />
                          <Input className="h-8 text-xs" placeholder="Reps" value={ex.reps} onChange={(e) => updateExercise(day.key, ex.key, { reps: e.target.value })} />
                          <Input className="h-8 text-xs" placeholder="Rest (s)" type="number" value={ex.restSeconds} onChange={(e) => updateExercise(day.key, ex.key, { restSeconds: e.target.value })} />
                          <Button type="button" size="icon" variant="ghost" onClick={() => removeExercise(day.key, ex.key)}>
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <Button type="button" size="sm" variant="ghost" onClick={() => addExercise(day.key)}>
                          <Plus className="mr-1 h-3.5 w-3.5" /> Add Exercise
                        </Button>
                        <Button type="button" size="sm" variant="ghost" onClick={() => setAddExerciseOpen(true)}>
                          + New Exercise (library)
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {error && <p className="text-xs text-red-600">{error}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="button" onClick={onSubmit} disabled={create.isPending}>
              {create.isPending ? 'Creating...' : 'Create Program'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CreateExerciseDialog open={addExerciseOpen} onClose={() => setAddExerciseOpen(false)} />
    </>
  )
}
