import { createBrowserRouter, Navigate } from 'react-router-dom'
import AuthGuard from './guards/AuthGuard'
import RoleLayout from './layouts/RoleLayout'
import SubAdminRoleLayout from './layouts/SubAdminRoleLayout'
import AuthLayout from './layouts/AuthLayout'
import RoleRedirect from './RoleRedirect'

// Lazy-loaded pages
import { lazy, Suspense } from 'react'
import { PageLoader } from '@/components/common/PageLoader'

const wrap = (Component: React.LazyExoticComponent<any>) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
)

const LandingPage = lazy(() => import('@/pages/marketing/LandingPage'))
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))

// Super Admin
const SuperAdminDashboardPage = lazy(() => import('@/pages/superadmin/SuperAdminDashboardPage'))
const BusinessesPage = lazy(() => import('@/pages/businesses/BusinessesPage'))
const SuperAdminBusinessBranchesPage = lazy(() => import('@/pages/superadmin/SuperAdminBusinessBranchesPage'))
const SuperAdminBusinessAdminsPage = lazy(() => import('@/pages/superadmin/SuperAdminBusinessAdminsPage'))
const SuperAdminBranchMembersPage = lazy(() => import('@/pages/superadmin/SuperAdminBranchMembersPage'))
const SuperAdminMemberDetailPage = lazy(() => import('@/pages/superadmin/SuperAdminMemberDetailPage'))
const SuperAdminAdminsPage = lazy(() => import('@/pages/superadmin/SuperAdminAdminsPage'))
const SuperAdminSubAdminsPage = lazy(() => import('@/pages/superadmin/SuperAdminSubAdminsPage'))
const SuperAdminTrainersPage = lazy(() => import('@/pages/superadmin/SuperAdminTrainersPage'))
const SuperAdminMembersPage = lazy(() => import('@/pages/superadmin/SuperAdminMembersPage'))
const SuperAdminMembershipsPage = lazy(() => import('@/pages/superadmin/SuperAdminMembershipsPage'))
const SuperAdminAppConfigPage = lazy(() => import('@/pages/superadmin/SuperAdminAppConfigPage'))

// Admin
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'))
const AdminBranchesPage = lazy(() => import('@/pages/admin/AdminBranchesPage'))
const AdminSubAdminsPage = lazy(() => import('@/pages/admin/AdminSubAdminsPage'))
const AdminTrainersPage = lazy(() => import('@/pages/admin/AdminTrainersPage'))
const AdminDietsPage = lazy(() => import('@/pages/admin/AdminDietsPage'))
const AdminTrainingProgramsPage = lazy(() => import('@/pages/admin/AdminTrainingProgramsPage'))
const AdminMembersPage = lazy(() => import('@/pages/admin/AdminMembersPage'))
const AdminMemberDetailPage = lazy(() => import('@/pages/admin/AdminMemberDetailPage'))
const AdminMembershipsPage = lazy(() => import('@/pages/admin/AdminMembershipsPage'))

// Sub-Admin
const SubAdminDashboardPage = lazy(() => import('@/pages/sub-admin/SubAdminDashboardPage'))
const SubAdminTrainersPage = lazy(() => import('@/pages/sub-admin/SubAdminTrainersPage'))
const SubAdminDietsPage = lazy(() => import('@/pages/sub-admin/SubAdminDietsPage'))
const SubAdminTrainingProgramsPage = lazy(() => import('@/pages/sub-admin/SubAdminTrainingProgramsPage'))
const SubAdminMembersPage = lazy(() => import('@/pages/sub-admin/SubAdminMembersPage'))
const SubAdminMemberDetailPage = lazy(() => import('@/pages/sub-admin/SubAdminMemberDetailPage'))
const SubAdminMembershipsPage = lazy(() => import('@/pages/sub-admin/SubAdminMembershipsPage'))

// Public
const PublicMemberRegisterPage = lazy(() => import('@/pages/public/PublicMemberRegisterPage'))

export const router = createBrowserRouter([
  { path: '/', element: wrap(LandingPage) },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: wrap(LoginPage) },
    ],
  },

  { path: 'dashboard', element: <AuthGuard><RoleRedirect /></AuthGuard> },

  {
    path: 'superadmin',
    element: <RoleLayout allowed={['superadmin']} />,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: wrap(SuperAdminDashboardPage) },
      { path: 'businesses', element: wrap(BusinessesPage) },
      { path: 'businesses/:businessId/branches', element: wrap(SuperAdminBusinessBranchesPage) },
      { path: 'businesses/:businessId/admins', element: wrap(SuperAdminBusinessAdminsPage) },
      { path: 'branches/:branchId/members', element: wrap(SuperAdminBranchMembersPage) },
      { path: 'branches/:branchId/members/:id', element: wrap(SuperAdminMemberDetailPage) },
      { path: 'admins', element: wrap(SuperAdminAdminsPage) },
      { path: 'sub-admins', element: wrap(SuperAdminSubAdminsPage) },
      { path: 'trainers', element: wrap(SuperAdminTrainersPage) },
      { path: 'members', element: wrap(SuperAdminMembersPage) },
      { path: 'members/:id', element: wrap(SuperAdminMemberDetailPage) },
      { path: 'memberships', element: wrap(SuperAdminMembershipsPage) },
      // Both forms render the same page: the standalone one picks a
      // business from a dropdown, the deep link arrives from the
      // Businesses list with one already chosen.
      { path: 'app-config', element: wrap(SuperAdminAppConfigPage) },
      { path: 'businesses/:businessId/app-config', element: wrap(SuperAdminAppConfigPage) },
    ],
  },

  {
    path: 'admin',
    element: <RoleLayout allowed={['admin']} />,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: wrap(AdminDashboardPage) },
      { path: 'branches', element: wrap(AdminBranchesPage) },
      { path: 'sub-admins', element: wrap(AdminSubAdminsPage) },
      { path: 'trainers', element: wrap(AdminTrainersPage) },
      { path: 'diets', element: wrap(AdminDietsPage) },
      { path: 'training-programs', element: wrap(AdminTrainingProgramsPage) },
      { path: 'members', element: wrap(AdminMembersPage) },
      { path: 'members/:id', element: wrap(AdminMemberDetailPage) },
      { path: 'memberships', element: wrap(AdminMembershipsPage) },
    ],
  },

  {
    path: 'sub-admin',
    element: <SubAdminRoleLayout />,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: wrap(SubAdminDashboardPage) },
      { path: 'trainers', element: wrap(SubAdminTrainersPage) },
      { path: 'diets', element: wrap(SubAdminDietsPage) },
      { path: 'training-programs', element: wrap(SubAdminTrainingProgramsPage) },
      { path: 'members', element: wrap(SubAdminMembersPage) },
      { path: 'members/:id', element: wrap(SubAdminMemberDetailPage) },
      { path: 'memberships', element: wrap(SubAdminMembershipsPage) },
    ],
  },

  // Fully public — no AuthGuard, no AppLayout/sidebar. businessId/branchId
  // come from the link the gym shares; businessKey is typed in on-page.
  { path: 'join/:businessId/:branchId', element: wrap(PublicMemberRegisterPage) },

  { path: '*', element: <Navigate to="/dashboard" replace /> },
])
