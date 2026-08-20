import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  nutritionAssessmentsApi,
  type CreateNutritionAssessmentPayload,
  type UpdateNutritionAssessmentPayload,
} from '@/api/nutrition-assessments.api'
import { getApiErrorMessage } from '@/lib/api-error'
import { toast } from 'sonner'

export const nutritionAssessmentKeys = {
  all: () => ['nutrition-assessments'] as const,
  forMember: (memberId: number) => ['nutrition-assessments', 'member', memberId] as const,
}

export function useNutritionAssessments() {
  return useQuery({
    queryKey: nutritionAssessmentKeys.all(),
    queryFn: () => nutritionAssessmentsApi.list(),
    staleTime: 30_000,
  })
}

export function useNutritionAssessmentsForMember(memberId: number | undefined) {
  return useQuery({
    queryKey: nutritionAssessmentKeys.forMember(memberId ?? 0),
    queryFn: () => nutritionAssessmentsApi.forMember(memberId!),
    enabled: !!memberId,
    staleTime: 30_000,
  })
}

export function useCreateNutritionAssessment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateNutritionAssessmentPayload) => nutritionAssessmentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: nutritionAssessmentKeys.all() })
      toast.success('Nutrition assessment saved')
    },
    onError: (error: any) => {
      toast.error(getApiErrorMessage(error, 'Failed to save assessment'))
    },
  })
}

export function useUpdateNutritionAssessment(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateNutritionAssessmentPayload) => nutritionAssessmentsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: nutritionAssessmentKeys.all() })
      toast.success('Assessment updated')
    },
    onError: (error: any) => {
      toast.error(getApiErrorMessage(error, 'Failed to update assessment'))
    },
  })
}

export function useDeleteNutritionAssessment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => nutritionAssessmentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: nutritionAssessmentKeys.all() })
      toast.success('Assessment removed')
    },
    onError: (error: any) => {
      toast.error(getApiErrorMessage(error, 'Failed to remove assessment'))
    },
  })
}
