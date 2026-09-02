import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Search, Download, X, ChevronLeft, ChevronRight, Eye, ScrollText, Calendar,
} from 'lucide-react'
import { api } from '../../lib/axios'
import { useDialog } from '../../lib/useDialog'
import { Skeleton } from '../../components/shared/Skeleton'
import { downloadCsv } from '../../lib/reportExport'

// ── Action-type config (colours per mockup) ───────────────────

const ACTION_TYPES = {
  status_update:   { label: 'Status Update',   cls: 'bg-secondary-light text-on-secondary border-secondary/30' },
  document_review: { label: 'Document Review', cls: 'bg-primary-light text-primary border-primary/20' },
  policy_change:   { label: 'Policy Change',   cls: 'bg-tertiary-light text-tertiary-dark border-tertiary/30' },
  data_export:     { label: 'Data Export',     cls: 'bg-surface-alt text-content-muted border-border' },
  system_login:    { label: 'System Login',    cls: 'bg-primary-light text-primary border-primary/20' },
  error_flag:      { label: 'Error Flag',      cls: 'bg-danger-light text-danger border-danger/30' },
  announcement:    { label: 'Announcement',    cls: 'bg-tertiary-light text-tertiary-dark border-tertiary/30' },
  user_management: { label: 'User Management',  cls: 'bg-surface-alt text-content-muted border-border' },
}

const TYPE_OPTIONS = Object.entries(ACTION_TYPES).map(([value, cfg]) => ({ value, label: cfg.label }))
const PAGE_SIZE = 10

function ActionBadge({ type }) {
  const cfg = ACTION_TYPES[type] ?? { label: type ?? 'Event', cls: 'bg-surface-alt text-content-muted border-border' }
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" /> {cfg.label}
    </span>
  )
}

function initials(name) {
  if (!name) return '—'
  const p = String(name).trim().split(/\s+/)
  return (p.length >= 2 ? p[0][0] + p[p.length - 1][0] : p[0][0]).toUpperCase()
}

function fmtDate(v) {
  if (!v) return '—'
  return new Date(v).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
}
function fmtTime(v) {
  if (!v) return ''
  return new Date(v).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

// ── Detail modal ──────────────────────────────────────────────

function LogModal({ log, onClose }) {
  const dialogRef = useDialog(onClose)
  const cfg = ACTION_TYPES[log.action_type]
  const isSystem = log.actor_type === 'system'
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="log-modal-title" className="relative bg-surface rounded-xl shadow-modal w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 id="log-modal-title" className="text-base font-bold text-content">Log Entry</h3>
          <button onClick={onClose} className="text-content-muted hover:text-content" aria-label="Close"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <ActionBadge type={log.action_type} />
            <span className="text-xs text-content-muted">{fmtDate(log.created_at)} · {fmtTime(log.created_at)}</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-content-muted">Actor</p>
              <p className="font-medium text-content">{isSystem ? 'System Automated' : log.actor_name ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-content-muted">{isSystem ? 'Process' : 'Admin ID'}</p>
              <p className="font-medium text-content font-mono">{isSystem ? (log.process ?? 'Batch Process') : (log.actor_id ?? '—')}</p>
            </div>
            {log.ip && (
              <div className="col-span-2">
                <p className="text-xs text-content-muted">IP Address</p>
                <p className="font-medium text-content font-mono">{log.ip}</p>
              </div>
            )}
          </div>
          <div>
            <p className="text-xs text-content-muted mb-1">Description</p>
            <p className="text-sm text-content leading-relaxed">{log.description}</p>
          </div>
          {cfg == null && <p className="text-xs text-content-muted">Action type: {log.action_type}</p>}
        </div>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────

export function ActivityLogsPage() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [type, setType] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [selected, setSelected] = useState(null)

  const { data, isPending } = useQuery({
    queryKey: ['admin', 'activity-logs'],
    queryFn: () => api.get('/admin/activity-logs').then((r) => r.data),
    retry: false,
  })

  const logs = useMemo(() => data?.data ?? [], [data])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const fromTs = from ? new Date(from).setHours(0, 0, 0, 0) : null
    const toTs = to ? new Date(to).setHours(23, 59, 59, 999) : null
    return logs.filter((l) => {
      const ts = l.created_at ? new Date(l.created_at).getTime() : 0
      const matchType = type === 'all' || l.action_type === type
      const matchFrom = fromTs == null || ts >= fromTs
      const matchTo = toTs == null || ts <= toTs
      const matchSearch = !q ||
        (l.actor_name ?? '').toLowerCase().includes(q) ||
        (l.actor_id ?? '').toLowerCase().includes(q) ||
        (l.description ?? '').toLowerCase().includes(q)
      return matchType && matchFrom && matchTo && matchSearch
    })
  }, [logs, from, to, type, search])

  const hasFilters = from || to || type !== 'all' || search
  const total = filtered.length
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const safePage = Math.min(page, pageCount - 1)
  const pageRows = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE)

  function clearFilters() { setFrom(''); setTo(''); setType('all'); setSearch(''); setPage(0) }

  function exportLogs() {
    downloadCsv('activity-logs',
      ['Timestamp', 'Actor', 'Actor ID', 'Action Type', 'Description'],
      filtered.map((l) => [
        `${fmtDate(l.created_at)} ${fmtTime(l.created_at)}`,
        l.actor_type === 'system' ? 'System Automated' : l.actor_name ?? '',
        l.actor_id ?? l.process ?? '',
        ACTION_TYPES[l.action_type]?.label ?? l.action_type ?? '',
        l.description ?? '',
      ]))
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-content">Activity Logs</h1>
        <p className="text-sm text-content-muted mt-1 max-w-2xl">
          A comprehensive audit trail of all administrative actions, status updates, and system events to ensure operational transparency and compliance.
        </p>
      </div>

      {/* Filter bar */}
      <div className="bg-surface border border-border rounded-xl shadow-card p-4 flex flex-col lg:flex-row lg:items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-content-muted">Date Range</label>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Calendar size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-content-muted pointer-events-none" />
              <input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(0) }} aria-label="From date"
                className="text-sm pl-8 pr-2 py-2 rounded-lg border border-border bg-surface focus:outline-none focus:border-primary" />
            </div>
            <span className="text-content-muted text-sm">–</span>
            <input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(0) }} aria-label="To date"
              className="text-sm px-2 py-2 rounded-lg border border-border bg-surface focus:outline-none focus:border-primary" />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="log-type" className="text-xs font-medium text-content-muted">Action Type</label>
          <select id="log-type" value={type} onChange={(e) => { setType(e.target.value); setPage(0) }}
            className="text-sm border border-border rounded-lg px-3 py-2 bg-surface text-content focus:outline-none focus:border-primary">
            <option value="all">All Categories</option>
            {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1.5 flex-1">
          <label htmlFor="log-search" className="text-xs font-medium text-content-muted">User / Admin</label>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" />
            <input id="log-search" type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(0) }} placeholder="Search user, ID, or description…"
              className="w-full text-sm pl-9 pr-3 py-2 rounded-lg border border-border bg-surface focus:outline-none focus:border-primary" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasFilters && (
            <button onClick={clearFilters} className="inline-flex items-center gap-1.5 text-sm font-medium text-content-muted border border-border px-4 py-2 rounded-lg hover:border-danger hover:text-danger transition-colors">
              <X size={14} /> Clear
            </button>
          )}
          <button onClick={exportLogs} disabled={total === 0}
            className="inline-flex items-center gap-1.5 bg-primary text-on-primary text-sm font-semibold px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50">
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface border border-border rounded-xl shadow-card overflow-hidden">
        {isPending ? (
          <div className="p-5 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="flex-1 space-y-2"><Skeleton className="h-3 w-48" /><Skeleton className="h-3 w-64" /></div>
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
            ))}
          </div>
        ) : total > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-surface-alt/60 text-left text-xs font-semibold text-content-muted uppercase tracking-wide">
                    <th className="px-5 py-3">Timestamp</th>
                    <th className="px-5 py-3">User / Actor</th>
                    <th className="px-5 py-3">Action Type</th>
                    <th className="px-5 py-3">Detailed Description</th>
                    <th className="px-5 py-3 text-right">View</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((l) => {
                    const isSystem = l.actor_type === 'system'
                    return (
                      <tr key={l.id} className="border-b border-border last:border-0 hover:bg-surface-alt transition-colors align-top">
                        <td className="px-5 py-4 whitespace-nowrap">
                          <p className="text-sm text-content">{fmtDate(l.created_at)}</p>
                          <p className="text-xs text-content-muted">{fmtTime(l.created_at)}</p>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-9 h-9 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${isSystem ? 'bg-surface-alt text-content-muted' : 'bg-primary-light text-primary'}`}>
                              {isSystem ? 'SYS' : initials(l.actor_name)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-content truncate">{isSystem ? 'System Automated' : l.actor_name ?? '—'}</p>
                              <p className="text-xs text-content-muted truncate">{isSystem ? (l.process ?? 'Batch Process') : `Admin ID: ${l.actor_id ?? '—'}`}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4"><ActionBadge type={l.action_type} /></td>
                        <td className="px-5 py-4"><p className="text-sm text-content leading-relaxed max-w-md">{l.description}</p></td>
                        <td className="px-5 py-4 text-right">
                          <button onClick={() => setSelected(l)} className="text-content-muted hover:text-primary transition-colors" aria-label="View log entry"><Eye size={16} /></button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="px-5 py-3 border-t border-border flex items-center justify-between gap-3 flex-wrap">
              <p className="text-xs text-content-muted">
                Showing <span className="font-semibold text-content">{safePage * PAGE_SIZE + 1}</span>–
                <span className="font-semibold text-content">{Math.min((safePage + 1) * PAGE_SIZE, total)}</span> of{' '}
                <span className="font-semibold text-content">{total.toLocaleString()}</span> entries
              </p>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={safePage === 0}
                  className="p-2 border border-border rounded-lg text-content-muted hover:bg-surface-alt disabled:opacity-40 disabled:cursor-not-allowed" aria-label="Previous page"><ChevronLeft size={15} /></button>
                <span className="text-xs text-content-muted px-2">Page {safePage + 1} of {pageCount}</span>
                <button onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))} disabled={safePage >= pageCount - 1}
                  className="p-2 border border-border rounded-lg text-content-muted hover:bg-surface-alt disabled:opacity-40 disabled:cursor-not-allowed" aria-label="Next page"><ChevronRight size={15} /></button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <ScrollText size={32} className="text-content-disabled" />
            <p className="text-sm font-semibold text-content">{hasFilters ? 'No log entries match your filters.' : 'No activity logged yet.'}</p>
            {hasFilters && <button onClick={clearFilters} className="text-sm text-primary hover:underline">Clear filters</button>}
          </div>
        )}
      </div>

      {selected && <LogModal log={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
