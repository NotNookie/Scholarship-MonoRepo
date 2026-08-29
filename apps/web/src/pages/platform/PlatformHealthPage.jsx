import { CircleCheck, AlertTriangle } from 'lucide-react'
import { usePlatformStore, HEALTH_META } from '../../store/platformStore'

export function PlatformHealthPage() {
  const services = usePlatformStore((s) => s.healthServices)

  const anyDown = services.some((s) => s.status === 'down')
  const anyDegraded = services.some((s) => s.status === 'degraded')
  const allGood = !anyDown && !anyDegraded

  const banner = anyDown
    ? { cls: 'stop', text: 'One or more services are down' }
    : anyDegraded
    ? { cls: 'warn', text: 'Some services are degraded' }
    : { cls: 'ok', text: 'All systems operational' }

  return (
    <>
      <div className="pf-page-head">
        <div>
          <h1 className="pf-title">Platform health</h1>
          <p className="pf-note">Live status of the services every municipality depends on.</p>
        </div>
      </div>

      <div
        className="pf-banner pf-reveal"
        style={
          banner.cls === 'ok'
            ? undefined
            : { background: banner.cls === 'stop' ? 'var(--pf-stop-fg)' : '#946f00' }
        }
      >
        {allGood ? <CircleCheck size={30} strokeWidth={2} /> : <AlertTriangle size={30} strokeWidth={2} />}
        <div>
          <div className="bt">{banner.text}</div>
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
    </>
  )
}
