import { useQuery } from '@tanstack/react-query'
import { businessRegistryApi } from '@/api/business-registry.api'

/** Every business on the platform — used for the SuperAdmin business filter. */
export function useBusinesses() {
  return useQuery({
    queryKey: ['businesses', 'all'],
    queryFn: () => businessRegistryApi.list(),
    staleTime: 60_000,
  })
}
