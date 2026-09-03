import { useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table'
import {
  Search,
  Download,
  X,
  ChevronsUpDown,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Inbox,
} from 'lucide-react'
import { api } from '../../lib/axios'
import { queryKeys } from '../../lib/queryKeys'
import { Skeleton } from '../../components/shared/Skeleton'
import { StatusPill } from '../../components/shared/StatusPill'
import { APPLICATION_STATUS } from '../../components/shared/statusConfig'

// ── Helpers ───────────────────────────────────────────────────

const STATUS_OPTIONS = Object.entries(APPLICATION_STATUS)
  .filter(([key]) => key !== 'under_review') // internal alias; not a distinct filter
  .map(([key, cfg]) => ({ value: key, label: cfg.label }))

function initials(name) {
  if (!name) return '—'
  const parts = name.trim().split(/\s+/)
  return (parts.length >= 2 ? parts[0][0] + parts[parts.length - 1][0] : parts[0][0]).toUpperCase()
}

function applicantName(a) {
  return a.applicant_name ?? ([a.first_name, a.last_name].filter(Boolean).join(' ') || 'Unnamed Applicant')
}

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
}

function csvCell(v) {
  const s = String(v ?? '')
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

function exportCsv(rows) {
  const headers = ['Applicant', 'Email', 'Application ID', 'Category', 'Submission Date', 'Status']
  const body = rows.map((r) => [
    applicantName(r),
    r.email ?? '',
    r.reference_no ?? r.id ?? '',
    r.scholarship_name ?? '',
    formatDate(r.submitted_at ?? r.created_at),
    APPLICATION_STATUS[r.status]?.label ?? r.status ?? '',
  ])
  const csv = [headers, ...body].map((row) => row.map(csvCell).join(',')).join('\r\n')
  const blob = new Blob([String.fromCharCode(0xFEFF) + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `applicant-records-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

// ── Sort indicator ────────────────────────────────────────────

function SortIcon({ dir }) {
  if (dir === 'asc') return <ChevronUp size={13} />
  if (dir === 'desc') return <ChevronDown size={13} />
  return <ChevronsUpDown size={13} className="opacity-40" />
}

// ── Main ──────────────────────────────────────────────────────

export function ApplicantsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  // Honor ?status= from the dashboard stat cards so the list lands pre-filtered.
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState(searchParams.get('status') ?? 'all')
  const [category, setCategory] = useState('all')
  const [year, setYear] = useState('all')
  const [sorting, setSorting] = useState([{ id: 'submitted', desc: true }])
  const [selected, setSelected] = useState(() => new Set())

  const { data, isPending } = useQuery({
    queryKey: queryKeys.adminApplicants.list({}),
    queryFn: () => api.get('/admin/applicants').then((r) => r.data),
    retry: false,
  })

  const records = useMemo(() => data?.data ?? [], [data])

  const categories = useMemo(
    () => Array.from(new Set(records.map((r) => r.scholarship_name).filter(Boolean))),
    [records],
  )
  const years = useMemo(
    () => Array.from(new Set(records.map((r) => r.academic_year).filter(Boolean))).sort().reverse(),
    [records],
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return records.filter((r) => {
      const matchSearch =
        !q ||
        applicantName(r).toLowerCase().includes(q) ||
        String(r.reference_no ?? r.id ?? '').toLowerCase().includes(q) ||
        String(r.email ?? '').toLowerCase().includes(q)
      const matchStatus = status === 'all' || r.status === status
      const matchCategory = category === 'all' || r.scholarship_name === category
      const matchYear = year === 'all' || r.academic_year === year
      return matchSearch && matchStatus && matchCategory && matchYear
    })
  }, [records, search, status, category, year])

  const toggleOne = (id) => setSelected((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n })
  const allSelected = filtered.length > 0 && filtered.every((r) => selected.has(r.id))
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(filtered.map((r) => r.id)))
  const selectedRows = filtered.filter((r) => selected.has(r.id))

  const columns = useMemo(
    () => [
      {
        id: 'select',
        enableSorting: false,
        header: () => (
          <input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Select all rows" className="w-4 h-4 accent-primary align-middle" />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={selected.has(row.original.id)}
            onChange={() => toggleOne(row.original.id)}
            onClick={(e) => e.stopPropagation()}
            aria-label={`Select ${applicantName(row.original)}`}
            className="w-4 h-4 accent-primary align-middle"
          />
        ),
      },
      {
        id: 'applicant',
        header: 'Applicant Name',
        accessorFn: (r) => applicantName(r),
        cell: ({ row }) => {
          const name = applicantName(row.original)
          return (
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-primary-light text-primary text-xs font-bold flex items-center justify-center shrink-0">
                {initials(name)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-content truncate">{name}</p>
                <p className="text-xs text-content-muted truncate">{row.original.email ?? '—'}</p>
              </div>
            </div>
          )
        },
      },
      {
        id: 'ref',
        header: 'Application ID',
        accessorFn: (r) => r.reference_no ?? r.id ?? '',
        cell: (info) => <span className="text-sm text-content-muted font-mono">{info.getValue() || '—'}</span>,
      },
      {
        id: 'category',
        header: 'Category',
        accessorFn: (r) => r.scholarship_name ?? '',
        cell: (info) => <span className="text-sm text-content">{info.getValue() || '—'}</span>,
      },
      {
        id: 'submitted',
        header: 'Submission Date',
        accessorFn: (r) => r.submitted_at ?? r.created_at ?? '',
        cell: (info) => <span className="text-sm text-content-muted whitespace-nowrap">{formatDate(info.getValue())}</span>,
      },
      {
        id: 'status',
        header: 'Status',
        accessorFn: (r) => r.status,
        cell: ({ row }) => <StatusPill status={row.original.status} size="sm" />,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selected, allSelected, filtered],
  )

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

  const hasFilters = search || status !== 'all' || category !== 'all' || year !== 'all'
  const pageRows = table.getRowModel().rows
  const totalRows = filtered.length
  const { pageIndex, pageSize } = table.getState().pagination
  const firstRow = totalRows === 0 ? 0 : pageIndex * pageSize + 1
  const lastRow = Math.min((pageIndex + 1) * pageSize, totalRows)

  function clearFilters() {
    setSearch('')
    setStatus('all')
    setCategory('all')
    setYear('all')
  }

  return (
    <div className="flex flex-col gap-6">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-content">Applicant Records</h1>
          <p className="text-sm text-content-muted mt-1">
            Manage, filter, and review all incoming scholarship applications.
          </p>
        </div>
        <button
          onClick={() => exportCsv(selectedRows.length ? selectedRows : filtered)}
          disabled={filtered.length === 0}
          className="inline-flex items-center gap-2 bg-primary text-on-primary text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          <Download size={15} /> {selectedRows.length ? `Export selected (${selectedRows.length})` : 'Export Records'}
        </button>
      </div>

      {/* ── Table card ─────────────────────────────────────────── */}
      <div className="bg-surface border border-border rounded-xl shadow-card overflow-hidden">

        {/* Filter bar */}
        <div className="p-4 border-b border-border flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, ID, or email…"
              className="w-full text-sm pl-9 pr-3 py-2 rounded-lg border border-border bg-surface-alt focus:outline-none focus:border-primary"
            />
          </div>
          <div className="flex items-center gap-3">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="text-sm border border-border rounded-lg px-3 py-2 bg-surface text-content focus:outline-none focus:border-primary"
            >
              <option value="all">All Statuses</option>
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="text-sm border border-border rounded-lg px-3 py-2 bg-surface text-content focus:outline-none focus:border-primary"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              aria-label="Filter by school year"
              className="text-sm border border-border rounded-lg px-3 py-2 bg-surface text-content focus:outline-none focus:border-primary"
            >
              <option value="all">All School Years</option>
              {years.map((y) => (
                <option key={y} value={y}>A.Y. {y}</option>
              ))}
            </select>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-content-muted hover:text-danger transition-colors shrink-0"
              >
                <X size={13} /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Table */}
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
        ) : totalRows > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  {table.getHeaderGroups().map((hg) => (
                    <tr key={hg.id} className="border-b border-border bg-surface-alt/60">
                      {hg.headers.map((header) => (
                        <th key={header.id} className="px-5 py-3 text-left">
                          <button
                            onClick={header.column.getToggleSortingHandler()}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-content-muted uppercase tracking-wide hover:text-content transition-colors"
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            <SortIcon dir={header.column.getIsSorted()} />
                          </button>
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {pageRows.map((row) => (
                    <tr
                      key={row.id}
                      onClick={() => navigate('/admin/applications')}
                      className="border-b border-border last:border-0 hover:bg-surface-alt cursor-pointer transition-colors"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-5 py-3.5">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-5 py-3 border-t border-border flex items-center justify-between gap-3 flex-wrap">
              <p className="text-xs text-content-muted">
                Showing <span className="font-semibold text-content">{firstRow}</span>–
                <span className="font-semibold text-content">{lastRow}</span> of{' '}
                <span className="font-semibold text-content">{totalRows.toLocaleString()}</span> results
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="p-2 border border-border rounded-lg text-content-muted hover:bg-surface-alt disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={15} />
                </button>
                <span className="text-xs text-content-muted px-2">
                  Page {pageIndex + 1} of {table.getPageCount()}
                </span>
                <button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="p-2 border border-border rounded-lg text-content-muted hover:bg-surface-alt disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Next page"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <Inbox size={32} className="text-content-disabled" />
            <p className="text-sm font-semibold text-content">
              {hasFilters ? 'No applicants match your filters.' : 'No applicant records yet.'}
            </p>
            {hasFilters && (
              <button onClick={clearFilters} className="text-sm text-primary hover:underline">
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
