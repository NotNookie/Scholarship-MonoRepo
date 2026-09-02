import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  useReactTable, getCoreRowModel, getSortedRowModel, getPaginationRowModel, flexRender,
} from '@tanstack/react-table'
import {
  Search, Download, X, ChevronsUpDown, ChevronUp, ChevronDown, ChevronLeft, ChevronRight,
  Users, AlertTriangle, GraduationCap, ClipboardCheck,
} from 'lucide-react'
import { api } from '../../lib/axios'
import { queryKeys } from '../../lib/queryKeys'
import { Skeleton } from '../../components/shared/Skeleton'
import { downloadCsv } from '../../lib/reportExport'
import {
  SCHOLAR_STATUS, resolvePolicy, gwaPasses, scholarStatus, initials, scholarName, formatDate,
} from '../../components/admin/scholars/scholarUtils'

const STATUS_OPTIONS = Object.entries(SCHOLAR_STATUS).map(([value, cfg]) => ({ value, label: cfg.label }))

function StatusPill({ status }) {
  const cfg = SCHOLAR_STATUS[status] ?? SCHOLAR_STATUS.active
  return <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.cls}`}>{cfg.label}</span>
}

function StatCard({ Icon, label, value, tone, onClick, active }) {
  const tones = {
    neutral: 'bg-primary-light text-primary',
    amber: 'bg-secondary-light text-on-secondary',
    red: 'bg-danger-light text-danger',
    muted: 'bg-surface-alt text-content-muted',
  }
  const clickable = !!onClick
  const Wrapper = clickable ? 'button' : 'div'
  return (
    <Wrapper
      type={clickable ? 'button' : undefined}
      onClick={onClick}
      aria-pressed={clickable ? active : undefined}
      className={`text-left w-full bg-surface border rounded-xl shadow-card p-5 transition-all ${active ? 'border-primary ring-2 ring-primary/20' : 'border-border'} ${clickable ? 'hover:border-primary hover:shadow-modal cursor-pointer' : ''}`}
    >
      <div className="flex items-start justify-between">
        <p className="text-sm text-content-muted">{label}</p>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${tones[tone]}`}><Icon size={17} /></div>
      </div>
      <p className="text-3xl font-bold text-content mt-2">{value}</p>
      {clickable && <p className="text-xs text-content-muted mt-1">{active ? 'Filtered · tap to clear' : 'Tap to filter'}</p>}
    </Wrapper>
  )
}

function SortIcon({ dir }) {
  if (dir === 'asc') return <ChevronUp size={13} />
  if (dir === 'desc') return <ChevronDown size={13} />
  return <ChevronsUpDown size={13} className="opacity-40" />
}

export function ScholarsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [program, setProgram] = useState('all')
  const [year, setYear] = useState('all')
  const [sorting, setSorting] = useState([{ id: 'name', desc: false }])

  const scholarsQuery = useQuery({
    queryKey: ['admin', 'scholars'],
    queryFn: () => api.get('/admin/scholars').then((r) => r.data),
    retry: false,
  })
  const policiesQuery = useQuery({
    queryKey: [...queryKeys.maintenance.all, 'policies'],
    queryFn: () => api.get('/admin/maintenance/policies').then((r) => r.data),
    retry: false,
  })

  const scholars = useMemo(() => scholarsQuery.data?.data ?? [], [scholarsQuery.data])
  const policies = useMemo(() => policiesQuery.data?.data ?? [], [policiesQuery.data])

  // Derive live status (at-risk is computed from the program policy, not stored)
  const rows = useMemo(
    () => scholars.map((s) => ({ ...s, derived_status: scholarStatus(s, policies) })),
    [scholars, policies],
  )

  const programs = useMemo(() => Array.from(new Set(scholars.map((s) => s.program ?? s.scholarship_name).filter(Boolean))), [scholars])
  const years = useMemo(() => Array.from(new Set(scholars.map((s) => s.academic_year).filter(Boolean))), [scholars])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return rows.filter((s) => {
      const matchSearch = !q || scholarName(s).toLowerCase().includes(q) || String(s.scholar_id ?? s.id ?? '').toLowerCase().includes(q)
      const matchStatus = status === 'all' || s.derived_status === status
      const matchProgram = program === 'all' || (s.program ?? s.scholarship_name) === program
      const matchYear = year === 'all' || s.academic_year === year
      return matchSearch && matchStatus && matchProgram && matchYear
    })
  }, [rows, search, status, program, year])

  const counts = useMemo(() => ({
    active: rows.filter((s) => s.derived_status === 'active' || s.derived_status === 'renewed').length,
    due: rows.filter((s) => s.derived_status === 'renewal_due').length,
    atRisk: rows.filter((s) => s.derived_status === 'at_risk').length,
    terminated: rows.filter((s) => s.derived_status === 'terminated').length,
  }), [rows])

  const columns = useMemo(() => [
    {
      id: 'name',
      header: 'Scholar',
      accessorFn: (s) => scholarName(s),
      cell: ({ row }) => {
        const s = row.original
        const name = scholarName(s)
        return (
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-primary-light text-primary text-xs font-bold flex items-center justify-center shrink-0">{initials(name)}</div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-content truncate">{name}</p>
              <p className="text-xs text-content-muted truncate">ID: {s.scholar_id ?? s.id ?? '—'}</p>
            </div>
          </div>
        )
      },
    },
    {
      id: 'program',
      header: 'Program / School',
      accessorFn: (s) => s.program ?? s.scholarship_name ?? '',
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="text-sm text-content truncate">{row.original.program ?? row.original.scholarship_name ?? '—'}</p>
          <p className="text-xs text-content-muted truncate">{row.original.school_name ?? ''}</p>
        </div>
      ),
    },
    {
      id: 'gwa',
      header: 'Latest GWA',
      accessorFn: (s) => s.latest_gwa ?? null,
      cell: ({ row }) => {
        const s = row.original
        const policy = resolvePolicy(s, policies)
        const passed = gwaPasses(s.latest_gwa, policy)
        if (s.latest_gwa == null) return <span className="text-sm text-content-muted">—</span>
        return (
          <span className={`inline-flex items-center gap-1.5 text-sm font-semibold ${passed === false ? 'text-danger' : 'text-content'}`}>
            {s.latest_gwa}
            {passed === false && <AlertTriangle size={13} />}
          </span>
        )
      },
    },
    {
      id: 'semesters',
      header: 'Semesters',
      accessorFn: (s) => s.semesters_completed ?? 0,
      cell: (info) => <span className="text-sm text-content">{info.getValue()}</span>,
    },
    {
      id: 'status',
      header: 'Status',
      accessorFn: (s) => s.derived_status,
      cell: ({ row }) => <StatusPill status={row.original.derived_status} />,
    },
    {
      id: 'renewed',
      header: 'Last Renewed',
      accessorFn: (s) => s.last_renewed_at ?? '',
      cell: (info) => <span className="text-sm text-content-muted whitespace-nowrap">{formatDate(info.getValue())}</span>,
    },
  ], [policies])

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  })

  const hasFilters = search || status !== 'all' || program !== 'all' || year !== 'all'
  const total = filtered.length
  const { pageIndex, pageSize } = table.getState().pagination
  const isPending = scholarsQuery.isPending

  function clearFilters() { setSearch(''); setStatus('all'); setProgram('all'); setYear('all') }

  function exportRoster() {
    downloadCsv('scholar-roster',
      ['Scholar', 'Scholar ID', 'Program', 'School', 'Latest GWA', 'Semesters', 'Status', 'Last Renewed'],
      filtered.map((s) => [
        scholarName(s), s.scholar_id ?? s.id ?? '', s.program ?? s.scholarship_name ?? '', s.school_name ?? '',
        s.latest_gwa ?? '', s.semesters_completed ?? '', SCHOLAR_STATUS[s.derived_status]?.label ?? '', formatDate(s.last_renewed_at),
      ]))
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-content">Scholar Monitoring</h1>
          <p className="text-sm text-content-muted mt-1">Track active scholars, renewals, and academic standing.</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button onClick={exportRoster} disabled={total === 0}
            className="inline-flex items-center gap-2 text-sm font-semibold text-content-muted border border-border px-4 py-2.5 rounded-lg hover:border-primary hover:text-primary transition-colors disabled:opacity-50">
            <Download size={15} /> Export
          </button>
          <button onClick={() => navigate('/admin/scholars/renewals')}
            className="inline-flex items-center gap-2 bg-primary text-on-primary text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-primary-dark transition-colors">
            <ClipboardCheck size={15} /> Review Renewals{counts.due > 0 ? ` (${counts.due})` : ''}
          </button>
        </div>
      </div>

      {/* Stat cards */}
      {isPending ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard Icon={Users} tone="neutral" label="Active Scholars" value={counts.active.toLocaleString()} active={status === 'active'} onClick={() => setStatus(status === 'active' ? 'all' : 'active')} />
          <StatCard Icon={ClipboardCheck} tone="amber" label="Due for Renewal" value={counts.due.toLocaleString()} active={status === 'renewal_due'} onClick={() => setStatus(status === 'renewal_due' ? 'all' : 'renewal_due')} />
          <StatCard Icon={AlertTriangle} tone="red" label="At Risk (GWA)" value={counts.atRisk.toLocaleString()} active={status === 'at_risk'} onClick={() => setStatus(status === 'at_risk' ? 'all' : 'at_risk')} />
          <StatCard Icon={GraduationCap} tone="muted" label="Terminated" value={counts.terminated.toLocaleString()} active={status === 'terminated'} onClick={() => setStatus(status === 'terminated' ? 'all' : 'terminated')} />
        </div>
      )}

      {/* Table */}
      <div className="bg-surface border border-border rounded-xl shadow-card overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or ID…"
              className="w-full text-sm pl-9 pr-3 py-2 rounded-lg border border-border bg-surface-alt focus:outline-none focus:border-primary" />
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="text-sm border border-border rounded-lg px-3 py-2 bg-surface text-content focus:outline-none focus:border-primary">
              <option value="all">All Statuses</option>
              {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select value={program} onChange={(e) => setProgram(e.target.value)} className="text-sm border border-border rounded-lg px-3 py-2 bg-surface text-content focus:outline-none focus:border-primary">
              <option value="all">All Programs</option>
              {programs.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <select value={year} onChange={(e) => setYear(e.target.value)} className="text-sm border border-border rounded-lg px-3 py-2 bg-surface text-content focus:outline-none focus:border-primary">
              <option value="all">All A.Y.</option>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            {hasFilters && (
              <button onClick={clearFilters} className="inline-flex items-center gap-1.5 text-xs font-medium text-content-muted hover:text-danger transition-colors">
                <X size={13} /> Clear
              </button>
            )}
          </div>
        </div>

        {isPending ? (
          <div className="p-5 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="flex-1 space-y-2"><Skeleton className="h-3 w-40" /><Skeleton className="h-3 w-24" /></div>
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
            ))}
          </div>
        ) : total > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  {table.getHeaderGroups().map((hg) => (
                    <tr key={hg.id} className="border-b border-border bg-surface-alt/60">
                      {hg.headers.map((header) => (
                        <th key={header.id} className="px-5 py-3 text-left">
                          <button onClick={header.column.getToggleSortingHandler()}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-content-muted uppercase tracking-wide hover:text-content transition-colors">
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            <SortIcon dir={header.column.getIsSorted()} />
                          </button>
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map((row) => (
                    <tr key={row.id}
                      onClick={() => navigate(`/admin/scholars/renewals?scholar=${row.original.id}`)}
                      className="border-b border-border last:border-0 hover:bg-surface-alt cursor-pointer transition-colors">
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-5 py-3.5">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-5 py-3 border-t border-border flex items-center justify-between gap-3 flex-wrap">
              <p className="text-xs text-content-muted">
                Showing <span className="font-semibold text-content">{pageIndex * pageSize + 1}</span>–
                <span className="font-semibold text-content">{Math.min((pageIndex + 1) * pageSize, total)}</span> of{' '}
                <span className="font-semibold text-content">{total.toLocaleString()}</span> scholars
              </p>
              <div className="flex items-center gap-2">
                <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}
                  className="p-2 border border-border rounded-lg text-content-muted hover:bg-surface-alt disabled:opacity-40 disabled:cursor-not-allowed" aria-label="Previous page"><ChevronLeft size={15} /></button>
                <span className="text-xs text-content-muted px-2">Page {pageIndex + 1} of {table.getPageCount()}</span>
                <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}
                  className="p-2 border border-border rounded-lg text-content-muted hover:bg-surface-alt disabled:opacity-40 disabled:cursor-not-allowed" aria-label="Next page"><ChevronRight size={15} /></button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <Users size={32} className="text-content-disabled" />
            <p className="text-sm font-semibold text-content">{hasFilters ? 'No scholars match your filters.' : 'No scholars yet.'}</p>
            {hasFilters
              ? <button onClick={clearFilters} className="text-sm text-primary hover:underline">Clear filters</button>
              : <p className="text-xs text-content-muted max-w-xs">Scholars appear here automatically once an application is approved.</p>}
          </div>
        )}
      </div>
    </div>
  )
}
