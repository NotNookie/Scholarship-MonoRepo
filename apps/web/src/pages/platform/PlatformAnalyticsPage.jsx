import { usePlatformStore, ONBOARD_TREND } from '../../store/platformStore'

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
          <h1 className="pf-title">Analytics</h1>
          <p className="pf-note">How the whole network is performing — across every municipality.</p>
        </div>
      </div>

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
