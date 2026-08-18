import { useState } from 'react'
import { Plus, Dumbbell, Trash2 } from 'lucide-react'
import { AssignTrainingProgramDialog } from '@/components/entity/AssignTrainingProgramDialog'
import { CreateTrainingProgramDialog } from '@/components/entity/CreateTrainingProgramDialog'
import { CreateExerciseDialog } from '@/components/entity/CreateExerciseDialog'
import { useProgramAssignments, useDeleteProgramAssignment } from '@/hooks/useProgramAssignments'
import { useTrainingPrograms, useDeleteTrainingProgram } from '@/hooks/useTrainingPrograms'
import { useExercises, useDeleteExercise } from '@/hooks/useExercises'
import { useUsersByRole } from '@/hooks/useUsers'
import { useRoles } from '@/hooks/useRoles'
import { useAuthStore } from '@/store/auth.store'
import type { ProgramAssignmentStatus } from '@/api/program-assignments.api'
import type { ManagedUser } from '@/api/user-management.api'
import { T, mono } from '@/components/scoreboard/tokens'
import { Hero, ScoreCard, ScoreboardCta, ScoreboardIconButton, RowCardList, RowCard, StatusPill } from '@/components/scoreboard/primitives'

const HERO_IMAGE: string | null = null

const statusTone: Record<ProgramAssignmentStatus, 'forest' | 'amber' | 'signal'> = {
  active: 'forest',
  paused: 'amber',
  completed: 'forest',
  cancelled: 'signal',
}

function findUser(users: ManagedUser[], id: number | null) {
  if (!id) return undefined
  return users.find((u) => u.id === String(id))
}

const SECTIONS = [
  { key: 'assignments', label: 'Assignments' },
  { key: 'programs', label: 'Programs' },
  { key: 'exercises', label: 'Exercise Library' },
] as const

export default function SubAdminTrainingProgramsPage() {
  const gymContext = useAuthStore((s) => s.gymContext)
  const { memberRole, trainerRole } = useRoles()
  const { data: members = [] } = useUsersByRole(memberRole?.id)
  const { data: trainers = [] } = useUsersByRole(trainerRole?.id)

  const assignments = useProgramAssignments()
  const programs = useTrainingPrograms()
  const exercises = useExercises()

  const deleteAssignment = useDeleteProgramAssignment()
  const deleteProgram = useDeleteTrainingProgram()
  const deleteExercise = useDeleteExercise()

  const [section, setSection] = useState<(typeof SECTIONS)[number]['key']>('assignments')
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

  const deletingAssignmentId = deleteAssignment.isPending ? (deleteAssignment.variables ?? null) : null
  const deletingProgramId = deleteProgram.isPending ? (deleteProgram.variables ?? null) : null
  const deletingExerciseId = deleteExercise.isPending ? (deleteExercise.variables ?? null) : null

  return (
    <>
      <Hero
        image={HERO_IMAGE}
        placeholderLabel="coaching"
        eyebrow="Training"
        title="Training Programs"
        subtitle="Build programs, assign them to members, and track who's coaching who in your branch."
      />

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {SECTIONS.map((s) => (
          <button
            key={s.key}
            onClick={() => setSection(s.key)}
            style={{
              ...mono,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              padding: '8px 14px',
              borderRadius: 10,
              border: `1px solid ${section === s.key ? T.signal : T.line}`,
              background: section === s.key ? T.signal : '#fff',
              color: section === s.key ? '#fff' : T.dim,
              cursor: 'pointer',
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {section === 'assignments' && (
        <ScoreCard
          title={`Assignments · ${assignments.data?.length ?? 0}`}
          subtitle="Training programs assigned to members in your branch"
          action={
            <ScoreboardCta icon={Plus} onClick={() => setAssignOpen(true)}>
              Assign Program
            </ScoreboardCta>
          }
        >
          <RowCardList
            isLoading={assignments.isLoading || programs.isLoading}
            isError={assignments.isError}
            onRetry={assignments.refetch}
            isEmpty={!assignments.isLoading && !assignments.isError && (assignments.data?.length ?? 0) === 0}
            emptyMessage="No programs assigned yet."
          >
            {assignments.data?.map((a) => (
              <RowCard key={a.id} columns="1.4fr 1.1fr 1.1fr 0.9fr 0.9fr auto">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,70,32,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Dumbbell size={18} color={T.signal} />
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 14.5, color: T.text }}>{programName(a.trainingProgramId)}</div>
                </div>
                <div style={{ fontSize: 13.5, color: T.text }}>
                  <span style={{ ...mono, fontSize: 9.5, color: T.dim, display: 'block', letterSpacing: '0.06em' }}>MEMBER</span>
                  {memberName(a.memberId)}
                </div>
                <div style={{ fontSize: 13.5, color: T.text }}>
                  <span style={{ ...mono, fontSize: 9.5, color: T.dim, display: 'block', letterSpacing: '0.06em' }}>TRAINER</span>
                  {trainerName(a.trainerId)}
                </div>
                <div style={{ ...mono, fontSize: 12, color: T.text }}>{a.startDate.slice(0, 10)}</div>
                <StatusPill tone={statusTone[a.status]}>{a.status}</StatusPill>
                <ScoreboardIconButton icon={Trash2} label="Remove" onClick={() => deleteAssignment.mutate(a.id)} disabled={deletingAssignmentId === a.id} />
              </RowCard>
            ))}
          </RowCardList>
        </ScoreCard>
      )}

      {section === 'programs' && (
        <ScoreCard
          title={`Programs · ${programs.data?.length ?? 0}`}
          subtitle="Training program templates in your branch"
          action={
            <ScoreboardCta icon={Plus} onClick={() => setCreateProgramOpen(true)}>
              Create Program
            </ScoreboardCta>
          }
        >
          <RowCardList
            isLoading={programs.isLoading}
            isError={programs.isError}
            onRetry={programs.refetch}
            isEmpty={!programs.isLoading && !programs.isError && (programs.data?.length ?? 0) === 0}
            emptyMessage="No training programs yet. Create the first one."
          >
            {programs.data?.map((p) => (
              <RowCard key={p.id} columns="1.6fr 1fr 1fr 0.8fr auto">
                <div style={{ fontWeight: 700, fontSize: 14.5, color: T.text }}>{p.name}</div>
                <div style={{ fontSize: 13.5, color: T.dim }}>{p.goal}</div>
                <div style={{ fontSize: 13.5, color: T.dim }}>{p.difficultyLevel}</div>
                <div style={{ ...mono, fontSize: 12, color: T.text }}>{p.days.length} days</div>
                <ScoreboardIconButton icon={Trash2} label="Remove" onClick={() => deleteProgram.mutate(p.id)} disabled={deletingProgramId === p.id} />
              </RowCard>
            ))}
          </RowCardList>
        </ScoreCard>
      )}

      {section === 'exercises' && (
        <ScoreCard
          title={`Exercise Library · ${exercises.data?.length ?? 0}`}
          subtitle="Reusable exercises available to every program"
          action={
            <ScoreboardCta icon={Plus} onClick={() => setCreateExerciseOpen(true)}>
              Add Exercise
            </ScoreboardCta>
          }
        >
          <RowCardList
            isLoading={exercises.isLoading}
            isError={exercises.isError}
            onRetry={exercises.refetch}
            isEmpty={!exercises.isLoading && !exercises.isError && (exercises.data?.length ?? 0) === 0}
            emptyMessage="No exercises yet. Add the first one."
          >
            {exercises.data?.map((e) => (
              <RowCard key={e.id} columns="1.4fr 1fr 1fr 0.8fr auto">
                <div style={{ fontWeight: 700, fontSize: 14.5, color: T.text }}>{e.name}</div>
                <div style={{ fontSize: 13.5, color: T.dim }}>{e.category}</div>
                <div style={{ fontSize: 13.5, color: T.dim }}>{e.muscleGroup ?? '—'}</div>
                <div style={{ fontSize: 13.5, color: T.dim }}>{e.difficultyLevel ?? '—'}</div>
                <ScoreboardIconButton icon={Trash2} onClick={() => deleteExercise.mutate(e.id)} disabled={deletingExerciseId === e.id} />
              </RowCard>
            ))}
          </RowCardList>
        </ScoreCard>
      )}

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
        fixedBranchId={gymContext?.branchId ? Number(gymContext.branchId) : undefined}
      />

      <CreateExerciseDialog open={createExerciseOpen} onClose={() => setCreateExerciseOpen(false)} />
    </>
  )
}
