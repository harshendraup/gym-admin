import { get } from './client'

export interface RoleRecord {
  id: number
  businessId: number | null
  branchId: number | null
  role: string
  roleName: string
  status?: string | null
}

export const rolesApi = {
  list: () => get<RoleRecord[]>('/roles'),
}
