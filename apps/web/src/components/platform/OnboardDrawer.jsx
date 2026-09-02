import { useState } from 'react'
import toast from 'react-hot-toast'
import { usePlatformStore } from '../../store/platformStore'
import { usePlatformSettings } from '../../store/platformSettingsStore'
import { PlatformDrawer } from './PlatformDrawer'

const EMPTY = { name: '', province: '', subdomain: '', email: '' }

export function OnboardDrawer({ open, onClose }) {
  const onboard = usePlatformStore((s) => s.onboard)
  // New tenants inherit the platform's assistive-feature defaults (Settings).
  const defaultBlur = usePlatformSettings((s) => s.defaultBlur)
  const defaultOcr = usePlatformSettings((s) => s.defaultOcr)
  const defaultAi = usePlatformSettings((s) => s.defaultAi)
  const [form, setForm] = useState(EMPTY)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const valid = form.name.trim() && form.subdomain.trim()

  const onWord = (on) => (on ? 'on' : 'off')

  function close() {
    setForm(EMPTY)
    onClose()
  }
  function submit() {
    onboard({ ...form, ocr: defaultOcr, ai: defaultAi })
    toast.success(`${form.name.trim()} chartered · invitation sent`)
    close()
  }

  return (
    <PlatformDrawer
      open={open}
      onClose={close}
      title="Onboard a municipality"
      subtitle="Charter a new tenant and invite its head administrator."
      submitLabel="Charter & invite"
      onSubmit={submit}
      canSubmit={!!valid}
    >
      <div className="pf-field">
        <label htmlFor="pf-name">Municipality name <span className="req" aria-hidden="true">*</span></label>
        <input id="pf-name" type="text" placeholder="e.g. Municipality of Sta. Cruz" value={form.name} onChange={set('name')} required />
      </div>
      <div className="pf-field-row">
        <div className="pf-field">
          <label htmlFor="pf-prov">Province</label>
          <input id="pf-prov" type="text" placeholder="Laguna" value={form.province} onChange={set('province')} />
        </div>
        <div className="pf-field">
          <label htmlFor="pf-sub">Subdomain <span className="req" aria-hidden="true">*</span></label>
          <div className="pf-subdomain">
            <input id="pf-sub" type="text" placeholder="stacruz" value={form.subdomain} onChange={set('subdomain')} required />
            <span className="suffix">.iskolar.ph</span>
          </div>
        </div>
      </div>
      <div className="pf-field">
        <label htmlFor="pf-email">Head administrator email</label>
        <input id="pf-email" type="email" placeholder="head@stacruz.gov.ph" value={form.email} onChange={set('email')} />
        <span className="hint">An invitation to set up the account will be sent here.</span>
      </div>
      <div className="pf-field">
        <span className="hint">
          Starts with your platform defaults — Blur {onWord(defaultBlur)} · OCR {onWord(defaultOcr)} · AI {onWord(defaultAi)}.
          Change these in Settings → New-municipality defaults.
        </span>
      </div>
    </PlatformDrawer>
  )
}
