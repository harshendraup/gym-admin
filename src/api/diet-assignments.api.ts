import { get, post, put, del } from './client'

/**
 * The real `/diet-assignments` resource (gym-os-api) — "assign this diet
 * plan to a member" (optionally with a trainer coaching them), the exact
 * structural equivalent of a program assignment. businessId/branchId are
 * derived server-side from the member, never sent.
 */
export type DietAssignmentStatus = 'Draft' | 'Active' | 'Completed'

export interface DietAssignmentRecord {
  id: number
  businessId: number
  branchId: number
  dietPlanId: number
  memberId: number
  trainerId: number | null
  assignedBy: number | null
  assignedByRole: 'superadmin' | 'admin' | 'sub_admin'
  startDate: string
  endDate: string | null
  status: DietAssignmentStatus
  assignedAt: string
  updatedAt: string
}

export interface CreateDietAssignmentPayload {
  dietPlanId: number
  memberId: number
  trainerId?: number
  startDate: string
  endDate?: string
  status?: DietAssignmentStatus
}

export interface UpdateDietAssignmentPayload {
  trainerId?: number
  startDate?: string
  endDate?: string
  status?: DietAssignmentStatus
}

export const dietAssignmentsApi = {
  list: () => get<DietAssignmentRecord[]>('/diet-assignments'),

  get: (id: number) => get<DietAssignmentRecord>(`/diet-assignments/${id}`),

  create: (data: CreateDietAssignmentPayload) => post<DietAssignmentRecord>('/diet-assignments', data),

  update: (id: number, data: UpdateDietAssignmentPayload) =>
    put<DietAssignmentRecord>(`/diet-assignments/${id}`, data),

  delete: (id: number) => del<void>(`/diet-assignments/${id}`),
}
