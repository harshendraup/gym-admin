import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  trainingProgramsApi,
  type CreateTrainingProgramPayload,
  type UpdateTrainingProgramPayload,
} from '@/api/training-programs.api'
import { getApiErrorMessage } from '@/lib/api-error'
import { toast } from 'sonner'

export const trainingProgramKeys = {
  all: () => ['training-programs'] as const,
}

/** The backend already scopes this to the caller's own business/branch. */
export function useTrainingPrograms() {
  return useQuery({
    queryKey: trainingProgramKeys.all(),
    queryFn: () => trainingProgramsApi.list(),
    staleTime: 30_000,
  })
}

export function useCreateTrainingProgram() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTrainingProgramPayload) => trainingProgramsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trainingProgramKeys.all() })
      toast.success('Training program created')
    },
    onError: (error: any) => {
      toast.error(getApiErrorMessage(error, 'Failed to create training program'))
    },
  })
}

export function useUpdateTrainingProgram(id: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateTrainingProgramPayload) => trainingProgramsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trainingProgramKeys.all() })
      toast.success('Training program updated')
    },
    onError: (error: any) => {
      toast.error(getApiErrorMessage(error, 'Failed to update training program'))
    },
  })
}

export function useDeleteTrainingProgram() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => trainingProgramsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trainingProgramKeys.all() })
      toast.success('Training program removed')
    },
    onError: (error: any) => {
      toast.error(getApiErrorMessage(error, 'Failed to remove training program'))
    },
  })
}
