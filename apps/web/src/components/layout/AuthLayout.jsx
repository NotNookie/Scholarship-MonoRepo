import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { Building2, ShieldCheck } from 'lucide-react'
import { useBrand } from '../../tenant/TenantContext'

// Persistent marketing panel — stays mounted across Log In / Register so it
// never flickers when switching.
function LeftPanel() {
  const brand = useBrand()
  const org = brand.municipality ? `${brand.office}, ${brand.municipality}` : brand.office
  return (
    <div className="hidden md:flex md:w-2/5 bg-primary-dark flex-col justify-between p-10 text-on-primary shrink-0">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
          <Building2 size={18} className="text-on-primary" />
        </div>
        <span className="text-sm font-semibold">{brand.program}</span>
      </div>

      <div>
        <h2 className="text-2xl font-bold leading-snug mb-4">
          Empowering the youth through education.
        </h2>
        <p className="text-on-primary/70 text-sm leading-relaxed mb-8">
          Access the {brand.program} portal to apply for scholarships, track your status,
          and stay updated with announcements{brand.municipality ? ` from ${brand.municipality}` : ''}.
        </p>
        <div className="flex items-start gap-3 bg-white/10 rounded-lg p-4">
          <ShieldCheck size={16} className="text-secondary shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-secondary uppercase tracking-wide mb-1">Secure Portal</p>
            <p className="text-xs text-on-primary/60 leading-relaxed">
              Your data is encrypted and handled in accordance with the Municipal Data Privacy Act.
            </p>
          </div>
        </div>
      </div>

      <p className="text-xs text-on-primary/40">
        © {new Date().getFullYear()} {org}
      </p>
    </div>
  )
}

// Segmented control with a sliding pill; the active side is driven by the route.
function AuthTabs() {
  const { pathname } = useLocation()
  const onRegister = pathname.startsWith('/register')
  const tabCls = ({ isActive }) =>
    `relative z-10 flex-1 text-center text-sm py-2 rounded-full transition-colors ${
      isActive ? 'text-primary font-semibold' : 'text-content-muted hover:text-content font-medium'
    }`
  return (
    <div className="relative flex bg-surface-alt border border-border rounded-full p-1 mb-8">
      <span
        className={`absolute top-1 bottom-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-surface shadow-sm transition-transform duration-300 ease-out ${
          onRegister ? 'translate-x-full' : 'translate-x-0'
        }`}
        aria-hidden="true"
      />
      <NavLink to="/login" className={tabCls}>Log In</NavLink>
      <NavLink to="/register" className={tabCls}>Register</NavLink>
    </div>
  )
}

export function AuthLayout() {
  const { pathname } = useLocation()
  return (
    <div className="min-h-screen flex">
      <LeftPanel />
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-surface overflow-y-auto">
        {/* Fixed frame reserves the (taller) Register height, so the tabs never
            move. Both forms are centered within the space below the tabs. */}
        <div className="w-full max-w-md flex flex-col min-h-180">
          <AuthTabs />
          <div className="flex-1 flex flex-col justify-center">
            {/* Keyed so the form replays the slide on each switch */}
            <div key={pathname} className="auth-slide">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
