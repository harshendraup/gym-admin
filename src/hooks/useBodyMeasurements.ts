import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  bodyMeasurementsApi,
  type CreateBodyMeasurementPayload,
  type UpdateBodyMeasurementPayload,
} from '@/api/body-measurements.api'
import { getApiErrorMessage } from '@/lib/api-error'
import { toast } from 'sonner'

export const bodyMeasurementKeys = {
  all: () => ['body-measurements'] as const,
  forMember: (memberId: number) => ['body-measurements', 'member', memberId] as const,
}

export function useBodyMeasurementsForMember(memberId: number | undefined) {
  return useQuery({
    queryKey: bodyMeasurementKeys.forMember(memberId ?? 0),
    queryFn: () => bodyMeasurementsApi.forMember(memberId!),
    enabled: !!memberId,
    staleTime: 30_000,
  })
}

export function useCreateBodyMeasurement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateBodyMeasurementPayload) => bodyMeasurementsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bodyMeasurementKeys.all() })
      toast.success('Measurement recorded')
    },
    onError: (error: any) => {
      toast.error(getApiErrorMessage(error, 'Failed to record measurement'))
    },
  })
}

export function useUpdateBodyMeasurement(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateBodyMeasurementPayload) => bodyMeasurementsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bodyMeasurementKeys.all() })
      toast.success('Measurement updated')
    },
    onError: (error: any) => {
      toast.error(getApiErrorMessage(error, 'Failed to update measurement'))
    },
  })
}

export function useDeleteBodyMeasurement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => bodyMeasurementsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bodyMeasurementKeys.all() })
      toast.success('Measurement removed')
    },
    onError: (error: any) => {
      toast.error(getApiErrorMessage(error, 'Failed to remove measurement'))
    },
  })
}
