import { get, post, put, del } from './client'

/**
 * The platform's actual `/businesses` resource (gym-os-api). Distinct from
 * `businesses.api.ts`, which targets a richer `/admin/businesses` contract
 * (multi-tenant gyms, member linking, overview analytics) that the real API
 * doesn't implement yet. This module backs the SuperAdmin "add business" flow
 * on BusinessesPage with what the API actually persists.
 */
export interface BusinessRecord {
  id: number
  businessKey: string
  businessName: string
  businessLogo?: string | null
  address?: string | null
  gstNo?: string | null
  mobileNumber?: string | null
  email?: string | null
  phoneNumber?: string | null
  status?: string | null
  createdAt: string
  updatedAt: string
}

export interface BusinessRecordPayload {
  businessKey: string
  businessName: string
  businessLogo?: string
  address?: string
  gstNo?: string
  mobileNumber?: string
  email?: string
  phoneNumber?: string
  status?: string
}

export const businessRegistryApi = {
  list: () => get<BusinessRecord[]>('/businesses'),

  get: (id: number) => get<BusinessRecord>(`/businesses/${id}`),

  create: (data: BusinessRecordPayload) => post<BusinessRecord>('/businesses', data),

  update: (id: number, data: Partial<BusinessRecordPayload>) =>
    put<BusinessRecord>(`/businesses/${id}`, data),

  delete: (id: number) => del<void>(`/businesses/${id}`),
}
