import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { exerciseLibraryConfigApi, type GymLibraryCategory } from '@/api/exercise-library-config.api'
import { getApiErrorMessage } from '@/lib/api-error'
import { toast } from 'sonner'

export const exerciseLibraryConfigKeys = {
  all: () => ['exercise-library-config'] as const,
}

/** null data means the business hasn't configured its exercise library yet. */
export function useExerciseLibraryConfig() {
  return useQuery({
    queryKey: exerciseLibraryConfigKeys.all(),
    queryFn: () => exerciseLibraryConfigApi.get(),
    staleTime: 30_000,
  })
}

export function useSaveExerciseLibraryConfig() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (categories: GymLibraryCategory[]) => exerciseLibraryConfigApi.save(categories),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: exerciseLibraryConfigKeys.all() })
      toast.success('Exercise library configuration saved')
    },
    onError: (error: any) => {
      toast.error(getApiErrorMessage(error, 'Failed to save exercise library configuration'))
    },
  })
}

export function useDeleteExerciseLibraryConfig() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => exerciseLibraryConfigApi.delete(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: exerciseLibraryConfigKeys.all() })
      toast.success('Exercise library deleted')
    },
    onError: (error: any) => {
      toast.error(getApiErrorMessage(error, 'Failed to delete exercise library'))
    },
  })
}
