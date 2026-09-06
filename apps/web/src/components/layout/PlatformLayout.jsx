import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutGrid, Building2, UserPlus, BarChart3, LifeBuoy, Megaphone,
  Activity, Users, Settings, LogOut, Sun, Moon,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { Crest } from '../platform/PlatformBits'
import { PlatformTools } from '../platform/PlatformTools'
import { ReportIssueDrawer } from '../platform/ReportIssueDrawer'
import '../../styles/platform.css'

const navItems = [
  { to: '/platform', end: true, label: 'Overview', Icon: LayoutGrid },
  { to: '/platform/municipalities', label: 'Municipalities', Icon: Building2 },
  { to: '/platform/onboarding', label: 'Onboarding', Icon: UserPlus },
  { to: '/platform/analytics', label: 'Analytics & Health', Icon: BarChart3 },
  { to: '/platform/support', label: 'Support', Icon: LifeBuoy },
  { to: '/platform/broadcasts', label: 'Broadcasts', Icon: Megaphone },
  { to: '/platform/activity', label: 'Logs', Icon: Activity },
  { to: '/platform/users', label: 'Platform Users', Icon: Users },
  { to: '/platform/settings', label: 'Settings', Icon: Settings },
]

function initials(name) {
  if (!name) return 'PA'
  const p = name.trim().split(/\s+/)
  return (p.length >= 2 ? p[0][0] + p[p.length - 1][0] : name.slice(0, 2)).toUpperCase()
}

export function PlatformLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [reportOpen, setReportOpen] = useState(false)

  // Console light/dark mode — persisted per device. The deep-ink sidebar stays
  // dark in both modes; only the content area flips.
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('iskolar-pf-theme') || 'dark' } catch { return 'dark' }
  })
  useEffect(() => {
    try { localStorage.setItem('iskolar-pf-theme', theme) } catch { /* storage unavailable */ }
  }, [theme])

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="platform-root" data-theme={theme}>
      {/* Deep-ink operator sidebar — a level darker than a tenant's admin blue,
          with a gold "Platform" mark, so the operator context is never mistaken
          for a municipality's own portal. */}
      <aside className="pf-side">
        <div className="pf-side-brand">
          <Crest className="pf-side-crest" />
          <span className="pf-side-word">Iskolar<span className="pf-side-tag">Platform</span></span>
        </div>

        <div className="pf-side-op">
          <div className="pf-side-badge">{initials(user?.name)}</div>
          <div className="pf-side-meta">
            <div className="pf-side-name">{user?.name ?? 'Platform Admin'}</div>
            <div className="pf-side-role">Super Admin</div>
          </div>
        </div>

        <nav className="pf-side-nav" aria-label="Platform sections">
          {navItems.map(({ to, end, label, Icon }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `pf-navitem${isActive ? ' active' : ''}`}>
              <Icon />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <button className="pf-side-out" type="button" onClick={handleLogout}>
          <LogOut size={16} /> Sign out
        </button>
      </aside>

      {/* Content column */}
      <div className="pf-shell">
        <header className="pf-topbar">
          <span className="pf-op-chip"><span className="pf-op-dot" aria-hidden="true" /> Operator console</span>
          <span className="pf-op-sub">Iskolar network — live</span>
          <div className="pf-topbar-right">
            <button type="button" className="pf-inline-link" onClick={() => setReportOpen(true)}>Report an issue</button>
            <button
              type="button"
              className="pf-mtool"
              onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <PlatformTools />
          </div>
        </header>

        <main className="pf-main">
          <div className="pf-wrap">
            <Outlet />
          </div>
        </main>
      </div>

      <ReportIssueDrawer open={reportOpen} onClose={() => setReportOpen(false)} />
    </div>
  )
}
