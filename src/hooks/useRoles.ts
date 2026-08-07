import { useQuery } from '@tanstack/react-query'
import { rolesApi } from '@/api/roles.api'

/**
 * Resolves the platform's fixed role slugs (admin / sub_admin / member) to
 * their database IDs, since `/users` create payloads need a `roleId`.
 */
export function useRoles() {
  const { data: roles = [], isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: () => rolesApi.list(),
    staleTime: 5 * 60_000,
  })

  const byslug = (slug: string) => roles.find((r) => r.role === slug)

  return {
    roles,
    isLoading,
    adminRole: byslug('admin'),
    subAdminRole: byslug('sub_admin'),
    memberRole: byslug('member'),
    trainerRole: byslug('trainer'),
  }
}
