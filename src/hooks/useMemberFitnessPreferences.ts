import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  memberFitnessPreferencesApi,
  type SaveMemberFitnessPreferencePayload,
} from '@/api/member-fitness-preferences.api'
import { getApiErrorMessage } from '@/lib/api-error'
import { toast } from 'sonner'

export const memberFitnessPreferenceKeys = {
  forMember: (memberId: number) => ['member-fitness-preferences', memberId] as const,
}

/** null data means this member has no fitness preferences saved yet. */
export function useMemberFitnessPreferences(memberId: number | undefined) {
  return useQuery({
    queryKey: memberFitnessPreferenceKeys.forMember(memberId ?? 0),
    queryFn: () => memberFitnessPreferencesApi.forMember(memberId!),
    enabled: !!memberId,
    staleTime: 30_000,
  })
}

export function useSaveMemberFitnessPreferences() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: SaveMemberFitnessPreferencePayload) => memberFitnessPreferencesApi.save(data),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: memberFitnessPreferenceKeys.forMember(variables.memberId) })
      toast.success('Fitness preferences saved')
    },
    onError: (error: any) => {
      toast.error(getApiErrorMessage(error, 'Failed to save fitness preferences'))
    },
  })
}
