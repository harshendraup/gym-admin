import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { dietsApi, type CreateDietPayload, type UpdateDietPayload } from '@/api/diets.api'
import { getApiErrorMessage } from '@/lib/api-error'
import { toast } from 'sonner'

export const dietKeys = {
  all: () => ['diets'] as const,
}

/**
 * The backend already scopes `GET /diets` by the caller's own role
 * (superadmin: all, admin: own business, sub_admin: own branch, member/
 * trainer: only their own) — one unfiltered query covers every dashboard.
 */
export function useDiets() {
  return useQuery({
    queryKey: dietKeys.all(),
    queryFn: () => dietsApi.list(),
    staleTime: 30_000,
  })
}

export function useDietsForClient(clientId: string | number | undefined) {
  const query = useDiets()
  return {
    ...query,
    data: clientId
      ? (query.data ?? []).filter((d) => String(d.clientId) === String(clientId))
      : query.data,
  }
}

export function useCreateDiet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateDietPayload) => dietsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dietKeys.all() })
      toast.success('Diet plan created')
    },
    onError: (error: any) => {
      toast.error(getApiErrorMessage(error, 'Failed to create diet plan'))
    },
  })
}

export function useUpdateDiet(id: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateDietPayload) => dietsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dietKeys.all() })
      toast.success('Diet plan updated')
    },
    onError: (error: any) => {
      toast.error(getApiErrorMessage(error, 'Failed to update diet plan'))
    },
  })
}

export function useDeleteDiet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => dietsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dietKeys.all() })
      toast.success('Diet plan removed')
    },
    onError: (error: any) => {
      toast.error(getApiErrorMessage(error, 'Failed to remove diet plan'))
    },
  })
}
