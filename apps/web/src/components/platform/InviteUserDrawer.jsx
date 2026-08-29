import { useState } from 'react'
import toast from 'react-hot-toast'
import { usePlatformStore, PLATFORM_ROLES } from '../../store/platformStore'
import { PlatformDrawer } from './PlatformDrawer'

const EMPTY = { name: '', email: '', role: 'support' }

export function InviteUserDrawer({ open, onClose }) {
  const invite = usePlatformStore((s) => s.invitePlatformUser)
  const [form, setForm] = useState(EMPTY)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const valid = form.email.trim()

  function close() {
    setForm(EMPTY)
    onClose()
  }
  function submit() {
    invite(form)
    toast.success(`Invitation sent to ${form.email.trim()}`)
    close()
  }

  return (
    <PlatformDrawer
      open={open}
      onClose={close}
      title="Invite a platform user"
      subtitle="Add someone to our team and choose what they can reach."
      submitLabel="Send invite"
      onSubmit={submit}
      canSubmit={!!valid}
    >
      <div className="pf-field">
        <label htmlFor="pf-uname">Full name</label>
        <input id="pf-uname" type="text" placeholder="e.g. Mika Ramos" value={form.name} onChange={set('name')} />
      </div>
      <div className="pf-field">
        <label htmlFor="pf-uemail">Email <span className="req" aria-hidden="true">*</span></label>
        <input id="pf-uemail" type="email" placeholder="mika@iskolar.ph" value={form.email} onChange={set('email')} required />
      </div>
      <div className="pf-field">
        <label htmlFor="pf-urole">Role</label>
        <select id="pf-urole" className="pf-select" value={form.role} onChange={set('role')}>
          {Object.entries(PLATFORM_ROLES).map(([key, r]) => (
            <option key={key} value={key}>{r.label}</option>
          ))}
        </select>
        <span className="hint">{PLATFORM_ROLES[form.role]?.desc}</span>
      </div>
    </PlatformDrawer>
  )
}
