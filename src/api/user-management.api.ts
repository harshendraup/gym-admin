import { get, post, put, del } from './client'

/**
 * The real `/users` resource (gym-os-api). Every person in the system —
 * admin, sub-admin, member — is a row here, differentiated by `roleId` and
 * scoped by `businessId`. The backend enforces who may create/see/edit whom;
 * this client just calls it.
 */
export interface ManagedUser {
  id: string
  firstName: string
  lastName: string | null
  fullName: string | null
  email: string | null
  mobile: string | null
  age: number | null
  gender: string | null
  dateOfBirth: string | null
  businessId: number | null
  branchId: number | null
  roleId: number | null
  trainerId: number | null
  status: string
  createdAt: string
  updatedAt: string
}

export interface ManagedUserPayload {
  firstName: string
  lastName?: string
  email?: string
  password?: string
  mobile?: string
  businessId?: number
  branchId?: number
  roleId?: number
  trainerId?: number
  status?: string
}

export const userManagementApi = {
  list: () => get<ManagedUser[]>('/users'),

  create: (data: ManagedUserPayload) => post<ManagedUser>('/users', data),

  update: (id: string, data: Partial<ManagedUserPayload>) =>
    put<ManagedUser>(`/users/${id}`, data),

  delete: (id: string) => del<void>(`/users/${id}`),
}
