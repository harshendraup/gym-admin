import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  paymentsApi, type PaymentPayload, type UpdatePaymentPayload, type PaymentListFilters,
  type CheckoutPayload, type VerifyPayload,
} from '@/api/payments.api'
import { getApiErrorMessage } from '@/lib/api-error'
import { toast } from 'sonner'

export const paymentKeys = {
  all: () => ['payments'] as const,
  list: (filters?: PaymentListFilters) =>
    ['payments', filters?.businessId ?? 'own', filters?.branchId ?? 'all'] as const,
  summary: (filters?: PaymentListFilters) =>
    ['payments', 'summary', filters?.businessId ?? 'own', filters?.branchId ?? 'all'] as const,
}

/** The backend scopes this per the caller's role; businessId/branchId filters only take effect for a superadmin caller. */
export function usePayments(filters?: PaymentListFilters) {
  return useQuery({
    queryKey: paymentKeys.list(filters),
    queryFn: () => paymentsApi.list(filters),
    staleTime: 30_000,
  })
}

export function usePaymentsSummary(filters?: PaymentListFilters) {
  return useQuery({
    queryKey: paymentKeys.summary(filters),
    queryFn: () => paymentsApi.summary(filters),
    staleTime: 30_000,
  })
}

export function useCreatePayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: PaymentPayload) => paymentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.all() })
      toast.success('Payment recorded')
    },
    onError: (error: any) => {
      toast.error(getApiErrorMessage(error, 'Failed to record payment'))
    },
  })
}

export function useUpdatePayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePaymentPayload }) =>
      paymentsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.all() })
      toast.success('Payment updated')
    },
    onError: (error: any) => {
      toast.error(getApiErrorMessage(error, 'Failed to update payment'))
    },
  })
}

export function useCheckoutPayment() {
  return useMutation({
    mutationFn: (data?: CheckoutPayload) => paymentsApi.checkout(data),
    onError: (error: any) => {
      toast.error(getApiErrorMessage(error, 'Failed to start checkout'))
    },
  })
}

export function useVerifyPayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: VerifyPayload }) => paymentsApi.verify(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.all() })
    },
    onError: (error: any) => {
      toast.error(getApiErrorMessage(error, 'Payment verification failed'))
    },
  })
}

export function useDeletePayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => paymentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.all() })
      toast.success('Payment removed')
    },
    onError: (error: any) => {
      toast.error(getApiErrorMessage(error, 'Failed to remove payment'))
    },
  })
}
