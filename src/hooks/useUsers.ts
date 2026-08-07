import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userManagementApi, type ManagedUserPayload } from '@/api/user-management.api'
import { getApiErrorMessage } from '@/lib/api-error'
import { toast } from 'sonner'

export const userKeys = {
  all: () => ['managed-users'] as const,
}

/**
 * `GET /users` has no server-side role/business/branch filter params — the
 * backend auto-scopes the result by the caller's own role (superadmin: all,
 * admin: own business, sub_admin: own business+branch). One unfiltered query
 * covers every dashboard; `useUsersByRole` narrows it client-side by roleId,
 * which is the only axis the backend doesn't already scope for us.
 */
export function useUsers() {
  return useQuery({
    queryKey: userKeys.all(),
    queryFn: () => userManagementApi.list(),
    staleTime: 30_000,
  })
}

export function useUsersByRole(roleId: number | undefined) {
  const query = useUsers()
  return {
    ...query,
    data: roleId ? (query.data ?? []).filter((u) => u.roleId === roleId) : query.data,
  }
}

export function useUser(id: string) {
  const query = useUsers()
  return {
    ...query,
    data: (query.data ?? []).find((u) => u.id === id),
  }
}

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ManagedUserPayload) => userManagementApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all() })
      toast.success('User created')
    },
    onError: (error: any) => {
      toast.error(getApiErrorMessage(error, 'Failed to create user'))
    },
  })
}

export function useUpdateUser(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<ManagedUserPayload>) => userManagementApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all() })
      toast.success('User updated')
    },
    onError: (error: any) => {
      toast.error(getApiErrorMessage(error, 'Failed to update user'))
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => userManagementApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all() })
      toast.success('User removed')
    },
    onError: (error: any) => {
      toast.error(getApiErrorMessage(error, 'Failed to remove user'))
    },
  })
}
