import { useState } from 'react'
import toast from 'react-hot-toast'
import { Send } from 'lucide-react'
import { usePlatformStore } from '../../store/platformStore'

const AUDIENCES = ['All municipalities', 'Active municipalities', 'Onboarding municipalities']

export function PlatformBroadcastsPage() {
  const broadcasts = usePlatformStore((s) => s.broadcasts)
  const sendBroadcast = usePlatformStore((s) => s.sendBroadcast)

  const [title, setTitle] = useState('')
  const [audience, setAudience] = useState(AUDIENCES[0])
  const [body, setBody] = useState('')

  const canSend = title.trim() && body.trim()

  function submit(e) {
    e.preventDefault()
    if (!canSend) return
    sendBroadcast({ title: title.trim(), audience, body: body.trim() })
    toast.success(`Broadcast sent to ${audience.toLowerCase()}`)
    setTitle('')
    setBody('')
    setAudience(AUDIENCES[0])
  }

  return (
    <>
      <div className="pf-page-head">
        <div>
          <h1 className="pf-title">Broadcasts</h1>
          <p className="pf-note">Send a message to municipal admins — maintenance notices, new features, reminders.</p>
        </div>
      </div>

      <h2 className="pf-h2">Compose</h2>
      <form onSubmit={submit} style={{ maxWidth: 640 }}>
        <div className="pf-field">
          <label htmlFor="bc-title">Title <span className="req">*</span></label>
          <input id="bc-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Scheduled maintenance this weekend" />
        </div>
        <div className="pf-field">
          <label htmlFor="bc-aud">Audience</label>
          <select id="bc-aud" className="pf-select" value={audience} onChange={(e) => setAudience(e.target.value)} style={{ width: '100%' }}>
            {AUDIENCES.map((a) => <option key={a}>{a}</option>)}
          </select>
        </div>
        <div className="pf-field">
          <label htmlFor="bc-body">Message <span className="req">*</span></label>
          <textarea id="bc-body" className="pf-textarea" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write the announcement municipal admins will see…" />
        </div>
        <button className="pf-btn" type="submit" disabled={!canSend}>
          <Send size={17} /> Send broadcast
        </button>
      </form>

      <h2 className="pf-h2">Sent</h2>
      <p className="pf-sub">Previously delivered broadcasts, newest first.</p>
      {broadcasts.map((b) => (
        <div className="pf-bc" key={b.id}>
          <div className="pf-bc-t">{b.title}</div>
          <div className="pf-bc-m">{b.audience} · {b.sentBy} · {b.sentAt}</div>
          <div className="pf-bc-b">{b.body}</div>
        </div>
      ))}
    </>
  )
}
