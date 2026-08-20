import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { dietPlansApi, type CreateDietPlanPayload, type UpdateDietPlanPayload } from '@/api/diet-plans.api'
import { getApiErrorMessage } from '@/lib/api-error'
import { toast } from 'sonner'

export const dietPlanKeys = {
  all: () => ['diet-plans'] as const,
  detail: (id: number) => ['diet-plans', 'detail', id] as const,
}

/**
 * `GET /diet-plans` already returns the full nested day/meal/item tree for
 * every plan (see DietPlanRepository.listWithDetails server-side), so this
 * single query backs both the library grid and the builder.
 */
export function useDietPlans() {
  return useQuery({
    queryKey: dietPlanKeys.all(),
    queryFn: () => dietPlansApi.list(),
    staleTime: 30_000,
  })
}

export function useDietPlanDetails(id: number | undefined) {
  return useQuery({
    queryKey: dietPlanKeys.detail(id ?? 0),
    queryFn: () => dietPlansApi.getDetails(id!),
    enabled: !!id,
    staleTime: 10_000,
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
      queryClient.invalidateQueries({ queryKey: dietPlanKeys.detail(id) })
      toast.success('Diet plan updated')
    },
    onError: (error: any) => {
      toast.error(getApiErrorMessage(error, 'Failed to update diet plan'))
    },
  })
}

/** Same as useUpdateDietPlan but callable for an arbitrary plan id — used by list-level quick actions like Archive. */
export function useUpdateAnyDietPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateDietPlanPayload }) => dietPlansApi.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: dietPlanKeys.all() })
      queryClient.invalidateQueries({ queryKey: dietPlanKeys.detail(variables.id) })
      toast.success('Diet plan updated')
    },
    onError: (error: any) => {
      toast.error(getApiErrorMessage(error, 'Failed to update diet plan'))
    },
  })
}

export function useDuplicateDietPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => dietPlansApi.duplicate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dietPlanKeys.all() })
      toast.success('Diet plan duplicated')
    },
    onError: (error: any) => {
      toast.error(getApiErrorMessage(error, 'Failed to duplicate diet plan'))
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
