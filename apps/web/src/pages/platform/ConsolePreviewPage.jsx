import { useState, useEffect, useCallback } from 'react'
import {
  LayoutGrid, Building2, UserPlus, BarChart3, LifeBuoy, Megaphone, Activity,
  Users, Settings, LogOut, GraduationCap, Plus, Check, CircleCheck, TrendingUp,
  Search, Bell,
} from 'lucide-react'
import '../../styles/console-preview.css'

// Illustrative sample data — a design mock of the operator Overview.
const NAV = [
  { label: 'Overview', Icon: LayoutGrid, active: true },
  { label: 'Municipalities', Icon: Building2 },
  { label: 'Onboarding', Icon: UserPlus },
  { label: 'Analytics', Icon: BarChart3 },
  { label: 'Support', Icon: LifeBuoy },
  { label: 'Broadcasts', Icon: Megaphone },
  { label: 'Logs', Icon: Activity },
  { label: 'Users', Icon: Users },
  { label: 'Settings', Icon: Settings },
]
const ACTIVITY = [
  { Icon: Plus, tone: 'b', before: '', strong: 'Nagcarlan', after: ' onboarded and activated', time: 'Today · 09:14' },
  { Icon: Check, tone: 'g', before: '', strong: 'Pakil', after: ' completed its first application cycle', time: 'Yesterday · 16:40' },
  { Icon: UserPlus, tone: '', before: 'Head admin invited for ', strong: 'Pila', after: '', time: '2 days ago · 11:02' },
]
const TENANTS = [
  ['SC', 'Sta. Cruz', 'Laguna', 'stacruz.iskolar.ph', 'ok', 'Active', '1,248', true],
  ['PA', 'Pagsanjan', 'Laguna', 'pagsanjan.iskolar.ph', 'ok', 'Active', '412', false],
  ['PK', 'Pakil', 'Laguna', 'pakil.iskolar.ph', 'ok', 'Active', '186', false],
  ['PI', 'Pila', 'Laguna', 'pila.iskolar.ph', 'warn', 'Onboarding', '0', false],
]
const STATS = [
  { lbl: 'Municipalities', fig: '7', sub: '4 active · 3 onboarding' },
  { lbl: 'Scholars, platform-wide', fig: '1,904', sub: '8.2% this cycle', up: true, trend: true },
  { lbl: 'Applications, A.Y. 2026–27', fig: '945', sub: 'across all municipalities' },
  { lbl: 'Suspended', fig: '0', sub: 'all tenants healthy' },
]

function Content() {
  return (
    <>
      <div className="kc-head kc-rise">
        <div>
          <h1>Command centre</h1>
          <p>Live health across every municipality on the platform.</p>
        </div>
        <button className="kc-btn" type="button"><Plus size={16} /> Onboard municipality</button>
      </div>

      <div className="kc-banner kc-rise kc-rise-2">
        <div className="ic"><CircleCheck size={20} /></div>
        <div>
          <div className="bt">All systems nominal</div>
          <div className="bs">7 municipalities · 0 suspended · last checked just now</div>
        </div>
      </div>

      <div className="kc-cols kc-rise kc-rise-2">
        <div className="kc-card">
          <h2>Needs attention</h2>
          <div className="kc-empty">
            <div className="ic"><Check size={22} /></div>
            <b>Nothing needs attention</b>
            Suspensions, failed onboardings and stalled tenants surface here.
          </div>
        </div>
        <div className="kc-card">
          <h2>Recent activity</h2>
          {ACTIVITY.map((a, i) => (
            <div className="kc-feed" key={i}>
              <div className={`ic ${a.tone}`}><a.Icon size={16} /></div>
              <div>
                <div className="tx">{a.before}<b>{a.strong}</b>{a.after}</div>
                <div className="tm">{a.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="kc-stats kc-rise kc-rise-3">
        {STATS.map((s) => (
          <div className="kc-stat" key={s.lbl}>
            <div className="lbl">{s.lbl}</div>
            <div className="fig kc-tnum">{s.fig}</div>
            <div className={`sub${s.up ? ' up' : ''}`}>{s.trend && <TrendingUp size={13} />}{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="kc-tablecard kc-rise kc-rise-4">
        <div className="th"><b>Municipalities</b><a href="#0">View all</a></div>
        <div className="kc-twrap">
          <table className="kc-table">
            <thead><tr><th>Municipality</th><th>Subdomain</th><th>Status</th><th className="num">Scholars</th></tr></thead>
            <tbody>
              {TENANTS.map(([sg, name, prov, sub, tone, status, scholars, main]) => (
                <tr key={sub}>
                  <td>
                    <div className="kc-ten">
                      <div className="kc-sigil">{sg}</div>
                      <div><b>{name}{main && <span className="kc-main-tag">Main</span>}</b><span>{prov}</span></div>
                    </div>
                  </td>
                  <td className="kc-mono">{sub}</td>
                  <td><span className={`kc-tag ${tone}`}>{status}</span></td>
                  <td className="num kc-tnum">{scholars}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

// ── Vercel top-nav shell ────────────────────────────────────────────────────
function TopNavShell({ v }) {
  return (
    <div className={`kc kc--v${v}`}>
      <header className="kc-topnav">
        <div className="kc-topnav-row">
          <span className="kc-brand"><span className="mark"><GraduationCap size={15} /></span> Iskolar</span>
          <span className="kc-crumb">/ <b>Platform</b></span>
          <div className="kc-topnav-right">
            <button className="kc-ico" type="button" aria-label="Search"><Search size={17} /></button>
            <span className="kc-sigil" style={{ width: 30, height: 30, borderRadius: '50%' }}>PA</span>
          </div>
        </div>
        <nav className="kc-topnav-tabs">
          {NAV.map(({ label, Icon, active }) => (
            <a key={label} href="#0" className={`kc-tab${active ? ' active' : ''}`}><Icon /><span>{label}</span></a>
          ))}
        </nav>
      </header>
      <main className="kc-body"><Content /></main>
    </div>
  )
}

// ── Shopify / Fusion side-nav shell ─────────────────────────────────────────
function SideNavShell({ v }) {
  return (
    <div className={`kc kc--v${v}`}>
      <div className="kc-side-shell">
        <aside className="kc-side">
          <span className="kc-brand"><span className="mark"><GraduationCap size={15} /></span> Iskolar</span>
          <div className="kc-op">
            <span className="badge">PA</span>
            <div><div className="nm">Platform Admin</div><div className="rl">Super Admin</div></div>
          </div>
          <nav className="kc-nav">
            {NAV.map(({ label, Icon, active }) => (
              <a key={label} href="#0" className={`kc-navitem${active ? ' active' : ''}`}><Icon /><span>{label}</span></a>
            ))}
          </nav>
          <button className="kc-out" type="button"><LogOut size={15} /> Sign out</button>
        </aside>
        <div className="kc-shell">
          <header className="kc-top">
            <span className="kc-chip"><span className="dot" /> Operator console</span>
            <span className="sub">Iskolar network — live</span>
            <div className="right">
              <button className="kc-ico" type="button" aria-label="Search"><Search size={17} /></button>
              <button className="kc-ico" type="button" aria-label="Notifications"><Bell size={17} /></button>
            </div>
          </header>
          <main className="kc-body"><Content /></main>
        </div>
      </div>
    </div>
  )
}

const VARIANTS = [
  { id: 1, name: 'Vercel dark' },
  { id: 2, name: 'Vercel light' },
  { id: 3, name: 'Shopify light' },
  { id: 4, name: 'Shopify dark' },
  { id: 5, name: 'Fusion' },
]

export function ConsolePreviewPage() {
  const [v, setV] = useState(1)
  const onKey = useCallback((e) => { const n = Number(e.key); if (n >= 1 && n <= 5) setV(n) }, [])
  useEffect(() => {
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onKey])

  return (
    <>
      {v <= 2 ? <TopNavShell v={v} /> : <SideNavShell v={v} />}
      <div className="kc-switch" role="group" aria-label="Console design">
        <span className="lbl">Console</span>
        {VARIANTS.map((x) => (
          <button key={x.id} data-active={v === x.id ? 'true' : undefined} onClick={() => setV(x.id)}>
            <b>{x.id}</b><span>{x.name}</span>
          </button>
        ))}
      </div>
    </>
  )
}
