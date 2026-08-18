import { get, post, put, del } from './client'

/**
 * The real `/exercises` resource (gym-os-api) — a business's own reusable
 * exercise library, referenced by training program days. businessId is
 * derived server-side from the acting admin/sub_admin, never sent.
 */
export type ExerciseCategory = 'Strength' | 'Cardio' | 'Mobility' | 'Flexibility' | 'Balance'
export type MuscleGroup =
  | 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Arms' | 'Core' | 'Full Body' | 'Cardio'
export type ExerciseDifficulty = 'Beginner' | 'Intermediate' | 'Advanced'

export interface ExerciseRecord {
  id: number
  businessId: number
  createdBy: number | null
  name: string
  category: ExerciseCategory
  muscleGroup: MuscleGroup | null
  difficultyLevel: ExerciseDifficulty | null
  equipment: string | null
  videoUrl: string | null
  instructions: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateExercisePayload {
  name: string
  category: ExerciseCategory
  muscleGroup?: MuscleGroup
  difficultyLevel?: ExerciseDifficulty
  equipment?: string
  videoUrl?: string
  instructions?: string
}

export type UpdateExercisePayload = Partial<CreateExercisePayload>

export const exercisesApi = {
  list: () => get<ExerciseRecord[]>('/exercises'),

  get: (id: number) => get<ExerciseRecord>(`/exercises/${id}`),

  create: (data: CreateExercisePayload) => post<ExerciseRecord>('/exercises', data),

  update: (id: number, data: UpdateExercisePayload) => put<ExerciseRecord>(`/exercises/${id}`, data),

  delete: (id: number) => del<void>(`/exercises/${id}`),
}
