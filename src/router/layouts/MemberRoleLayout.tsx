import { Outlet } from 'react-router-dom'
import AuthGuard from '@/router/guards/AuthGuard'
import RoleGuard from '@/router/guards/RoleGuard'

/**
 * The admin dashboard has no member-facing nav/sidebar (Sidebar.tsx's
 * navItems only cover superadmin/admin/sub_admin) — a member only ever
 * needs the single checkout screen, so this renders a bare centered shell
 * instead of reusing AppLayout.
 */
export default function MemberRoleLayout() {
  return (
    <AuthGuard>
      <RoleGuard allowed={['member']}>
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
          <Outlet />
        </div>
      </RoleGuard>
    </AuthGuard>
  )
}
