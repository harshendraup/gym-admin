import { createBrowserRouter, Navigate } from 'react-router-dom'
import AuthGuard from './guards/AuthGuard'
import RoleLayout from './layouts/RoleLayout'
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

// Admin
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'))
const AdminBranchesPage = lazy(() => import('@/pages/admin/AdminBranchesPage'))
const AdminSubAdminsPage = lazy(() => import('@/pages/admin/AdminSubAdminsPage'))
const AdminTrainersPage = lazy(() => import('@/pages/admin/AdminTrainersPage'))
const AdminMembersPage = lazy(() => import('@/pages/admin/AdminMembersPage'))
const AdminMemberDetailPage = lazy(() => import('@/pages/admin/AdminMemberDetailPage'))

// Sub-Admin
const SubAdminDashboardPage = lazy(() => import('@/pages/sub-admin/SubAdminDashboardPage'))
const SubAdminTrainersPage = lazy(() => import('@/pages/sub-admin/SubAdminTrainersPage'))
const SubAdminMembersPage = lazy(() => import('@/pages/sub-admin/SubAdminMembersPage'))
const SubAdminMemberDetailPage = lazy(() => import('@/pages/sub-admin/SubAdminMemberDetailPage'))

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
      { path: 'members', element: wrap(AdminMembersPage) },
      { path: 'members/:id', element: wrap(AdminMemberDetailPage) },
    ],
  },

  {
    path: 'sub-admin',
    element: <RoleLayout allowed={['sub_admin']} />,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: wrap(SubAdminDashboardPage) },
      { path: 'trainers', element: wrap(SubAdminTrainersPage) },
      { path: 'members', element: wrap(SubAdminMembersPage) },
      { path: 'members/:id', element: wrap(SubAdminMemberDetailPage) },
    ],
  },

  // Fully public — no AuthGuard, no AppLayout/sidebar. businessId/branchId
  // come from the link the gym shares; businessKey is typed in on-page.
  { path: 'join/:businessId/:branchId', element: wrap(PublicMemberRegisterPage) },

  { path: '*', element: <Navigate to="/dashboard" replace /> },
])
