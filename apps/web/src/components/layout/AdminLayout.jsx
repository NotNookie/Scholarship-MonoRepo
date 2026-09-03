import { useEffect } from 'react'
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  LayoutDashboard,
  ClipboardList,
  ShieldCheck,
  Gavel,
  LineChart,
  Megaphone,
  BarChart2,
  ScrollText,
  UserCog,
  Settings,
  LogOut,
  Plus,
  Eye,
  LifeBuoy,
  ShieldAlert,
  ShieldOff,
  Search,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { CommandPalette } from '../admin/CommandPalette'
import { useAuthStore } from '../../store/authStore'
import { useBrand, useTenant } from '../../tenant/TenantContext'
import { useImpersonation } from '../../store/impersonationStore'
import { usePlatformStore, tenantHasActiveAccess } from '../../store/platformStore'
import { api } from '../../lib/axios'

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/admin/applicants', label: 'Applicant Records', Icon: ClipboardList },
  { to: '/admin/applications', label: 'Verification Queue', Icon: ShieldCheck },
  { to: '/admin/appeals', label: 'Appeals', Icon: Gavel },
  { to: '/admin/scholars', label: 'Scholar Monitoring', Icon: LineChart },
  { to: '/admin/communications', label: 'Announcements & Events', Icon: Megaphone },
  { to: '/admin/reports', label: 'Reports', Icon: BarChart2 },
  { to: '/admin/activity', label: 'Activity Logs', Icon: ScrollText },
  { to: '/admin/support', label: 'Request Support', Icon: LifeBuoy },
]

const superAdminItems = [
  { to: '/admin/users', label: 'Users', Icon: UserCog },
  { to: '/admin/maintenance', label: 'Settings', Icon: Settings },
]

function getInitials(name) {
  if (!name) return 'A'
  const parts = name.trim().split(' ')
  return (
    parts.length >= 2
      ? parts[0][0] + parts[parts.length - 1][0]
      : parts[0][0]
  ).toUpperCase()
}

const ROLE_LABELS = {
  super_admin: 'Super Admin',
  admin: 'Administrator',
  staff: 'Staff',
}

export function AdminLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const brand = useBrand()
  const { isImpersonating } = useTenant()
  const exitImpersonation = useImpersonation((s) => s.exit)
  // Maintenance + Users are the municipality Head's job (Admin); Staff don't see them.
  // An impersonating operator gets full Head access to the tenant's portal.
  const isHead = user?.role === 'admin' || isImpersonating

  // Consent-based support access: a municipality grants the platform team access
  // via a support request and can revoke it anytime.
  const tickets = usePlatformStore((s) => s.supportTickets)
  const revokeSupport = usePlatformStore((s) => s.revokeSupport)
  const activeGrant = tickets.find((t) => t.tenantId === brand.id && t.status === 'open' && t.grantsAccess)
  const hasSupportAccess = tenantHasActiveAccess(tickets, brand.id)

  // If the tenant revokes access mid-session, drop the impersonating operator out.
  useEffect(() => {
    if (isImpersonating && !hasSupportAccess) {
      exitImpersonation()
      navigate('/platform/municipalities')
    }
  }, [isImpersonating, hasSupportAccess, exitImpersonation, navigate])

  function handleLogout() {
    logout()
    navigate('/login')
  }

  function handleExitImpersonation() {
    exitImpersonation()
    navigate('/platform/municipalities')
  }

  function handleRevoke() {
    if (activeGrant) revokeSupport(activeGrant.id)
    toast.success('Support access revoked.')
  }

  const initials = getInitials(user?.name)
  const roleLabel = ROLE_LABELS[user?.role] ?? 'Staff'

  // Live "needs action" counts for sidebar badges.
  const countOf = (r) => r.data?.meta?.total ?? r.data?.data?.length ?? 0
  const pendingApps = useQuery({ queryKey: ['admin', 'applications', 'count'], queryFn: () => api.get('/admin/applications?status=submitted').then((r) => r.data), retry: false })
  const pendingAppeals = useQuery({ queryKey: ['admin', 'appeals', 'count'], queryFn: () => api.get('/admin/appeals?status=pending').then((r) => r.data), retry: false })
  const pendingRenewals = useQuery({ queryKey: ['admin', 'renewals', 'count'], queryFn: () => api.get('/admin/renewals?status=pending').then((r) => r.data), retry: false })
  const badges = {
    '/admin/applications': countOf(pendingApps),
    '/admin/appeals': countOf(pendingAppeals),
    '/admin/scholars': countOf(pendingRenewals),
  }

  return (
    <div className="h-screen overflow-hidden flex flex-col print:h-auto print:overflow-visible">
      {/* Top banner: operator impersonation (dark), else the tenant's own
          "support access is active" indicator (amber) with revoke. */}
      {isImpersonating ? (
        <div className="print:hidden bg-content text-white px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <Eye size={16} className="text-secondary shrink-0" />
            <p className="text-sm min-w-0 truncate">
              <span className="font-semibold">Impersonating {brand.municipality}</span>
              <span className="text-white/60 hidden sm:inline"> — you&rsquo;re viewing this portal as an operator.</span>
            </p>
          </div>
          <button
            onClick={handleExitImpersonation}
            className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold border border-white/30 text-white px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <LogOut size={13} /> Exit
          </button>
        </div>
      ) : hasSupportAccess ? (
        <div className="print:hidden bg-warning-light border-b border-warning/30 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <ShieldAlert size={16} className="text-warning shrink-0" />
            <p className="text-sm text-content min-w-0 truncate">
              <span className="font-semibold">Platform support access is active</span>
              <span className="text-content-muted hidden sm:inline"> — the platform team can enter your portal to help.</span>
            </p>
          </div>
          <button
            onClick={handleRevoke}
            className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold border border-warning/50 text-content px-3 py-1.5 rounded-lg hover:bg-warning/10 transition-colors"
          >
            <ShieldOff size={13} /> Revoke
          </button>
        </div>
      ) : null}

      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <aside className="print:hidden w-64 bg-primary-dark text-on-primary flex flex-col shrink-0">

        {/* User + New Announcement */}
        <div className="px-4 pt-5 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-on-primary text-sm font-bold shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-on-primary truncate">
                {user?.name ?? 'Admin'}
              </p>
              <p className="text-xs text-on-primary/50 capitalize truncate">{roleLabel}</p>
            </div>
          </div>
          <Link
            to="/admin/communications"
            className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary/80 text-on-primary text-xs font-semibold py-2.5 rounded-lg transition-colors"
          >
            <Plus size={14} />
            New Announcement
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 flex flex-col gap-0.5 text-sm overflow-y-auto">
          {navItems.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg leading-tight transition-colors ${
                  isActive
                    ? 'bg-secondary text-primary-dark font-semibold'
                    : 'text-on-primary/70 hover:bg-white/10 hover:text-on-primary'
                }`
              }
            >
              <Icon size={16} className="shrink-0" />
              <span className="flex-1">{label}</span>
              {badges[to] > 0 && (
                <span className="shrink-0 min-w-5 h-5 px-1.5 rounded-full bg-danger text-white text-xs font-bold flex items-center justify-center">
                  {badges[to] > 99 ? '99+' : badges[to]}
                </span>
              )}
            </NavLink>
          ))}

          {isHead && (
            <>
              <div className="mt-4 mb-1 px-3 text-xs text-on-primary/40 uppercase tracking-widest">
                System
              </div>
              {superAdminItems.map(({ to, label, Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg leading-tight transition-colors ${
                      isActive
                        ? 'bg-secondary text-primary-dark font-semibold'
                        : 'text-on-primary/70 hover:bg-white/10 hover:text-on-primary'
                    }`
                  }
                >
                  <Icon size={16} />
                  {label}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        {/* Sign out */}
        <div className="px-5 py-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs text-on-primary/50 hover:text-on-primary transition-colors"
          >
            <LogOut size={13} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <header className="h-16 bg-surface border-b border-border flex items-center px-6 shrink-0 gap-4">
          <span className="text-sm font-semibold text-content">
            {brand.officeShort} Management Portal
          </span>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('admin:cmdk'))}
            className="ml-auto inline-flex items-center gap-2 text-sm text-content-muted border border-border rounded-lg pl-3 pr-2 py-1.5 hover:border-primary hover:text-content transition-colors"
          >
            <Search size={14} /> Search…
            <kbd className="text-[10px] font-mono border border-border rounded px-1.5 py-0.5 bg-surface-alt">⌘K</kbd>
          </button>
        </header>
        <main className="flex-1 bg-surface-alt p-6 overflow-auto">
          <Outlet />
        </main>
        </div>
      </div>
      <CommandPalette />
    </div>
  )
}
