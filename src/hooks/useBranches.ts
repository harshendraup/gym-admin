import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { branchesApi, type BranchPayload } from '@/api/branches.api'
import { getApiErrorMessage } from '@/lib/api-error'
import { toast } from 'sonner'

export const branchKeys = {
  all: () => ['branches'] as const,
  list: (businessId?: string) => ['branches', businessId ?? 'all'] as const,
}

/**
 * `GET /branches` is not scoped server-side — it returns every branch of
 * every business. When `businessId` is given, the result is filtered
 * client-side.
 */
export function useBranches(businessId?: string) {
  return useQuery({
    queryKey: branchKeys.list(businessId),
    queryFn: () => branchesApi.list(),
    select: (data) => (businessId ? data.filter((b) => String(b.businessId) === businessId) : data),
    staleTime: 30_000,
  })
}

export function useBranch(id: number) {
  return useQuery({
    queryKey: ['branches', 'detail', id],
    queryFn: () => branchesApi.get(id),
    enabled: !!id,
  })
}

export function useCreateBranch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: BranchPayload) => branchesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: branchKeys.all() })
      toast.success('Branch created')
    },
    onError: (error: any) => {
      toast.error(getApiErrorMessage(error, 'Failed to create branch'))
    },
  })
}

export function useUpdateBranch(id: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<BranchPayload>) => branchesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: branchKeys.all() })
      toast.success('Branch updated')
    },
    onError: (error: any) => {
      toast.error(getApiErrorMessage(error, 'Failed to update branch'))
    },
  })
}

export function useDeleteBranch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => branchesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: branchKeys.all() })
      toast.success('Branch removed')
    },
    onError: (error: any) => {
      toast.error(getApiErrorMessage(error, 'Failed to remove branch'))
    },
  })
}
