import { get, post, put } from './client'

export type DietMealLogStatus = 'Completed' | 'Skipped' | 'Modified' | 'Pending'

export interface DietMealLogRecord {
  id: number
  dietAssignmentId: number
  memberId: number
  dietMealId: number
  logDate: string
  status: DietMealLogStatus
  actualCalories: string | null
  actualProtein: string | null
  notes: string | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface DietWaterLogRecord {
  id: number
  dietAssignmentId: number
  memberId: number
  logDate: string
  amountMl: string
  loggedAt: string
}

export interface CreateDietMealLogPayload {
  dietAssignmentId: number
  dietMealId: number
  logDate: string
  status: DietMealLogStatus
  actualCalories?: number
  actualProtein?: number
  notes?: string
}

export interface UpdateDietMealLogPayload {
  status?: DietMealLogStatus
  actualCalories?: number
  actualProtein?: number
  notes?: string
}

export interface CreateDietWaterLogPayload {
  dietAssignmentId: number
  logDate: string
  amountMl: number
}

export interface DietDailySummaryMeal {
  id: number
  mealType: string
  mealName: string | null
  mealTime: string | null
  caloriesTarget: string | null
  proteinTarget: string | null
  carbsTarget: string | null
  fatTarget: string | null
  items: unknown[]
  alternatives: unknown[]
  log: {
    status: DietMealLogStatus
    actualCalories: string | null
    actualProtein: string | null
    notes: string | null
  }
}

export interface DietDailySummary {
  logDate: string
  meals: DietDailySummaryMeal[]
  totalWaterMl: number
  waterLogs: { id: number; amountMl: string; loggedAt: string }[]
}

export type NutritionAdherenceStatus = 'Good' | 'Needs Attention' | 'At Risk'

export interface DietProgress {
  assignmentId: number
  memberId: number
  mealAdherencePct: number
  waterAdherencePct: number | null
  proteinTargetAvg: number | null
  proteinActualAvg: number | null
  totalMealsLogged: number
  totalMealsCompleted: number
  expectedMealsToDate: number
  lastLoggedAt: string | null
  status: NutritionAdherenceStatus
}

export const dietTrackingApi = {
  logMeal: (data: CreateDietMealLogPayload) => post<DietMealLogRecord>('/diet-meal-logs', data),
  updateMealLog: (id: number, data: UpdateDietMealLogPayload) =>
    put<DietMealLogRecord>(`/diet-meal-logs/${id}`, data),
  logWater: (data: CreateDietWaterLogPayload) => post<DietWaterLogRecord>('/diet-water-logs', data),
  dailySummary: (assignmentId: number, date?: string) =>
    get<DietDailySummary>(`/diet-assignments/${assignmentId}/daily-summary`, date ? { date } : undefined),
  progress: (assignmentId: number) =>
    get<DietProgress>(`/diet-assignments/${assignmentId}/progress`),
}
