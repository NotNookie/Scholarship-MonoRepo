import { useState } from 'react'
import toast from 'react-hot-toast'
import { Check, RotateCcw, Inbox } from 'lucide-react'
import { usePlatformStore } from '../../store/platformStore'

const PRIORITY = {
  high: { label: 'High', cls: 'stop' },
  normal: { label: 'Normal', cls: 'info' },
  low: { label: 'Low', cls: 'neutral' },
}

const TABS = ['Open', 'Resolved', 'All']

export function PlatformSupportPage() {
  const tickets = usePlatformStore((s) => s.supportTickets)
  const resolveTicket = usePlatformStore((s) => s.resolveTicket)
  const [tab, setTab] = useState('Open')

  const shown = tickets.filter((t) =>
    tab === 'All' ? true : tab === 'Open' ? t.status === 'open' : t.status === 'resolved'
  )
  const openCount = tickets.filter((t) => t.status === 'open').length

  function toggle(t) {
    resolveTicket(t.id)
    toast.success(t.status === 'resolved' ? `Reopened ${t.id}` : `Marked ${t.id} resolved`)
  }

  return (
    <>
      <div className="pf-page-head">
        <div>
          <h1 className="pf-title">Support</h1>
          <p className="pf-note">Requests from municipal admins and staff. {openCount} open.</p>
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
            return (
              <div className={`pf-ticket${t.status === 'resolved' ? ' is-resolved' : ''}`} key={t.id}>
                <div className="pf-ticket-main">
                  <div className="pf-ticket-subj">{t.subject}</div>
                  <div className="pf-ticket-meta">
                    <b>{t.tenant}</b> · {t.requester} · opened {t.opened} · <span className="pf-mono">{t.id}</span>
                  </div>
                </div>
                <div className="pf-ticket-tags">
                  <span className={`pf-tag ${p.cls}`}>{p.label}</span>
                  <button
                    type="button"
                    className="pf-btn pf-btn--ghost"
                    onClick={() => toggle(t)}
                  >
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
