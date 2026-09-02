import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, Bell, Building2, Users, LayoutGrid, Activity, Settings,
  LifeBuoy, Megaphone, HeartPulse, BarChart3, UserPlus, CircleCheck, AlertTriangle, Info,
} from 'lucide-react'
import { usePlatformStore, sigilOf } from '../../store/platformStore'

// Static destinations the search can jump to.
const PAGES = [
  { label: 'Overview', to: '/platform', Icon: LayoutGrid },
  { label: 'Municipalities', to: '/platform/municipalities', Icon: Building2 },
  { label: 'Onboarding', to: '/platform/onboarding', Icon: UserPlus },
  { label: 'Analytics & Health', to: '/platform/analytics', Icon: BarChart3 },
  { label: 'Support', to: '/platform/support', Icon: LifeBuoy },
  { label: 'Broadcasts', to: '/platform/broadcasts', Icon: Megaphone },
  { label: 'Logs', to: '/platform/activity', Icon: Activity },
  { label: 'Platform health', to: '/platform/analytics#health', Icon: HeartPulse },
  { label: 'Platform Users', to: '/platform/users', Icon: Users },
  { label: 'Settings', to: '/platform/settings', Icon: Settings },
]

// ── Global search (command palette) ──────────────────────────────
function GlobalSearch({ open, onClose }) {
  const navigate = useNavigate()
  const municipalities = usePlatformStore((s) => s.municipalities)
  const users = usePlatformStore((s) => s.platformUsers)
  const [q, setQ] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (!open) return
    // Clear + focus after paint (kept out of the effect body so it doesn't
    // trigger a synchronous cascading render).
    const id = requestAnimationFrame(() => {
      setQ('')
      inputRef.current?.focus()
    })
    return () => cancelAnimationFrame(id)
  }, [open])

  const results = useMemo(() => {
    const t = q.trim().toLowerCase()
    const match = (s) => s.toLowerCase().includes(t)
    const pages = PAGES.filter((p) => !t || match(p.label))
    const tenants = municipalities.filter((m) => !t || match(m.name) || match(m.subdomain))
    const team = users.filter((u) => t && (match(u.name) || match(u.email)))
    return { pages, tenants, team }
  }, [q, municipalities, users])

  const flat = useMemo(
    () => [
      ...results.pages.map((p) => ({ to: p.to })),
      ...results.tenants.map((m) => ({ to: `/platform/municipalities/${m.id}` })),
      ...results.team.map(() => ({ to: '/platform/users' })),
    ],
    [results]
  )

  if (!open) return null

  const go = (to) => { onClose(); navigate(to) }
  const total = results.pages.length + results.tenants.length + results.team.length

  function onKeyDown(e) {
    if (e.key === 'Escape') { e.preventDefault(); onClose() }
    else if (e.key === 'Enter' && flat[0]) { e.preventDefault(); go(flat[0].to) }
  }

  return (
    <div
      className="pf-cmd-scrim"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="pf-cmd" role="dialog" aria-modal="true" aria-label="Search the platform" onKeyDown={onKeyDown}>
        <div className="pf-cmd-top">
          <Search aria-hidden="true" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search municipalities, people, pages…"
            aria-label="Search"
          />
          <button type="button" className="pf-cmd-esc" onClick={onClose}>ESC</button>
        </div>

        <div className="pf-cmd-results">
          {total === 0 ? (
            <div className="pf-cmd-empty">No matches for “{q}”.</div>
          ) : (
            <>
              {results.tenants.length > 0 && (
                <>
                  <div className="pf-cmd-group">Municipalities</div>
                  {results.tenants.map((m) => (
                    <button key={m.id} type="button" className="pf-cmd-item" onClick={() => go(`/platform/municipalities/${m.id}`)}>
                      <span className="pf-sigil" aria-hidden="true">{sigilOf(m.name)}</span>
                      {m.name}
                      <span className="meta">{m.subdomain}.iskolar.ph</span>
                    </button>
                  ))}
                </>
              )}
              {results.team.length > 0 && (
                <>
                  <div className="pf-cmd-group">People</div>
                  {results.team.map((u) => (
                    <button key={u.id} type="button" className="pf-cmd-item" onClick={() => go('/platform/users')}>
                      <Users aria-hidden="true" />
                      {u.name}
                      <span className="meta">{u.email}</span>
                    </button>
                  ))}
                </>
              )}
              {results.pages.length > 0 && (
                <>
                  <div className="pf-cmd-group">Pages</div>
                  {results.pages.map((p) => (
                    <button key={p.to} type="button" className="pf-cmd-item" onClick={() => go(p.to)}>
                      <p.Icon aria-hidden="true" />
                      {p.label}
                    </button>
                  ))}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Notifications ────────────────────────────────────────────────
const NOTIF_ICON = { ok: CircleCheck, warn: AlertTriangle, info: Info }

function Notifications() {
  const navigate = useNavigate()
  const notifications = usePlatformStore((s) => s.notifications)
  const markRead = usePlatformStore((s) => s.markNotificationRead)
  const markAll = usePlatformStore((s) => s.markAllNotificationsRead)
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const unread = notifications.filter((n) => !n.read).length

  useEffect(() => {
    if (!open) return
    function onDoc(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    function onEsc(e) { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onEsc)
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onEsc) }
  }, [open])

  function activate(n) {
    markRead(n.id)
    setOpen(false)
    if (n.to) navigate(n.to)
  }

  return (
    <div className="pf-pop" ref={ref}>
      <button
        type="button"
        className="pf-mtool"
        aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <Bell />
        {unread > 0 && <span className="pf-ndot" aria-hidden="true" />}
      </button>

      {open && (
        <div className="pf-notif-panel" role="menu" aria-label="Notifications">
          <div className="pf-notif-head">
            <b>Notifications</b>
            {unread > 0 && <button type="button" onClick={markAll}>Mark all read</button>}
          </div>
          <div className="pf-notif-list">
            {notifications.length === 0 ? (
              <div className="pf-notif-empty">You’re all caught up.</div>
            ) : (
              notifications.map((n) => {
                const Icon = NOTIF_ICON[n.kind] ?? Info
                return (
                  <button
                    key={n.id}
                    type="button"
                    className={`pf-notif-item${n.read ? '' : ' unread'}`}
                    onClick={() => activate(n)}
                  >
                    <span className={`pf-notif-ic ${n.kind}`}><Icon /></span>
                    <span>
                      <span className="pf-notif-tx">{n.text}</span>
                      <span className="pf-notif-tm">{n.time}</span>
                    </span>
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Combined masthead tools ──────────────────────────────────────
export function PlatformTools() {
  const [searchOpen, setSearchOpen] = useState(false)

  // Cmd/Ctrl+K opens search from anywhere in the console.
  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="pf-tools">
      <button type="button" className="pf-mtool" aria-label="Search (Ctrl+K)" title="Search  ·  Ctrl K" onClick={() => setSearchOpen(true)}>
        <Search />
      </button>
      <Notifications />
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  )
}
