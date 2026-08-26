import { createBrowserRouter, Navigate } from 'react-router-dom'

// Layouts
import { PublicLayout } from '../components/layout/PublicLayout'
import { AdminLayout } from '../components/layout/AdminLayout'
import { AuthLayout } from '../components/layout/AuthLayout'

// Auth guard
import { RequireAuth } from './RequireAuth'

// Public pages
import { LandingPage } from '../pages/public/LandingPage'
import { ScholarshipsPage } from '../pages/public/ScholarshipsPage'
import { RequirementsPage } from '../pages/public/RequirementsPage'
import { AnnouncementsPage } from '../pages/public/AnnouncementsPage'
import { FormsPage } from '../pages/public/FormsPage'

// Auth pages
import { LoginPage } from '../pages/auth/LoginPage'
import { LoginVerifyPage } from '../pages/auth/LoginVerifyPage'
import { RegisterPage } from '../pages/auth/RegisterPage'

// Student pages
import { StudentDashboardPage } from '../pages/student/StudentDashboardPage'
import { ApplicationPage } from '../pages/student/ApplicationPage'
import { DocumentsPage } from '../pages/student/DocumentsPage'
import { AppealPage } from '../pages/student/AppealPage'
import { StudentAnnouncementsPage } from '../pages/student/StudentAnnouncementsPage'
import { MyScholarshipPage } from '../pages/student/MyScholarshipPage'
import { RenewalPage } from '../pages/student/RenewalPage'
import { StudentSettingsPage } from '../pages/student/StudentSettingsPage'

// Admin pages
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage'
import { QueuePage } from '../pages/admin/QueuePage'
import { ApplicantsPage } from '../pages/admin/ApplicantsPage'
import { AppealsPage } from '../pages/admin/AppealsPage'
import { ScholarsPage } from '../pages/admin/ScholarsPage'
import { RenewalsPage } from '../pages/admin/RenewalsPage'
import { CommunicationsPage } from '../pages/admin/CommunicationsPage'
import { ReportsPage } from '../pages/admin/ReportsPage'
import { ActivityLogsPage } from '../pages/admin/ActivityLogsPage'
import { UsersPage } from '../pages/admin/UsersPage'
import { MaintenancePage } from '../pages/admin/MaintenancePage'
import { MaintenancePoliciesPage } from '../pages/admin/MaintenancePoliciesPage'
import { MaintenanceCyclesPage } from '../pages/admin/MaintenanceCyclesPage'
import { MaintenanceEligibilityPage } from '../pages/admin/MaintenanceEligibilityPage'
import { MaintenanceProfilePage } from '../pages/admin/MaintenanceProfilePage'

const scholar = (element) => (
  <RequireAuth roles={['scholar']}>{element}</RequireAuth>
)

export const router = createBrowserRouter([
  // ── Public + student portal (shared PublicLayout) ───────────
  {
    element: <PublicLayout />,
    children: [
      // Public pages (no auth required)
      { path: '/', element: <LandingPage /> },
      { path: '/scholarships', element: <ScholarshipsPage /> },
      { path: '/requirements', element: <RequirementsPage /> },
      { path: '/announcements', element: <AnnouncementsPage /> },
      { path: '/forms', element: <FormsPage /> },

      // Student pages (auth-gated individually)
      { path: '/dashboard',              element: scholar(<StudentDashboardPage />) },
      { path: '/apply',                  element: scholar(<ApplicationPage />) },
      { path: '/applications/:id',       element: scholar(<DocumentsPage />) },
      { path: '/appeal/:id',             element: scholar(<AppealPage />) },
      { path: '/student/announcements',  element: scholar(<StudentAnnouncementsPage />) },
      { path: '/scholarship',            element: scholar(<MyScholarshipPage />) },
      { path: '/scholarship/renew',      element: scholar(<RenewalPage />) },
      { path: '/settings',               element: scholar(<StudentSettingsPage />) },
    ],
  },

  // ── Auth pages ─────────────────────────────────────────────
  // Login + Register share AuthLayout (persistent panel + tabs); verify is standalone.
  {
    element: <AuthLayout />,
    children: [
      { path: '/login',    element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },
  { path: '/login/verify',   element: <LoginVerifyPage /> },

  // ── Legacy admin login → centralized login ──────────────────
  { path: '/admin/login',        element: <Navigate to="/login" replace /> },
  { path: '/admin/login/verify', element: <Navigate to="/login" replace /> },

  // ── Admin portal ────────────────────────────────────────────
  {
    path: '/admin',
    element: (
      <RequireAuth roles={['admin', 'staff', 'super_admin']}>
        <AdminLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },
      { path: 'dashboard',     element: <AdminDashboardPage /> },
      { path: 'applications',  element: <QueuePage /> },
      { path: 'applicants',    element: <ApplicantsPage /> },
      { path: 'appeals',            element: <AppealsPage /> },
      { path: 'scholars',           element: <ScholarsPage /> },
      { path: 'scholars/renewals',  element: <RenewalsPage /> },
      { path: 'communications', element: <CommunicationsPage /> },
      // Legacy routes — merged into Announcements & Events
      { path: 'schedules',      element: <Navigate to="/admin/communications" replace /> },
      { path: 'announcements',  element: <Navigate to="/admin/communications" replace /> },
      { path: 'reports',       element: <ReportsPage /> },
      { path: 'activity',      element: <ActivityLogsPage /> },
      { path: 'users',         element: <UsersPage /> },
      { path: 'maintenance',          element: <MaintenancePage /> },
      { path: 'maintenance/policies', element: <MaintenancePoliciesPage /> },
      { path: 'maintenance/cycles',      element: <MaintenanceCyclesPage /> },
      { path: 'maintenance/eligibility', element: <MaintenanceEligibilityPage /> },
      { path: 'maintenance/profile',  element: <MaintenanceProfilePage /> },
    ],
  },

  // ── Catch-all ───────────────────────────────────────────────
  { path: '*', element: <Navigate to="/" replace /> },
])
