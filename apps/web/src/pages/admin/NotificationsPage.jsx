import { useState, useMemo, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Megaphone, Send, Plus, PencilLine, Trash2, X, Loader2, CheckCheck, AlertCircle,
  FileText, Bell,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../../lib/axios'
import { queryKeys } from '../../lib/queryKeys'
import { Skeleton } from '../../components/shared/Skeleton'

const STATUS_AUDIENCES = [
  { value: 'status:submitted', label: 'Pending Review' },
  { value: 'status:approved', label: 'Approved' },
  { value: 'status:incomplete', label: 'Incomplete' },
  { value: 'status:rejected', label: 'Not Approved' },
]

const TEMPLATE_TRIGGERS = [
  'Application Received', 'Document Rejected', 'Application Approved',
  'Marked Incomplete', 'Renewal Reminder', 'Appeal Decision', 'Custom',
]

const VARIABLES = ['{{first_name}}', '{{last_name}}', '{{application_id}}', '{{status}}', '{{program}}', '{{doc_type}}', '{{deadline}}']

const inputCls = 'w-full text-sm px-3 py-2.5 rounded-lg border border-border bg-surface focus:outline-none focus:border-primary'

function initials(name) {
  if (!name) return '—'
  const p = String(name).trim().split(/\s+/)
  return (p.length >= 2 ? p[0][0] + p[p.length - 1][0] : p[0][0]).toUpperCase()
}
function fmtDateTime(v) {
  if (!v) return '—'
  return new Date(v).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

// ── Template modal ────────────────────────────────────────────

function TemplateModal({ template, isPending, onClose, onSubmit }) {
  const editing = !!template?.id
  const bodyRef = useRef(null)
  const [form, setForm] = useState({
    name: template?.name ?? '',
    trigger: template?.trigger ?? 'Custom',
    body: template?.body ?? '',
    status: template?.status ?? 'draft',
  })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const canSave = form.name.trim() && form.body.trim()

  function insertVar(v) {
    const el = bodyRef.current
    const start = el?.selectionStart ?? form.body.length
    const next = form.body.slice(0, start) + v + form.body.slice(el?.selectionEnd ?? start)
    setForm((f) => ({ ...f, body: next }))
    requestAnimationFrame(() => { el?.focus(); el?.setSelectionRange(start + v.length, start + v.length) })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-surface rounded-xl shadow-modal w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between shrink-0">
          <h3 className="text-base font-bold text-content">{editing ? 'Edit Template' : 'New Template'}</h3>
          <button onClick={onClose} className="text-content-muted hover:text-content" aria-label="Close"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-auto p-6 flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="t-name" className="text-sm font-medium text-content">Template Name</label>
              <input id="t-name" value={form.name} onChange={set('name')} placeholder="e.g. Application Received" className={inputCls} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="t-trigger" className="text-sm font-medium text-content">Trigger Event</label>
              <select id="t-trigger" value={form.trigger} onChange={set('trigger')} className={inputCls}>
                {TEMPLATE_TRIGGERS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="t-body" className="text-sm font-medium text-content">Message Body</label>
            <textarea id="t-body" ref={bodyRef} rows={5} value={form.body} onChange={set('body')}
              placeholder="Dear {{first_name}}, we have received your application…" className={`${inputCls} resize-y`} />
            <div className="flex flex-wrap gap-1.5 mt-1">
              {VARIABLES.map((v) => (
                <button key={v} type="button" onClick={() => insertVar(v)}
                  className="text-xs font-mono px-2 py-1 rounded bg-primary-light text-primary hover:bg-primary hover:text-on-primary transition-colors">
                  {v}
                </button>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2.5 text-sm text-content cursor-pointer">
            <input type="checkbox" checked={form.status === 'active'} onChange={(e) => setForm((f) => ({ ...f, status: e.target.checked ? 'active' : 'draft' }))}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
            Active — automatically send on this trigger
          </label>
        </div>
        <div className="px-6 py-4 bg-surface-alt border-t border-border flex items-center justify-end gap-3 shrink-0">
          <button onClick={onClose} className="text-sm font-medium text-content-muted px-4 py-2 rounded-lg hover:text-content transition-colors">Cancel</button>
          <button disabled={!canSave || isPending} onClick={() => onSubmit(form)}
            className="inline-flex items-center gap-2 bg-primary text-on-primary text-sm font-semibold px-5 py-2 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50">
            {isPending && <Loader2 size={15} className="animate-spin" />}
            {editing ? 'Save Changes' : 'Create Template'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────

export function NotificationsPage() {
  const queryClient = useQueryClient()
  const [audience, setAudience] = useState('all_applicants')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [templateModal, setTemplateModal] = useState(null)
  const [showAllLogs, setShowAllLogs] = useState(false)

  const templatesQuery = useQuery({
    queryKey: ['admin', 'notification-templates'],
    queryFn: () => api.get('/admin/notification-templates').then((r) => r.data),
    retry: false,
  })
  const logQuery = useQuery({
    queryKey: ['admin', 'notification-log'],
    queryFn: () => api.get('/admin/notifications/log').then((r) => r.data),
    retry: false,
  })
  const policiesQuery = useQuery({
    queryKey: [...queryKeys.maintenance.all, 'policies'],
    queryFn: () => api.get('/admin/maintenance/policies').then((r) => r.data),
    retry: false,
  })

  const templates = useMemo(() => templatesQuery.data?.data ?? [], [templatesQuery.data])
  const logs = useMemo(() => logQuery.data?.data ?? [], [logQuery.data])
  const programs = useMemo(() => (policiesQuery.data?.data ?? []).map((p) => p.name).filter(Boolean), [policiesQuery.data])

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'notification-templates'] })
    queryClient.invalidateQueries({ queryKey: ['admin', 'notification-log'] })
  }

  const broadcast = useMutation({
    mutationFn: (payload) => api.post('/admin/notifications/broadcast', payload),
    onSuccess: () => { toast.success('Broadcast sent.'); setSubject(''); setMessage(''); invalidate() },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Could not send broadcast.'),
  })
  const saveTemplate = useMutation({
    mutationFn: (p) => (p.id ? api.put(`/admin/notification-templates/${p.id}`, p) : api.post('/admin/notification-templates', p)),
    onSuccess: () => { toast.success('Template saved.'); invalidate(); setTemplateModal(null) },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Could not save template.'),
  })
  const deleteTemplate = useMutation({
    mutationFn: (t) => api.delete(`/admin/notification-templates/${t.id}`),
    onSuccess: () => { toast.success('Template deleted.'); invalidate() },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Could not delete.'),
  })

  const canSend = subject.trim() && message.trim()
  const shownLogs = showAllLogs ? logs : logs.slice(0, 5)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-content">Notification Management</h1>
        <p className="text-sm text-content-muted mt-1">Manage automated alerts, send in-app broadcasts, and review the delivery log.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Broadcast ────────────────────────────────────────── */}
        <section className="bg-surface border border-border rounded-xl shadow-card p-6 flex flex-col gap-5 self-start">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary-light flex items-center justify-center"><Megaphone size={17} className="text-primary" /></div>
            <h2 className="text-base font-bold text-content">Broadcast</h2>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="b-audience" className="text-sm font-medium text-content">Audience</label>
            <select id="b-audience" value={audience} onChange={(e) => setAudience(e.target.value)} className={inputCls}>
              <optgroup label="General">
                <option value="all_applicants">All Applicants</option>
                <option value="active_scholars">Active Scholars</option>
              </optgroup>
              <optgroup label="By Status">
                {STATUS_AUDIENCES.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
              </optgroup>
              {programs.length > 0 && (
                <optgroup label="By Program">
                  {programs.map((p) => <option key={p} value={`program:${p}`}>{p}</option>)}
                </optgroup>
              )}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="b-subject" className="text-sm font-medium text-content">Subject</label>
            <input id="b-subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Deadline Extension" className={inputCls} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="b-message" className="text-sm font-medium text-content">Message</label>
            <textarea id="b-message" rows={7} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type your broadcast message here…" className={`${inputCls} resize-y`} />
          </div>

          <button onClick={() => broadcast.mutate({ audience, subject, message })} disabled={!canSend || broadcast.isPending}
            className="inline-flex items-center justify-center gap-2 bg-primary text-on-primary text-sm font-semibold py-2.5 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {broadcast.isPending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />} Send Broadcast
          </button>
        </section>

        {/* ── Templates + Log ──────────────────────────────────── */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* Templates */}
          <section className="bg-surface border border-border rounded-xl shadow-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-content">Automated Templates</h2>
              <button onClick={() => setTemplateModal({})} className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                <Plus size={14} /> New Template
              </button>
            </div>
            {templatesQuery.isPending ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{[1, 2].map((i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}</div>
            ) : templates.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {templates.map((t) => (
                  <div key={t.id} className={`border-l-4 rounded-lg border border-border p-4 ${t.status === 'active' ? 'border-l-tertiary' : 'border-l-border'}`}>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <p className="text-sm font-bold text-content truncate">{t.name}</p>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${t.status === 'active' ? 'bg-tertiary-light text-tertiary-dark' : 'bg-surface-alt text-content-muted'}`}>
                        {t.status === 'active' ? 'Active' : 'Draft'}
                      </span>
                    </div>
                    <p className="text-xs text-content-muted line-clamp-2 leading-relaxed">{t.body}</p>
                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border">
                      <button onClick={() => setTemplateModal(t)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-content-muted hover:text-primary transition-colors">
                        <PencilLine size={13} /> Edit
                      </button>
                      <button onClick={() => deleteTemplate.mutate(t)} className="ml-auto text-content-muted hover:text-danger transition-colors" aria-label="Delete template"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-10 text-center">
                <FileText size={26} className="text-content-disabled" />
                <p className="text-sm text-content-muted">No templates yet.</p>
                <button onClick={() => setTemplateModal({})} className="text-sm text-primary hover:underline">Create one</button>
              </div>
            )}
          </section>

          {/* Communication log */}
          <section className="bg-surface border border-border rounded-xl shadow-card overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="text-base font-bold text-content">Communication Log</h2>
              <p className="text-xs text-content-muted mt-0.5">Recent automated and manual notices sent.</p>
            </div>
            {logQuery.isPending ? (
              <div className="p-5 space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}</div>
            ) : logs.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-surface-alt/60 text-left text-xs font-semibold text-content-muted uppercase tracking-wide">
                        <th className="px-6 py-3">Recipient</th>
                        <th className="px-6 py-3">Type</th>
                        <th className="px-6 py-3">Subject</th>
                        <th className="px-6 py-3">Date / Time</th>
                        <th className="px-6 py-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shownLogs.map((l) => {
                        const failed = l.status === 'failed'
                        return (
                          <tr key={l.id} className="border-b border-border last:border-0">
                            <td className="px-6 py-3.5">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-8 h-8 rounded-full bg-primary-light text-primary text-xs font-bold flex items-center justify-center shrink-0">{initials(l.recipient_name)}</div>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-content truncate">{l.recipient_name ?? l.audience_label ?? '—'}</p>
                                  <p className="text-xs text-content-muted truncate">{l.recipient_id ?? (l.recipients ? `${l.recipients} recipients` : '')}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-3.5">
                              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${l.type === 'manual' ? 'bg-primary-light text-primary' : 'bg-surface-alt text-content-muted'}`}>
                                {l.type === 'manual' ? 'Manual Broadcast' : `Auto: ${l.trigger ?? 'System'}`}
                              </span>
                            </td>
                            <td className="px-6 py-3.5"><p className="text-sm text-content truncate max-w-[16rem]">{l.subject}</p></td>
                            <td className="px-6 py-3.5 text-xs text-content-muted whitespace-nowrap">{fmtDateTime(l.created_at)}</td>
                            <td className="px-6 py-3.5 text-right">
                              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${failed ? 'text-danger' : 'text-tertiary-dark'}`}>
                                {failed ? <AlertCircle size={13} /> : <CheckCheck size={13} />}
                                {failed ? 'Failed' : l.delivered_pct != null && l.delivered_pct < 100 ? `${l.delivered_pct}% Delivered` : 'Delivered'}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                {logs.length > 5 && (
                  <div className="px-6 py-3 border-t border-border text-center">
                    <button onClick={() => setShowAllLogs((v) => !v)} className="text-sm font-semibold text-primary hover:underline">
                      {showAllLogs ? 'Show less' : 'View All Logs'}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 py-12 text-center">
                <Bell size={26} className="text-content-disabled" />
                <p className="text-sm text-content-muted">No notices sent yet.</p>
              </div>
            )}
          </section>
        </div>
      </div>

      {templateModal && (
        <TemplateModal
          template={templateModal.id ? templateModal : null}
          isPending={saveTemplate.isPending}
          onClose={() => setTemplateModal(null)}
          onSubmit={(form) => saveTemplate.mutate(templateModal.id ? { ...templateModal, ...form } : form)}
        />
      )}
    </div>
  )
}
