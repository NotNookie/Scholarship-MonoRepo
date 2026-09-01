import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts'
import {
  Download,
  FileSpreadsheet,
  FileText,
  Users,
  BadgeCheck,
  XCircle,
  Banknote,
  TrendingUp,
  BarChart3,
} from 'lucide-react'
import { api } from '../../lib/axios'
import { queryKeys } from '../../lib/queryKeys'
import { Skeleton } from '../../components/shared/Skeleton'
import { downloadCsv, downloadPdf } from '../../lib/reportExport'
import { useBrand } from '../../tenant/TenantContext'
import { APPLICATION_STATUS } from '../../components/shared/statusConfig'

// ── Helpers ───────────────────────────────────────────────────

function applicantName(a) {
  return a.applicant_name ?? ([a.first_name, a.last_name].filter(Boolean).join(' ') || 'Unnamed Applicant')
}
function formatDate(v) {
  if (!v) return ''
  return new Date(v).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
}
function peso(v) {
  return v != null ? `PHP ${Number(v).toLocaleString()}` : ''
}
function statusLabel(s) {
  return APPLICATION_STATUS[s]?.label ?? s ?? ''
}

// ── Report definitions ────────────────────────────────────────

const REPORTS = [
  {
    key: 'applicants',
    Icon: Users,
    title: 'Applicant List',
    description: 'All applications with status, program, and submission date.',
    columns: ['Applicant', 'Application ID', 'Program', 'Status', 'Submitted'],
    rows: (apps) => apps.map((a) => [applicantName(a), a.reference_no ?? a.id, a.scholarship_name ?? '', statusLabel(a.status), formatDate(a.submitted_at ?? a.created_at)]),
  },
  {
    key: 'approved',
    Icon: BadgeCheck,
    title: 'Approved Scholars',
    description: 'Everyone who passed final evaluation.',
    columns: ['Scholar', 'Application ID', 'Program', 'Grant', 'Approved'],
    rows: (apps) => apps.filter((a) => a.status === 'approved').map((a) => [applicantName(a), a.reference_no ?? a.id, a.scholarship_name ?? '', peso(a.grant_amount), formatDate(a.decided_at ?? a.updated_at)]),
  },
  {
    key: 'rejected',
    Icon: XCircle,
    title: 'Rejected + Incomplete',
    description: 'Not-approved and incomplete-requirement applicants.',
    columns: ['Applicant', 'Application ID', 'Program', 'Status', 'Remarks'],
    rows: (apps) => apps.filter((a) => a.status === 'rejected' || a.status === 'incomplete').map((a) => [applicantName(a), a.reference_no ?? a.id, a.scholarship_name ?? '', statusLabel(a.status), a.decision_remarks ?? '']),
  },
  {
    key: 'payout',
    Icon: Banknote,
    title: 'Payout List',
    description: 'Disbursement ledger for approved scholars.',
    note: 'Disbursement tracking is not yet available — this lists approved grants.',
    columns: ['Scholar', 'Application ID', 'Program', 'Grant', 'Status'],
    rows: (apps) => apps.filter((a) => a.status === 'approved').map((a) => [applicantName(a), a.reference_no ?? a.id, a.scholarship_name ?? '', peso(a.grant_amount), 'Pending release']),
  },
]

// ── Chart cards ───────────────────────────────────────────────

function ChartCard({ title, subtitle, Icon, children, empty }) {
  return (
    <section className="bg-surface border border-border rounded-xl shadow-card p-6">
      <div className="flex items-center gap-2 mb-1">
        <Icon size={16} className="text-primary" />
        <h2 className="text-base font-bold text-content">{title}</h2>
      </div>
      <p className="text-xs text-content-muted mb-4">{subtitle}</p>
      {empty ? (
        <div className="h-55 flex flex-col items-center justify-center text-center gap-2 text-content-muted">
          <BarChart3 size={26} className="text-content-disabled" />
          <p className="text-sm">No data to chart yet.</p>
        </div>
      ) : children}
    </section>
  )
}

// ── Main ──────────────────────────────────────────────────────

export function ReportsPage() {
  const brand = useBrand()
  const { data, isPending } = useQuery({
    queryKey: queryKeys.adminApplications.list({ report: true }),
    queryFn: () => api.get('/admin/applications?per_page=1000').then((r) => r.data),
    retry: false,
  })

  const apps = useMemo(() => data?.data ?? [], [data])

  // Application success (status colors — labels always shown, so identity is not colour-alone)
  const approved = apps.filter((a) => a.status === 'approved').length
  const rejected = apps.filter((a) => a.status === 'rejected').length
  const successTotal = approved + rejected
  const successData = [
    { name: 'Approved', value: approved, color: 'var(--color-tertiary)' },
    { name: 'Rejected', value: rejected, color: 'var(--color-danger)' },
  ]

  // Applicants per program (single categorical series → primary blue, no legend needed)
  const programData = useMemo(() => {
    const map = new Map()
    apps.forEach((a) => {
      const k = a.scholarship_name ?? 'Unspecified'
      map.set(k, (map.get(k) ?? 0) + 1)
    })
    return Array.from(map, ([name, count]) => ({ name, count }))
  }, [apps])

  const axisTick = { fill: 'var(--color-content-muted)', fontSize: 11 }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-content">Reports &amp; Analytics</h1>
          <p className="text-sm text-content-muted mt-1">Data insights and exportable reports for the current application cycle.</p>
        </div>
        <button
          onClick={() => downloadCsv('master-applicant-data', REPORTS[0].columns, REPORTS[0].rows(apps))}
          disabled={apps.length === 0}
          className="inline-flex items-center gap-2 bg-primary text-on-primary text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 shrink-0"
        >
          <Download size={15} /> Export Master Data
        </button>
      </div>

      {/* Charts */}
      {isPending ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-72 w-full rounded-xl" />
          <Skeleton className="h-72 w-full rounded-xl" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Application success donut */}
            <ChartCard title="Application Success" subtitle="Approved vs. rejected outcomes" Icon={BadgeCheck} empty={successTotal === 0}>
              <div className="flex items-center gap-6">
                <ResponsiveContainer width="55%" height={200}>
                  <PieChart>
                    <Pie data={successData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={2} strokeWidth={0}>
                      {successData.map((d) => <Cell key={d.name} fill={d.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                {/* Direct labels + legend (identity never colour-alone) */}
                <div className="flex flex-col gap-3">
                  {successData.map((d) => (
                    <div key={d.name} className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: d.color }} />
                      <div>
                        <p className="text-sm font-semibold text-content">
                          {successTotal ? Math.round((d.value / successTotal) * 100) : 0}%
                        </p>
                        <p className="text-xs text-content-muted">{d.name} ({d.value})</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ChartCard>

            {/* Applicants per program */}
            <ChartCard title="Applicants by Program" subtitle="Total applications per scholarship program" Icon={BarChart3} empty={programData.length === 0}>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={programData} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                  <XAxis dataKey="name" tick={axisTick} tickLine={false} axisLine={{ stroke: 'var(--color-border)' }} />
                  <YAxis allowDecimals={false} tick={axisTick} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: 'var(--color-surface-alt)' }} />
                  <Bar dataKey="count" name="Applicants" fill="var(--color-primary)" radius={[4, 4, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Disbursement trends (placeholder until disbursement data exists) */}
          <ChartCard title="Financial Disbursement Trends" subtitle="Projected budget vs. actual disbursements" Icon={TrendingUp} empty>
            <div />
          </ChartCard>
        </>
      )}

      {/* Generate reports */}
      <section>
        <h2 className="text-base font-bold text-content mb-4">Generate Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {REPORTS.map((r) => {
            const rows = isPending ? [] : r.rows(apps)
            return (
              <div key={r.key} className="bg-surface border border-border rounded-xl shadow-card p-6 flex flex-col">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center shrink-0">
                    <r.Icon size={18} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-content">{r.title}</h3>
                    <p className="text-xs text-content-muted mt-0.5 leading-relaxed">{r.description}</p>
                  </div>
                  <span className="text-xs text-content-muted shrink-0">{rows.length} rows</span>
                </div>
                {r.note && <p className="text-xs text-on-secondary bg-secondary-light border border-secondary/30 rounded-lg px-3 py-2 mt-3">{r.note}</p>}
                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border">
                  <button
                    onClick={() => downloadPdf(r.title, r.columns, r.rows(apps), `${brand.program} — Generated ${new Date().toLocaleString('en-PH')}`)}
                    disabled={isPending}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-content-muted border border-border px-4 py-2 rounded-lg hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
                  >
                    <FileText size={14} /> PDF
                  </button>
                  <button
                    onClick={() => downloadCsv(r.key, r.columns, r.rows(apps))}
                    disabled={isPending}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-content-muted border border-border px-4 py-2 rounded-lg hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
                  >
                    <FileSpreadsheet size={14} /> Excel
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
