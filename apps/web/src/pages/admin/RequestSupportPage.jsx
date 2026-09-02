import { useState } from 'react'
import toast from 'react-hot-toast'
import {
  LifeBuoy, ShieldAlert, ShieldOff, ShieldCheck, Send, CheckCircle2,
  Paperclip, X, Pencil, Ban, MessageSquare, ChevronDown, FileText,
} from 'lucide-react'
import { usePlatformStore, SUPPORT_CATEGORIES } from '../../store/platformStore'
import { useBrand } from '../../tenant/TenantContext'
import { useDialog } from '../../lib/useDialog'

const inputCls = 'w-full text-sm px-3 py-2.5 rounded-lg border border-border bg-surface focus:outline-none focus:border-primary'

function formatDate(v) {
  if (!v || v === 'Just now') return v || '—'
  return new Date(v).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
}
function formatSize(bytes) {
  if (bytes == null) return ''
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`
  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}

const STATUS_META = {
  open: { label: 'Open', cls: 'bg-primary-light text-primary' },
  resolved: { label: 'Resolved', cls: 'bg-tertiary-light text-tertiary-dark' },
  cancelled: { label: 'Cancelled', cls: 'bg-surface-alt text-content-muted border border-border' },
}

// ── Cancel-confirm modal ──────────────────────────────────────
function CancelModal({ ticket, onClose, onConfirm }) {
  const ref = useDialog(onClose)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby="cancel-req-title" className="relative bg-surface rounded-xl shadow-modal w-full max-w-sm p-6">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-lg bg-danger-light text-danger flex items-center justify-center shrink-0"><Ban size={20} /></div>
          <div>
            <h3 id="cancel-req-title" className="text-base font-bold text-content">Cancel this request?</h3>
            <p className="text-xs text-content-muted mt-1 leading-relaxed">
              &ldquo;{ticket.subject}&rdquo; will be withdrawn and any platform access it granted ends immediately. You can always file a new one.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 mt-6">
          <button onClick={onClose} className="text-sm font-medium text-content-muted px-4 py-2 rounded-lg hover:text-content transition-colors">Keep it</button>
          <button onClick={onConfirm} className="text-sm font-semibold bg-danger text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">Cancel request</button>
        </div>
      </div>
    </div>
  )
}

// ── One request card (expandable, editable, threaded) ─────────
function TicketCard({ ticket, onRevoke, onGrant, onEdit, onCancel, onReply }) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [reply, setReply] = useState('')
  const [fields, setFields] = useState({ subject: ticket.subject, message: ticket.message, category: ticket.category })

  const isOpen = ticket.status === 'open'
  const granting = isOpen && ticket.grantsAccess
  const meta = STATUS_META[ticket.status] ?? STATUS_META.open
  const thread = ticket.messages ?? []

  function saveEdit() {
    if (!fields.subject.trim()) return
    onEdit(ticket.id, { subject: fields.subject.trim(), message: fields.message.trim(), category: fields.category })
    setEditing(false)
    toast.success('Request updated.')
  }
  function sendReply() {
    if (!reply.trim()) return
    onReply(ticket.id, reply.trim())
    setReply('')
  }

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-content">{ticket.subject}</p>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-surface-alt text-content-muted border border-border">{ticket.category ?? 'Other'}</span>
            {granting && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-warning-light text-warning border border-warning/30">
                <ShieldAlert size={11} /> Access granted
              </span>
            )}
          </div>
          <p className="text-xs text-content-disabled mt-1">
            Sent {formatDate(ticket.opened)} · {ticket.requester}
            {(thread.length > 0 || (ticket.attachments?.length ?? 0) > 0) && (
              <> · {thread.length > 0 && <>{thread.length} repl{thread.length === 1 ? 'y' : 'ies'}</>}
              {thread.length > 0 && (ticket.attachments?.length ?? 0) > 0 && ', '}
              {(ticket.attachments?.length ?? 0) > 0 && <>{ticket.attachments.length} file{ticket.attachments.length === 1 ? '' : 's'}</>}</>
            )}
          </p>
        </div>
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${meta.cls}`}>
          {ticket.status === 'resolved' && <CheckCircle2 size={12} />}
          {meta.label}
        </span>
        <button
          onClick={() => setOpen((v) => !v)}
          className="shrink-0 text-content-muted hover:text-content transition-colors p-1"
          aria-label={open ? 'Collapse' : 'Expand'} aria-expanded={open}
        >
          <ChevronDown size={16} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Expanded body */}
      {open && (
        <div className="px-4 pb-4 border-t border-border pt-4 space-y-4">
          {editing ? (
            <div className="space-y-3">
              <select value={fields.category} onChange={(e) => setFields((f) => ({ ...f, category: e.target.value }))} className={inputCls} aria-label="Category">
                {SUPPORT_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
              <input value={fields.subject} onChange={(e) => setFields((f) => ({ ...f, subject: e.target.value }))} className={inputCls} aria-label="Subject" />
              <textarea rows={3} value={fields.message} onChange={(e) => setFields((f) => ({ ...f, message: e.target.value }))} className={`${inputCls} resize-none`} aria-label="Details" />
              <div className="flex justify-end gap-2">
                <button onClick={() => { setEditing(false); setFields({ subject: ticket.subject, message: ticket.message, category: ticket.category }) }} className="text-sm font-medium text-content-muted px-3 py-1.5 rounded-lg hover:text-content">Cancel</button>
                <button onClick={saveEdit} disabled={!fields.subject.trim()} className="text-sm font-semibold bg-primary text-on-primary px-4 py-1.5 rounded-lg hover:bg-primary-dark disabled:opacity-50">Save changes</button>
              </div>
            </div>
          ) : (
            <>
              {ticket.message && <p className="text-sm text-content leading-relaxed whitespace-pre-line">{ticket.message}</p>}

              {ticket.attachments?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {ticket.attachments.map((a, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 text-xs text-content-muted bg-surface-alt border border-border rounded-lg px-2.5 py-1.5">
                      <FileText size={13} className="text-primary" /> {a.name} <span className="text-content-disabled">· {formatSize(a.size)}</span>
                    </span>
                  ))}
                </div>
              )}

              {/* Thread */}
              {thread.length > 0 && (
                <div className="space-y-2.5 pt-1">
                  {thread.map((m) => (
                    <div key={m.id} className={`flex ${m.from === 'tenant' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-lg px-3 py-2 ${m.from === 'tenant' ? 'bg-primary-light' : 'bg-surface-alt border border-border'}`}>
                        <p className="text-xs font-semibold text-content">{m.author}</p>
                        <p className="text-sm text-content mt-0.5 leading-relaxed whitespace-pre-line">{m.text}</p>
                        <p className="text-xs text-content-disabled mt-1">{formatDate(m.at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply (open tickets only) */}
              {isOpen && (
                <div className="flex items-end gap-2 pt-1">
                  <textarea
                    rows={1}
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Reply to the platform team…"
                    className={`${inputCls} resize-none`}
                  />
                  <button onClick={sendReply} disabled={!reply.trim()} className="shrink-0 inline-flex items-center gap-1.5 bg-primary text-on-primary text-sm font-semibold px-3.5 py-2.5 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50">
                    <MessageSquare size={15} /> Reply
                  </button>
                </div>
              )}

              {/* Actions */}
              {isOpen && (
                <div className="flex items-center gap-2 pt-2 border-t border-border">
                  {granting ? (
                    <button onClick={() => onRevoke(ticket.id)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-danger border border-danger/40 px-3 py-1.5 rounded-lg hover:bg-danger-light transition-colors">
                      <ShieldOff size={13} /> Revoke access
                    </button>
                  ) : (
                    <button onClick={() => onGrant(ticket.id)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-tertiary-dark border border-tertiary/40 px-3 py-1.5 rounded-lg hover:bg-tertiary-light transition-colors">
                      <ShieldCheck size={13} /> Grant access
                    </button>
                  )}
                  <button onClick={() => setEditing(true)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-content-muted border border-border px-3 py-1.5 rounded-lg hover:border-primary hover:text-primary transition-colors">
                    <Pencil size={13} /> Edit
                  </button>
                  <button onClick={() => onCancel(ticket)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-content-muted border border-border px-3 py-1.5 rounded-lg hover:border-danger hover:text-danger transition-colors ml-auto">
                    <Ban size={13} /> Cancel request
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────
export function RequestSupportPage() {
  const brand = useBrand()
  const tickets = usePlatformStore((s) => s.supportTickets)
  const requestSupport = usePlatformStore((s) => s.requestSupport)
  const revokeSupport = usePlatformStore((s) => s.revokeSupport)
  const setTicketAccess = usePlatformStore((s) => s.setTicketAccess)
  const updateTicket = usePlatformStore((s) => s.updateTicket)
  const cancelTicket = usePlatformStore((s) => s.cancelTicket)
  const addTicketMessage = usePlatformStore((s) => s.addTicketMessage)

  const [category, setCategory] = useState(SUPPORT_CATEGORIES[0])
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [grant, setGrant] = useState(true)
  const [files, setFiles] = useState([])
  const [cancelling, setCancelling] = useState(null)

  const mine = tickets.filter((t) => t.tenantId === brand.id)
  const openTickets = mine.filter((t) => t.status === 'open')
  const closedTickets = mine.filter((t) => t.status !== 'open')
  const activeGrant = mine.find((t) => t.status === 'open' && t.grantsAccess)

  function addFiles(list) {
    const added = Array.from(list ?? []).map((f) => ({ name: f.name, size: f.size }))
    setFiles((prev) => [...prev, ...added])
  }

  function submit(e) {
    e.preventDefault()
    if (!subject.trim()) return
    requestSupport({
      tenantId: brand.id, tenant: brand.municipality,
      subject: subject.trim(), message: message.trim(),
      category, attachments: files, grantsAccess: grant,
    })
    toast.success(grant ? 'Support request sent — access granted while it stays open.' : 'Support request sent.')
    setSubject(''); setMessage(''); setGrant(true); setFiles([]); setCategory(SUPPORT_CATEGORIES[0])
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-lg bg-primary-light flex items-center justify-center shrink-0">
          <LifeBuoy size={20} className="text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-content">Request Support</h1>
          <p className="text-sm text-content-muted mt-1">
            Ask the platform team for help. You can grant temporary access to your portal — and revoke it anytime.
          </p>
        </div>
      </div>

      {/* Active-access indicator */}
      {activeGrant && (
        <div className="bg-warning-light border border-warning/40 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-warning/15 flex items-center justify-center shrink-0">
            <ShieldAlert size={20} className="text-warning" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-content">Platform support access is active</p>
            <p className="text-xs text-content-muted mt-1 leading-relaxed">
              The platform team can currently enter your portal to help with &ldquo;{activeGrant.subject}&rdquo;. Revoke access as soon as you no longer need help.
            </p>
          </div>
          <button
            onClick={() => { revokeSupport(activeGrant.id); toast.success('Support access revoked.') }}
            className="shrink-0 inline-flex items-center gap-2 bg-content text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
          >
            <ShieldOff size={15} /> Revoke access
          </button>
        </div>
      )}

      {/* New request form */}
      <form onSubmit={submit} className="bg-surface border border-border rounded-xl shadow-card p-6 flex flex-col gap-5">
        <h2 className="text-base font-bold text-content">New request</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="category" className="text-sm font-medium text-content">Category</label>
            <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
              {SUPPORT_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label htmlFor="subject" className="text-sm font-medium text-content">What do you need help with?</label>
            <input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Applicants aren't receiving the OTP" className={inputCls} />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="message" className="text-sm font-medium text-content">Details <span className="text-content-muted font-normal">(optional)</span></label>
          <textarea id="message" rows={4} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Describe the issue so the platform team can help faster…" className={`${inputCls} resize-none`} />
        </div>

        {/* Attachments */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 text-sm font-semibold text-content border border-border px-3 py-2 rounded-lg cursor-pointer hover:border-primary hover:text-primary transition-colors">
              <Paperclip size={15} /> Attach files
              <input type="file" multiple className="hidden" onChange={(e) => { addFiles(e.target.files); e.target.value = '' }} />
            </label>
            <span className="text-xs text-content-muted">Screenshots or documents help us diagnose faster.</span>
          </div>
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {files.map((f, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 text-xs text-content bg-surface-alt border border-border rounded-lg px-2.5 py-1.5">
                  <FileText size={13} className="text-primary" /> {f.name} <span className="text-content-disabled">· {formatSize(f.size)}</span>
                  <button type="button" onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))} className="text-content-muted hover:text-danger" aria-label={`Remove ${f.name}`}><X size={13} /></button>
                </span>
              ))}
            </div>
          )}
        </div>

        <label className={`flex items-start gap-3 cursor-pointer rounded-lg p-4 border ${grant ? 'border-primary/30 bg-primary-light/40' : 'border-border bg-surface-alt'}`}>
          <input type="checkbox" checked={grant} onChange={(e) => setGrant(e.target.checked)} className="w-4 h-4 mt-0.5 accent-primary shrink-0" />
          <span className="text-sm text-content leading-relaxed">
            <span className="font-semibold">Allow the platform team to enter my portal</span> while this request is open, to troubleshoot on my behalf. I can revoke this anytime, and it ends automatically when the request is resolved.
          </span>
        </label>

        <div className="flex justify-end">
          <button type="submit" disabled={!subject.trim()} className="inline-flex items-center gap-2 bg-primary text-on-primary text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <Send size={15} /> Send request
          </button>
        </div>
      </form>

      {/* My requests */}
      <section className="bg-surface border border-border rounded-xl shadow-card p-6">
        <h2 className="text-base font-bold text-content mb-4">Your requests</h2>
        {mine.length === 0 ? (
          <p className="text-sm text-content-muted py-6 text-center">You haven&rsquo;t sent any support requests yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {openTickets.map((t) => (
              <TicketCard
                key={t.id} ticket={t}
                onRevoke={(id) => { revokeSupport(id); toast.success('Support access revoked.') }}
                onGrant={(id) => { setTicketAccess(id, true); toast.success('Access granted.') }}
                onEdit={updateTicket}
                onCancel={setCancelling}
                onReply={(id, text) => { addTicketMessage(id, { from: 'tenant', author: 'LYDO Head', text }); toast.success('Reply sent.') }}
              />
            ))}

            {closedTickets.length > 0 && (
              <>
                <p className="text-xs font-semibold text-content-muted uppercase tracking-wide mt-3">History</p>
                {closedTickets.map((t) => (
                  <TicketCard
                    key={t.id} ticket={t}
                    onRevoke={revokeSupport} onGrant={setTicketAccess}
                    onEdit={updateTicket} onCancel={setCancelling}
                    onReply={(id, text) => addTicketMessage(id, { from: 'tenant', author: 'LYDO Head', text })}
                  />
                ))}
              </>
            )}
          </div>
        )}
      </section>

      {cancelling && (
        <CancelModal
          ticket={cancelling}
          onClose={() => setCancelling(null)}
          onConfirm={() => { cancelTicket(cancelling.id); toast.success('Request cancelled.'); setCancelling(null) }}
        />
      )}
    </div>
  )
}
