import { get, post, put, del } from './client'

export type PaymentPurpose =
  | 'membership_new' | 'membership_renewal' | 'joining_fee'
  | 'personal_training' | 'product' | 'penalty' | 'other'

export type PaymentMethod =
  | 'cash' | 'card' | 'upi' | 'bank_transfer'
  | 'razorpay' | 'stripe' | 'paypal' | 'phonepe' | 'wallet' | 'other'

export type PaymentStatus =
  | 'pending' | 'processing' | 'success' | 'failed'
  | 'cancelled' | 'refunded' | 'partially_refunded'

export type RefundStatus = 'none' | 'partial' | 'full'

export interface PaymentRecord {
  id: number
  businessId: number
  branchId: number | null
  userId: number
  membershipId: number | null
  collectedBy: number | null
  purpose: PaymentPurpose
  invoiceNumber: string | null
  amount: string
  taxAmount: string
  discountAmount: string
  totalAmount: string
  currency: string
  paymentMethod: PaymentMethod
  gatewayOrderId: string | null
  gatewayPaymentId: string | null
  status: PaymentStatus
  failureReason: string | null
  refundStatus: RefundStatus
  refundedAmount: string
  refundedAt: string | null
  paidOn: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface PaymentPayload {
  userId?: number
  branchId?: number
  membershipId?: number
  purpose: PaymentPurpose
  invoiceNumber?: string
  amount: number
  taxAmount?: number
  discountAmount?: number
  totalAmount: number
  currency?: string
  paymentMethod: PaymentMethod
  gatewayOrderId?: string
  gatewayPaymentId?: string
  gatewaySignature?: string
  status?: PaymentStatus
  paidOn?: string
  notes?: string
}

export interface UpdatePaymentPayload {
  status?: PaymentStatus
  failureReason?: string
  refundStatus?: RefundStatus
  refundedAmount?: number
  refundedAt?: string
  notes?: string
}

export interface PaymentListFilters {
  /** Only honored for a superadmin caller — every other role is scoped server-side. */
  businessId?: number
  branchId?: number
}

export interface RevenueSummary {
  totalRevenue: number
  count: number
}

export interface CheckoutPayload {
  purpose?: PaymentPurpose
  amount?: number
  currency?: string
}

export interface CheckoutResponse {
  paymentId: number
  razorpayOrderId: string
  amount: number
  currency: string
  keyId: string | null
}

export interface VerifyPayload {
  razorpayOrderId: string
  razorpayPaymentId: string
  razorpaySignature: string
}

export const paymentsApi = {
  list: (filters?: PaymentListFilters) =>
    get<PaymentRecord[]>('/payments', filters as Record<string, unknown> | undefined),

  get: (id: number) => get<PaymentRecord>(`/payments/${id}`),

  create: (data: PaymentPayload) => post<PaymentRecord>('/payments', data),

  update: (id: number, data: UpdatePaymentPayload) => put<PaymentRecord>(`/payments/${id}`, data),

  delete: (id: number) => del<void>(`/payments/${id}`),

  summary: (filters?: PaymentListFilters) =>
    get<RevenueSummary>('/payments/summary', filters as Record<string, unknown> | undefined),

  checkout: (data?: CheckoutPayload) => post<CheckoutResponse>('/payments/checkout', data ?? {}),

  verify: (id: number, data: VerifyPayload) => post<PaymentRecord>(`/payments/${id}/verify`, data),
}
