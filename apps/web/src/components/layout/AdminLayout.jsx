import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom'
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
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/admin/applicants', label: 'Applicant Records', Icon: ClipboardList },
  { to: '/admin/applications', label: 'Verification Queue', Icon: ShieldCheck },
  { to: '/admin/appeals', label: 'Appeals', Icon: Gavel },
  { to: '/admin/scholars', label: 'Scholar Monitoring', Icon: LineChart },
  { to: '/admin/communications', label: 'Announcements & Events', Icon: Megaphone },
  { to: '/admin/reports', label: 'Reports', Icon: BarChart2 },
  { to: '/admin/activity', label: 'Activity Logs', Icon: ScrollText },
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

export function AdminLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const isSuperAdmin = user?.role === 'super_admin'

  function handleLogout() {
    logout()
    navigate('/admin/login')
  }

  const initials = getInitials(user?.name)
  const roleLabel = user?.role?.replace(/_/g, ' ') ?? 'Admin'

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-primary-dark text-on-primary flex flex-col shrink-0">

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
            to="/admin/announcements"
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
              <Icon size={16} />
              {label}
            </NavLink>
          ))}

          {isSuperAdmin && (
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
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-surface border-b border-border flex items-center px-6 shrink-0">
          <span className="text-sm font-semibold text-content">
            LYDO Management Portal
          </span>
        </header>
        <main className="flex-1 bg-surface-alt p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
