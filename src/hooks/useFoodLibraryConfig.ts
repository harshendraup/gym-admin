import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { foodLibraryConfigApi, type GymLibraryFoodCategory } from '@/api/food-library-config.api'
import { foodKeys } from '@/hooks/useFoods'
import { getApiErrorMessage } from '@/lib/api-error'
import { toast } from 'sonner'

export const foodLibraryConfigKeys = {
  all: () => ['food-library-config'] as const,
}

/** null data means the business hasn't configured its food library yet. */
export function useFoodLibraryConfig() {
  return useQuery({
    queryKey: foodLibraryConfigKeys.all(),
    queryFn: () => foodLibraryConfigApi.get(),
    staleTime: 30_000,
  })
}

export function useSaveFoodLibraryConfig() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (categories: GymLibraryFoodCategory[]) => foodLibraryConfigApi.save(categories),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: foodLibraryConfigKeys.all() })
      // Saving the config also materializes real `foods` rows server-side
      // (see FoodLibraryConfigService.materializeFoods) — refresh the foods
      // list so the Food Library table shows them immediately.
      queryClient.invalidateQueries({ queryKey: foodKeys.all() })
      toast.success('Food library configuration saved')
    },
    onError: (error: any) => {
      toast.error(getApiErrorMessage(error, 'Failed to save food library configuration'))
    },
  })
}

export function useDeleteFoodLibraryConfig() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => foodLibraryConfigApi.delete(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: foodLibraryConfigKeys.all() })
      toast.success('Food library deleted')
    },
    onError: (error: any) => {
      toast.error(getApiErrorMessage(error, 'Failed to delete food library'))
    },
  })
}
