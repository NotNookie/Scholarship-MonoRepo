import { useState } from 'react'
import { Plus, UserPlus, Check, ShieldCheck } from 'lucide-react'

const FILTERS = ['All', 'Onboarding', 'Suspensions', 'Admin access', 'Configuration']

// Illustrative sample events — swap for `/platform/activity` once the backend exists.
const EVENTS = [
  { icon: 'plus', tone: 'b', text: <><b>Nagcarlan</b> onboarded and activated · by Platform Admin</>, time: '2026-02-14 · 09:14' },
  { icon: 'invite', tone: '', text: <>Head admin invite sent for <b>Pila</b> · by Platform Admin</>, time: '2026-02-12 · 11:02' },
  { icon: 'shield', tone: '', text: <>OCR validation enabled for <b>Pagsanjan</b></>, time: '2026-02-10 · 14:20' },
  { icon: 'check', tone: 'g', text: <><b>Pakil</b> completed its first application cycle</>, time: '2026-02-03 · 16:40' },
  { icon: 'invite', tone: '', text: <>Platform user <b>Dan Lim</b> added as Read-only</>, time: '2026-01-28 · 15:10' },
]

function EventIcon({ icon }) {
  if (icon === 'plus') return <Plus size={18} />
  if (icon === 'invite') return <UserPlus size={18} />
  if (icon === 'shield') return <ShieldCheck size={18} />
  return <Check size={18} />
}

export function PlatformActivityPage() {
  const [active, setActive] = useState('All')

  return (
    <>
      <div className="pf-page-head">
        <div>
          <h1 className="pf-title">Activity log</h1>
          <p className="pf-note">Every platform event, newest first.</p>
        </div>
      </div>

      <div className="pf-chips" role="group" aria-label="Filter activity">
        {FILTERS.map((f) => (
          <button key={f} type="button" className="pf-chip" aria-pressed={active === f} onClick={() => setActive(f)}>
            {f}
          </button>
        ))}
      </div>

      <div style={{ borderTop: '2px solid var(--pf-ink)' }}>
        {EVENTS.map((e, i) => (
          <div className="pf-feed" key={i}>
            <div className={`pf-feed-ic ${e.tone}`}><EventIcon icon={e.icon} /></div>
            <div>
              <div className="pf-feed-tx">{e.text}</div>
              <div className="pf-feed-tm">{e.time}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
