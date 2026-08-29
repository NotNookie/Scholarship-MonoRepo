import { useNavigate, useParams, Navigate } from 'react-router-dom'
import { ChevronLeft, Ban, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import { usePlatformStore, sigilOf } from '../../store/platformStore'
import { StatusTag } from '../../components/platform/PlatformBits'

export function PlatformMunicipalityDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const municipality = usePlatformStore((s) => s.municipalities.find((m) => m.id === id))
  const toggleStatus = usePlatformStore((s) => s.toggleStatus)

  if (!municipality) return <Navigate to="/platform/municipalities" replace />

  const m = municipality
  const suspended = m.status === 'suspended'

  function handleToggle() {
    toggleStatus(m.id)
    const nowSuspended = !suspended
    toast(
      (t) => (
        <span>
          <b>{m.name}</b> {nowSuspended ? 'suspended' : 'reactivated'}
          <button
            className="pf-toast-undo"
            onClick={() => { toggleStatus(m.id); toast.dismiss(t.id) }}
          >
            Undo
          </button>
        </span>
      ),
      { duration: 5000 }
    )
  }

  return (
    <>
      <button className="pf-back" type="button" onClick={() => navigate('/platform/municipalities')}>
        <ChevronLeft size={17} />
        Back to municipalities
      </button>

      <div className="pf-rec-head">
        <div className="pf-rec-sigil">{sigilOf(m.name)}</div>
        <div>
          <h1 className="pf-rec-title">
            {m.name} <StatusTag status={m.status} />
          </h1>
          <div className="pf-rec-sub">{m.subdomain}.iskolar.ph</div>
        </div>
        <div className="pf-rec-actions">
          {suspended ? (
            <button className="pf-btn" type="button" onClick={handleToggle}>
              <Check size={18} strokeWidth={2.4} />
              Reactivate
            </button>
          ) : (
            <button className="pf-btn pf-btn--danger" type="button" onClick={handleToggle}>
              <Ban size={18} strokeWidth={2.2} />
              Suspend tenant
            </button>
          )}
        </div>
      </div>

      <hr className="pf-rule" />

      <div className="pf-rec-grid">
        <div className="pf-rec-panel">
          <h2>Configuration</h2>
          <div className="pf-kv"><span className="k">Scholarship programs</span><span className="v tnum">{m.programs}</span></div>
          <div className="pf-kv"><span className="k">Active cycle</span><span className="v">{m.cycle}</span></div>
          <div className="pf-kv"><span className="k">OCR validation</span><span className={`v ${m.ocr ? 'on' : 'off'}`}>{m.ocr ? 'Enabled' : 'Off'}</span></div>
          <div className="pf-kv"><span className="k">AI announcements</span><span className={`v ${m.ai ? 'on' : 'off'}`}>{m.ai ? 'Enabled' : 'Off'}</span></div>
        </div>

        <div className="pf-rec-panel">
          <h2>Administrators &amp; staff</h2>
          <div className="pf-person">
            <span className="pf-pfp" style={{ background: 'var(--pf-black)', color: '#fff' }}>JC</span>
            <div><div className="pf-pn">Juan Dela Cruz</div><div className="pf-pr">Head administrator</div></div>
          </div>
          <div className="pf-person">
            <span className="pf-pfp" style={{ background: 'var(--pf-surface-alt)', color: 'var(--pf-ink-2)' }}>AR</span>
            <div><div className="pf-pn">Ana Reyes</div><div className="pf-pr">Staff</div></div>
          </div>
          <div className="pf-kv"><span className="k">Total</span><span className="v tnum">{m.admins} admin · {m.staff} staff</span></div>
        </div>

        <div className="pf-rec-panel">
          <h2>Usage</h2>
          <div className="pf-rec-fig tnum">{m.scholars.toLocaleString('en-US')}</div>
          <div className="pf-rec-fig-lbl">active scholars</div>
          <div className="pf-kv"><span className="k">Applications, cycle</span><span className="v tnum">{m.applications.toLocaleString('en-US')}</span></div>
          <div className="pf-kv"><span className="k">Onboarded</span><span className="v">{m.onboarded}</span></div>
        </div>
      </div>
    </>
  )
}
