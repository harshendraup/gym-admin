import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { businessAdminsApi, type CreateBusinessAdminPayload } from '@/api/business-admins.api'
import { userKeys } from './useUsers'
import { getApiErrorMessage } from '@/lib/api-error'
import { toast } from 'sonner'

export const businessAdminKeys = {
  list: (businessId: number) => ['business-admins', businessId] as const,
}

export function useBusinessAdmins(businessId: number | undefined) {
  return useQuery({
    queryKey: businessAdminKeys.list(businessId!),
    queryFn: () => businessAdminsApi.list(businessId!),
    enabled: !!businessId,
  })
}

export function useCreateBusinessAdmin(businessId: number | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateBusinessAdminPayload) => {
      if (!businessId) throw new Error('No business selected')
      return businessAdminsApi.create(businessId, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: businessAdminKeys.list(businessId!) })
      queryClient.invalidateQueries({ queryKey: userKeys.all() })
      toast.success('Admin created')
    },
    onError: (error: any) => {
      toast.error(getApiErrorMessage(error, 'Failed to create admin'))
    },
  })
}
