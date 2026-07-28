import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Search, UserPlus, PencilLine, Trash2, Power, X, Loader2, Users, ChevronLeft, ChevronRight, Check,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../../lib/axios'
import { Skeleton } from '../../components/shared/Skeleton'

// Internal role keys map to LYDO-facing labels (per mockup #12).
const ROLES = {
  super_admin: { label: 'Super Admin',    cls: 'bg-danger-light text-danger border-danger/30' },
  miso:        { label: 'MISO Lead',      cls: 'bg-primary-light text-primary border-primary/20' },
  admin:       { label: 'Staff Evaluator', cls: 'bg-surface-alt text-content-muted border-border' },
}
const ROLE_OPTIONS = Object.entries(ROLES).map(([value, cfg]) => ({ value, label: cfg.label }))
const PAGE_SIZE = 10

const inputCls = 'w-full text-sm px-3 py-2.5 rounded-lg border border-border bg-surface focus:outline-none focus:border-primary'

function initials(name) {
  if (!name) return '—'
  const p = String(name).trim().split(/\s+/)
  return (p.length >= 2 ? p[0][0] + p[p.length - 1][0] : p[0][0]).toUpperCase()
}
function lastActive(v) {
  if (!v) return 'Never'
  const d = new Date(v)
  const today = new Date()
  const sameDay = d.toDateString() === today.toDateString()
  if (sameDay) return `Today, ${d.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}`
  const yst = new Date(today); yst.setDate(today.getDate() - 1)
  if (d.toDateString() === yst.toDateString()) return `Yesterday, ${d.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}`
  return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
}

function RoleBadge({ role }) {
  const cfg = ROLES[role] ?? { label: role ?? '—', cls: 'bg-surface-alt text-content-muted border-border' }
  return <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.cls}`}>{cfg.label}</span>
}
function StatusPill({ status }) {
  const active = status !== 'inactive'
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${active ? 'bg-tertiary-light text-tertiary-dark' : 'bg-surface-alt text-content-muted'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-tertiary' : 'bg-content-disabled'}`} /> {active ? 'Active' : 'Inactive'}
    </span>
  )
}

// ── User modal ────────────────────────────────────────────────

function UserModal({ user, isPending, onClose, onSubmit }) {
  const editing = !!user?.id
  const [form, setForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    role: user?.role ?? 'admin',
    status: user?.status ?? 'active',
  })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const canSave = form.name.trim() && /.+@.+\..+/.test(form.email)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-surface rounded-xl shadow-modal w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 className="text-base font-bold text-content">{editing ? 'Edit User' : 'Add New User'}</h3>
          <button onClick={onClose} className="text-content-muted hover:text-content" aria-label="Close"><X size={18} /></button>
        </div>
        <div className="p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="u-name" className="text-sm font-medium text-content">Full Name</label>
            <input id="u-name" value={form.name} onChange={set('name')} placeholder="e.g. Juan Dela Cruz" className={inputCls} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="u-email" className="text-sm font-medium text-content">Email</label>
            <input id="u-email" type="email" value={form.email} onChange={set('email')} placeholder="name@stacruz.gov.ph" className={inputCls} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="u-role" className="text-sm font-medium text-content">Assigned Role</label>
            <select id="u-role" value={form.role} onChange={set('role')} className={inputCls}>
              {ROLE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <label className="flex items-center gap-2.5 text-sm text-content cursor-pointer">
            <input type="checkbox" checked={form.status === 'active'} onChange={(e) => setForm((f) => ({ ...f, status: e.target.checked ? 'active' : 'inactive' }))}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
            Account is active
          </label>
          {!editing && <p className="text-xs text-content-muted">An invitation with sign-in details will be emailed to this address.</p>}
        </div>
        <div className="px-6 py-4 bg-surface-alt border-t border-border flex items-center justify-end gap-3">
          <button onClick={onClose} className="text-sm font-medium text-content-muted px-4 py-2 rounded-lg hover:text-content transition-colors">Cancel</button>
          <button disabled={!canSave || isPending} onClick={() => onSubmit(form)}
            className="inline-flex items-center gap-2 bg-primary text-on-primary text-sm font-semibold px-5 py-2 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50">
            {isPending && <Loader2 size={15} className="animate-spin" />}
            {editing ? 'Save Changes' : 'Add User'}
          </button>
        </div>
      </div>
    </div>
  )
}

function DeleteModal({ user, isPending, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-surface rounded-xl shadow-modal w-full max-w-sm p-6">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-lg bg-danger-light text-danger flex items-center justify-center shrink-0"><Trash2 size={20} /></div>
          <div>
            <h3 className="text-base font-bold text-content">Remove user?</h3>
            <p className="text-xs text-content-muted mt-1 leading-relaxed">{user.name}'s account will be permanently removed and they'll lose portal access.</p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 mt-6">
          <button onClick={onClose} className="text-sm font-medium text-content-muted px-4 py-2 rounded-lg hover:text-content">Cancel</button>
          <button disabled={isPending} onClick={onConfirm} className="inline-flex items-center gap-2 bg-danger text-white text-sm font-semibold px-5 py-2 rounded-lg hover:opacity-90 disabled:opacity-50">
            {isPending && <Loader2 size={15} className="animate-spin" />} Remove
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────

export function UsersPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('all')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(0)
  const [modal, setModal] = useState(null)

  const { data, isPending } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => api.get('/admin/users').then((r) => r.data),
    retry: false,
  })

  const users = useMemo(() => data?.data ?? [], [data])
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })

  const saveMutation = useMutation({
    mutationFn: (p) => (p.id ? api.put(`/admin/users/${p.id}`, p) : api.post('/admin/users', p)),
    onSuccess: () => { toast.success('User saved.'); invalidate(); setModal(null) },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Could not save user.'),
  })
  const toggleMutation = useMutation({
    mutationFn: (u) => api.patch(`/admin/users/${u.id}`, { status: u.status === 'inactive' ? 'active' : 'inactive' }),
    onSuccess: (_r, u) => { toast.success(u.status === 'inactive' ? 'User activated.' : 'User deactivated.'); invalidate() },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Action failed.'),
  })
  const deleteMutation = useMutation({
    mutationFn: (u) => api.delete(`/admin/users/${u.id}`),
    onSuccess: () => { toast.success('User removed.'); invalidate(); setModal(null) },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Could not remove user.'),
  })

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return users.filter((u) => {
      const matchSearch = !q || (u.name ?? '').toLowerCase().includes(q) || (u.email ?? '').toLowerCase().includes(q)
      const matchRole = role === 'all' || u.role === role
      const matchStatus = status === 'all' || (status === 'active' ? u.status !== 'inactive' : u.status === 'inactive')
      return matchSearch && matchRole && matchStatus
    })
  }, [users, search, role, status])

  const hasFilters = search || role !== 'all' || status !== 'all'
  const total = filtered.length
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const safePage = Math.min(page, pageCount - 1)
  const pageRows = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE)

  function clearFilters() { setSearch(''); setRole('all'); setStatus('all'); setPage(0) }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-content">User Management</h1>
          <p className="text-sm text-content-muted mt-1">Manage LYDO staff accounts, system roles, and platform access.</p>
        </div>
        <button onClick={() => setModal({ mode: 'edit' })}
          className="inline-flex items-center gap-2 bg-primary text-on-primary text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-primary-dark transition-colors shrink-0">
          <UserPlus size={15} /> Add New User
        </button>
      </div>

      <div className="bg-surface border border-border rounded-xl shadow-card overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-border flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" />
            <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(0) }} placeholder="Search by name or email…"
              className="w-full text-sm pl-9 pr-3 py-2 rounded-lg border border-border bg-surface-alt focus:outline-none focus:border-primary" />
          </div>
          <div className="flex items-center gap-3">
            <select value={role} onChange={(e) => { setRole(e.target.value); setPage(0) }} className="text-sm border border-border rounded-lg px-3 py-2 bg-surface text-content focus:outline-none focus:border-primary">
              <option value="all">All Roles</option>
              {ROLE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(0) }} className="text-sm border border-border rounded-lg px-3 py-2 bg-surface text-content focus:outline-none focus:border-primary">
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            {hasFilters && (
              <button onClick={clearFilters} className="inline-flex items-center gap-1.5 text-xs font-medium text-content-muted hover:text-danger transition-colors">
                <X size={13} /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        {isPending ? (
          <div className="p-5 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="flex-1 space-y-2"><Skeleton className="h-3 w-40" /><Skeleton className="h-3 w-52" /></div>
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
                    <th className="px-5 py-3">User Details</th>
                    <th className="px-5 py-3">Assigned Role</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Last Active</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((u) => (
                    <tr key={u.id} className="border-b border-border last:border-0 hover:bg-surface-alt transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-primary-light text-primary text-xs font-bold flex items-center justify-center shrink-0">{initials(u.name)}</div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-content truncate">{u.name}</p>
                            <p className="text-xs text-content-muted truncate">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4"><RoleBadge role={u.role} /></td>
                      <td className="px-5 py-4"><StatusPill status={u.status} /></td>
                      <td className="px-5 py-4 text-sm text-content-muted whitespace-nowrap">{lastActive(u.last_active_at)}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setModal({ mode: 'edit', user: u })} className="p-1.5 text-content-muted hover:text-primary transition-colors" aria-label="Edit user"><PencilLine size={15} /></button>
                          <button onClick={() => toggleMutation.mutate(u)} className={`p-1.5 transition-colors ${u.status === 'inactive' ? 'text-content-muted hover:text-tertiary-dark' : 'text-content-muted hover:text-secondary'}`} aria-label={u.status === 'inactive' ? 'Activate user' : 'Deactivate user'}>
                            <Power size={15} />
                          </button>
                          <button onClick={() => setModal({ mode: 'delete', user: u })} className="p-1.5 text-content-muted hover:text-danger transition-colors" aria-label="Remove user"><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
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
            <Users size={32} className="text-content-disabled" />
            <p className="text-sm font-semibold text-content">{hasFilters ? 'No users match your filters.' : 'No staff accounts yet.'}</p>
            {hasFilters
              ? <button onClick={clearFilters} className="text-sm text-primary hover:underline">Clear filters</button>
              : <button onClick={() => setModal({ mode: 'edit' })} className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary"><Check size={14} /> Add the first user</button>}
          </div>
        )}
      </div>

      {modal?.mode === 'edit' && (
        <UserModal user={modal.user} isPending={saveMutation.isPending} onClose={() => setModal(null)}
          onSubmit={(form) => saveMutation.mutate(modal.user ? { ...modal.user, ...form } : form)} />
      )}
      {modal?.mode === 'delete' && (
        <DeleteModal user={modal.user} isPending={deleteMutation.isPending} onClose={() => setModal(null)} onConfirm={() => deleteMutation.mutate(modal.user)} />
      )}
    </div>
  )
}
