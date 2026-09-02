import { useNavigate } from 'react-router-dom'
import {
  CircleCheck, Check, Plus, UserPlus, TrendingUp,
  Ban, Trash2, UserMinus, Megaphone, LifeBuoy, Shield,
} from 'lucide-react'
import { usePlatformStore } from '../../store/platformStore'
import { OnboardDrawer } from '../../components/platform/OnboardDrawer'
import { useState } from 'react'

// Maps an activity `kind` to its feed icon + tone (b = blue, g = green,
// stop = red-attention). Keeps the feed visually consistent with the store.
const ACTIVITY_META = {
  onboard:     { Icon: Plus,      tone: 'b' },
  invite_team: { Icon: UserPlus,  tone: 'b' },
  cycle:       { Icon: Check,     tone: 'g' },
  reactivate:  { Icon: Check,     tone: 'g' },
  invite:      { Icon: UserPlus,  tone: '' },
  support:     { Icon: LifeBuoy,  tone: '' },
  broadcast:   { Icon: Megaphone, tone: '' },
  role:        { Icon: Shield,    tone: '' },
  suspend:     { Icon: Ban,       tone: 'stop' },
  offboard:    { Icon: Trash2,    tone: 'stop' },
  remove:      { Icon: UserMinus, tone: 'stop' },
}

export function PlatformOverviewPage() {
  const navigate = useNavigate()
  const municipalities = usePlatformStore((s) => s.municipalities)
  const activity = usePlatformStore((s) => s.activity)
  const [onboardOpen, setOnboardOpen] = useState(false)

  const total = municipalities.length
  const active = municipalities.filter((m) => m.status === 'active').length
  const onboarding = municipalities.filter((m) => m.status === 'onboarding').length
  const suspended = municipalities.filter((m) => m.status === 'suspended').length
  const scholars = municipalities.reduce((s, m) => s + m.scholars, 0)
  const applications = municipalities.reduce((s, m) => s + m.applications, 0)

  const attention = municipalities.filter((m) => m.status === 'suspended')

  return (
    <>
      <div className="pf-reveal">
        <div className="pf-page-head">
          <div>
            <h1 className="pf-title">Command centre</h1>
            <p className="pf-note">Live health across every municipality on the platform.</p>
          </div>
          <button className="pf-btn" type="button" onClick={() => setOnboardOpen(true)}>
            <Plus size={18} strokeWidth={2.4} />
            Onboard municipality
          </button>
        </div>
      </div>

      <div className="pf-banner pf-reveal">
        <CircleCheck size={30} strokeWidth={2} />
        <div>
          <div className="bt">{suspended === 0 ? 'All systems nominal' : `${suspended} tenant${suspended > 1 ? 's' : ''} need attention`}</div>
          <div className="bs">
            {total} municipalities · {suspended} suspended · last checked just now
          </div>
        </div>
      </div>

      <div className="pf-cols pf-reveal">
        <div className="pf-block">
          <h2>Needs attention</h2>
          {attention.length === 0 ? (
            <div className="pf-empty">
              <Check size={30} strokeWidth={1.8} />
              <b>Nothing needs attention</b>
              Suspensions, failed onboardings and stalled tenants surface here.
            </div>
          ) : (
            attention.map((m) => (
              <button
                key={m.id}
                type="button"
                className="pf-feed"
                style={{ width: '100%', textAlign: 'left', background: 'none', border: 0, borderBottom: '1px solid var(--pf-line-soft)', cursor: 'pointer' }}
                onClick={() => navigate(`/platform/municipalities/${m.id}`)}
              >
                <div className="pf-feed-ic" style={{ background: 'var(--pf-stop-bg)', color: 'var(--pf-stop-fg)' }}>
                  <UserPlus size={18} />
                </div>
                <div>
                  <div className="pf-feed-tx"><b>{m.name}</b> is suspended</div>
                  <div className="pf-feed-tm">Review and reactivate</div>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="pf-block">
          <h2>Recent activity</h2>
          {activity.length === 0 ? (
            <div className="pf-empty">
              <Check size={30} strokeWidth={1.8} />
              <b>No activity yet</b>
              Onboarding, suspensions, broadcasts and team changes appear here.
            </div>
          ) : (
            activity.slice(0, 6).map((a) => {
              const meta = ACTIVITY_META[a.kind] ?? { Icon: Check, tone: '' }
              const stop = meta.tone === 'stop'
              return (
                <div key={a.id} className="pf-feed">
                  <div
                    className={`pf-feed-ic ${stop ? '' : meta.tone}`}
                    style={stop ? { background: 'var(--pf-stop-bg)', color: 'var(--pf-stop-fg)' } : undefined}
                  >
                    <meta.Icon size={18} />
                  </div>
                  <div>
                    <div className="pf-feed-tx">{a.before}<b>{a.strong}</b>{a.after}</div>
                    <div className="pf-feed-tm">{a.time}</div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      <div className="pf-vitals pf-reveal">
        <div className="pf-vital">
          <div className="lbl">Municipalities</div>
          <div className="fig tnum">{total}</div>
          <div className="sub up">{active} active · {onboarding} onboarding</div>
        </div>
        <div className="pf-vital">
          <div className="lbl">Scholars, platform-wide</div>
          <div className="fig tnum">{scholars.toLocaleString('en-US')}</div>
          <div className="sub up" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <TrendingUp size={14} strokeWidth={2.4} /> 8.2% this cycle
          </div>
        </div>
        <div className="pf-vital">
          <div className="lbl">Applications, A.Y. 2026–27</div>
          <div className="fig tnum">{applications.toLocaleString('en-US')}</div>
          <div className="sub">across all municipalities</div>
        </div>
        <div className="pf-vital">
          <div className="lbl">Suspended</div>
          <div className="fig tnum">{suspended}</div>
          <div className="sub">{suspended === 0 ? 'all tenants healthy' : 'requires attention'}</div>
        </div>
      </div>

      <OnboardDrawer open={onboardOpen} onClose={() => setOnboardOpen(false)} />
    </>
  )
}
