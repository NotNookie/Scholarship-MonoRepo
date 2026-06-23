import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  CalendarDays,
  Megaphone,
  BarChart2,
  UserCog,
  Settings,
  LogOut,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/admin/applications', label: 'Applications', Icon: ClipboardList },
  { to: '/admin/applicants', label: 'Applicants', Icon: Users },
  { to: '/admin/schedules', label: 'Schedules', Icon: CalendarDays },
  { to: '/admin/announcements', label: 'Announcements', Icon: Megaphone },
  { to: '/admin/reports', label: 'Reports', Icon: BarChart2 },
]

const superAdminItems = [
  { to: '/admin/users', label: 'Users', Icon: UserCog },
  { to: '/admin/maintenance', label: 'Maintenance', Icon: Settings },
]

export function AdminLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const isSuperAdmin = user?.role === 'super_admin'

  function handleLogout() {
    logout()
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-60 bg-primary-dark text-on-primary flex flex-col shrink-0">
        <div className="h-16 flex items-center px-5 border-b border-white/10">
          <span className="font-semibold text-sm tracking-wide">Iskolar Link</span>
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 text-sm overflow-y-auto">
          {navItems.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded transition-colors ${
                  isActive
                    ? 'bg-primary text-on-primary font-medium'
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
              <div className="mt-4 mb-2 px-3 text-xs text-on-primary/40 uppercase tracking-widest">
                Admin
              </div>
              {superAdminItems.map(({ to, label, Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded transition-colors ${
                      isActive
                        ? 'bg-primary text-on-primary font-medium'
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

        <div className="px-5 py-4 border-t border-white/10">
          <p className="text-xs text-on-primary/60 truncate">{user?.name ?? 'Admin'}</p>
          <p className="text-xs text-on-primary/40 capitalize">{user?.role?.replace('_', ' ') ?? ''}</p>
          <button
            onClick={handleLogout}
            className="mt-3 flex items-center gap-2 text-xs text-on-primary/50 hover:text-on-primary transition-colors"
          >
            <LogOut size={13} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-surface border-b border-border flex items-center px-6 shrink-0">
          <span className="text-sm font-semibold text-content">
            Iskolar ng Bayan — LYDO
          </span>
        </header>
        <main className="flex-1 bg-surface-alt p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
