import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { foodsApi, type CreateFoodPayload, type UpdateFoodPayload } from '@/api/foods.api'
import { getApiErrorMessage } from '@/lib/api-error'
import { toast } from 'sonner'

export const foodKeys = {
  all: () => ['foods'] as const,
}

export function useFoods() {
  return useQuery({
    queryKey: foodKeys.all(),
    queryFn: () => foodsApi.list(),
    staleTime: 60_000,
  })
}

export function useCreateFood() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateFoodPayload) => foodsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: foodKeys.all() })
      toast.success('Food added to library')
    },
    onError: (error: any) => {
      toast.error(getApiErrorMessage(error, 'Failed to add food'))
    },
  })
}

export function useUpdateFood(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateFoodPayload) => foodsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: foodKeys.all() })
      toast.success('Food updated')
    },
    onError: (error: any) => {
      toast.error(getApiErrorMessage(error, 'Failed to update food'))
    },
  })
}

export function useDeleteFood() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => foodsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: foodKeys.all() })
      toast.success('Food removed')
    },
    onError: (error: any) => {
      toast.error(getApiErrorMessage(error, 'Failed to remove food'))
    },
  })
}
