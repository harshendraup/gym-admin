import { get, post } from './client'
import type { ManagedUser } from './user-management.api'

/**
 * The real `/businesses/:businessId/admins` resource (gym-os-api). Lets a
 * superadmin provision a business-scoped `admin` account. `businessKey` is a
 * required second factor on the create call and must match the target
 * business's actual key — always read it off the already-fetched
 * `BusinessRecord`, never let the caller type it in freely.
 */
export interface CreateBusinessAdminPayload {
  businessKey: string
  branchId?: number
  firstName: string
  lastName?: string
  email: string
  password: string
  mobile?: string
}

export const businessAdminsApi = {
  list: (businessId: number) => get<ManagedUser[]>(`/businesses/${businessId}/admins`),

  create: (businessId: number, data: CreateBusinessAdminPayload) =>
    post<ManagedUser>(`/businesses/${businessId}/admins`, data),
}
