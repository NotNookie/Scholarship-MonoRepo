import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useQuery, useMutation } from '@tanstack/react-query'
import {
  GraduationCap, FileText, ShieldCheck, UploadCloud, Send, Loader2, Info,
  CheckCircle2, CalendarClock, X, ChevronLeft, AlertTriangle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../../lib/axios'
import { useBrand } from '../../tenant/TenantContext'
import { validateFile, measureSharpness, BLUR_THRESHOLD } from '../../lib/fileValidation'

const DRAFT_KEY = 'iskolar-renewal-draft'

function declarationsFor(municipality) {
  return [
    { name: 'declare_residency', title: 'Residency Confirmation', text: `I certify that I am still a bona fide resident of the Municipality of ${municipality}.` },
    { name: 'declare_voter', title: 'Voter Registration Status', text: `I, or my parents/guardians, are registered voters of ${municipality}.` },
    { name: 'declare_no_other', title: 'No Concurrent Government Scholarships', text: 'I am not currently enjoying any other major government scholarship program (e.g. DOST, CHED) that conflicts with this grant.' },
  ]
}

const DOCS = [
  { key: 'grade_slip', label: 'Official Grade Slip', note: 'Previous semester grades' },
  { key: 'cert_enrollment', label: 'Certificate of Enrollment', note: 'Current semester' },
]

const inputCls = (err) =>
  `w-full text-sm px-3 py-2.5 rounded-lg border bg-surface focus:outline-none focus:border-primary transition-colors ${err ? 'border-danger' : 'border-border'}`

function loadDraft() {
  try { return JSON.parse(localStorage.getItem(DRAFT_KEY) ?? 'null') ?? {} } catch { return {} }
}

function Section({ n, Icon, title, children, active }) {
  return (
    <section className={`bg-surface border rounded-xl shadow-card overflow-hidden ${active ? 'border-l-4 border-l-primary border-y-border border-r-border' : 'border-border'}`}>
      <div className="px-6 py-4 border-b border-border flex items-center gap-2.5">
        <Icon size={17} className="text-primary" />
        <h2 className="text-base font-bold text-content">{n}. {title}</h2>
      </div>
      <div className="p-6 flex flex-col gap-5">{children}</div>
    </section>
  )
}

export function RenewalPage() {
  const navigate = useNavigate()
  const brand = useBrand()
  const DECLARATIONS = declarationsFor(brand.municipality)
  const [files, setFiles] = useState({})
  const [blurHints, setBlurHints] = useState({})

  async function handleFile(key, f) {
    if (!f) return
    const err = validateFile(f)
    if (err) { toast.error(err); return }
    setFiles((prev) => ({ ...prev, [key]: f }))
    setBlurHints((prev) => ({ ...prev, [key]: false }))
    if (/\.(jpe?g|png)$/i.test(f.name)) {
      const sharpness = await measureSharpness(f)
      if (sharpness != null && sharpness < BLUR_THRESHOLD) setBlurHints((prev) => ({ ...prev, [key]: true }))
    }
  }

  function removeFile(key) {
    setFiles((f) => ({ ...f, [key]: null }))
    setBlurHints((h) => ({ ...h, [key]: false }))
  }

  const { data, isPending } = useQuery({
    queryKey: ['student', 'scholarship'],
    queryFn: () => api.get('/student/scholarship').then((r) => r.data?.data ?? r.data),
    retry: false,
  })

  const {
    register, handleSubmit, watch, getValues,
    formState: { errors },
  } = useForm({ defaultValues: { back_subjects: 'no', ...loadDraft() } })

  const values = watch()

  // Auto-save draft locally (same pattern as the 5-step application form)
  useEffect(() => {
    const sub = watch((v) => localStorage.setItem(DRAFT_KEY, JSON.stringify(v)))
    return () => sub.unsubscribe()
  }, [watch])

  const mutation = useMutation({
    mutationFn: (payload) => {
      const fd = new FormData()
      Object.entries(payload).forEach(([k, v]) => fd.append(k, v ?? ''))
      Object.entries(files).forEach(([k, f]) => f && fd.append(k, f))
      return api.post('/student/renewals', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    },
    onSuccess: () => {
      toast.success('Renewal submitted for review.')
      localStorage.removeItem(DRAFT_KEY)
      navigate('/scholarship')
    },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Could not submit renewal.'),
  })

  const s = data ?? null

  // ── Section completion (drives the progress rail) ────────────
  const step1Done = !!(values.gwa && values.units && values.year_level)
  const step2Done = !!(files.grade_slip && files.cert_enrollment)
  const step3Done = DECLARATIONS.every((d) => values[d.name])
  const steps = [
    { n: 1, label: 'Academic Update', done: step1Done },
    { n: 2, label: 'Document Uploads', done: step2Done },
    { n: 3, label: 'Eligibility', done: step3Done },
  ]

  function saveDraft() {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(getValues()))
    toast.success('Draft saved on this device.')
  }

  if (isPending) {
    return <div className="max-w-6xl mx-auto px-6 py-10"><div className="h-64 bg-surface-alt rounded-xl animate-pulse" /></div>
  }

  // ── Blocked states ───────────────────────────────────────────
  if (!s || !s.renewal_open) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="bg-surface border border-border rounded-xl shadow-card p-12 flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 bg-surface-alt rounded-full flex items-center justify-center">
            <CalendarClock size={24} className="text-content-muted" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-content">Renewal isn't open right now</h1>
            <p className="text-sm text-content-muted mt-1 max-w-sm">
              {s?.renewal_opens_at
                ? `The renewal window opens on ${new Date(s.renewal_opens_at).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })}.`
                : 'You will be notified here and by announcement once the renewal period opens.'}
            </p>
          </div>
          <Link to="/scholarship" className="text-sm font-semibold text-primary border border-primary px-5 py-2.5 rounded-lg hover:bg-primary-light transition-colors">
            Back to My Scholarship
          </Link>
        </div>
      </div>
    )
  }

  if (s.renewal_submitted) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="bg-surface border border-border rounded-xl shadow-card p-12 flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 bg-tertiary-light rounded-full flex items-center justify-center">
            <CheckCircle2 size={24} className="text-tertiary-dark" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-content">Renewal already submitted</h1>
            <p className="text-sm text-content-muted mt-1 max-w-sm">
              Your renewal for A.Y. {s.renewal_academic_year ?? s.academic_year} is under review by the {brand.officeShort} office.
            </p>
          </div>
          <Link to="/scholarship" className="text-sm font-semibold text-primary border border-primary px-5 py-2.5 rounded-lg hover:bg-primary-light transition-colors">
            Back to My Scholarship
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <Link to="/scholarship" className="inline-flex items-center gap-1.5 text-sm text-content-muted hover:text-primary transition-colors mb-4">
        <ChevronLeft size={15} /> My Scholarship
      </Link>

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-content">Scholarship Renewal</h1>
        <p className="text-sm text-content-muted mt-1">
          A.Y. {s.renewal_academic_year ?? s.academic_year}{s.renewal_semester ? `, ${s.renewal_semester}` : ''}
        </p>
      </header>

      <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Sections ───────────────────────────────────────── */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          <Section n={1} Icon={GraduationCap} title="Academic Update" active={!step1Done}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="gwa" className="text-sm font-medium text-content">General Weighted Average (GWA)</label>
                <input id="gwa" type="text" placeholder="e.g. 1.75" aria-invalid={!!errors.gwa} className={inputCls(errors.gwa)}
                  {...register('gwa', { required: 'Please enter your GWA.' })} />
                {errors.gwa && <p role="alert" className="text-xs text-danger">{errors.gwa.message}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="units" className="text-sm font-medium text-content">Units Enrolled</label>
                <input id="units" type="number" min="0" placeholder="e.g. 21" aria-invalid={!!errors.units} className={inputCls(errors.units)}
                  {...register('units', { required: 'Please enter your enrolled units.' })} />
                {errors.units && <p role="alert" className="text-xs text-danger">{errors.units.message}</p>}
              </div>
            </div>

            <div className="flex flex-col gap-1.5 sm:max-w-xs">
              <label htmlFor="year_level" className="text-sm font-medium text-content">Current Year Level</label>
              <select id="year_level" aria-invalid={!!errors.year_level} className={inputCls(errors.year_level)}
                {...register('year_level', { required: 'Please select your year level.' })}>
                <option value="">Select year level</option>
                {['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', 'Graduating'].map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
              {errors.year_level && <p role="alert" className="text-xs text-danger">{errors.year_level.message}</p>}
            </div>

            <fieldset className="border-t border-border pt-5">
              <legend className="text-sm font-medium text-content mb-2">
                Do you have any dropped or failed subjects? (Back-subjects)
              </legend>
              <div className="flex items-center gap-6">
                {['yes', 'no'].map((v) => (
                  <label key={v} className="flex items-center gap-2 text-sm text-content cursor-pointer">
                    <input type="radio" value={v} {...register('back_subjects')} className="w-4 h-4 text-primary focus:ring-primary" />
                    {v === 'yes' ? 'Yes' : 'No'}
                  </label>
                ))}
              </div>
              {values.back_subjects === 'yes' && (
                <div className="flex flex-col gap-1.5 mt-4">
                  <label htmlFor="back_subjects_note" className="text-sm font-medium text-content">Please explain</label>
                  <textarea id="back_subjects_note" rows={3} placeholder="Which subjects, and why?" className={inputCls(errors.back_subjects_note)}
                    {...register('back_subjects_note', { required: 'Please explain your back-subjects.' })} />
                  {errors.back_subjects_note && <p role="alert" className="text-xs text-danger">{errors.back_subjects_note.message}</p>}
                </div>
              )}
            </fieldset>
          </Section>

          <Section n={2} Icon={FileText} title="Document Uploads" active={step1Done && !step2Done}>
            <p className="text-sm text-content-muted -mt-1">
              Upload clear, legible copies. Max file size 5MB (PDF, JPG, PNG).
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {DOCS.map((d) => {
                const file = files[d.key]
                return (
                  <div key={d.key}>
                    {file ? (
                      <>
                        <div className="border border-tertiary/40 bg-tertiary-light/40 rounded-lg p-4 flex items-center gap-3">
                          <CheckCircle2 size={16} className="text-tertiary-dark shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-content truncate">{d.label}</p>
                            <p className="text-xs text-content-muted truncate">{file.name}</p>
                          </div>
                          <button type="button" onClick={() => removeFile(d.key)}
                            className="text-content-muted hover:text-danger shrink-0" aria-label={`Remove ${d.label}`}><X size={15} /></button>
                        </div>
                        {blurHints[d.key] && (
                          <div className="mt-2 flex items-start gap-2 bg-secondary/15 border border-secondary/40 rounded-lg px-3 py-2">
                            <AlertTriangle size={14} className="text-content shrink-0 mt-0.5" />
                            <p className="text-xs text-content leading-relaxed">This image looks a little blurry. A clearer photo is easier to verify — retake it, or keep this one.</p>
                          </div>
                        )}
                      </>
                    ) : (
                      <label htmlFor={d.key} className="flex flex-col items-center justify-center gap-1.5 border-2 border-dashed border-border rounded-lg px-4 py-7 cursor-pointer hover:border-primary hover:bg-primary-light/30 transition-colors text-center">
                        <UploadCloud size={22} className="text-content-muted" />
                        <span className="text-sm font-semibold text-content">{d.label}</span>
                        <span className="text-xs text-content-muted">{d.note}</span>
                        <span className="text-xs text-primary font-semibold mt-1">Browse files</span>
                        <input id={d.key} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden"
                          onChange={(e) => handleFile(d.key, e.target.files?.[0])} />
                      </label>
                    )}
                  </div>
                )
              })}
            </div>
          </Section>

          <Section n={3} Icon={ShieldCheck} title="Eligibility Declarations" active={step2Done && !step3Done}>
            {DECLARATIONS.map((d) => (
              <label key={d.name} className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 mt-0.5 rounded border-border text-primary focus:ring-primary shrink-0"
                  {...register(d.name, { required: true })} />
                <span>
                  <span className="text-sm font-semibold text-content block">{d.title}</span>
                  <span className="text-xs text-content-muted leading-relaxed">{d.text}</span>
                </span>
              </label>
            ))}
            {(errors.declare_residency || errors.declare_voter || errors.declare_no_other) && (
              <p role="alert" className="text-xs text-danger">All declarations must be confirmed before submitting.</p>
            )}
          </Section>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <button type="button" onClick={saveDraft}
              className="text-sm font-semibold text-content-muted border border-border px-5 py-2.5 rounded-lg hover:border-primary hover:text-primary transition-colors">
              Save Draft
            </button>
            <button type="submit" disabled={mutation.isPending}
              className="inline-flex items-center gap-2 bg-primary text-on-primary text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-60">
              {mutation.isPending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
              Submit Renewal
            </button>
          </div>
        </div>

        {/* ── Right rail ─────────────────────────────────────── */}
        <aside className="flex flex-col gap-6 lg:sticky lg:top-20 lg:self-start">
          <div className="bg-surface border border-border rounded-xl shadow-card p-6">
            <p className="text-xs font-semibold text-content-muted uppercase tracking-wide mb-4">Application Progress</p>
            <ol className="flex flex-col gap-4">
              {steps.map((st) => (
                <li key={st.n} className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border-2 ${st.done ? 'bg-primary border-primary text-on-primary' : 'bg-surface border-border text-content-muted'}`}>
                    {st.done ? <CheckCircle2 size={14} strokeWidth={2.5} /> : st.n}
                  </span>
                  <span className={`text-sm ${st.done ? 'text-content font-medium' : 'text-content-muted'}`}>{st.label}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="bg-primary-light border border-primary/20 rounded-xl p-5 flex gap-3">
            <Info size={16} className="text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-content">Need help?</p>
              <p className="text-xs text-content-muted mt-1 leading-relaxed">
                If you're unsure about your GWA calculation or required documents, contact the scholarship office.
              </p>
              <a href="/#contact" className="text-xs font-semibold text-primary hover:underline mt-2 inline-block">Contact support →</a>
            </div>
          </div>
        </aside>
      </form>
    </div>
  )
}
