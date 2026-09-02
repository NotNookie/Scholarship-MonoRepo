import { Save } from 'lucide-react'
import toast from 'react-hot-toast'
import { usePlatformSettings } from '../../store/platformSettingsStore'

function Toggle({ label, checked, onChange }) {
  return (
    <button
      type="button"
      className="pf-tog"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
    />
  )
}

export function PlatformSettingsPage() {
  // Bound to the persisted store, so edits survive reloads and feed the onboard
  // flow. `save` is an explicit confirmation — the values persist as you type.
  const s = usePlatformSettings()
  const update = usePlatformSettings((st) => st.set)
  const set = (k) => (v) => update({ [k]: v })
  const setInput = (k) => (e) => update({ [k]: e.target.value })

  function save() {
    toast.success('Platform settings saved')
  }

  return (
    <>
      <div className="pf-page-head">
        <div>
          <h1 className="pf-title">Settings</h1>
          <p className="pf-note">Platform-wide configuration and the defaults every new municipality starts from.</p>
        </div>
        <button className="pf-btn" type="button" onClick={save}>
          <Save size={18} strokeWidth={2.2} />
          Save changes
        </button>
      </div>
      <hr className="pf-rule" />

      <div className="pf-block">
        <h2>Platform identity</h2>
        <div className="pf-set-row">
          <div>
            <div className="pf-set-lbl">Platform name</div>
            <div className="pf-set-desc">Shown in the console chrome. This is the platform brand, not a municipality&rsquo;s program name.</div>
          </div>
          <div className="pf-set-ctl">
            <input className="pf-input" type="text" value={s.platformName} onChange={setInput('platformName')} aria-label="Platform name" />
          </div>
        </div>
        <div className="pf-set-row">
          <div>
            <div className="pf-set-lbl">Support address</div>
            <div className="pf-set-desc">Where the &ldquo;report an issue&rdquo; link in the phase banner points.</div>
          </div>
          <div className="pf-set-ctl">
            <input className="pf-input" type="email" value={s.issueEmail} onChange={setInput('issueEmail')} aria-label="Support address" />
          </div>
        </div>
      </div>

      <div className="pf-block" style={{ marginTop: 34 }}>
        <h2>New-municipality defaults</h2>
        <div className="pf-set-row">
          <div>
            <div className="pf-set-lbl">Blur detection</div>
            <div className="pf-set-desc">Client-side soft flag on document uploads. Free, runs locally — recommended on.</div>
          </div>
          <div className="pf-set-ctl"><Toggle label="Blur detection default" checked={s.defaultBlur} onChange={set('defaultBlur')} /></div>
        </div>
        <div className="pf-set-row">
          <div>
            <div className="pf-set-lbl">OCR validation</div>
            <div className="pf-set-desc">Assistive text extraction for staff — decision-support only, never auto-decides. Free, local.</div>
          </div>
          <div className="pf-set-ctl"><Toggle label="OCR validation default" checked={s.defaultOcr} onChange={set('defaultOcr')} /></div>
        </div>
        <div className="pf-set-row">
          <div>
            <div className="pf-set-lbl">AI announcement drafting</div>
            <div className="pf-set-desc">Optional writing aid in the announcement composer. The one metered feature — off by default.</div>
          </div>
          <div className="pf-set-ctl"><Toggle label="AI announcements default" checked={s.defaultAi} onChange={set('defaultAi')} /></div>
        </div>
      </div>

      <div className="pf-block" style={{ marginTop: 34 }}>
        <h2>Onboarding</h2>
        <div className="pf-set-row">
          <div>
            <div className="pf-set-lbl">Subdomain root</div>
            <div className="pf-set-desc">New municipalities are reached at <span className="pf-mono">&lt;name&gt;.{s.subdomainRoot}</span>.</div>
          </div>
          <div className="pf-set-ctl">
            <input className="pf-input" type="text" value={s.subdomainRoot} onChange={setInput('subdomainRoot')} aria-label="Subdomain root" />
          </div>
        </div>
        <div className="pf-set-row">
          <div>
            <div className="pf-set-lbl">Require head-administrator invite</div>
            <div className="pf-set-desc">Every new tenant must nominate a head administrator by email before it goes active.</div>
          </div>
          <div className="pf-set-ctl"><Toggle label="Require head invite" checked={s.requireHeadInvite} onChange={set('requireHeadInvite')} /></div>
        </div>
      </div>
    </>
  )
}
