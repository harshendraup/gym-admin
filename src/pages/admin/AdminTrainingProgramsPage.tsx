import { useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Plus } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { EntityListPage } from '@/components/entity/EntityListPage'
import { AssignTrainingProgramDialog } from '@/components/entity/AssignTrainingProgramDialog'
import { CreateTrainingProgramDialog } from '@/components/entity/CreateTrainingProgramDialog'
import { CreateExerciseDialog } from '@/components/entity/CreateExerciseDialog'
import { useProgramAssignments, useDeleteProgramAssignment } from '@/hooks/useProgramAssignments'
import { useTrainingPrograms, useDeleteTrainingProgram } from '@/hooks/useTrainingPrograms'
import { useExercises, useDeleteExercise } from '@/hooks/useExercises'
import { useUsersByRole } from '@/hooks/useUsers'
import { useRoles } from '@/hooks/useRoles'
import { useBranches } from '@/hooks/useBranches'
import { useAuthStore } from '@/store/auth.store'
import type { ProgramAssignmentRecord, ProgramAssignmentStatus } from '@/api/program-assignments.api'
import type { TrainingProgramRecord } from '@/api/training-programs.api'
import type { ExerciseRecord } from '@/api/exercises.api'
import type { ManagedUser } from '@/api/user-management.api'

const statusVariant: Record<ProgramAssignmentStatus, 'secondary' | 'success' | 'default' | 'destructive'> = {
  active: 'success',
  paused: 'secondary',
  completed: 'default',
  cancelled: 'destructive',
}

function findUser(users: ManagedUser[], id: number | null) {
  if (!id) return undefined
  return users.find((u) => u.id === String(id))
}

function assignmentColumns(
  memberName: (id: number) => string,
  trainerName: (id: number | null) => string,
  programName: (id: number) => string,
  onDelete: (a: ProgramAssignmentRecord) => void,
  deletingId: number | null
): ColumnDef<ProgramAssignmentRecord>[] {
  return [
    { header: 'Program', cell: ({ row }) => <span className="font-medium text-slate-900">{programName(row.original.trainingProgramId)}</span> },
    { header: 'Member', cell: ({ row }) => memberName(row.original.memberId) },
    { header: 'Trainer', cell: ({ row }) => trainerName(row.original.trainerId) },
    { header: 'Start', cell: ({ row }) => row.original.startDate.slice(0, 10) },
    { header: 'End', cell: ({ row }) => row.original.endDate?.slice(0, 10) ?? '—' },
    {
      header: 'Status',
      cell: ({ row }) => <Badge variant={statusVariant[row.original.status]}>{row.original.status}</Badge>,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button size="sm" variant="destructive" onClick={() => onDelete(row.original)} disabled={deletingId === row.original.id}>
            Remove
          </Button>
        </div>
      ),
    },
  ]
}

function programColumns(
  onDelete: (p: TrainingProgramRecord) => void,
  deletingId: number | null
): ColumnDef<TrainingProgramRecord>[] {
  return [
    { header: 'Name', cell: ({ row }) => <span className="font-medium text-slate-900">{row.original.name}</span> },
    { header: 'Goal', cell: ({ row }) => row.original.goal },
    { header: 'Difficulty', cell: ({ row }) => row.original.difficultyLevel },
    { header: 'Duration', cell: ({ row }) => row.original.durationWeeks ? `${row.original.durationWeeks} wks` : '—' },
    { header: 'Days', cell: ({ row }) => row.original.days.length },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button size="sm" variant="destructive" onClick={() => onDelete(row.original)} disabled={deletingId === row.original.id}>
            Remove
          </Button>
        </div>
      ),
    },
  ]
}

function exerciseColumns(
  onDelete: (e: ExerciseRecord) => void,
  deletingId: number | null
): ColumnDef<ExerciseRecord>[] {
  return [
    { header: 'Name', cell: ({ row }) => <span className="font-medium text-slate-900">{row.original.name}</span> },
    { header: 'Category', cell: ({ row }) => row.original.category },
    { header: 'Muscle Group', cell: ({ row }) => row.original.muscleGroup ?? '—' },
    { header: 'Difficulty', cell: ({ row }) => row.original.difficultyLevel ?? '—' },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button size="sm" variant="destructive" onClick={() => onDelete(row.original)} disabled={deletingId === row.original.id}>
            Remove
          </Button>
        </div>
      ),
    },
  ]
}

export default function AdminTrainingProgramsPage() {
  const gymContext = useAuthStore((s) => s.gymContext)
  const { memberRole, trainerRole } = useRoles()
  const { data: members = [] } = useUsersByRole(memberRole?.id)
  const { data: trainers = [] } = useUsersByRole(trainerRole?.id)
  const { data: branches = [] } = useBranches(gymContext?.businessId)

  const assignments = useProgramAssignments()
  const programs = useTrainingPrograms()
  const exercises = useExercises()

  const deleteAssignment = useDeleteProgramAssignment()
  const deleteProgram = useDeleteTrainingProgram()
  const deleteExercise = useDeleteExercise()

  const [assignOpen, setAssignOpen] = useState(false)
  const [createProgramOpen, setCreateProgramOpen] = useState(false)
  const [createExerciseOpen, setCreateExerciseOpen] = useState(false)

  const memberName = (id: number) => {
    const u = findUser(members, id)
    return u ? (u.fullName ?? u.firstName) : `#${id}`
  }
  const trainerName = (id: number | null) => {
    if (!id) return 'Unassigned'
    const u = findUser(trainers, id)
    return u ? (u.fullName ?? u.firstName) : `#${id}`
  }
  const programName = (id: number) => programs.data?.find((p) => p.id === id)?.name ?? `#${id}`

  return (
    <div className="flex flex-col h-full">
      <Header title="Training Programs" />
      <div className="flex-1 overflow-auto p-6">
        <Tabs defaultValue="assignments" className="space-y-4">
          <TabsList>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="programs">Programs</TabsTrigger>
            <TabsTrigger value="exercises">Exercise Library</TabsTrigger>
          </TabsList>

          <TabsContent value="assignments">
            <EntityListPage
              title="Assignments"
              description="Training programs assigned to members within your business"
              columns={assignmentColumns(
                memberName,
                trainerName,
                programName,
                (a) => deleteAssignment.mutate(a.id),
                deleteAssignment.isPending ? (deleteAssignment.variables ?? null) : null
              )}
              data={assignments.data}
              isLoading={assignments.isLoading || programs.isLoading}
              isError={assignments.isError}
              onRetry={assignments.refetch}
              emptyMessage="No programs assigned yet."
              actions={
                <Button size="sm" onClick={() => setAssignOpen(true)}>
                  <Plus className="mr-1.5 h-4 w-4" /> Assign Program
                </Button>
              }
            />
          </TabsContent>

          <TabsContent value="programs">
            <EntityListPage
              title="Programs"
              description="Training program templates in your business"
              columns={programColumns(
                (p) => deleteProgram.mutate(p.id),
                deleteProgram.isPending ? (deleteProgram.variables ?? null) : null
              )}
              data={programs.data}
              isLoading={programs.isLoading}
              isError={programs.isError}
              onRetry={programs.refetch}
              emptyMessage="No training programs yet. Create the first one."
              actions={
                <Button size="sm" onClick={() => setCreateProgramOpen(true)}>
                  <Plus className="mr-1.5 h-4 w-4" /> Create Program
                </Button>
              }
            />
          </TabsContent>

          <TabsContent value="exercises">
            <EntityListPage
              title="Exercise Library"
              description="Reusable exercises available to every program"
              columns={exerciseColumns(
                (e) => deleteExercise.mutate(e.id),
                deleteExercise.isPending ? (deleteExercise.variables ?? null) : null
              )}
              data={exercises.data}
              isLoading={exercises.isLoading}
              isError={exercises.isError}
              onRetry={exercises.refetch}
              emptyMessage="No exercises yet. Add the first one."
              actions={
                <Button size="sm" onClick={() => setCreateExerciseOpen(true)}>
                  <Plus className="mr-1.5 h-4 w-4" /> Add Exercise
                </Button>
              }
            />
          </TabsContent>
        </Tabs>
      </div>

      <AssignTrainingProgramDialog
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        memberOptions={members}
        trainerOptions={trainers}
        programOptions={programs.data ?? []}
      />

      <CreateTrainingProgramDialog
        open={createProgramOpen}
        onClose={() => setCreateProgramOpen(false)}
        branchOptions={branches}
      />

      <CreateExerciseDialog open={createExerciseOpen} onClose={() => setCreateExerciseOpen(false)} />
    </div>
  )
}
