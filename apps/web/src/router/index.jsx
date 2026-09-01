/* eslint-disable react-refresh/only-export-components -- router config file: it exports the router and defines lazy route components; it is not a Fast-Refreshable component module. */
import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'

// Layouts
import { PublicLayout } from '../components/layout/PublicLayout'
import { AdminLayout } from '../components/layout/AdminLayout'
import { AuthLayout } from '../components/layout/AuthLayout'
import { PlatformLayout } from '../components/layout/PlatformLayout'

// Auth guard
import { RequireAuth } from './RequireAuth'

// Public pages
import { LandingPage } from '../pages/public/LandingPage'
import { ScholarshipsPage } from '../pages/public/ScholarshipsPage'
import { ScholarshipDetailPage } from '../pages/public/ScholarshipDetailPage'
import { RequirementsPage } from '../pages/public/RequirementsPage'
import { AnnouncementsPage } from '../pages/public/AnnouncementsPage'
import { AnnouncementDetailPage } from '../pages/public/AnnouncementDetailPage'
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
import { ActivityLogsPage } from '../pages/admin/ActivityLogsPage'
import { UsersPage } from '../pages/admin/UsersPage'
import { MaintenancePage } from '../pages/admin/MaintenancePage'
import { MaintenancePoliciesPage } from '../pages/admin/MaintenancePoliciesPage'
import { MaintenanceCyclesPage } from '../pages/admin/MaintenanceCyclesPage'
import { MaintenanceEligibilityPage } from '../pages/admin/MaintenanceEligibilityPage'
import { MaintenanceProfilePage } from '../pages/admin/MaintenanceProfilePage'
import { MaintenanceFeaturesPage } from '../pages/admin/MaintenanceFeaturesPage'
import { RequestSupportPage } from '../pages/admin/RequestSupportPage'

// Platform (Super Admin) pages
import { PlatformOverviewPage } from '../pages/platform/PlatformOverviewPage'
import { PlatformMunicipalitiesPage } from '../pages/platform/PlatformMunicipalitiesPage'
import { PlatformMunicipalityDetailPage } from '../pages/platform/PlatformMunicipalityDetailPage'
import { PlatformOnboardingPage } from '../pages/platform/PlatformOnboardingPage'
import { PlatformAnalyticsPage } from '../pages/platform/PlatformAnalyticsPage'
import { PlatformSupportPage } from '../pages/platform/PlatformSupportPage'
import { PlatformBroadcastsPage } from '../pages/platform/PlatformBroadcastsPage'
import { PlatformActivityPage } from '../pages/platform/PlatformActivityPage'
import { PlatformHealthPage } from '../pages/platform/PlatformHealthPage'
import { PlatformUsersPage } from '../pages/platform/PlatformUsersPage'
import { PlatformSettingsPage } from '../pages/platform/PlatformSettingsPage'

// Dev-only helper (tree-shaken out of production by the import.meta.env.DEV guard below)
import { DevAs } from '../pages/dev/DevAs'

// Chart-heavy pages are lazy-loaded so recharts lands in its own chunk instead
// of the main bundle (it's only needed on Reports and the scholar's dashboard).
const MyScholarshipPage = lazy(() =>
  import('../pages/student/MyScholarshipPage').then((m) => ({ default: m.MyScholarshipPage }))
)
const ReportsPage = lazy(() =>
  import('../pages/admin/ReportsPage').then((m) => ({ default: m.ReportsPage }))
)

function RouteFallback() {
  return <div style={{ padding: '48px 24px', textAlign: 'center', color: '#64748b', fontSize: 14 }}>Loading…</div>
}
const withSuspense = (element) => <Suspense fallback={<RouteFallback />}>{element}</Suspense>

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
      { path: '/scholarships/:id', element: <ScholarshipDetailPage /> },
      { path: '/requirements', element: <RequirementsPage /> },
      { path: '/announcements', element: <AnnouncementsPage /> },
      { path: '/announcements/:id', element: <AnnouncementDetailPage /> },
      { path: '/forms', element: <FormsPage /> },

      // Student pages (auth-gated individually)
      { path: '/dashboard',              element: scholar(<StudentDashboardPage />) },
      { path: '/apply',                  element: scholar(<ApplicationPage />) },
      { path: '/applications/:id',       element: scholar(<DocumentsPage />) },
      { path: '/appeal/:id',             element: scholar(<AppealPage />) },
      { path: '/student/announcements',  element: scholar(<StudentAnnouncementsPage />) },
      { path: '/scholarship',            element: scholar(withSuspense(<MyScholarshipPage />)) },
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
      <RequireAuth roles={['admin', 'staff']}>
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
      { path: 'reports',       element: withSuspense(<ReportsPage />) },
      { path: 'activity',      element: <ActivityLogsPage /> },
      { path: 'support',       element: <RequestSupportPage /> },
      { path: 'users',         element: <UsersPage /> },
      { path: 'maintenance',          element: <MaintenancePage /> },
      { path: 'maintenance/policies', element: <MaintenancePoliciesPage /> },
      { path: 'maintenance/cycles',      element: <MaintenanceCyclesPage /> },
      { path: 'maintenance/eligibility', element: <MaintenanceEligibilityPage /> },
      { path: 'maintenance/profile',  element: <MaintenanceProfilePage /> },
      { path: 'maintenance/features', element: <MaintenanceFeaturesPage /> },
    ],
  },

  // ── Platform (Super Admin) console ──────────────────────────
  // Our operator side — onboarding and overseeing municipal tenants.
  {
    path: '/platform',
    element: (
      <RequireAuth roles={['super_admin']}>
        <PlatformLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <PlatformOverviewPage /> },
      { path: 'municipalities', element: <PlatformMunicipalitiesPage /> },
      { path: 'municipalities/:id', element: <PlatformMunicipalityDetailPage /> },
      { path: 'onboarding', element: <PlatformOnboardingPage /> },
      { path: 'analytics', element: <PlatformAnalyticsPage /> },
      { path: 'support', element: <PlatformSupportPage /> },
      { path: 'broadcasts', element: <PlatformBroadcastsPage /> },
      { path: 'activity', element: <PlatformActivityPage /> },
      { path: 'health', element: <PlatformHealthPage /> },
      { path: 'users', element: <PlatformUsersPage /> },
      { path: 'settings', element: <PlatformSettingsPage /> },
    ],
  },

  // ── Dev-only auto-login helper (headless screenshots / quick role switch) ──
  ...(import.meta.env.DEV ? [{ path: '/__dev-as/:role', element: <DevAs /> }] : []),

  // ── Catch-all ───────────────────────────────────────────────
  { path: '*', element: <Navigate to="/" replace /> },
])
