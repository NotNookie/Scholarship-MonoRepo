import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutGrid, Building2, UserPlus, BarChart3, LifeBuoy, Megaphone,
  Activity, HeartPulse, Users, Settings, LogOut,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { Crest } from '../platform/PlatformBits'
import { PlatformTools } from '../platform/PlatformTools'
import { ReportIssueDrawer } from '../platform/ReportIssueDrawer'
import '../../styles/platform.css'

// Locked design combo for the platform console. The stylesheet still carries
// the other treatments (top/right/bottom/float placements, other headers/navs/
// buttons); change these four values to re-theme the whole surface.
const LOOK = { variant: 'compact', header: 'slab', nav: 'underline', place: 'left', buttons: 'outline' }

const navItems = [
  { to: '/platform', end: true, label: 'Overview', Icon: LayoutGrid },
  { to: '/platform/municipalities', label: 'Municipalities', Icon: Building2 },
  { to: '/platform/onboarding', label: 'Onboarding', Icon: UserPlus },
  { to: '/platform/analytics', label: 'Analytics', Icon: BarChart3 },
  { to: '/platform/support', label: 'Support', Icon: LifeBuoy },
  { to: '/platform/broadcasts', label: 'Broadcasts', Icon: Megaphone },
  { to: '/platform/activity', label: 'Activity', Icon: Activity },
  { to: '/platform/health', label: 'Health', Icon: HeartPulse },
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

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="platform-root" data-variant={LOOK.variant} data-header={LOOK.header} data-nav={LOOK.nav} data-btn={LOOK.buttons} data-place={LOOK.place}>
      {/* Masthead — the fixed brand anchor */}
      <header className="pf-masthead">
        <div className="pf-wrap pf-masthead-in">
          <Crest />
          <span className="pf-svc">
            <span className="pf-brand">Iskolar</span>
            <span className="pf-tag">Platform Console</span>
          </span>
          <PlatformTools />
          <div className="pf-op">
            <div className="pf-op-badge">{initials(user?.name)}</div>
            <div className="pf-op-meta">
              <div className="pf-op-name">{user?.name ?? 'Platform Admin'}</div>
              <div className="pf-op-role">Super Admin</div>
            </div>
            <button className="pf-op-out" type="button" onClick={handleLogout} aria-label="Sign out" title="Sign out">
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </header>

      {/* Phase banner — full width under the masthead */}
      <div className="pf-phase">
        <div className="pf-wrap pf-phase-in">
          <span className="pf-badge">Platform</span>
          <span>
            Operator console for the Iskolar network — <button type="button" className="pf-inline-link" onClick={() => setReportOpen(true)}>report an issue</button>.
          </span>
          <span className="pf-live">
            <span className="pf-dot" aria-hidden="true" />
            Live · updated just now
          </span>
        </div>
      </div>

      {/* Nav + content — the nav's placement is set by data-place */}
      <div className="pf-body">
        <nav className="pf-nav" aria-label="Platform sections">
          <div className="pf-wrap pf-nav-in">
            {navItems.map(({ to, end, label, Icon }) => (
              <NavLink key={to} to={to} end={end} className={({ isActive }) => `pf-navitem${isActive ? ' active' : ''}`}>
                <Icon />
                {label}
              </NavLink>
            ))}
            <span className="pf-nav-stamp">Platform</span>
          </div>
        </nav>

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
