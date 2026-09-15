import { useState } from 'react'
import { Inbox, Mail, Phone, CalendarClock, Building2, Check, X, Eye, BadgeCheck, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useOnboardingRequests } from '../../store/onboardingRequestsStore'
import { OnboardDrawer } from '../../components/platform/OnboardDrawer'
import { usePlatformStore, sigilOf } from '../../store/platformStore'

const norm = (n) => (n || '').replace(/municipality of/i, '').trim().toLowerCase()
const isOfficialEmail = (email) => /\.gov(\.ph)?$/i.test((email || '').split('@')[1] || '')

const TABS = [
  { key: 'new', label: 'New' },
  { key: 'in_review', label: 'In review' },
  { key: 'approved', label: 'Approved' },
  { key: 'declined', label: 'Declined' },
  { key: 'all', label: 'All' },
]

const STATUS_TAG = {
  new: { cls: 'info', label: 'New' },
  in_review: { cls: 'warn', label: 'In review' },
  approved: { cls: 'ok', label: 'Approved' },
  declined: { cls: 'stop', label: 'Declined' },
}

function suggestSubdomain(name) {
  return (name || '').replace(/municipality of/i, '').trim().toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20)
}

function fmtDate(v) {
  if (!v) return '—'
  const d = new Date(v)
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
}

function RequestCard({ r, dupWarning, onCharter, onDecline, onReview }) {
  const tag = STATUS_TAG[r.status] ?? STATUS_TAG.new
  const decided = r.status === 'approved' || r.status === 'declined'
  const official = isOfficialEmail(r.email)
  return (
    <div className="pf-block" style={{ padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div className="pf-sigil" aria-hidden="true">{sigilOf(r.municipality)}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 750, color: 'var(--pf-ink)' }}>{r.municipality}</span>
            <span className={`pf-tag ${tag.cls}`}>{tag.label}</span>
          </div>
          <div className="pf-ten-prov" style={{ marginTop: 2 }}>
            {[r.province, r.scholars && `~${r.scholars} scholars`].filter(Boolean).join(' · ')}
          </div>
        </div>
        <span className="pf-mono" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
          <CalendarClock size={13} /> {fmtDate(r.submittedAt)}
        </span>
      </div>

      {dupWarning && (
        <div className="pf-banner pf-banner--warn" style={{ margin: '14px 0 0', padding: '10px 14px' }}>
          <AlertTriangle size={20} />
          <div><div className="bt" style={{ fontSize: '0.86rem' }}>Possible duplicate</div><div className="bs">{dupWarning}</div></div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px 20px', margin: '14px 0 0', fontSize: '0.86rem' }}>
        <span style={{ color: 'var(--pf-ink)' }}><b style={{ fontWeight: 700 }}>{r.name}</b> · <span style={{ color: 'var(--pf-ink-2)' }}>{r.position}</span></span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
          <a href={`mailto:${r.email}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, minWidth: 0 }}><Mail size={13} /> <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.email}</span></a>
          {official
            ? <span className="pf-tag ok" title="Official government email domain" style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><BadgeCheck size={11} /> Official</span>
            : <span className="pf-tag warn" title="Not an official .gov.ph domain — verify before chartering">Unverified</span>}
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--pf-ink-2)' }}><Phone size={13} /> {r.contact || '—'}</span>
      </div>

      {r.message && (
        <p style={{ margin: '12px 0 0', fontSize: '0.88rem', color: 'var(--pf-ink-2)', borderLeft: '2px solid var(--pf-line)', paddingLeft: 12, lineHeight: 1.5 }}>
          “{r.message}”
        </p>
      )}

      {!decided && (
        <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
          <button className="pf-btn" type="button" onClick={onCharter}>
            <Building2 size={16} /> Charter &amp; invite
          </button>
          {r.status === 'new' && (
            <button className="pf-btn pf-btn--ghost" type="button" onClick={onReview}>
              <Eye size={16} /> Mark in review
            </button>
          )}
          <button className="pf-btn pf-btn--danger" type="button" onClick={onDecline}>
            <X size={16} /> Decline
          </button>
        </div>
      )}
      {r.status === 'approved' && (
        <p style={{ marginTop: 14, fontSize: '0.82rem', color: 'var(--pf-ok-fg)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Check size={14} /> Chartered — invitation sent to the head administrator.
        </p>
      )}
    </div>
  )
}

export function PlatformRequestsPage() {
  const requests = useOnboardingRequests((s) => s.requests)
  const setStatus = useOnboardingRequests((s) => s.setStatus)
  const municipalities = usePlatformStore((s) => s.municipalities)
  const [tab, setTab] = useState('new')
  const [chartering, setChartering] = useState(null)

  const shown = requests.filter((r) => (tab === 'all' ? true : r.status === tab))
  const newCount = requests.filter((r) => r.status === 'new').length

  // Flag requests that would collide with an existing tenant or another pending request.
  function dupWarningFor(r) {
    const sub = suggestSubdomain(r.municipality)
    const n = norm(r.municipality)
    const existing = municipalities.find((m) => m.subdomain === sub || norm(m.name) === n)
    if (existing) return `A tenant for this municipality already exists — ${existing.subdomain}.iskolar.ph.`
    const pending = requests.find((o) => o.id !== r.id && norm(o.municipality) === n && (o.status === 'new' || o.status === 'in_review'))
    if (pending) return 'Another pending request from this municipality is already in the queue.'
    return null
  }

  function decline(r) {
    setStatus(r.id, 'declined')
    toast(`Declined ${r.municipality}`)
  }

  return (
    <>
      <div className="pf-page-head">
        <div>
          <h1 className="pf-title">Requests</h1>
          <p className="pf-note">
            Municipalities asking to join, submitted from the public request form. {newCount} new.
          </p>
        </div>
      </div>

      <div className="pf-seg" role="group" aria-label="Filter requests" style={{ margin: '18px 0' }}>
        {TABS.map((t) => (
          <button key={t.key} type="button" aria-pressed={tab === t.key} onClick={() => setTab(t.key)}>{t.label}</button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="pf-empty">
          <Inbox />
          <b>No requests here</b>
          Requests from the public onboarding form will appear in this inbox.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {shown.map((r) => (
            <RequestCard
              key={r.id}
              r={r}
              dupWarning={dupWarningFor(r)}
              onCharter={() => setChartering(r)}
              onDecline={() => decline(r)}
              onReview={() => setStatus(r.id, 'in_review')}
            />
          ))}
        </div>
      )}

      <OnboardDrawer
        open={!!chartering}
        initial={chartering ? {
          name: chartering.municipality,
          province: chartering.province,
          email: chartering.email,
          subdomain: suggestSubdomain(chartering.municipality),
        } : undefined}
        onCharter={() => chartering && setStatus(chartering.id, 'approved')}
        onClose={() => setChartering(null)}
      />
    </>
  )
}
