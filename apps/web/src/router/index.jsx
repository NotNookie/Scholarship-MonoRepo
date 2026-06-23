import { createBrowserRouter, Navigate } from 'react-router-dom'

// Layouts
import { PublicLayout } from '../components/layout/PublicLayout'
import { StudentLayout } from '../components/layout/StudentLayout'
import { AdminLayout } from '../components/layout/AdminLayout'

// Auth guard
import { RequireAuth } from './RequireAuth'

// Public pages
import { LandingPage } from '../pages/public/LandingPage'
import { RequirementsPage } from '../pages/public/RequirementsPage'
import { AnnouncementsPage } from '../pages/public/AnnouncementsPage'
import { FormsPage } from '../pages/public/FormsPage'

// Auth pages
import { LoginPage } from '../pages/auth/LoginPage'
import { RegisterPage } from '../pages/auth/RegisterPage'
import { AdminLoginPage } from '../pages/auth/AdminLoginPage'

// Student pages
import { StudentDashboardPage } from '../pages/student/StudentDashboardPage'
import { ApplicationPage } from '../pages/student/ApplicationPage'
import { ApplicationsPage } from '../pages/student/ApplicationsPage'
import { DocumentsPage } from '../pages/student/DocumentsPage'
import { AppealPage } from '../pages/student/AppealPage'
import { StudentAnnouncementsPage } from '../pages/student/StudentAnnouncementsPage'

// Admin pages
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage'
import { QueuePage } from '../pages/admin/QueuePage'
import { ApplicantsPage } from '../pages/admin/ApplicantsPage'
import { SchedulingPage } from '../pages/admin/SchedulingPage'
import { AdminAnnouncementsPage } from '../pages/admin/AdminAnnouncementsPage'
import { ReportsPage } from '../pages/admin/ReportsPage'
import { UsersPage } from '../pages/admin/UsersPage'
import { MaintenancePage } from '../pages/admin/MaintenancePage'

export const router = createBrowserRouter([
  // ── Public portal ──────────────────────────────────────────
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <LandingPage /> },
      { path: '/requirements', element: <RequirementsPage /> },
      { path: '/announcements', element: <AnnouncementsPage /> },
      { path: '/forms', element: <FormsPage /> },
    ],
  },

  // ── Auth pages (standalone, no shared layout) ───────────────
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },

  // ── Student portal ──────────────────────────────────────────
  {
    element: (
      <RequireAuth roles={['student']}>
        <StudentLayout />
      </RequireAuth>
    ),
    children: [
      { path: '/dashboard', element: <StudentDashboardPage /> },
      { path: '/apply', element: <ApplicationPage /> },
      { path: '/applications', element: <ApplicationsPage /> },
      { path: '/applications/:id', element: <DocumentsPage /> },
      { path: '/appeal/:id', element: <AppealPage /> },
      { path: '/student/announcements', element: <StudentAnnouncementsPage /> },
    ],
  },

  // ── Admin login (standalone) ────────────────────────────────
  { path: '/admin/login', element: <AdminLoginPage /> },

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
      { path: 'dashboard', element: <AdminDashboardPage /> },
      { path: 'applications', element: <QueuePage /> },
      { path: 'applicants', element: <ApplicantsPage /> },
      { path: 'schedules', element: <SchedulingPage /> },
      { path: 'announcements', element: <AdminAnnouncementsPage /> },
      { path: 'reports', element: <ReportsPage /> },
      { path: 'users', element: <UsersPage /> },
      { path: 'maintenance', element: <MaintenancePage /> },
    ],
  },

  // ── Catch-all ───────────────────────────────────────────────
  { path: '*', element: <Navigate to="/" replace /> },
])
