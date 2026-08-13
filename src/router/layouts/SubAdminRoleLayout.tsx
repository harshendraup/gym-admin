import AuthGuard from '@/router/guards/AuthGuard'
import RoleGuard from '@/router/guards/RoleGuard'
import SubAdminLayout from './SubAdminLayout'

/**
 * Same guard composition as RoleLayout, but renders SubAdminLayout instead
 * of AppLayout — kept as a separate file (rather than a `layout` prop on
 * RoleLayout) so the superadmin/admin route trees are untouched by this
 * sub-admin-only redesign.
 */
export default function SubAdminRoleLayout() {
  return (
    <AuthGuard>
      <RoleGuard allowed={['sub_admin']}>
        <SubAdminLayout />
      </RoleGuard>
    </AuthGuard>
  )
}
