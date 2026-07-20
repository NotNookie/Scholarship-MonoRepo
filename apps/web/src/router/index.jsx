import { createBrowserRouter, Navigate } from 'react-router-dom'

// Layouts
import { PublicLayout } from '../components/layout/PublicLayout'
import { AdminLayout } from '../components/layout/AdminLayout'

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
import { AdminLoginPage } from '../pages/auth/AdminLoginPage'
import { AdminLoginVerifyPage } from '../pages/auth/AdminLoginVerifyPage'

// Student pages
import { StudentDashboardPage } from '../pages/student/StudentDashboardPage'
import { ApplicationPage } from '../pages/student/ApplicationPage'
import { ApplicationsPage } from '../pages/student/ApplicationsPage'
import { DocumentsPage } from '../pages/student/DocumentsPage'
import { StudentDocumentsPage } from '../pages/student/StudentDocumentsPage'
import { AppealPage } from '../pages/student/AppealPage'
import { StudentAnnouncementsPage } from '../pages/student/StudentAnnouncementsPage'

// Admin pages
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage'
import { QueuePage } from '../pages/admin/QueuePage'
import { ApplicantsPage } from '../pages/admin/ApplicantsPage'
import { AppealsPage } from '../pages/admin/AppealsPage'
import { CommunicationsPage } from '../pages/admin/CommunicationsPage'
import { ReportsPage } from '../pages/admin/ReportsPage'
import { UsersPage } from '../pages/admin/UsersPage'
import { MaintenancePage } from '../pages/admin/MaintenancePage'
import { MaintenancePoliciesPage } from '../pages/admin/MaintenancePoliciesPage'
import { MaintenanceCyclesPage } from '../pages/admin/MaintenanceCyclesPage'
import { MaintenanceProfilePage } from '../pages/admin/MaintenanceProfilePage'

const student = (element) => (
  <RequireAuth roles={['student']}>{element}</RequireAuth>
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
      { path: '/dashboard',              element: student(<StudentDashboardPage />) },
      { path: '/apply',                  element: student(<ApplicationPage />) },
      { path: '/applications',           element: student(<ApplicationsPage />) },
      { path: '/applications/:id',       element: student(<DocumentsPage />) },
      { path: '/documents',              element: student(<StudentDocumentsPage />) },
      { path: '/appeal/:id',             element: student(<AppealPage />) },
      { path: '/student/announcements',  element: student(<StudentAnnouncementsPage />) },
    ],
  },

  // ── Auth pages (standalone, no layout) ─────────────────────
  { path: '/login',          element: <LoginPage /> },
  { path: '/login/verify',   element: <LoginVerifyPage /> },
  { path: '/register',       element: <RegisterPage /> },

  // ── Admin login (standalone) ────────────────────────────────
  { path: '/admin/login',        element: <AdminLoginPage /> },
  { path: '/admin/login/verify', element: <AdminLoginVerifyPage /> },

  // ── Admin portal ────────────────────────────────────────────
  {
    path: '/admin',
    element: (
      <RequireAuth roles={['super_admin', 'admin', 'miso']}>
        <AdminLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },
      { path: 'dashboard',     element: <AdminDashboardPage /> },
      { path: 'applications',  element: <QueuePage /> },
      { path: 'applicants',    element: <ApplicantsPage /> },
      { path: 'appeals',       element: <AppealsPage /> },
      { path: 'communications', element: <CommunicationsPage /> },
      // Legacy routes — merged into Announcements & Events
      { path: 'schedules',      element: <Navigate to="/admin/communications" replace /> },
      { path: 'announcements',  element: <Navigate to="/admin/communications" replace /> },
      { path: 'reports',       element: <ReportsPage /> },
      { path: 'users',         element: <UsersPage /> },
      { path: 'maintenance',          element: <MaintenancePage /> },
      { path: 'maintenance/policies', element: <MaintenancePoliciesPage /> },
      { path: 'maintenance/cycles',   element: <MaintenanceCyclesPage /> },
      { path: 'maintenance/profile',  element: <MaintenanceProfilePage /> },
    ],
  },

  // ── Catch-all ───────────────────────────────────────────────
  { path: '*', element: <Navigate to="/" replace /> },
])
