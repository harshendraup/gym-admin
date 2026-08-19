import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  dietPlansApi,
  type CreateDietPlanPayload,
  type UpdateDietPlanPayload,
} from '@/api/diet-plans.api'
import { getApiErrorMessage } from '@/lib/api-error'
import { toast } from 'sonner'

export const dietPlanKeys = {
  all: () => ['diet-plans'] as const,
}

/** The backend already scopes this to the caller's own business/branch. */
export function useDietPlans() {
  return useQuery({
    queryKey: dietPlanKeys.all(),
    queryFn: () => dietPlansApi.list(),
    staleTime: 30_000,
  })
}

export function useCreateDietPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateDietPlanPayload) => dietPlansApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dietPlanKeys.all() })
      toast.success('Diet plan created')
    },
    onError: (error: any) => {
      toast.error(getApiErrorMessage(error, 'Failed to create diet plan'))
    },
  })
}

export function useUpdateDietPlan(id: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateDietPlanPayload) => dietPlansApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dietPlanKeys.all() })
      toast.success('Diet plan updated')
    },
    onError: (error: any) => {
      toast.error(getApiErrorMessage(error, 'Failed to update diet plan'))
    },
  })
}

export function useDeleteDietPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => dietPlansApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dietPlanKeys.all() })
      toast.success('Diet plan removed')
    },
    onError: (error: any) => {
      toast.error(getApiErrorMessage(error, 'Failed to remove diet plan'))
    },
  })
}
