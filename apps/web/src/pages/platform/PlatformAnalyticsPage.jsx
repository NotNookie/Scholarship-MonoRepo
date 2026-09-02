import { CircleCheck, AlertTriangle } from 'lucide-react'
import { usePlatformStore, ONBOARD_TREND, HEALTH_META } from '../../store/platformStore'

// Horizontal bar chart — one row per municipality.
function BarChart({ rows, unit }) {
  const max = Math.max(1, ...rows.map((r) => r.value))
  return (
    <div className="pf-chart">
      {rows.map((r) => (
        <div className="pf-bar-row" key={r.label}>
          <div className="pf-bar-lbl" title={r.label}>{r.label}</div>
          <div className="pf-bar-track">
            <div className="pf-bar-fill" style={{ transform: `scaleX(${r.value / max})` }} />
          </div>
          <div className="pf-bar-val tnum">{r.value.toLocaleString('en-US')}{unit ?? ''}</div>
        </div>
      ))}
    </div>
  )
}

export function PlatformAnalyticsPage() {
  const municipalities = usePlatformStore((s) => s.municipalities)
  const services = usePlatformStore((s) => s.healthServices)

  const anyDown = services.some((s) => s.status === 'down')
  const anyDegraded = services.some((s) => s.status === 'degraded')
  const allGood = !anyDown && !anyDegraded
  const healthBanner = anyDown
    ? { cls: 'stop', text: 'One or more services are down' }
    : anyDegraded
    ? { cls: 'warn', text: 'Some services are degraded' }
    : { cls: 'ok', text: 'All systems operational' }

  const total = municipalities.length
  const active = municipalities.filter((m) => m.status === 'active').length
  const scholars = municipalities.reduce((s, m) => s + m.scholars, 0)
  const applications = municipalities.reduce((s, m) => s + m.applications, 0)
  const avgPerTenant = active ? Math.round(scholars / active) : 0

  const scholarRows = [...municipalities]
    .filter((m) => m.scholars > 0)
    .sort((a, b) => b.scholars - a.scholars)
    .map((m) => ({ label: m.name, value: m.scholars }))

  const appRows = [...municipalities]
    .filter((m) => m.applications > 0)
    .sort((a, b) => b.applications - a.applications)
    .map((m) => ({ label: m.name, value: m.applications }))

  const trendMax = Math.max(1, ...ONBOARD_TREND.map((t) => t.n))

  return (
    <>
      <div className="pf-page-head">
        <div>
          <h1 className="pf-title">Analytics &amp; Health</h1>
          <p className="pf-note">How the whole network is performing, and the live status of the services behind it.</p>
        </div>
      </div>

      {/* Platform health — surfaced first: service status before the numbers */}
      <h2 className="pf-h2" id="health" style={{ scrollMarginTop: 24, marginTop: 0 }}>Platform health</h2>
      <p className="pf-sub">Live status of the services every municipality depends on.</p>
      <div
        className="pf-banner pf-reveal"
        style={
          healthBanner.cls === 'ok'
            ? undefined
            : { background: healthBanner.cls === 'stop' ? 'var(--pf-stop-fg)' : '#946f00' }
        }
      >
        {allGood ? <CircleCheck size={30} strokeWidth={2} /> : <AlertTriangle size={30} strokeWidth={2} />}
        <div>
          <div className="bt">{healthBanner.text}</div>
          <div className="bs">{services.length} services monitored · checked just now</div>
        </div>
      </div>
      <div style={{ borderTop: '2px solid var(--pf-ink)' }}>
        {services.map((svc) => {
          const meta = HEALTH_META[svc.status] ?? HEALTH_META.operational
          return (
            <div className="pf-health-row" key={svc.id}>
              <span className={`pf-health-dot ${meta.cls}`} aria-hidden="true" />
              <div className="pf-health-main">
                <div className="pf-health-lbl">{svc.label}</div>
                <div className="pf-health-detail">{svc.detail}</div>
              </div>
              <span className="pf-health-metric">{svc.metric}</span>
              <span className={`pf-tag ${meta.cls}`}>{meta.label}</span>
            </div>
          )
        })}
      </div>

      <h2 className="pf-h2">Network performance</h2>
      <p className="pf-sub">How the whole network is performing across every municipality.</p>
      <div className="pf-vitals pf-reveal">
        <div className="pf-vital">
          <div className="lbl">Scholars served</div>
          <div className="fig tnum">{scholars.toLocaleString('en-US')}</div>
          <div className="sub">across {active} active municipalities</div>
        </div>
        <div className="pf-vital">
          <div className="lbl">Applications, this cycle</div>
          <div className="fig tnum">{applications.toLocaleString('en-US')}</div>
          <div className="sub">A.Y. 2026–2027</div>
        </div>
        <div className="pf-vital">
          <div className="lbl">Avg. scholars / municipality</div>
          <div className="fig tnum">{avgPerTenant.toLocaleString('en-US')}</div>
          <div className="sub">active tenants only</div>
        </div>
        <div className="pf-vital">
          <div className="lbl">Municipalities</div>
          <div className="fig tnum">{total}</div>
          <div className="sub up">{active} live on the platform</div>
        </div>
      </div>

      <h2 className="pf-h2">Scholars by municipality</h2>
      <p className="pf-sub">Total scholars currently served in each tenant.</p>
      <BarChart rows={scholarRows} />

      <h2 className="pf-h2">Applications this cycle</h2>
      <p className="pf-sub">Applications received in A.Y. 2026–2027, per municipality.</p>
      <BarChart rows={appRows} />

      <h2 className="pf-h2">Network growth</h2>
      <p className="pf-sub">Municipalities live on the platform at each month-end.</p>
      <div className="pf-spark" role="img" aria-label="Municipalities live per month">
        {ONBOARD_TREND.map((t) => (
          <div className="pf-spark-col" key={t.m}>
            <div className="pf-spark-n tnum">{t.n}</div>
            <div className="pf-spark-bar" style={{ height: `${(t.n / trendMax) * 100}%` }} />
            <div className="pf-spark-m">{t.m}</div>
          </div>
        ))}
      </div>

    </>
  )
}
