import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  dietAssignmentsApi,
  type CreateDietAssignmentPayload,
  type UpdateDietAssignmentPayload,
} from '@/api/diet-assignments.api'
import { getApiErrorMessage } from '@/lib/api-error'
import { toast } from 'sonner'

export const dietAssignmentKeys = {
  all: () => ['diet-assignments'] as const,
}

/** The backend already scopes this per the caller's role. */
export function useDietAssignments() {
  return useQuery({
    queryKey: dietAssignmentKeys.all(),
    queryFn: () => dietAssignmentsApi.list(),
    staleTime: 30_000,
  })
}

/** Client-side filter for one member's own assignments — mirrors the old useDietsForClient. */
export function useDietAssignmentsForMember(memberId: string | number | undefined) {
  const query = useDietAssignments()
  return {
    ...query,
    data: memberId
      ? (query.data ?? []).filter((a) => String(a.memberId) === String(memberId))
      : query.data,
  }
}

export function useCreateDietAssignment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateDietAssignmentPayload) => dietAssignmentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dietAssignmentKeys.all() })
      toast.success('Diet plan assigned')
    },
    onError: (error: any) => {
      toast.error(getApiErrorMessage(error, 'Failed to assign diet plan'))
    },
  })
}

export function useUpdateDietAssignment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateDietAssignmentPayload }) =>
      dietAssignmentsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dietAssignmentKeys.all() })
      toast.success('Assignment updated')
    },
    onError: (error: any) => {
      toast.error(getApiErrorMessage(error, 'Failed to update assignment'))
    },
  })
}

export function useDeleteDietAssignment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => dietAssignmentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dietAssignmentKeys.all() })
      toast.success('Assignment removed')
    },
    onError: (error: any) => {
      toast.error(getApiErrorMessage(error, 'Failed to remove assignment'))
    },
  })
}
