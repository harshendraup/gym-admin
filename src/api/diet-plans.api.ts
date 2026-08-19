import { get, post, put, del } from './client'

/**
 * The real `/diet-plans` resource (gym-os-api). A plan is a business+branch
 * template, not tied to a member yet — see diet-assignments.api.ts for the
 * "assign this plan to a member" step. Structural equivalent of
 * training-programs.api.ts.
 */
export type DietPlanGoal = 'Weight Loss' | 'Muscle Gain' | 'Fat Loss' | 'Fitness'

export interface DietPlanRecord {
  id: number
  businessId: number
  branchId: number
  createdBy: number | null
  createdByRole: 'superadmin' | 'admin' | 'sub_admin'
  name: string
  goal: DietPlanGoal
  description: string | null
  caloriesTarget: string | null
  proteinTarget: string | null
  carbsTarget: string | null
  fatTarget: string | null
  waterTarget: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateDietPlanPayload {
  branchId: number
  name: string
  goal: DietPlanGoal
  description?: string
  caloriesTarget?: number
  proteinTarget?: number
  carbsTarget?: number
  fatTarget?: number
  waterTarget?: number
  isActive?: boolean
}

export type UpdateDietPlanPayload = Partial<Omit<CreateDietPlanPayload, 'branchId'>>

export const dietPlansApi = {
  list: () => get<DietPlanRecord[]>('/diet-plans'),

  get: (id: number) => get<DietPlanRecord>(`/diet-plans/${id}`),

  create: (data: CreateDietPlanPayload) => post<DietPlanRecord>('/diet-plans', data),

  update: (id: number, data: UpdateDietPlanPayload) => put<DietPlanRecord>(`/diet-plans/${id}`, data),

  delete: (id: number) => del<void>(`/diet-plans/${id}`),
}
