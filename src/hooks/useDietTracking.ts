import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { dietTrackingApi } from '@/api/diet-tracking.api'
import { getApiErrorMessage } from '@/lib/api-error'
import { toast } from 'sonner'

export const dietTrackingKeys = {
  dailySummary: (assignmentId: number, date?: string) =>
    ['diet-daily-summary', assignmentId, date ?? 'today'] as const,
  progress: (assignmentId: number) => ['diet-progress', assignmentId] as const,
}

export function useDietDailySummary(assignmentId: number | undefined, date?: string) {
  return useQuery({
    queryKey: dietTrackingKeys.dailySummary(assignmentId ?? 0, date),
    queryFn: () => dietTrackingApi.dailySummary(assignmentId!, date),
    enabled: !!assignmentId,
    staleTime: 15_000,
  })
}

export function useDietProgress(assignmentId: number | undefined) {
  return useQuery({
    queryKey: dietTrackingKeys.progress(assignmentId ?? 0),
    queryFn: () => dietTrackingApi.progress(assignmentId!),
    enabled: !!assignmentId,
    staleTime: 30_000,
  })
}

export function useLogDietMeal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: dietTrackingApi.logMeal,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['diet-daily-summary', variables.dietAssignmentId] })
      queryClient.invalidateQueries({ queryKey: dietTrackingKeys.progress(variables.dietAssignmentId) })
      toast.success('Meal logged')
    },
    onError: (error: any) => {
      toast.error(getApiErrorMessage(error, 'Failed to log meal'))
    },
  })
}

export function useLogDietWater() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: dietTrackingApi.logWater,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['diet-daily-summary', variables.dietAssignmentId] })
      queryClient.invalidateQueries({ queryKey: dietTrackingKeys.progress(variables.dietAssignmentId) })
      toast.success('Water logged')
    },
    onError: (error: any) => {
      toast.error(getApiErrorMessage(error, 'Failed to log water'))
    },
  })
}
