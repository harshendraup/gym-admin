import type { GymLibraryCategory, GymLibraryGroup, GymLibraryExercise } from '@/api/exercise-library-config.api'
import type { LibraryExercise } from './exerciseLibrary'

function findConfiguredGroup(
  categories: GymLibraryCategory[],
  categoryId?: string,
  groupId?: string
): GymLibraryGroup | undefined {
  if (!categoryId || !groupId) return undefined
  return categories.find((c) => c.id === categoryId)?.groups.find((g) => g.id === groupId)
}

export function listConfiguredCategories(categories: GymLibraryCategory[]): { id: string; name: string }[] {
  return categories.map((c) => ({ id: c.id, name: c.name }))
}

export function listConfiguredGroups(categories: GymLibraryCategory[], categoryId?: string): { id: string; name: string }[] {
  if (!categoryId) return []
  const category = categories.find((c) => c.id === categoryId)
  return (category?.groups ?? []).map((g) => ({ id: g.id, name: g.name }))
}

/** The group's real ExerciseCategory, before an exercise is picked — mirrors getCategoryForGroup for the master catalog. */
export function getConfiguredCategoryForGroup(categories: GymLibraryCategory[], categoryId?: string, groupId?: string) {
  return findConfiguredGroup(categories, categoryId, groupId)?.category
}

export function listConfiguredEquipment(categories: GymLibraryCategory[], categoryId?: string, groupId?: string): string[] {
  return findConfiguredGroup(categories, categoryId, groupId)?.equipment ?? []
}

export function listConfiguredExercises(categories: GymLibraryCategory[], categoryId?: string, groupId?: string): GymLibraryExercise[] {
  return findConfiguredGroup(categories, categoryId, groupId)?.exercises ?? []
}

/** Everything the group already carries is fully resolved — no mapping needed. */
export function resolveConfiguredExercise(
  categories: GymLibraryCategory[],
  categoryId: string,
  groupId: string,
  exerciseName: string,
  equipment?: string
): LibraryExercise | undefined {
  const group = findConfiguredGroup(categories, categoryId, groupId)
  const exercise = group?.exercises.find((ex) => ex.name === exerciseName)
  if (!group || !exercise) return undefined
  return {
    name: exercise.name,
    category: group.category,
    muscleGroup: exercise.muscleGroup,
    equipment: equipment || group.equipment.slice(0, 3).join(', '),
  }
}
