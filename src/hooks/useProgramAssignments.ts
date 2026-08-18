import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  programAssignmentsApi,
  type CreateProgramAssignmentPayload,
  type CreateAssignmentLogPayload,
} from '@/api/program-assignments.api'
import { getApiErrorMessage } from '@/lib/api-error'
import { toast } from 'sonner'

export const programAssignmentKeys = {
  all: () => ['program-assignments'] as const,
  logs: (assignmentId: number) => ['program-assignments', assignmentId, 'logs'] as const,
}

/** The backend already scopes this per the caller's role. */
export function useProgramAssignments() {
  return useQuery({
    queryKey: programAssignmentKeys.all(),
    queryFn: () => programAssignmentsApi.list(),
    staleTime: 30_000,
  })
}

export function useCreateProgramAssignment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateProgramAssignmentPayload) => programAssignmentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: programAssignmentKeys.all() })
      toast.success('Training program assigned')
    },
    onError: (error: any) => {
      toast.error(getApiErrorMessage(error, 'Failed to assign training program'))
    },
  })
}

export function useDeleteProgramAssignment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => programAssignmentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: programAssignmentKeys.all() })
      toast.success('Assignment removed')
    },
    onError: (error: any) => {
      toast.error(getApiErrorMessage(error, 'Failed to remove assignment'))
    },
  })
}

export function useAssignmentLogs(assignmentId: number | undefined) {
  return useQuery({
    queryKey: programAssignmentKeys.logs(assignmentId ?? 0),
    queryFn: () => programAssignmentsApi.listLogs(assignmentId!),
    enabled: !!assignmentId,
  })
}

export function useCreateAssignmentLog(assignmentId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateAssignmentLogPayload) => programAssignmentsApi.createLog(assignmentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: programAssignmentKeys.logs(assignmentId) })
      toast.success('Workout logged')
    },
    onError: (error: any) => {
      toast.error(getApiErrorMessage(error, 'Failed to log workout'))
    },
  })
}
