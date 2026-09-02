import { useState, useEffect } from 'react'
import { useLocation, useBlocker } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
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
import { useDialog } from '../../lib/useDialog'

// In-page sections (anchors for the sticky section nav + search deep-links).
const SECTIONS = [
  { id: 'general', label: 'General' },
  { id: 'contact', label: 'Contact' },
  { id: 'public', label: 'Public Content' },
  { id: 'application', label: 'Application' },
]
const scrollToSection = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

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
      setEdits({}) // clear dirty state
      queryClient.invalidateQueries({ queryKey: queryKeys.maintenance.settings() })
    },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Could not save settings.'),
  })

  // Dirty = there are unsaved form edits. (Theme applies live and isn't part of
  // this — see the note by the Save button.)
  const dirty = Object.keys(edits).length > 0

  // Warn before leaving with unsaved changes — closing the tab…
  useEffect(() => {
    if (!dirty) return
    const onBeforeUnload = (e) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [dirty])

  // …and navigating within the app.
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) => dirty && currentLocation.pathname !== nextLocation.pathname,
  )

  // Deep-link support: scroll to the section named in the URL hash (from search).
  const { hash } = useLocation()
  useEffect(() => {
    if (!hash) return
    const el = document.getElementById(hash.slice(1))
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [hash, isPending])

  function discard() {
    setEdits({})
    if (blocker.state === 'blocked') blocker.proceed()
  }
  const guardRef = useDialog(() => blocker.reset?.(), blocker.state === 'blocked')

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
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-content">Branding &amp; System Settings</h1>
          <p className="text-sm text-content-muted mt-1">Configure the public appearance and contact details of the scholarship portal.</p>
        </div>
        <div className="flex flex-col sm:items-end gap-1 shrink-0">
          <button
            onClick={() => saveMutation.mutate(form)}
            disabled={!dirty || saveMutation.isPending}
            className="inline-flex items-center gap-2 bg-primary text-on-primary text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saveMutation.isPending ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
            {dirty ? 'Save Changes' : 'Saved'}
          </button>
          <p className="text-xs text-content-muted">Changes are saved when you click Save</p>
        </div>
      </div>

      {/* Sticky section nav — jump between sections */}
      <div className="sticky top-0 z-10 -mt-2 py-2 bg-surface-alt/90 backdrop-blur-sm flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => scrollToSection(s.id)}
            className="whitespace-nowrap text-xs font-semibold px-3 py-1.5 rounded-full border border-border bg-surface text-content-muted hover:border-primary hover:text-primary transition-colors"
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-6">
          {/* General branding */}
          <section id="general" className="scroll-mt-20 bg-surface border border-border rounded-xl shadow-card p-6">
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
          <section id="contact" className="scroll-mt-20 bg-surface border border-border rounded-xl shadow-card p-6">
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
          <section id="public" className="scroll-mt-20 bg-surface border border-border rounded-xl shadow-card p-6">
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
          <section id="application" className="scroll-mt-20 bg-surface border border-border rounded-xl shadow-card p-6">
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

      </div>

      {/* Sticky unsaved-changes bar — always reachable on the long page */}
      {dirty && (
        <div className="sticky bottom-4 z-20 flex items-center justify-between gap-3 rounded-xl border border-border bg-surface shadow-modal px-5 py-3">
          <p className="text-sm text-content inline-flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-secondary shrink-0" /> You have unsaved changes
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => setEdits({})} className="text-sm font-medium text-content-muted px-3 py-2 rounded-lg hover:text-content transition-colors">Discard</button>
            <button
              onClick={() => saveMutation.mutate(form)}
              disabled={saveMutation.isPending}
              className="inline-flex items-center gap-2 bg-primary text-on-primary text-sm font-semibold px-5 py-2 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {saveMutation.isPending ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />} Save Changes
            </button>
          </div>
        </div>
      )}

      {/* Leave-with-unsaved-changes guard */}
      {blocker.state === 'blocked' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => blocker.reset()} />
          <div ref={guardRef} role="dialog" aria-modal="true" aria-labelledby="unsaved-title" className="relative bg-surface rounded-xl shadow-modal w-full max-w-sm p-6">
            <h3 id="unsaved-title" className="text-base font-bold text-content">Discard unsaved changes?</h3>
            <p className="text-sm text-content-muted mt-1.5 leading-relaxed">You have edits that haven&rsquo;t been saved. Leaving now will lose them.</p>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => blocker.reset()} className="text-sm font-medium text-content-muted px-4 py-2 rounded-lg hover:text-content transition-colors">Keep editing</button>
              <button onClick={discard} className="text-sm font-semibold bg-danger text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">Discard &amp; leave</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
