import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Check, RotateCcw, Inbox, LogIn, ShieldCheck } from 'lucide-react'
import { usePlatformStore } from '../../store/platformStore'
import { useImpersonation } from '../../store/impersonationStore'

const PRIORITY = {
  high: { label: 'High', cls: 'stop' },
  normal: { label: 'Normal', cls: 'info' },
  low: { label: 'Low', cls: 'neutral' },
}

const TABS = ['Open', 'Resolved', 'All']

export function PlatformSupportPage() {
  const navigate = useNavigate()
  const tickets = usePlatformStore((s) => s.supportTickets)
  const municipalities = usePlatformStore((s) => s.municipalities)
  const resolveTicket = usePlatformStore((s) => s.resolveTicket)
  const enterTenant = useImpersonation((s) => s.enter)
  const [tab, setTab] = useState('Open')

  const shown = tickets.filter((t) =>
    tab === 'All' ? true : tab === 'Open' ? t.status === 'open' : t.status === 'resolved'
  )
  const openCount = tickets.filter((t) => t.status === 'open').length

  function toggle(t) {
    resolveTicket(t.id)
    toast.success(t.status === 'resolved' ? `Reopened ${t.id}` : `Marked ${t.id} resolved`)
  }

  function enter(t) {
    const m = municipalities.find((x) => x.id === t.tenantId)
      ?? { id: t.tenantId, name: t.tenant, subdomain: t.tenantId, province: '' }
    enterTenant(m)
    navigate('/admin/dashboard')
  }

  return (
    <>
      <div className="pf-page-head">
        <div>
          <h1 className="pf-title">Support</h1>
          <p className="pf-note">Requests from municipal admins and staff. {openCount} open. You can enter a portal only when the municipality has granted access.</p>
        </div>
      </div>

      <div className="pf-seg" role="group" aria-label="Filter tickets" style={{ margin: '18px 0' }}>
        {TABS.map((t) => (
          <button key={t} type="button" aria-pressed={tab === t} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="pf-empty" style={{ borderTop: '2px solid var(--pf-ink)', paddingTop: 26 }}>
          <Inbox size={30} strokeWidth={1.8} />
          <b>No {tab.toLowerCase()} tickets</b>
          Support requests raised by tenants will appear here.
        </div>
      ) : (
        <div style={{ borderTop: '2px solid var(--pf-ink)' }}>
          {shown.map((t) => {
            const p = PRIORITY[t.priority] ?? PRIORITY.normal
            const canEnter = t.grantsAccess && t.status === 'open'
            return (
              <div className={`pf-ticket${t.status === 'resolved' ? ' is-resolved' : ''}`} key={t.id}>
                <div className="pf-ticket-main">
                  <div className="pf-ticket-subj">{t.subject}</div>
                  <div className="pf-ticket-meta">
                    <b>{t.tenant}</b> · {t.requester} · opened {t.opened} · <span className="pf-mono">{t.id}</span>
                  </div>
                  {t.message && (
                    <div style={{ fontSize: 13, color: 'var(--pf-ink-2)', marginTop: 5 }}>{t.message}</div>
                  )}
                </div>
                <div className="pf-ticket-tags">
                  {canEnter && (
                    <span className="pf-tag ok" style={{ gap: 5 }}><ShieldCheck size={12} /> Access granted</span>
                  )}
                  <span className={`pf-tag ${p.cls}`}>{p.label}</span>
                  {canEnter && (
                    <button type="button" className="pf-btn" onClick={() => enter(t)}>
                      <LogIn size={16} /> Enter tenant
                    </button>
                  )}
                  <button type="button" className="pf-btn pf-btn--ghost" onClick={() => toggle(t)}>
                    {t.status === 'resolved'
                      ? (<><RotateCcw size={16} /> Reopen</>)
                      : (<><Check size={16} /> Resolve</>)}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
