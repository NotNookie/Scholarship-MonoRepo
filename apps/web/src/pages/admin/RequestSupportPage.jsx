import { useState } from 'react'
import toast from 'react-hot-toast'
import { LifeBuoy, ShieldAlert, ShieldOff, Send, CheckCircle2 } from 'lucide-react'
import { usePlatformStore } from '../../store/platformStore'
import { useBrand } from '../../tenant/TenantContext'

const inputCls = 'w-full text-sm px-3 py-2.5 rounded-lg border border-border bg-surface focus:outline-none focus:border-primary'

function formatDate(v) {
  if (!v || v === 'Just now') return v || '—'
  return new Date(v).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function RequestSupportPage() {
  const brand = useBrand()
  const tickets = usePlatformStore((s) => s.supportTickets)
  const requestSupport = usePlatformStore((s) => s.requestSupport)
  const revokeSupport = usePlatformStore((s) => s.revokeSupport)

  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [grant, setGrant] = useState(true)

  const mine = tickets.filter((t) => t.tenantId === brand.id)
  const activeGrant = mine.find((t) => t.status === 'open' && t.grantsAccess)

  function submit(e) {
    e.preventDefault()
    if (!subject.trim()) return
    requestSupport({ tenantId: brand.id, tenant: brand.municipality, subject: subject.trim(), message: message.trim(), grantsAccess: grant })
    toast.success(grant ? 'Support request sent — access granted while it stays open.' : 'Support request sent.')
    setSubject(''); setMessage(''); setGrant(true)
  }

  function revoke(id) {
    revokeSupport(id)
    toast.success('Support access revoked.')
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
            Ask the platform team for help. You can grant them temporary access to enter your portal — and revoke it anytime.
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
            onClick={() => revoke(activeGrant.id)}
            className="shrink-0 inline-flex items-center gap-2 bg-content text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
          >
            <ShieldOff size={15} /> Revoke access
          </button>
        </div>
      )}

      {/* New request form */}
      <form onSubmit={submit} className="bg-surface border border-border rounded-xl shadow-card p-6 flex flex-col gap-5">
        <h2 className="text-base font-bold text-content">New request</h2>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="subject" className="text-sm font-medium text-content">What do you need help with?</label>
          <input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Applicants aren't receiving the OTP" className={inputCls} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="message" className="text-sm font-medium text-content">Details <span className="text-content-muted font-normal">(optional)</span></label>
          <textarea id="message" rows={4} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Describe the issue so the platform team can help faster…" className={`${inputCls} resize-none`} />
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
          <div className="divide-y divide-border">
            {mine.map((t) => {
              const open = t.status === 'open'
              const granting = open && t.grantsAccess
              return (
                <div key={t.id} className="py-4 flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-content">{t.subject}</p>
                      {granting && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-warning-light text-warning border border-warning/30">Access granted</span>
                      )}
                    </div>
                    {t.message && <p className="text-xs text-content-muted mt-1 leading-relaxed">{t.message}</p>}
                    <p className="text-xs text-content-disabled mt-1">Sent {formatDate(t.opened)}</p>
                  </div>
                  <div className="shrink-0 flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${open ? 'bg-primary-light text-primary' : 'bg-tertiary-light text-tertiary-dark'}`}>
                      {open ? 'Open' : <><CheckCircle2 size={12} /> Resolved</>}
                    </span>
                    {granting && (
                      <button onClick={() => revoke(t.id)} className="text-xs font-semibold text-danger border border-danger/40 px-3 py-1.5 rounded-lg hover:bg-danger-light transition-colors">
                        Revoke
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
