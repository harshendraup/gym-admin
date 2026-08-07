import { get, post, put, del } from './client'

/**
 * The real `/branches` resource (gym-os-api). NOTE: `GET /branches` is not
 * scoped server-side — it returns every branch of every business regardless
 * of the caller's role. Callers that need a single business's branches must
 * filter the result client-side by `businessId` (see `useBranches`).
 */
export interface BranchRecord {
  id: number
  businessId: number
  branchName: string
  email?: string | null
  mobileNumber?: string | null
  photo?: unknown | null
  address?: string | null
  city?: string | null
  state?: string | null
  country?: string | null
  pincode?: string | null
  status?: string | null
  lat?: string | null
  long?: string | null
  createdAt: string
  updatedAt: string
}

export interface BranchPayload {
  businessId: number
  branchName: string
  email?: string
  mobileNumber?: string
  address?: string
  city?: string
  state?: string
  country?: string
  pincode?: string
  status?: string
  lat?: number
  long?: number
}

export const branchesApi = {
  list: () => get<BranchRecord[]>('/branches'),

  get: (id: number) => get<BranchRecord>(`/branches/${id}`),

  create: (data: BranchPayload) => post<BranchRecord>('/branches', data),

  update: (id: number, data: Partial<BranchPayload>) =>
    put<BranchRecord>(`/branches/${id}`, data),

  delete: (id: number) => del<void>(`/branches/${id}`),
}
