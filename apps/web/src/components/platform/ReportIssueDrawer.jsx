import { useState } from 'react'
import toast from 'react-hot-toast'
import { usePlatformSettings } from '../../store/platformSettingsStore'
import { PlatformDrawer } from './PlatformDrawer'

const EMPTY = { subject: '', details: '' }

// In-app "report an issue" form for the operator console. Reuses the accessible
// PlatformDrawer shell. Without a backend it confirms with a toast; the target
// address is the support email stored in platform Settings.
export function ReportIssueDrawer({ open, onClose }) {
  const issueEmail = usePlatformSettings((s) => s.issueEmail)
  const [form, setForm] = useState(EMPTY)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const valid = !!form.subject.trim()

  function close() {
    setForm(EMPTY)
    onClose()
  }
  function submit() {
    toast.success(`Thanks — your report was sent to ${issueEmail}`)
    close()
  }

  return (
    <PlatformDrawer
      open={open}
      onClose={close}
      title="Report an issue"
      subtitle="Tell the platform team what's wrong — it reaches the support inbox."
      submitLabel="Send report"
      onSubmit={submit}
      canSubmit={valid}
    >
      <div className="pf-field">
        <label htmlFor="ri-subject">Subject <span className="req" aria-hidden="true">*</span></label>
        <input
          id="ri-subject"
          type="text"
          placeholder="e.g. Onboarding drawer won't submit"
          value={form.subject}
          onChange={set('subject')}
          required
        />
      </div>
      <div className="pf-field">
        <label htmlFor="ri-details">Details</label>
        <textarea
          id="ri-details"
          rows={5}
          placeholder="What happened, and what did you expect to happen?"
          value={form.details}
          onChange={set('details')}
        />
      </div>
      <div className="pf-field">
        <span className="hint">Goes to {issueEmail} — change this in Settings → Platform identity.</span>
      </div>
    </PlatformDrawer>
  )
}
