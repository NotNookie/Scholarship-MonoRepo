/* ============================================================================
   IMPECCABLE DIRECTION CONTRACT — Iskolar platform landing  (Persuade)
   ----------------------------------------------------------------------------
   THESIS: One system for the whole scholarship lifecycle. Refuses the civic-SaaS
     default of a bright, generic feature-grid brochure; opens dark and confident,
     type-led, and proves itself with the real product.
   OWN-WORLD: Monochrome Municipal Blue, single hue ink→near-white, blue-biased
     neutrals, dark hero → light body with one committed-blue mission band.
     Honor Gold held as a rare spark. Hanken Grotesk. (styles/landing.css, .isk)
   STORY: An LGU decision-maker reads one confident thesis, watches the lifecycle,
     operates the real product, sees the mission, is reassured, requests onboarding.
   FIRST VIEWPORT: dark hero — a giant type-led statement over a near-edge-to-edge
     product frame; primary action "Request onboarding" in the nav and hero.
   FORM: giant "Bleed" hero + interactive product-proof viewer (tabbed real
     surfaces), lifecycle journey, roles + scholar phone, trust, mission, CTA.
   FINISH: unreviewed and undocumented is unfinished; this build ends with the
     finish review, the verdict, DESIGN.md, and every shipping raster carrying
     its provenance.
   ========================================================================== */
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  LayoutDashboard, ClipboardList, ShieldCheck, Gavel, LineChart, BarChart2,
  ArrowRight, SlidersHorizontal, ServerCog, GraduationCap, MapPin, Send,
  ChevronDown, FileCheck2, RefreshCw, Users, Lock, ScrollText, Database,
  Megaphone, CheckCircle2,
} from 'lucide-react'
import '../../styles/landing.css'

const YEAR = new Date().getFullYear()

function initials(name) {
  const p = name.split(' ')
  return (p.length >= 2 ? p[0][0] + p[p.length - 1][0] : p[0][0]).toUpperCase()
}

// ── Reusable app chrome (mirrors the real admin app; illustrative data) ──────
const SIDE_NAV = [
  { Icon: LayoutDashboard, label: 'Dashboard' },
  { Icon: ClipboardList, label: 'Applicants' },
  { Icon: ShieldCheck, label: 'Queue' },
  { Icon: Gavel, label: 'Appeals' },
  { Icon: LineChart, label: 'Scholars' },
  { Icon: BarChart2, label: 'Reports' },
]

function AppSidebar({ active }) {
  return (
    <div className="isk-app-side">
      <div className="isk-app-side-user">
        <i>MS</i>
        <b>Sta. Cruz LYDO<span>Administrator</span></b>
      </div>
      {SIDE_NAV.map(({ Icon, label }) => (
        <div className="isk-app-nav" data-active={active === label ? 'true' : undefined} key={label}>
          <Icon /> {label}
        </div>
      ))}
    </div>
  )
}

function AppFrame({ url, active, children }) {
  return (
    <div className="isk-frame">
      <div className="isk-frame-bar">
        <div className="isk-frame-dots"><i /><i /><i /></div>
        <div className="isk-frame-url">
          <ShieldCheck size={12} /> app.iskolar.ph{url}
          <span className="isk-frame-tag">Demo</span>
        </div>
        <div style={{ width: 44 }} />
      </div>
      <div className="isk-app">
        <AppSidebar active={active} />
        <div className="isk-app-main">{children}</div>
      </div>
    </div>
  )
}

// ── Hero dashboard view ─────────────────────────────────────────────────────
const DASH_STATS = [
  { lbl: 'Applicants', val: '1,240', tone: 'var(--blue-600)', bg: 'var(--blue-100)', c: 'var(--blue-600)', Icon: ClipboardList },
  { lbl: 'Pending', val: '86', tone: 'var(--gold)', bg: '#fff9e0', c: '#735c00', Icon: ClipboardList },
  { lbl: 'Approved', val: '742', tone: '#61c574', bg: '#eaf7ed', c: '#004f1e', Icon: ShieldCheck },
  { lbl: 'Follow-up', val: '31', tone: '#ef4444', bg: '#fef2f2', c: '#ef4444', Icon: Gavel },
]
const DASH_ROWS = [
  { n: 'Maria Santos', ref: 'APP-2401', prog: 'BS Nursing · PUP', pill: 'ok', label: 'Approved' },
  { n: 'Jose Rivera', ref: 'APP-2408', prog: 'BS Educ · LSPU', pill: 'wait', label: 'Pending' },
  { n: 'Andrea Lim', ref: 'APP-2412', prog: 'BS IT · LSPU', pill: 'rev', label: 'Reviewing' },
  { n: 'Paolo Mendoza', ref: 'APP-2415', prog: 'BS Agri · UPLB', pill: 'wait', label: 'Pending' },
]

function DashboardView() {
  return (
    <>
      <div className="isk-app-h"><h5>Dashboard Overview</h5><span>A.Y. {YEAR}–{YEAR + 1}</span></div>
      <div className="isk-app-stats">
        {DASH_STATS.map(({ lbl, val, tone, bg, c, Icon }) => (
          <div className="isk-app-stat" key={lbl}>
            <div className="isk-app-stat-body">
              <div className="lbl">{lbl}<i style={{ background: bg, color: c }}><Icon size={11} /></i></div>
              <div className="val isk-tnum">{val}</div>
            </div>
            <div className="bar" style={{ background: tone }} />
          </div>
        ))}
      </div>
      <div className="isk-app-card">
        <div className="isk-app-card-h"><b>Recent Applications</b><em>View all</em></div>
        {DASH_ROWS.map((r) => (
          <div className="isk-app-row" key={r.ref}>
            <i className="av">{initials(r.n)}</i>
            <div className="who"><b>{r.n}</b><span>{r.ref} · {r.prog}</span></div>
            <span className={`isk-pill isk-pill--${r.pill}`}>{r.label}</span>
          </div>
        ))}
      </div>
    </>
  )
}

function ProductFrame() {
  return <AppFrame url="" active="Dashboard"><DashboardView /></AppFrame>
}

// ── Proof surfaces (bigger + interactive) ───────────────────────────────────
const QUEUE_ROWS = [
  ['Maria Santos', 'APP-2401', 'BS Nursing · PUP', 'ok', 'Approved'],
  ['Jose Rivera', 'APP-2408', 'BS Education · LSPU', 'wait', 'Pending'],
  ['Andrea Lim', 'APP-2412', 'BS Info Tech · LSPU', 'rev', 'Reviewing'],
  ['Paolo Mendoza', 'APP-2415', 'BS Agriculture · UPLB', 'wait', 'Pending'],
  ['Bea Gonzales', 'APP-2417', 'BS Accountancy · PUP', 'ok', 'Approved'],
]
function QueueView() {
  return (
    <>
      <div className="isk-view-h"><h5>Verification queue</h5><span className="chip">12 pending review</span></div>
      <div className="isk-tblwrap">
        <table className="isk-tbl">
          <thead><tr><th>Applicant</th><th>Reference</th><th>Program / School</th><th>Status</th></tr></thead>
          <tbody>
            {QUEUE_ROWS.map(([n, ref, prog, pill, l]) => (
              <tr key={ref}>
                <td><div className="who2"><i>{initials(n)}</i>{n}</div></td>
                <td className="mut isk-tnum">{ref}</td>
                <td>{prog}</td>
                <td><span className={`isk-pill isk-pill--${pill}`}>{l}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

const MON_STATS = [
  { lbl: 'Active scholars', val: '742', tone: '#61c574', bg: '#eaf7ed', c: '#004f1e', Icon: GraduationCap },
  { lbl: 'For renewal', val: '168', tone: 'var(--blue-600)', bg: 'var(--blue-100)', c: 'var(--blue-600)', Icon: RefreshCw },
  { lbl: 'At risk', val: '9', tone: '#ef4444', bg: '#fef2f2', c: '#ef4444', Icon: ShieldCheck },
]
const MON_ROWS = [
  ['Maria Santos', 'BS Nursing · PUP', '1.75', 'ok', 'Good standing'],
  ['Jose Rivera', 'BS Education · LSPU', '2.10', 'ok', 'Good standing'],
  ['Andrea Lim', 'BS Info Tech · LSPU', '2.85', 'wait', 'For review'],
  ['Karla Dizon', 'BS Psychology · UPLB', '3.10', 'risk', 'At risk'],
]
function MonitorView() {
  return (
    <>
      <div className="isk-view-h"><h5>Scholar monitoring</h5><span className="chip">A.Y. {YEAR}–{YEAR + 1}</span></div>
      <div className="isk-view-stats">
        {MON_STATS.map(({ lbl, val, tone, bg, c, Icon }) => (
          <div className="isk-app-stat" key={lbl}>
            <div className="isk-app-stat-body">
              <div className="lbl">{lbl}<i style={{ background: bg, color: c }}><Icon size={11} /></i></div>
              <div className="val isk-tnum">{val}</div>
            </div>
            <div className="bar" style={{ background: tone }} />
          </div>
        ))}
      </div>
      <div className="isk-tblwrap">
        <table className="isk-tbl">
          <thead><tr><th>Scholar</th><th>Program / School</th><th>GWA</th><th>Standing</th></tr></thead>
          <tbody>
            {MON_ROWS.map(([n, prog, g, pill, l]) => (
              <tr key={n}>
                <td><div className="who2"><i>{initials(n)}</i>{n}</div></td>
                <td>{prog}</td>
                <td className="isk-tnum">{g}</td>
                <td><span className={`isk-pill isk-pill--${pill}`}>{l}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

const RPT_STATS = [
  { lbl: 'Approved', val: '742', tone: '#61c574', bg: '#eaf7ed', c: '#004f1e', Icon: ShieldCheck },
  { lbl: 'Renewed', val: '168', tone: 'var(--blue-600)', bg: 'var(--blue-100)', c: 'var(--blue-600)', Icon: RefreshCw },
  { lbl: 'Follow-up', val: '31', tone: 'var(--gold)', bg: '#fff9e0', c: '#735c00', Icon: ClipboardList },
]
const RPT_BARS = [['Jun', 44], ['Jul', 58], ['Aug', 72], ['Sep', 66], ['Oct', 81], ['Nov', 76], ['Dec', 90]]
function ReportsView() {
  return (
    <>
      <div className="isk-view-h"><h5>Reports</h5><span className="chip">This cycle</span></div>
      <div className="isk-view-stats">
        {RPT_STATS.map(({ lbl, val, tone, bg, c, Icon }) => (
          <div className="isk-app-stat" key={lbl}>
            <div className="isk-app-stat-body">
              <div className="lbl">{lbl}<i style={{ background: bg, color: c }}><Icon size={11} /></i></div>
              <div className="val isk-tnum">{val}</div>
            </div>
            <div className="bar" style={{ background: tone }} />
          </div>
        ))}
      </div>
      <div className="isk-chart">
        <div className="isk-chart-h"><span>Applications received</span><span className="mut">Monthly</span></div>
        <div className="isk-chart-bars">
          {RPT_BARS.map(([m, h], i) => (
            <div key={m}>
              <i className={i >= RPT_BARS.length - 2 ? 'hi' : ''} style={{ height: `${h}%` }} />
              <span>{m}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

const PROOF_TABS = [
  { id: 'queue', label: 'Verification queue', nav: 'Queue', url: '/queue', View: QueueView },
  { id: 'monitor', label: 'Scholar monitoring', nav: 'Scholars', url: '/scholars', View: MonitorView },
  { id: 'reports', label: 'Reports', nav: 'Reports', url: '/reports', View: ReportsView },
]

function ProofViewer() {
  const [tab, setTab] = useState('queue')
  const current = PROOF_TABS.find((t) => t.id === tab)
  const View = current.View
  return (
    <>
      <div className="isk-seg-wrap">
        <div className="isk-seg" role="tablist" aria-label="Product surfaces">
          {PROOF_TABS.map((t) => (
            <button key={t.id} role="tab" aria-selected={tab === t.id} data-active={tab === t.id ? 'true' : undefined} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div className="isk-proof-frame">
        <AppFrame url={current.url} active={current.nav}><View /></AppFrame>
      </div>
    </>
  )
}

// ── Shared nav ──────────────────────────────────────────────────────────────
function Nav({ stuck }) {
  return (
    <nav className={`isk-nav${stuck ? ' isk-nav--stuck' : ''}`}>
      <div className="isk-container isk-nav-inner">
        <a className="isk-brand" href="#top">
          <span className="isk-brand-mark"><GraduationCap size={18} /></span>
          Iskolar
        </a>
        <div className="isk-navlinks">
          <a className="isk-navlink" href="#product">Product</a>
          <a className="isk-navlink" href="#lifecycle">Lifecycle</a>
          <a className="isk-navlink" href="#roles">For LGUs</a>
          <a className="isk-navlink" href="#trust">Trust</a>
        </div>
        <div className="isk-nav-right">
          <Link className="isk-btn isk-btn-invert" to="/iskolar/request">Request onboarding</Link>
        </div>
      </div>
    </nav>
  )
}

const PilotBadge = () => (
  <div className="isk-pilotwrap isk-rise isk-rise-1">
    <span className="isk-hero-pilot">
      <span className="isk-pilot-dot" />
      Now piloting with <b>Sta. Cruz, Laguna&nbsp;LYDO</b>
    </span>
  </div>
)

// ── Hero ────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <div className="isk-container isk-giant isk-giant--center" style={{ paddingBottom: 0 }}>
      <PilotBadge />
      <h1 className="isk-display isk-display--giant isk-rise isk-rise-2">
        One place for the whole lifecycle.
      </h1>
      <p className="isk-hero-sub isk-rise isk-rise-3">
        The scholarship program your municipality runs — application to graduation —
        in one system.
      </p>
      <div className="isk-hero-actions isk-rise isk-rise-4">
        <Link className="isk-btn isk-btn-invert" to="/iskolar/request">Request onboarding <ArrowRight size={16} className="isk-arrow" /></Link>
        <a className="isk-btn isk-btn-ghost-dark" href="#lifecycle">See how it works</a>
      </div>
      <div className="isk-peek-cap isk-rise isk-rise-4"><ChevronDown size={15} /> Scroll to explore the product</div>
      <div className="isk-peek-bleed isk-rise isk-rise-4">
        <div className="isk-peek-bleed-inner"><ProductFrame /></div>
      </div>
    </div>
  )
}

// ── Lifecycle ───────────────────────────────────────────────────────────────
const JOURNEY = [
  { Icon: FileCheck2, n: 'Apply', p: 'Scholars apply online and upload documents from any phone — no queues at the office.' },
  { Icon: ShieldCheck, n: 'Verify', p: 'Staff review, flag, and shortlist in a queue with a full audit trail.' },
  { Icon: LineChart, n: 'Monitor', p: 'Track grades, requirements, and standing so no scholar slips through the cracks.' },
  { Icon: RefreshCw, n: 'Renew', p: 'Scholars submit renewals and grades each term; staff approve in a click.' },
]

// ── Roles + scholar phone ───────────────────────────────────────────────────
const ROLES = [
  { Icon: GraduationCap, b: 'Scholars', p: 'Apply, track status, and submit renewals — all from a phone.' },
  { Icon: ClipboardList, b: 'LYDO staff', p: 'Review applications, monitor scholars, run the day-to-day.' },
  { Icon: SlidersHorizontal, b: 'Municipal admin', p: 'Configure the program, set policy, and oversee the office.' },
  { Icon: ServerCog, b: 'Platform team', p: 'We host, maintain, secure, and support the whole system.' },
]

function PhoneMock() {
  return (
    <div className="isk-phone">
      <div className="isk-phone-screen">
        <div className="isk-phone-notch" />
        <div className="isk-phone-top">
          <span className="who">Iskolar · Sta. Cruz</span>
          <b>Kumusta, Maria</b>
        </div>
        <div className="isk-phone-body">
          <div className="isk-phone-card">
            <span className="st"><CheckCircle2 size={12} /> Active scholar</span>
            <span className="big">A.Y. {YEAR}–{YEAR + 1}</span>
            <span className="sub">GWA 1.75 · Renewal opens in 3 weeks</span>
          </div>
          <div className="isk-phone-row"><i><FileCheck2 size={14} /></i><div className="t"><b>Submit grades</b><span>Before your renewal</span></div></div>
          <div className="isk-phone-row"><i><Megaphone size={14} /></i><div className="t"><b>New announcement</b><span>Orientation schedule</span></div></div>
        </div>
      </div>
    </div>
  )
}

const TRUST = [
  { Icon: Lock, b: 'Two-factor sign-in', p: 'Every account is protected with mandatory 2FA.' },
  { Icon: Users, b: 'Role-based access', p: 'Scholars, staff, and admins each see only what they should.' },
  { Icon: ScrollText, b: 'Full audit trail', p: 'Every decision is logged — transparent and accountable.' },
  { Icon: ServerCog, b: 'Hosted & maintained', p: 'We run, secure, and update the platform for you.' },
  { Icon: Database, b: 'Your data stays yours', p: 'Each municipality’s records belong to that municipality.' },
  { Icon: SlidersHorizontal, b: 'Configured per LGU', p: 'Your rules, thresholds, branding, and local tools — not a fixed template.' },
]

const NEXT_STEPS = [
  ['1', 'Submit a request', 'Tell us about your program.'],
  ['2', 'We review with you', 'We confirm the details together.'],
  ['3', 'We provision your tenant', 'Configured for your LGU.'],
  ['4', 'Your team logs in', 'You’re up and running.'],
]

function Body() {
  return (
    <div className="isk-body">
      {/* Lifecycle */}
      <section className="isk-section" id="lifecycle">
        <div className="isk-container">
          <div className="isk-sec-head">
            <h2 className="isk-h2">One system. The whole journey.</h2>
            <p>Every stage of a scholarship lives in Iskolar — from a student’s first application to their renewal each term.</p>
          </div>
          <div className="isk-journey">
            {JOURNEY.map(({ Icon, n, p }, i) => (
              <div className="isk-journey-step" key={n}>
                <div className="isk-journey-ico"><Icon size={22} /></div>
                <h3><b>{i + 1}.</b> {n}</h3>
                <p>{p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product proof (dark, interactive) */}
      <section className="isk-section isk-section--dark" id="product">
        <div className="isk-container">
          <div className="isk-sec-head" style={{ marginInline: 'auto', textAlign: 'center', maxWidth: '46ch' }}>
            <h2 className="isk-h2">See it actually work.</h2>
            <p>Not slideware — the real surfaces your office uses every day, with bulk actions, exports, and reports built in.</p>
          </div>
          <ProofViewer />
        </div>
      </section>

      {/* Roles + mobile */}
      <section className="isk-section isk-section--mist" id="roles">
        <div className="isk-container isk-roles">
          <div>
            <div className="isk-sec-head" style={{ marginBottom: 28 }}>
              <h2 className="isk-h2">One system, every role.</h2>
              <p>From the scholar on their phone to the office that runs the program.</p>
            </div>
            <div className="isk-roles-list">
              {ROLES.map(({ Icon, b, p }) => (
                <div className="isk-role" key={b}>
                  <div className="isk-role-ico"><Icon size={19} /></div>
                  <b>{b}</b>
                  <p>{p}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="isk-roles-phone"><PhoneMock /></div>
        </div>
      </section>

      {/* Trust */}
      <section className="isk-section" id="trust">
        <div className="isk-container">
          <div className="isk-sec-head">
            <h2 className="isk-h2">Built to be trusted.</h2>
            <p>Public scholarship money deserves public-grade accountability.</p>
          </div>
          <div className="isk-trust">
            {TRUST.map(({ Icon, b, p }) => (
              <div className="isk-trust-item" key={b}>
                <div className="isk-trust-ico"><Icon size={19} /></div>
                <div><b>{b}</b><p>{p}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission — committed-blue emotional beat */}
      <section className="isk-section isk-mission">
        <div className="isk-container">
          <h2>Behind every application is a <em>student</em>.</h2>
          <p>
            Iskolar exists so municipalities can run their scholarships with the care
            those students deserve — and never lose track of a single one.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="isk-section isk-section--mist" id="demo">
        <div className="isk-container isk-cta">
          <h2 className="isk-h2">Bring Iskolar to your municipality.</h2>
          <p className="isk-cta-sub">
            We&rsquo;re onboarding local governments now — invite-and-onboard, so every
            LGU gets a properly configured space. Here&rsquo;s what happens after you reach out.
          </p>
          <div className="isk-cta-steps">
            {NEXT_STEPS.map(([n, title, sub]) => (
              <div className="isk-cta-step" key={n}>
                <span className="isk-cta-n isk-tnum">{n}</span>
                <b>{title}</b>
                <p>{sub}</p>
              </div>
            ))}
          </div>
          <div className="isk-cta-actions">
            <Link className="isk-btn isk-btn-primary" to="/iskolar/request"><Send size={16} /> Request onboarding</Link>
          </div>
        </div>
      </section>

      <footer className="isk-footer">
        <div className="isk-container">
          <div className="isk-footer-top">
            <div>
              <a className="isk-brand" href="#top" style={{ color: '#fff' }}>
                <span className="isk-brand-mark"><GraduationCap size={18} /></span> Iskolar
              </a>
              <p>Scholarship management for Philippine local governments.</p>
              <p style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 10 }}>
                <MapPin size={13} /> Piloting in Sta. Cruz, Laguna
              </p>
            </div>
            <div className="isk-footer-cols">
              <div className="isk-footer-col">
                <b>Product</b>
                <a href="#top">Overview</a>
                <a href="#lifecycle">Lifecycle</a>
                <a href="#product">The product</a>
              </div>
              <div className="isk-footer-col">
                <b>For LGUs</b>
                <a href="#roles">Every role</a>
                <a href="#trust">Trust &amp; security</a>
                <Link to="/iskolar/request">Request onboarding</Link>
              </div>
              <div className="isk-footer-col">
                <b>Account</b>
                <Link to="/login">Sign in</Link>
                <a href="mailto:hello@iskolar.ph">Contact</a>
              </div>
            </div>
          </div>
          <div className="isk-footer-bottom">
            <span>© {YEAR} Iskolar</span>
            <span>A capstone project · Iskolar ng Bayan is a program of the Sta. Cruz LYDO.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

// ── Page ────────────────────────────────────────────────────────────────────
export function PlatformLandingPage() {
  const [stuck, setStuck] = useState(false)
  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="isk isk-dark isk-scroll" id="top">
      <Nav stuck={stuck} />
      <div className="isk-hero">
        <Hero />
      </div>
      <Body />
    </div>
  )
}
