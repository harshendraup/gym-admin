import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthRole, AuthUser } from '@/api/auth.api'

type User = AuthUser

interface GymContext {
  gymId?: string
  businessId?: string
  business_id?: string
  role: string
  branchId?: string
  gymName?: string
}

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  gymContext: GymContext | null
  isAuthenticated: boolean

  setAuth: (user: User, accessToken: string, refreshToken: string | null, gymContext: GymContext | null) => void
  setTokens: (accessToken: string, refreshToken: string | null) => void
  setGymContext: (context: GymContext) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      gymContext: null,
      isAuthenticated: false,

      setAuth: (user, accessToken, refreshToken, gymContext) =>
        set({ user, accessToken, refreshToken, gymContext, isAuthenticated: true }),

      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),

      setGymContext: (gymContext) =>
        set({ gymContext }),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          gymContext: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'gymos-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        gymContext: state.gymContext,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

/**
 * The API returns a bare `roleId` on the user plus a separate `role` record
 * (no gym-scoped session concept yet). This adapts that into the GymContext
 * shape the rest of the app (Sidebar/RoleGuard/gym-scoped hooks) reads from.
 */
export function buildGymContext(user: AuthUser, role: AuthRole | null): GymContext | null {
  if (!role) return null

  return {
    gymId: user.businessId != null ? String(user.businessId) : undefined,
    businessId: user.businessId != null ? String(user.businessId) : undefined,
    business_id: user.businessId != null ? String(user.businessId) : undefined,
    branchId: user.branchId != null ? String(user.branchId) : undefined,
    role: role.role,
    gymName: undefined,
  }
}

// Convenience selectors
export const selectGymId = (state: AuthState) => state.gymContext?.gymId
export const selectRole = (state: AuthState) => state.gymContext?.role
export const selectIsOwner = (state: AuthState) => state.gymContext?.role === 'admin'
export const selectIsStaff = (state: AuthState) =>
  ['admin', 'staff'].includes(state.gymContext?.role ?? '')
export const selectIsSuperAdmin = (state: AuthState) => state.gymContext?.role === 'superadmin'
