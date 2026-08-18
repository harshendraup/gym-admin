import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { exercisesApi, type CreateExercisePayload, type UpdateExercisePayload } from '@/api/exercises.api'
import { getApiErrorMessage } from '@/lib/api-error'
import { toast } from 'sonner'

export const exerciseKeys = {
  all: () => ['exercises'] as const,
}

/** The backend already scopes this to the caller's own business. */
export function useExercises() {
  return useQuery({
    queryKey: exerciseKeys.all(),
    queryFn: () => exercisesApi.list(),
    staleTime: 30_000,
  })
}

export function useCreateExercise() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateExercisePayload) => exercisesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: exerciseKeys.all() })
      toast.success('Exercise added')
    },
    onError: (error: any) => {
      toast.error(getApiErrorMessage(error, 'Failed to add exercise'))
    },
  })
}

export function useUpdateExercise(id: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateExercisePayload) => exercisesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: exerciseKeys.all() })
      toast.success('Exercise updated')
    },
    onError: (error: any) => {
      toast.error(getApiErrorMessage(error, 'Failed to update exercise'))
    },
  })
}

export function useDeleteExercise() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => exercisesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: exerciseKeys.all() })
      toast.success('Exercise removed')
    },
    onError: (error: any) => {
      toast.error(getApiErrorMessage(error, 'Failed to remove exercise'))
    },
  })
}
