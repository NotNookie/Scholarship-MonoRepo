import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Check } from 'lucide-react'
import { usePlatformStore, SETUP_STEPS, setupStage, PIPELINE_COLUMNS, sigilOf } from '../../store/platformStore'
import { OnboardDrawer } from '../../components/platform/OnboardDrawer'

function progressOf(setup) {
  return SETUP_STEPS.filter((s) => setup?.[s.key]).length
}

function PipelineCard({ m, onOpen }) {
  const done = progressOf(m.setup)
  return (
    <button type="button" className="pf-board-card" onClick={() => onOpen(m.id)}>
      <div className="nm">
        <span className="pf-sigil" aria-hidden="true">{sigilOf(m.name)}</span>
        {m.name}
      </div>
      <div className="sd">{m.subdomain}.iskolar.ph</div>
      <div className="pf-progress" aria-hidden="true">
        {SETUP_STEPS.map((s) => (
          <i key={s.key} className={m.setup?.[s.key] ? 'on' : ''} />
        ))}
      </div>
      <div className="pf-progress-lbl">{done} of {SETUP_STEPS.length} steps done</div>
    </button>
  )
}

export function PlatformOnboardingPage() {
  const navigate = useNavigate()
  const municipalities = usePlatformStore((s) => s.municipalities)
  const [onboardOpen, setOnboardOpen] = useState(false)

  const inFlight = municipalities.filter((m) => m.status === 'onboarding')
  const byStage = (key) => inFlight.filter((m) => setupStage(m.setup) === key)

  const open = (id) => navigate(`/platform/municipalities/${id}`)

  return (
    <>
      <div className="pf-page-head">
        <div>
          <h1 className="pf-title">Onboarding</h1>
          <p className="pf-note">Municipalities being set up. Onboarding is manual — move each one through the checklist.</p>
        </div>
        <button className="pf-btn" type="button" onClick={() => setOnboardOpen(true)}>
          <Plus size={18} strokeWidth={2.4} />
          Onboard municipality
        </button>
      </div>

      {inFlight.length === 0 ? (
        <div className="pf-empty" style={{ borderTop: '2px solid var(--pf-ink)', paddingTop: 26 }}>
          <Check size={30} strokeWidth={1.8} />
          <b>No municipalities in onboarding</b>
          Every tenant is fully set up and live. Charter a new one to start.
        </div>
      ) : (
        <div className="pf-board">
          {PIPELINE_COLUMNS.map((col) => {
            const items = byStage(col.key)
            return (
              <div className="pf-board-col" key={col.key}>
                <div className="pf-board-col-head">
                  <div className="t">{col.label} <span className="c tnum">{items.length}</span></div>
                  <div className="d">{col.desc}</div>
                </div>
                {items.length === 0 ? (
                  <div className="pf-board-empty">Nothing here right now.</div>
                ) : (
                  items.map((m) => <PipelineCard key={m.id} m={m} onOpen={open} />)
                )}
              </div>
            )
          })}
        </div>
      )}

      <OnboardDrawer open={onboardOpen} onClose={() => setOnboardOpen(false)} />
    </>
  )
}
