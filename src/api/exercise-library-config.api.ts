import { get, put, del } from './client'
import type { ExerciseCategory, MuscleGroup } from './exercises.api'

/**
 * A gym's own curated subset of the master exercise catalog
 * (src/data/exercisesData.json) — system categories/groups/exercises/
 * equipment it selected, plus any custom ones it created. Fully resolved:
 * every group already carries its real `category` (and every exercise its
 * best-guess `muscleGroup`), so nothing downstream needs to re-map it.
 */
export interface GymLibraryExercise {
  name: string
  targetMuscle: string
  muscleGroup?: MuscleGroup
}

export interface GymLibraryGroup {
  id: string
  name: string
  category: ExerciseCategory
  source: 'system' | 'custom'
  exercises: GymLibraryExercise[]
  equipment: string[]
}

export interface GymLibraryCategory {
  id: string
  name: string
  source: 'system' | 'custom'
  groups: GymLibraryGroup[]
}

export interface ExerciseLibraryConfigRecord {
  id: number
  businessId: number
  config: { categories: GymLibraryCategory[] }
  createdBy: number | null
  createdAt: string
  updatedAt: string
}

export const exerciseLibraryConfigApi = {
  /** null means the business hasn't configured its exercise library yet. */
  get: () => get<ExerciseLibraryConfigRecord | null>('/exercise-library-config'),

  save: (categories: GymLibraryCategory[]) =>
    put<ExerciseLibraryConfigRecord>('/exercise-library-config', { categories }),

  /** Permanently deletes the business's exercise library configuration — reverts it to NOT_CONFIGURED. */
  delete: () => del<void>('/exercise-library-config'),
}
