import { useState } from 'react'
import { Plus, UserPlus, Check, ShieldCheck, Download } from 'lucide-react'

const FILTERS = ['All', 'Onboarding', 'Suspensions', 'Admin access', 'Configuration']

// Illustrative sample events — swap for `/platform/activity` once the backend exists.
// `cat` matches a filter; `text` is plain so events can be exported to CSV.
const EVENTS = [
  { icon: 'plus',   tone: 'b', cat: 'Onboarding',    tenant: 'Nagcarlan', text: 'Nagcarlan onboarded and activated', actor: 'Platform Admin', time: '2026-02-14 · 09:14' },
  { icon: 'invite', tone: '',  cat: 'Admin access',  tenant: 'Pila',      text: 'Head admin invite sent for Pila', actor: 'Platform Admin', time: '2026-02-12 · 11:02' },
  { icon: 'shield', tone: '',  cat: 'Configuration', tenant: 'Pagsanjan', text: 'OCR validation enabled for Pagsanjan', actor: 'Platform Admin', time: '2026-02-10 · 14:20' },
  { icon: 'check',  tone: 'g', cat: 'Onboarding',    tenant: 'Pakil',     text: 'Pakil completed its first application cycle', actor: 'System', time: '2026-02-03 · 16:40' },
  { icon: 'invite', tone: '',  cat: 'Admin access',  tenant: '—',         text: 'Platform user Dan Lim added as Read-only', actor: 'Platform Admin', time: '2026-01-28 · 15:10' },
]

function EventIcon({ icon }) {
  if (icon === 'plus') return <Plus size={18} />
  if (icon === 'invite') return <UserPlus size={18} />
  if (icon === 'shield') return <ShieldCheck size={18} />
  return <Check size={18} />
}

function toCsv(rows) {
  const esc = (v) => `"${String(v).replace(/"/g, '""')}"`
  const head = ['Time', 'Category', 'Tenant', 'Event', 'Actor']
  const lines = [head, ...rows.map((e) => [e.time, e.cat, e.tenant, e.text, e.actor])]
  return lines.map((r) => r.map(esc).join(',')).join('\r\n')
}

export function PlatformActivityPage() {
  const [active, setActive] = useState('All')

  const shown = EVENTS.filter((e) => active === 'All' || e.cat === active)

  function exportCsv() {
    const blob = new Blob([toCsv(shown)], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `platform-activity-${active.toLowerCase().replace(/\s+/g, '-')}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <div className="pf-page-head">
        <div>
          <h1 className="pf-title">Activity log</h1>
          <p className="pf-note">Every platform event, newest first.</p>
        </div>
        <button className="pf-btn pf-btn--ghost" type="button" onClick={exportCsv} disabled={shown.length === 0}>
          <Download size={17} /> Export CSV
        </button>
      </div>

      <div className="pf-chips" role="group" aria-label="Filter activity">
        {FILTERS.map((f) => (
          <button key={f} type="button" className="pf-chip" aria-pressed={active === f} onClick={() => setActive(f)}>
            {f}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="pf-empty" style={{ borderTop: '2px solid var(--pf-ink)', paddingTop: 26 }}>
          <Check size={30} strokeWidth={1.8} />
          <b>No events in this category</b>
          Try a different filter.
        </div>
      ) : (
        <div style={{ borderTop: '2px solid var(--pf-ink)' }}>
          {shown.map((e, i) => (
            <div className="pf-feed" key={i}>
              <div className={`pf-feed-ic ${e.tone}`}><EventIcon icon={e.icon} /></div>
              <div>
                <div className="pf-feed-tx">{e.text}{e.actor && e.actor !== 'System' ? <> · by {e.actor}</> : null}</div>
                <div className="pf-feed-tm">{e.time}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
