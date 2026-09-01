import { useState } from 'react'
import { useNavigate, useParams, Navigate } from 'react-router-dom'
import { ChevronLeft, Ban, Check, CircleCheck, Download, Trash2, LogIn } from 'lucide-react'
import toast from 'react-hot-toast'
import { usePlatformStore, sigilOf, SETUP_STEPS, tenantHasActiveAccess } from '../../store/platformStore'
import { useImpersonation } from '../../store/impersonationStore'
import { StatusTag } from '../../components/platform/PlatformBits'
import { OffboardDrawer } from '../../components/platform/OffboardDrawer'

export function PlatformMunicipalityDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const municipality = usePlatformStore((s) => s.municipalities.find((m) => m.id === id))
  const toggleStatus = usePlatformStore((s) => s.toggleStatus)
  const offboard = usePlatformStore((s) => s.offboard)
  const tickets = usePlatformStore((s) => s.supportTickets)
  const enterTenant = useImpersonation((s) => s.enter)
  const [offboardOpen, setOffboardOpen] = useState(false)

  if (!municipality) return <Navigate to="/platform/municipalities" replace />

  const m = municipality
  const suspended = m.status === 'suspended'
  const onboarding = m.status === 'onboarding'

  function exportData() {
    const esc = (v) => `"${String(v).replace(/"/g, '""')}"`
    const rows = [
      ['Field', 'Value'],
      ['Municipality', m.name], ['Province', m.province], ['Subdomain', `${m.subdomain}.iskolar.ph`],
      ['Status', m.status], ['Scholars', m.scholars], ['Applications', m.applications],
      ['Programs', m.programs], ['Active cycle', m.cycle], ['Admins', m.admins], ['Staff', m.staff],
      ['OCR', m.ocr ? 'Enabled' : 'Off'], ['AI announcements', m.ai ? 'Enabled' : 'Off'], ['Onboarded', m.onboarded],
    ]
    const csv = rows.map((r) => r.map(esc).join(',')).join('\r\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `${m.subdomain}-tenant-export.csv`
    document.body.appendChild(a); a.click(); a.remove()
    URL.revokeObjectURL(url)
    toast.success(`Exported ${m.name} data`)
  }

  function handleEnter() {
    enterTenant(m)
    navigate('/admin/dashboard')
  }

  function confirmOffboard() {
    setOffboardOpen(false)
    offboard(m.id)
    toast.success(`${m.name} has been offboarded`)
    navigate('/platform/municipalities')
  }

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
        <div className="pf-rec-actions" style={{ display: 'flex', gap: 12 }}>
          {tenantHasActiveAccess(tickets, m.id) ? (
            <button className="pf-btn" type="button" onClick={handleEnter}>
              <LogIn size={18} strokeWidth={2.2} />
              Enter tenant
            </button>
          ) : (
            <button
              className="pf-btn"
              type="button"
              disabled
              title="This municipality hasn't granted support access. They must file a support request that allows entry."
            >
              <LogIn size={18} strokeWidth={2.2} />
              Enter tenant
            </button>
          )}
          {suspended ? (
            <button className="pf-btn pf-btn--ghost" type="button" onClick={handleToggle}>
              <Check size={18} strokeWidth={2.4} />
              Reactivate
            </button>
          ) : (
            <button className="pf-btn pf-btn--danger" type="button" onClick={handleToggle}>
              <Ban size={18} strokeWidth={2.2} />
              Suspend
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

      {onboarding && (
        <>
          <h2 className="pf-h2">Onboarding checklist</h2>
          <p className="pf-sub">Work through these steps to take {m.name} live.</p>
          <div className="pf-checklist">
            {SETUP_STEPS.map((s) => {
              const done = m.setup?.[s.key]
              return (
                <div key={s.key} className={`pf-check${done ? ' done' : ''}`}>
                  {done ? <CircleCheck /> : <span className="todo-dot" aria-hidden="true" />}
                  {s.label}
                </div>
              )
            })}
          </div>
        </>
      )}

      <h2 className="pf-h2" style={{ borderTopColor: 'var(--pf-stop-fg)' }}>Danger zone</h2>
      <p className="pf-sub">Export this tenant’s data, or remove it from the platform entirely.</p>
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        <button className="pf-btn pf-btn--ghost" type="button" onClick={exportData}>
          <Download size={17} /> Export tenant data
        </button>
        <button className="pf-btn pf-btn--danger" type="button" onClick={() => setOffboardOpen(true)}>
          <Trash2 size={17} /> Offboard tenant…
        </button>
      </div>

      <OffboardDrawer
        open={offboardOpen}
        tenant={m}
        onClose={() => setOffboardOpen(false)}
        onConfirm={confirmOffboard}
      />
    </>
  )
}
