import { useState, useMemo, useRef, useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutGrid, Building2, Award, CalendarRange, SlidersHorizontal, Sparkles,
  Palette, Search, CornerDownLeft,
} from 'lucide-react'

// The persistent settings sub-nav — jump between any settings section without
// round-tripping through the hub.
const NAV = [
  { to: '/admin/maintenance', end: true, label: 'Overview', Icon: LayoutGrid },
  { to: '/admin/maintenance/profile', label: 'Organization Profile', Icon: Building2 },
  { to: '/admin/maintenance/appearance', label: 'Appearance', Icon: Palette },
  { to: '/admin/maintenance/policies', label: 'Scholarship Policies', Icon: Award },
  { to: '/admin/maintenance/cycles', label: 'Cycles & Documents', Icon: CalendarRange },
  { to: '/admin/maintenance/eligibility', label: 'Eligibility Rules', Icon: SlidersHorizontal },
  { to: '/admin/maintenance/features', label: 'Assistive Features', Icon: Sparkles },
]

// Flat index of individual settings, for the search / quick-jump. Profile
// entries carry a hash so the page scrolls to the right section.
const SEARCH_INDEX = [
  { label: 'Portal name / header text', to: '/admin/maintenance/profile#general', kw: 'branding title' },
  { label: 'Tagline', to: '/admin/maintenance/profile#general', kw: 'branding' },
  { label: 'Municipal logo', to: '/admin/maintenance/profile#general', kw: 'branding image' },
  { label: 'Office address', to: '/admin/maintenance/profile#contact', kw: 'contact' },
  { label: 'Support email', to: '/admin/maintenance/profile#contact', kw: 'contact' },
  { label: 'Hotline number', to: '/admin/maintenance/profile#contact', kw: 'contact phone' },
  { label: 'Walkthrough video', to: '/admin/maintenance/profile#public', kw: 'public content' },
  { label: 'Website URL', to: '/admin/maintenance/profile#public', kw: 'public content link' },
  { label: 'Facebook page', to: '/admin/maintenance/profile#public', kw: 'public content social' },
  { label: 'Manual / handbook', to: '/admin/maintenance/profile#public', kw: 'public content pdf' },
  { label: 'Map embed', to: '/admin/maintenance/profile#public', kw: 'public content location' },
  { label: 'Essay requirement', to: '/admin/maintenance/profile#application', kw: 'lifecycle apply' },
  { label: 'Qualifying exam milestone', to: '/admin/maintenance/profile#application', kw: 'lifecycle' },
  { label: 'Orientation milestone', to: '/admin/maintenance/profile#application', kw: 'lifecycle' },
  { label: 'Payout / disbursement tracking', to: '/admin/maintenance/profile#application', kw: 'lifecycle reports' },
  { label: 'Application deadline', to: '/admin/maintenance/profile#application', kw: 'lifecycle date' },
  { label: 'UI theme & custom colours', to: '/admin/maintenance/appearance', kw: 'brand colour palette appearance preset' },
  { label: 'Appearance · theme preview', to: '/admin/maintenance/appearance', kw: 'colour wheel custom' },
  { label: 'Scholarship policies · GWA · income cap', to: '/admin/maintenance/policies', kw: 'programs threshold slots' },
  { label: 'Application periods / cycles', to: '/admin/maintenance/cycles', kw: 'deadline schedule' },
  { label: 'Document checklist', to: '/admin/maintenance/cycles', kw: 'required documents' },
  { label: 'Eligibility rules · residency · voter', to: '/admin/maintenance/eligibility', kw: 'baseline attestation' },
  { label: 'Assistive features · OCR · AI', to: '/admin/maintenance/features', kw: 'ocr ai toggle' },
]

function SettingsSearch() {
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const boxRef = useRef(null)

  const results = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return []
    return SEARCH_INDEX.filter((s) => `${s.label} ${s.kw}`.toLowerCase().includes(term)).slice(0, 7)
  }, [q])

  useEffect(() => {
    function onDocClick(e) { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  function go(item) {
    setQ(''); setOpen(false)
    navigate(item.to)
  }
  function onKeyDown(e) {
    if (!open || results.length === 0) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)) }
    else if (e.key === 'Enter') { e.preventDefault(); go(results[active]) }
    else if (e.key === 'Escape') { setOpen(false) }
  }

  return (
    <div ref={boxRef} className="relative">
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted pointer-events-none" />
        <input
          type="text"
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); setActive(0) }}
          onFocus={() => q && setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search settings…"
          aria-label="Search settings"
          className="w-full text-sm pl-9 pr-3 py-2 rounded-lg border border-border bg-surface focus:outline-none focus:border-primary"
        />
      </div>
      {open && results.length > 0 && (
        <div className="absolute z-20 mt-1 w-full bg-surface border border-border rounded-lg shadow-modal overflow-hidden">
          {results.map((item, i) => (
            <button
              key={item.label}
              onMouseEnter={() => setActive(i)}
              onClick={() => go(item)}
              className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between gap-2 ${i === active ? 'bg-primary-light text-primary' : 'text-content hover:bg-surface-alt'}`}
            >
              <span className="truncate">{item.label}</span>
              {i === active && <CornerDownLeft size={13} className="shrink-0 opacity-70" />}
            </button>
          ))}
        </div>
      )}
      {open && q && results.length === 0 && (
        <div className="absolute z-20 mt-1 w-full bg-surface border border-border rounded-lg shadow-modal px-3 py-2.5 text-sm text-content-muted">
          No settings match “{q}”.
        </div>
      )}
    </div>
  )
}

export function SettingsLayout() {
  const linkCls = ({ isActive }) =>
    `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
      isActive ? 'bg-primary-light text-primary font-semibold' : 'text-content-muted hover:bg-surface-alt hover:text-content'
    }`
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Settings sub-nav */}
      <aside className="lg:w-60 shrink-0 lg:sticky lg:top-6 lg:self-start flex flex-col gap-3">
        <SettingsSearch />
        <nav className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0">
          {NAV.map(({ to, end, label, Icon }) => (
            <NavLink key={to} to={to} end={end} className={linkCls}>
              <Icon size={16} className="shrink-0" />
              <span className="whitespace-nowrap">{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Section content */}
      <div className="flex-1 min-w-0">
        <Outlet />
      </div>
    </div>
  )
}
