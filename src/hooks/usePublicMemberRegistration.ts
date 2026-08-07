import { useMutation } from '@tanstack/react-query'
import {
  memberRegistrationApi,
  type PublicMemberRegistrationPayload,
} from '@/api/member-registration.api'
import { getApiErrorMessage } from '@/lib/api-error'
import { toast } from 'sonner'

/**
 * Backs the fully public `/join/:businessId/:branchId` page — no auth token,
 * no shared query cache to invalidate on success. The page itself decides
 * what to do with the returned {user, role, token}.
 */
export function usePublicMemberRegistration(businessId: number | undefined) {
  return useMutation({
    mutationFn: (data: PublicMemberRegistrationPayload) => {
      if (!businessId) throw new Error('Missing business')
      return memberRegistrationApi.register(businessId, data)
    },
    onError: (error: any) => {
      toast.error(getApiErrorMessage(error, 'Registration failed'))
    },
  })
}
