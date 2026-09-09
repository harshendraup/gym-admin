import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  attendanceLogsApi,
  type CreateAttendanceLogPayload,
} from '@/api/attendance-logs.api'
import { getApiErrorMessage } from '@/lib/api-error'
import { toast } from 'sonner'

export const attendanceLogKeys = {
  all: () => ['attendance-logs'] as const,
  forMember: (memberId: number) => ['attendance-logs', 'member', memberId] as const,
  statsForMember: (memberId: number) => ['attendance-logs', 'member', memberId, 'stats'] as const,
}

export function useAttendanceLogsForMember(memberId: number | undefined) {
  return useQuery({
    queryKey: attendanceLogKeys.forMember(memberId ?? 0),
    queryFn: () => attendanceLogsApi.forMember(memberId!),
    enabled: !!memberId,
    staleTime: 30_000,
  })
}

export function useAttendanceStats(memberId: number | undefined) {
  return useQuery({
    queryKey: attendanceLogKeys.statsForMember(memberId ?? 0),
    queryFn: () => attendanceLogsApi.statsForMember(memberId!),
    enabled: !!memberId,
    staleTime: 30_000,
  })
}

export function useCreateAttendanceLog() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateAttendanceLogPayload) => attendanceLogsApi.create(data),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: attendanceLogKeys.all() })
      queryClient.invalidateQueries({ queryKey: attendanceLogKeys.forMember(variables.memberId) })
      queryClient.invalidateQueries({ queryKey: attendanceLogKeys.statsForMember(variables.memberId) })
      toast.success('Check-in logged')
    },
    onError: (error: any) => {
      toast.error(getApiErrorMessage(error, 'Failed to log check-in'))
    },
  })
}

export function useDeleteAttendanceLog() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => attendanceLogsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceLogKeys.all() })
      toast.success('Check-in removed')
    },
    onError: (error: any) => {
      toast.error(getApiErrorMessage(error, 'Failed to remove check-in'))
    },
  })
}
