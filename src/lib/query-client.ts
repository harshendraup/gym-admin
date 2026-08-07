import { QueryClient } from '@tanstack/react-query'

/**
 * Single shared instance (not created inline in main.tsx) so auth.store.ts
 * can clear it on every login/logout. Query keys (['managed-users'],
 * ['branches', businessId], ...) don't carry any per-account discriminator,
 * so without clearing on identity change, switching accounts in the same
 * tab can surface the previous account's cached data — a real cross-tenant
 * leak, not just a UX staleness issue.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
})
