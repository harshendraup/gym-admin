import AuthGuard from '@/router/guards/AuthGuard'
import RoleGuard from '@/router/guards/RoleGuard'
import AppLayout from './AppLayout'

/**
 * One guard per role-prefixed route subtree, applied at the layout level
 * rather than per-route. Composes the existing AuthGuard/RoleGuard
 * unchanged — both are stateless render-time checks on the Zustand auth
 * store, safe to nest once per subtree.
 */
export default function RoleLayout({ allowed }: { allowed: string[] }) {
  return (
    <AuthGuard>
      <RoleGuard allowed={allowed}>
        <AppLayout />
      </RoleGuard>
    </AuthGuard>
  )
}
