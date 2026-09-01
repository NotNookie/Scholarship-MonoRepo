import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ChevronLeft,
  Palette,
  Building2,
  Contact,
  UploadCloud,
  Check,
  Loader2,
  Video,
  ClipboardList,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../../lib/axios'
import { queryKeys } from '../../lib/queryKeys'
import { Skeleton } from '../../components/shared/Skeleton'

// Theme presets are STORED ONLY for now — they do not live-swap the app tokens.
const THEMES = [
  { value: 'corporate_blue', label: 'Corporate Blue (Default)', dots: ['bg-primary-dark', 'bg-primary', 'bg-primary-light'] },
  { value: 'civic_green', label: 'Civic Green', dots: ['bg-tertiary-dark', 'bg-tertiary', 'bg-tertiary-light'] },
]

const DEFAULTS = {
  portal_name: 'Iskolar ng Bayan',
  tagline: 'Empowering Youth Through Education',
  office_address: '',
  support_email: '',
  hotline: '',
  theme: 'corporate_blue',
  logo_name: '',
  walkthrough_video_enabled: true,
  walkthrough_video_url: '',
  website_url: '',
  facebook_url: '',
  manual_url: '',
  map_embed_url: '',
  application_deadline: '',
  essay_enabled: true,
  qualifying_exam_enabled: false,
  orientation_enabled: false,
  payout_tracking_enabled: false,
}

const inputCls = 'w-full text-sm px-3 py-2.5 rounded-lg border border-border bg-surface focus:outline-none focus:border-primary'

function Field({ id, label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-content">{label}</label>
      {children}
    </div>
  )
}

function Toggle({ checked, onChange, label }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${checked ? 'bg-primary' : 'bg-border'}`}>
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-surface shadow-sm transition-transform ${checked ? 'translate-x-5' : ''}`} />
    </button>
  )
}

function ToggleRow({ title, desc, checked, onChange }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-content">{title}</p>
        <p className="text-xs text-content-muted mt-1 max-w-md">{desc}</p>
      </div>
      <Toggle label={title} checked={checked} onChange={onChange} />
    </div>
  )
}

export function MaintenanceProfilePage() {
  const queryClient = useQueryClient()
  // Only local edits are tracked; the live form derives from server data + edits.
  const [edits, setEdits] = useState({})

  const { data, isPending } = useQuery({
    queryKey: queryKeys.maintenance.settings(),
    queryFn: () => api.get('/admin/maintenance/settings').then((r) => r.data?.data ?? r.data),
    retry: false,
  })

  const form = { ...DEFAULTS, ...(data ?? {}), ...edits }
  const setForm = (updater) => setEdits((prev) => updater({ ...DEFAULTS, ...(data ?? {}), ...prev }))
  const set = (k) => (e) => setEdits((prev) => ({ ...prev, [k]: e.target.value }))

  const saveMutation = useMutation({
    mutationFn: (payload) => api.put('/admin/maintenance/settings', payload),
    onSuccess: () => {
      toast.success('Settings saved.')
      queryClient.invalidateQueries({ queryKey: queryKeys.maintenance.settings() })
    },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Could not save settings.'),
  })

  if (isPending) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <Link to="/admin/maintenance" className="inline-flex items-center gap-1.5 text-sm text-content-muted hover:text-primary transition-colors mb-3">
            <ChevronLeft size={15} /> Maintenance Hub
          </Link>
          <h1 className="text-2xl font-bold text-content">Branding &amp; System Settings</h1>
          <p className="text-sm text-content-muted mt-1">Configure the public appearance and contact details of the scholarship portal.</p>
        </div>
        <button
          onClick={() => saveMutation.mutate(form)}
          disabled={saveMutation.isPending}
          className="inline-flex items-center gap-2 bg-primary text-on-primary text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 shrink-0"
        >
          {saveMutation.isPending ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />} Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: forms */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* General branding */}
          <section className="bg-surface border border-border rounded-xl shadow-card p-6">
            <h2 className="text-base font-bold text-content inline-flex items-center gap-2 pb-4 mb-5 border-b border-border">
              <Palette size={17} className="text-primary" /> General Branding
            </h2>
            <div className="flex flex-col gap-5">
              <div>
                <p className="text-sm font-medium text-content mb-2">Municipal Logo</p>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg border-2 border-dashed border-border flex items-center justify-center text-content-disabled bg-surface-alt shrink-0">
                    <Building2 size={22} />
                  </div>
                  <label className="inline-flex items-center gap-2 text-sm font-semibold text-content border border-border px-4 py-2 rounded-lg cursor-pointer hover:border-primary hover:text-primary transition-colors">
                    <UploadCloud size={15} /> Browse Files
                    <input
                      type="file"
                      accept=".png,.svg,.jpg,.jpeg"
                      className="hidden"
                      onChange={(e) => setForm((s) => ({ ...s, logo_name: e.target.files?.[0]?.name ?? s.logo_name }))}
                    />
                  </label>
                  {form.logo_name && <span className="text-xs text-content-muted truncate">{form.logo_name}</span>}
                </div>
                <p className="text-xs text-content-muted mt-2">Square PNG or SVG, max 2MB.</p>
              </div>
              <Field id="portal_name" label="Portal Name / Header Text">
                <input id="portal_name" type="text" value={form.portal_name} onChange={set('portal_name')} className={inputCls} />
              </Field>
              <Field id="tagline" label="Tagline">
                <input id="tagline" type="text" value={form.tagline} onChange={set('tagline')} className={inputCls} />
              </Field>
            </div>
          </section>

          {/* Office contact */}
          <section className="bg-surface border border-border rounded-xl shadow-card p-6">
            <h2 className="text-base font-bold text-content inline-flex items-center gap-2 pb-4 mb-5 border-b border-border">
              <Contact size={17} className="text-primary" /> Office Contact Information
            </h2>
            <div className="flex flex-col gap-5">
              <Field id="office_address" label="Municipal Office Address">
                <textarea id="office_address" rows={2} value={form.office_address} onChange={set('office_address')} placeholder="LYDO, Municipal Hall, Sta. Cruz, Laguna" className={`${inputCls} resize-none`} />
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field id="support_email" label="Support Email">
                  <input id="support_email" type="email" value={form.support_email} onChange={set('support_email')} placeholder="scholarships@stacruz.gov.ph" className={inputCls} />
                </Field>
                <Field id="hotline" label="Hotline Number">
                  <input id="hotline" type="text" value={form.hotline} onChange={set('hotline')} placeholder="(049) 000-0000" className={inputCls} />
                </Field>
              </div>
            </div>
          </section>

          {/* Content options */}
          <section className="bg-surface border border-border rounded-xl shadow-card p-6">
            <h2 className="text-base font-bold text-content inline-flex items-center gap-2 pb-4 mb-5 border-b border-border">
              <Video size={17} className="text-primary" /> Public Content
            </h2>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-content">Application walkthrough video</p>
                <p className="text-xs text-content-muted mt-1 max-w-md">Not every municipality has one. Turn this off to hide the video player on the public Requirements page.</p>
              </div>
              <Toggle
                label="Show walkthrough video"
                checked={!!form.walkthrough_video_enabled}
                onChange={() => setForm((s) => ({ ...s, walkthrough_video_enabled: !s.walkthrough_video_enabled }))}
              />
            </div>
            {form.walkthrough_video_enabled && (
              <div className="mt-5">
                <Field id="wv_url" label="Video URL">
                  <input id="wv_url" type="url" value={form.walkthrough_video_url} onChange={set('walkthrough_video_url')} placeholder="https://…  (YouTube, Vimeo, or an MP4 link)" className={inputCls} />
                </Field>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-border flex flex-col gap-4">
              <p className="text-xs text-content-muted">Leave any of these blank and it simply won&rsquo;t appear on your public pages.</p>
              <Field id="website_url" label="Website URL">
                <input id="website_url" type="url" value={form.website_url} onChange={set('website_url')} placeholder="https://yourtown.gov.ph" className={inputCls} />
              </Field>
              <Field id="facebook_url" label="Facebook page URL">
                <input id="facebook_url" type="url" value={form.facebook_url} onChange={set('facebook_url')} placeholder="https://facebook.com/yourtown" className={inputCls} />
              </Field>
              <Field id="manual_url" label="Downloadable manual / handbook URL">
                <input id="manual_url" type="url" value={form.manual_url} onChange={set('manual_url')} placeholder="https://…  (a PDF link)" className={inputCls} />
              </Field>
              <Field id="map_embed_url" label="Map embed URL">
                <input id="map_embed_url" type="url" value={form.map_embed_url} onChange={set('map_embed_url')} placeholder="OpenStreetMap / Google Maps embed URL" className={inputCls} />
              </Field>
            </div>
          </section>

          {/* Application & lifecycle options */}
          <section className="bg-surface border border-border rounded-xl shadow-card p-6">
            <h2 className="text-base font-bold text-content inline-flex items-center gap-2 pb-4 mb-5 border-b border-border">
              <ClipboardList size={17} className="text-primary" /> Application &amp; Lifecycle
            </h2>
            <p className="text-xs text-content-muted mb-5">
              Turn parts of the process on or off to match how your municipality actually runs its program.
            </p>
            <div className="flex flex-col gap-5">
              <ToggleRow
                title="Require a personal essay"
                desc="Adds the “Essay & Statement” step to the application form. Turn off if your process doesn't collect an essay."
                checked={!!form.essay_enabled}
                onChange={() => setForm((s) => ({ ...s, essay_enabled: !s.essay_enabled }))}
              />
              <ToggleRow
                title="Qualifying exam milestone"
                desc="Shows a “Qualifying Exam” stage in the scholar's journey between the decision and the award."
                checked={!!form.qualifying_exam_enabled}
                onChange={() => setForm((s) => ({ ...s, qualifying_exam_enabled: !s.qualifying_exam_enabled }))}
              />
              <ToggleRow
                title="Orientation milestone"
                desc="Shows an “Orientation” stage in the scholar's journey before the award is finalized."
                checked={!!form.orientation_enabled}
                onChange={() => setForm((s) => ({ ...s, orientation_enabled: !s.orientation_enabled }))}
              />
              <ToggleRow
                title="Disbursement / payout tracking"
                desc="Shows the payout report and the disbursement trends chart under Reports. Turn off if payouts aren't tracked in-app."
                checked={!!form.payout_tracking_enabled}
                onChange={() => setForm((s) => ({ ...s, payout_tracking_enabled: !s.payout_tracking_enabled }))}
              />
              <div className="pt-5 border-t border-border">
                <Field id="application_deadline" label="Application deadline (shown on the public Scholarships page)">
                  <input id="application_deadline" type="text" value={form.application_deadline} onChange={set('application_deadline')} placeholder="e.g. August 15, 2026" className={inputCls} />
                </Field>
                <p className="text-xs text-content-muted mt-2">Leave blank to hide the deadline banner.</p>
              </div>
            </div>
          </section>
        </div>

        {/* Right: theme + preview */}
        <aside className="flex flex-col gap-6">
          <section className="bg-surface border border-border rounded-xl shadow-card p-6">
            <h2 className="text-base font-bold text-content inline-flex items-center gap-2 mb-4">
              <Palette size={17} className="text-primary" /> UI Theme Preset
            </h2>
            <div className="flex flex-col gap-3">
              {THEMES.map((t) => {
                const active = form.theme === t.value
                return (
                  <button
                    key={t.value}
                    onClick={() => setForm((s) => ({ ...s, theme: t.value }))}
                    className={`flex items-center justify-between p-4 rounded-lg border transition-colors text-left ${active ? 'border-primary bg-primary-light/40' : 'border-border hover:border-primary'}`}
                  >
                    <span className="flex items-center gap-2">
                      <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${active ? 'border-primary' : 'border-border'}`}>
                        {active && <span className="w-2 h-2 rounded-full bg-primary" />}
                      </span>
                      <span className="text-sm font-medium text-content">{t.label}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      {t.dots.map((d, i) => <span key={i} className={`w-3.5 h-3.5 rounded-full ${d}`} />)}
                    </span>
                  </button>
                )
              })}
            </div>
            <p className="text-xs text-content-muted mt-3">Saved with settings. Live theme switching is not yet applied to the interface.</p>
          </section>

          {/* Preview */}
          <section className="bg-surface border border-border rounded-xl shadow-card p-5">
            <p className="text-xs font-semibold text-content-muted uppercase tracking-wide mb-3">Applicant View Preview</p>
            <div className="border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 pb-3 border-b border-border">
                <div className="w-7 h-7 rounded bg-primary-light flex items-center justify-center"><Building2 size={14} className="text-primary" /></div>
                <div>
                  <p className="text-sm font-bold text-primary leading-tight">{form.portal_name || 'Portal Name'}</p>
                  <p className="text-xs text-content-muted">{form.tagline || 'Tagline'}</p>
                </div>
              </div>
              <div className="space-y-2 mt-3">
                <div className="h-2 w-3/4 rounded bg-surface-alt" />
                <div className="h-2 w-full rounded bg-surface-alt" />
                <div className="flex gap-2 mt-3">
                  <span className="h-6 w-16 rounded bg-surface-alt" />
                  <span className="h-6 w-16 rounded bg-primary" />
                </div>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
