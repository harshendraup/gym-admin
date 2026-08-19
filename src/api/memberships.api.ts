import { get, post, put, del } from './client'

/**
 * The real `/memberships` resource (gym-os-api) — a business's membership
 * plans (the cards a gym offers members, e.g. "Gold Annual", "Silver
 * Monthly"). businessId/createdBy are always derived server-side from the
 * acting admin/sub_admin. branchId is optional: null means the plan is
 * business-wide, a real id pins it to one branch. A sub_admin's branchId is
 * always forced server-side to their own branch regardless of what's sent.
 */
export type MembershipDurationUnit = 'days' | 'weeks' | 'months' | 'years'
export type MembershipDiscountType = 'flat' | 'percentage'
export type MembershipStatus = 'draft' | 'active' | 'inactive' | 'archived'

export interface MembershipRecord {
  id: number
  businessId: number
  branchId: number | null
  createdBy: number | null
  membershipName: string
  membershipCode: string
  title: string
  subTitle: string | null
  description: string | null
  badgeLabel: string | null
  colorTag: string | null
  amount: string
  currency: string
  discountType: MembershipDiscountType | null
  discountValue: string | null
  finalAmount: string | null
  taxPercentage: string | null
  joiningFee: string
  renewalPrice: string | null
  durationValue: number
  durationUnit: MembershipDurationUnit
  isLifetime: boolean
  attendanceLimit: number | null
  maxFreezeDays: number | null
  personalTrainingSessions: number | null
  guestPasses: number | null
  maxMembersPerPlan: number | null
  isTrial: boolean
  groupClasses: boolean
  dietPlan: boolean
  lockerAccess: boolean
  workoutAccess: boolean
  isFeatured: boolean
  isVisibleOnApp: boolean
  sortOrder: number | null
  status: MembershipStatus
  metaMembership: unknown
  createdAt: string
  updatedAt: string
}

export interface MembershipPayload {
  branchId?: number
  membershipName: string
  membershipCode: string
  title: string
  subTitle?: string
  description?: string
  badgeLabel?: string
  colorTag?: string
  amount: number
  currency?: string
  discountType?: MembershipDiscountType
  discountValue?: number
  taxPercentage?: number
  joiningFee?: number
  renewalPrice?: number
  durationValue: number
  durationUnit: MembershipDurationUnit
  isLifetime?: boolean
  attendanceLimit?: number
  maxFreezeDays?: number
  personalTrainingSessions?: number
  guestPasses?: number
  maxMembersPerPlan?: number
  isTrial?: boolean
  groupClasses?: boolean
  dietPlan?: boolean
  lockerAccess?: boolean
  workoutAccess?: boolean
  isFeatured?: boolean
  isVisibleOnApp?: boolean
  sortOrder?: number
  status?: MembershipStatus
}

export type UpdateMembershipPayload = Partial<MembershipPayload>

export interface MembershipListFilters {
  /** Only honored for a superadmin caller — every other role is scoped server-side. */
  businessId?: number
  branchId?: number
}

export const membershipsApi = {
  list: (filters?: MembershipListFilters) =>
    get<MembershipRecord[]>('/memberships', filters as Record<string, unknown> | undefined),

  get: (id: number) => get<MembershipRecord>(`/memberships/${id}`),

  create: (data: MembershipPayload) => post<MembershipRecord>('/memberships', data),

  update: (id: number, data: UpdateMembershipPayload) =>
    put<MembershipRecord>(`/memberships/${id}`, data),

  delete: (id: number) => del<void>(`/memberships/${id}`),
}
