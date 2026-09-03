import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Search, LayoutDashboard, ClipboardList, ShieldCheck, Gavel, LineChart,
  Megaphone, BarChart2, ScrollText, LifeBuoy, UserCog, Settings,
  CornerDownLeft, User, GraduationCap,
} from 'lucide-react'
import { api } from '../../lib/axios'

// Admin pages the palette can jump to.
const PAGES = [
  { label: 'Dashboard', to: '/admin/dashboard', Icon: LayoutDashboard },
  { label: 'Applicant Records', to: '/admin/applicants', Icon: ClipboardList },
  { label: 'Verification Queue', to: '/admin/applications', Icon: ShieldCheck },
  { label: 'Appeals', to: '/admin/appeals', Icon: Gavel },
  { label: 'Scholar Monitoring', to: '/admin/scholars', Icon: LineChart },
  { label: 'Renewals', to: '/admin/scholars/renewals', Icon: LineChart },
  { label: 'Announcements & Events', to: '/admin/communications', Icon: Megaphone },
  { label: 'Reports', to: '/admin/reports', Icon: BarChart2 },
  { label: 'Activity Logs', to: '/admin/activity', Icon: ScrollText },
  { label: 'Request Support', to: '/admin/support', Icon: LifeBuoy },
  { label: 'Users', to: '/admin/users', Icon: UserCog },
  { label: 'Settings', to: '/admin/maintenance', Icon: Settings },
]

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [active, setActive] = useState(0)
  const navigate = useNavigate()
  const inputRef = useRef(null)

  function openPalette() { setQ(''); setActive(0); setOpen(true) }

  // ⌘K / Ctrl+K toggles; Esc closes; a header button dispatches 'admin:cmdk'.
  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); if (open) setOpen(false); else openPalette() }
      else if (e.key === 'Escape' && open) setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('admin:cmdk', openPalette)
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('admin:cmdk', openPalette) }
  }, [open])

  // Focus the input once the palette is open.
  useEffect(() => {
    if (!open) return
    const t = setTimeout(() => inputRef.current?.focus(), 30)
    return () => clearTimeout(t)
  }, [open])

  // Records loaded only while the palette is open.
  const applicantsQuery = useQuery({ queryKey: ['admin', 'applicants'], queryFn: () => api.get('/admin/applicants').then((r) => r.data), enabled: open, retry: false })
  const scholarsQuery = useQuery({ queryKey: ['admin', 'scholars'], queryFn: () => api.get('/admin/scholars').then((r) => r.data), enabled: open, retry: false })

  const results = useMemo(() => {
    const term = q.trim().toLowerCase()
    const pages = PAGES.filter((p) => !term || p.label.toLowerCase().includes(term)).map((p) => ({ id: `p:${p.to}`, label: p.label, sub: 'Page', Icon: p.Icon, to: p.to }))
    if (!term) return pages
    const apps = (applicantsQuery.data?.data ?? [])
      .filter((a) => `${a.first_name} ${a.last_name} ${a.reference_no ?? ''}`.toLowerCase().includes(term))
      .slice(0, 5)
      .map((a) => ({ id: `a:${a.id}`, label: `${a.first_name} ${a.last_name}`, sub: `Applicant · ${a.reference_no ?? ''}`, Icon: User, to: `/admin/applications?select=${a.id}` }))
    const schs = (scholarsQuery.data?.data ?? [])
      .filter((s) => `${s.first_name} ${s.last_name} ${s.scholar_id ?? ''}`.toLowerCase().includes(term))
      .slice(0, 5)
      .map((s) => ({ id: `s:${s.id}`, label: `${s.first_name} ${s.last_name}`, sub: `Scholar · ${s.scholar_id ?? ''}`, Icon: GraduationCap, to: `/admin/scholars/renewals?scholar=${s.scholar_id ?? s.id}` }))
    return [...pages, ...apps, ...schs].slice(0, 14)
  }, [q, applicantsQuery.data, scholarsQuery.data])

  function go(item) { setOpen(false); navigate(item.to) }
  function onKeyDown(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)) }
    else if (e.key === 'Enter') { e.preventDefault(); if (results[active]) go(results[active]) }
  }

  if (!open) return null
  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center p-4 pt-[12vh]">
      <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
      <div role="dialog" aria-modal="true" aria-label="Command palette" className="relative w-full max-w-lg bg-surface rounded-xl shadow-modal border border-border overflow-hidden">
        <div className="flex items-center gap-2 px-4 border-b border-border">
          <Search size={16} className="text-content-muted shrink-0" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => { setQ(e.target.value); setActive(0) }}
            onKeyDown={onKeyDown}
            placeholder="Search pages, applicants, scholars…"
            aria-label="Search"
            className="flex-1 py-3.5 text-sm bg-transparent focus:outline-none text-content placeholder:text-content-muted"
          />
          <kbd className="text-[10px] font-mono text-content-muted border border-border rounded px-1.5 py-0.5 shrink-0">esc</kbd>
        </div>
        <div className="max-h-80 overflow-auto py-1">
          {results.length === 0 ? (
            <p className="px-4 py-6 text-sm text-content-muted text-center">No matches for &ldquo;{q}&rdquo;.</p>
          ) : (
            results.map((item, i) => (
              <button
                key={item.id}
                onMouseEnter={() => setActive(i)}
                onClick={() => go(item)}
                className={`w-full text-left px-4 py-2.5 flex items-center gap-3 ${i === active ? 'bg-primary-light' : 'hover:bg-surface-alt'}`}
              >
                <item.Icon size={16} className={`shrink-0 ${i === active ? 'text-primary' : 'text-content-muted'}`} />
                <span className={`flex-1 min-w-0 text-sm truncate ${i === active ? 'text-primary font-medium' : 'text-content'}`}>{item.label}</span>
                <span className="text-xs text-content-muted shrink-0">{item.sub}</span>
                {i === active && <CornerDownLeft size={13} className="text-content-muted shrink-0" />}
              </button>
            ))
          )}
        </div>
        <div className="px-4 py-2 border-t border-border text-[11px] text-content-muted flex items-center gap-3">
          <span><kbd className="font-mono">↑↓</kbd> navigate</span>
          <span><kbd className="font-mono">↵</kbd> open</span>
          <span className="ml-auto font-mono">⌘K</span>
        </div>
      </div>
    </div>
  )
}
