import { get, put } from './client'

export type FitnessLevel = 'Beginner' | 'Intermediate' | 'Advanced'

export interface MemberFitnessPreferenceRecord {
  id: number
  businessId: number
  branchId: number
  memberId: number
  updatedBy: number | null
  fitnessLevel: FitnessLevel | null
  previousGymExperience: string | null
  workoutFrequency: number | null
  preferredDays: string[] | null
  preferredDuration: number | null
  preferredTime: string | null
  preferredWorkoutTypes: string[] | null
  favoriteExercises: string[] | null
  avoidExercises: string[] | null
  availableEquipment: string[] | null
  injuries: string | null
  physicalLimitations: string | null
  exerciseRestrictions: string | null
  mobilityLimitations: string | null
  fitnessAssessmentNotes: string | null
  createdAt: string
  updatedAt: string
}

export interface SaveMemberFitnessPreferencePayload {
  memberId: number
  fitnessLevel?: FitnessLevel
  previousGymExperience?: string
  workoutFrequency?: number
  preferredDays?: string[]
  preferredDuration?: number
  preferredTime?: string
  preferredWorkoutTypes?: string[]
  favoriteExercises?: string[]
  avoidExercises?: string[]
  availableEquipment?: string[]
  injuries?: string
  physicalLimitations?: string
  exerciseRestrictions?: string
  mobilityLimitations?: string
  fitnessAssessmentNotes?: string
}

export const memberFitnessPreferencesApi = {
  /** null means this member has no fitness preferences saved yet. */
  forMember: (memberId: number) =>
    get<MemberFitnessPreferenceRecord | null>(`/member-fitness-preferences/${memberId}`),
  save: (data: SaveMemberFitnessPreferencePayload) =>
    put<MemberFitnessPreferenceRecord>('/member-fitness-preferences', data),
}
