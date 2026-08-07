import { api } from './client'
import type { AuthResponse } from './auth.api'

/**
 * The real, PUBLIC `POST /businesses/:businessId/members/register` endpoint
 * (gym-os-api). No auth token — `businessKey` is the trust factor in its
 * place, and `branchId` must belong to `businessId`. Always creates a
 * `member`-role user; the response shape matches `/auth/login` so the new
 * member can be signed in immediately.
 */
export interface PublicMemberRegistrationPayload {
  businessKey: string
  branchId: number
  firstName: string
  lastName?: string
  fullName?: string
  mobile?: string
  email: string
  password: string
}

export const memberRegistrationApi = {
  register: (businessId: number, data: PublicMemberRegistrationPayload) =>
    api.post<AuthResponse>(`/businesses/${businessId}/members/register`, data),
}
