import { get, post, put, del } from './client'

/**
 * The real `/diets` resource (gym-os-api). A diet plan always belongs to
 * exactly one client (member) — businessId/branchId are derived server-side
 * from that client and can't be set directly. A trainer, when assigned,
 * must be in the same business+branch as the client.
 */
export type DietGoal = 'Weight Loss' | 'Muscle Gain' | 'Fat Loss' | 'Fitness'
export type DietStatus = 'Draft' | 'Active' | 'Completed'

export interface DietRecord {
  id: number
  businessId: number
  branchId: number
  clientId: number
  trainerId: number | null
  name: string
  goal: DietGoal
  description: string | null
  startDate: string | null
  endDate: string | null
  caloriesTarget: string | null
  proteinTarget: string | null
  carbsTarget: string | null
  fatTarget: string | null
  waterTarget: string | null
  status: DietStatus
  createdAt: string
  updatedAt: string
}

export interface CreateDietPayload {
  clientId: number
  trainerId?: number
  name: string
  goal: DietGoal
  description?: string
  startDate?: string
  endDate?: string
  caloriesTarget?: number
  proteinTarget?: number
  carbsTarget?: number
  fatTarget?: number
  waterTarget?: number
  status?: DietStatus
}

export type UpdateDietPayload = Partial<Omit<CreateDietPayload, 'clientId'>>

export const dietsApi = {
  list: () => get<DietRecord[]>('/diets'),

  get: (id: number) => get<DietRecord>(`/diets/${id}`),

  create: (data: CreateDietPayload) => post<DietRecord>('/diets', data),

  update: (id: number, data: UpdateDietPayload) => put<DietRecord>(`/diets/${id}`, data),

  delete: (id: number) => del<void>(`/diets/${id}`),
}
