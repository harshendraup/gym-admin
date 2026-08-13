import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { businessRegistryApi } from '@/api/business-registry.api'
import { useAuthStore } from '@/store/auth.store'
import { useGymStore } from '@/store/gym.store'

/**
 * Syncs gym.store's branding (consumed by Sidebar for the logo, and by
 * AppLayout for white-label CSS vars) from the logged-in user's own
 * business. Superadmin has no businessId, so this is a no-op for them.
 */
export function useBusinessBranding() {
  const businessId = useAuthStore((s) => s.gymContext?.businessId)
  const setGym = useGymStore((s) => s.setGym)

  const { data: business } = useQuery({
    queryKey: ['businesses', 'detail', businessId],
    queryFn: () => businessRegistryApi.get(Number(businessId)),
    enabled: !!businessId,
    staleTime: 60_000,
  })

  useEffect(() => {
    if (!business) return
    setGym(String(business.id), {
      name: business.businessName,
      logoUrl: business.businessLogo ?? null,
      primaryColor: '#3B82F6',
      secondaryColor: '#22C55E',
      accentColor: '#F59E0B',
    })
  }, [business, setGym])
}
