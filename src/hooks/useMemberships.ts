import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  membershipsApi, type MembershipPayload, type UpdateMembershipPayload, type MembershipListFilters,
} from '@/api/memberships.api'
import { getApiErrorMessage } from '@/lib/api-error'
import { toast } from 'sonner'

export const membershipKeys = {
  all: () => ['memberships'] as const,
  list: (filters?: MembershipListFilters) =>
    ['memberships', filters?.businessId ?? 'own', filters?.branchId ?? 'all'] as const,
}

/** The backend scopes this per the caller's role; businessId/branchId filters only take effect for a superadmin caller. */
export function useMemberships(filters?: MembershipListFilters) {
  return useQuery({
    queryKey: membershipKeys.list(filters),
    queryFn: () => membershipsApi.list(filters),
    staleTime: 30_000,
  })
}

export function useCreateMembership() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: MembershipPayload) => membershipsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: membershipKeys.all() })
      toast.success('Membership plan created')
    },
    onError: (error: any) => {
      toast.error(getApiErrorMessage(error, 'Failed to create membership plan'))
    },
  })
}

export function useUpdateMembership() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateMembershipPayload }) =>
      membershipsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: membershipKeys.all() })
      toast.success('Membership plan updated')
    },
    onError: (error: any) => {
      toast.error(getApiErrorMessage(error, 'Failed to update membership plan'))
    },
  })
}

export function useDeleteMembership() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => membershipsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: membershipKeys.all() })
      toast.success('Membership plan removed')
    },
    onError: (error: any) => {
      toast.error(getApiErrorMessage(error, 'Failed to remove membership plan'))
    },
  })
}
