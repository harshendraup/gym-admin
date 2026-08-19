import catalog from './exercisesData.json'
import type { ExerciseCategory, MuscleGroup } from '@/api/exercises.api'

export interface CatalogExercise {
  name: string
  target_muscle: string
}

export interface CatalogGroup {
  group_id: string
  group_name: string
  intensity: string
  exercises: CatalogExercise[]
  related_equipments: string[]
}

export interface CatalogCategory {
  category_id: string
  category_name: string
  description: string
  groups: CatalogGroup[]
}

export interface LibraryExercise {
  name: string
  category: ExerciseCategory
  muscleGroup?: MuscleGroup
  equipment?: string
}

const CATALOG_CATEGORIES = catalog.gym_workout_categories as CatalogCategory[]

// Maps each exercisesData.json group to the app's 5-value ExerciseCategory
// enum. grp_recovery_01 / grp_recovery_02 (sauna, cold plunge, massage guns)
// are recovery modalities rather than trainable exercises, so any group left
// out of this table is excluded from both the picker and the autocomplete.
const GROUP_CATEGORY: Record<string, ExerciseCategory> = {
  grp_str_01: 'Strength', grp_str_02: 'Strength', grp_str_03: 'Strength', grp_str_04: 'Strength',
  grp_str_05: 'Strength', grp_str_06: 'Strength', grp_str_07: 'Strength',
  grp_card_01: 'Cardio', grp_card_02: 'Cardio', grp_card_03: 'Cardio', grp_card_04: 'Cardio',
  grp_card_05: 'Cardio', grp_card_06: 'Cardio', grp_card_07: 'Cardio', grp_card_08: 'Cardio',
  grp_flex_01: 'Flexibility', grp_flex_02: 'Flexibility', grp_flex_03: 'Flexibility',
  grp_flex_04: 'Mobility',
  grp_yoga_01: 'Flexibility', grp_yoga_02: 'Flexibility',
  grp_func_01: 'Strength', grp_func_02: 'Strength', grp_func_03: 'Strength',
  grp_oly_01: 'Strength',
  grp_core_01: 'Strength', grp_core_02: 'Balance',
  grp_studio_01: 'Cardio',
  grp_rehab_01: 'Mobility',
}

// Best-effort keyword mapping from the dataset's free-text target_muscle to
// the app's fixed MuscleGroup enum; checked in this order since a muscle
// string can mention several groups (e.g. "Glutes, Hamstrings, Core").
const MUSCLE_KEYWORDS: [RegExp, MuscleGroup][] = [
  [/pector/i, 'Chest'],
  [/lat(issimus)?|rhomboid|trapezius|spinal erector|teres|thoracic|upper back/i, 'Back'],
  [/quad|glute|hamstring|calv|calf|adductor|abductor|vmo|hip flexor|psoas|iliotibial|it band|ankle|hip joint/i, 'Legs'],
  [/delt|rotator cuff/i, 'Shoulders'],
  [/bicep|tricep|forearm|grip/i, 'Arms'],
  [/abdomin|obliqu|transverse|core|diaphragm/i, 'Core'],
  [/full body|connective tissue|joint/i, 'Full Body'],
  [/cardiovascular|heart/i, 'Cardio'],
]

function mapMuscleGroup(targetMuscle: string): MuscleGroup | undefined {
  return MUSCLE_KEYWORDS.find(([pattern]) => pattern.test(targetMuscle))?.[1]
}

// Only categories/groups with a known ExerciseCategory mapping are exposed,
// so the picker can never produce a selection the submit schema would reject.
const TRAINABLE_CATEGORIES: CatalogCategory[] = CATALOG_CATEGORIES.map((cat) => ({
  ...cat,
  groups: cat.groups.filter((g) => GROUP_CATEGORY[g.group_id]),
})).filter((cat) => cat.groups.length > 0)

function findCatalogGroup(categoryId?: string, groupId?: string): CatalogGroup | undefined {
  if (!categoryId || !groupId) return undefined
  return TRAINABLE_CATEGORIES.find((c) => c.category_id === categoryId)?.groups.find((g) => g.group_id === groupId)
}

/** Level 1 of the cascade: every trainable category in the catalog. */
export function getCatalogCategories(): { id: string; name: string }[] {
  return TRAINABLE_CATEGORIES.map((c) => ({ id: c.category_id, name: c.category_name }))
}

/** Level 2: groups belonging to the selected category. */
export function getCatalogGroups(categoryId?: string): { id: string; name: string }[] {
  if (!categoryId) return []
  const cat = TRAINABLE_CATEGORIES.find((c) => c.category_id === categoryId)
  return (cat?.groups ?? []).map((g) => ({ id: g.group_id, name: g.group_name }))
}

/** ExerciseCategory enum value for a picked group, before an exercise is chosen. */
export function getCategoryForGroup(categoryId?: string, groupId?: string): ExerciseCategory | undefined {
  return findCatalogGroup(categoryId, groupId)?.group_id ? GROUP_CATEGORY[groupId as string] : undefined
}

/** Level 3: equipment belonging to the selected category + group. */
export function getCatalogEquipment(categoryId?: string, groupId?: string): string[] {
  return findCatalogGroup(categoryId, groupId)?.related_equipments ?? []
}

/**
 * Level 4: exercises belonging to the selected category + group. Equipment
 * in this dataset is modeled per group rather than per exercise, so picking
 * a specific piece of equipment doesn't narrow this list further — it's
 * instead used to set the auto-filled Equipment value precisely.
 */
export function getCatalogExercises(categoryId?: string, groupId?: string): CatalogExercise[] {
  return findCatalogGroup(categoryId, groupId)?.exercises ?? []
}

export function resolveLibraryExercise(
  categoryId: string,
  groupId: string,
  exerciseName: string,
  equipment?: string
): LibraryExercise | undefined {
  const group = findCatalogGroup(categoryId, groupId)
  const exercise = group?.exercises.find((ex) => ex.name === exerciseName)
  if (!group || !exercise) return undefined
  return {
    name: exercise.name,
    category: GROUP_CATEGORY[group.group_id],
    muscleGroup: mapMuscleGroup(exercise.target_muscle),
    equipment: equipment || group.related_equipments.slice(0, 3).join(', '),
  }
}

// Flat, alphabetized list of every trainable exercise — powers the free-text
// name autocomplete as an alternative to the cascading picker.
export const EXERCISE_LIBRARY: LibraryExercise[] = TRAINABLE_CATEGORIES.flatMap((cat) =>
  cat.groups.flatMap((group) =>
    group.exercises.map((ex) => ({
      name: ex.name,
      category: GROUP_CATEGORY[group.group_id],
      muscleGroup: mapMuscleGroup(ex.target_muscle),
      equipment: group.related_equipments.slice(0, 3).join(', '),
    }))
  )
).sort((a, b) => a.name.localeCompare(b.name))

export function findLibraryExercise(name: string): LibraryExercise | undefined {
  return EXERCISE_LIBRARY.find((ex) => ex.name === name)
}
