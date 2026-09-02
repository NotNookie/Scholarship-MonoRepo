import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery } from '@tanstack/react-query'
import {
  User, Phone, MapPin, Calendar, BookOpen,
  GraduationCap, FileText, Check, Banknote,
  Users, Upload, CloudUpload, Trash2, HelpCircle,
  Send, Circle, AlertTriangle, Loader2, X,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../../lib/axios'
import { queryKeys } from '../../lib/queryKeys'
import { validateFile, measureSharpness, BLUR_THRESHOLD } from '../../lib/fileValidation'
import { useBrand } from '../../tenant/TenantContext'
import { useDialog } from '../../lib/useDialog'

// ── Constants ────────────────────────────────────────────────

const DRAFT_KEY = 'iskolar-application-draft'

// Each step carries a stable `id` so optional steps (e.g. the essay) can be
// filtered out per municipality without breaking numeric indexing.
const STEP_DEFS = [
  { id: 'personal',  label: 'Personal Info',     Icon: User,          fields: ['first_name', 'last_name', 'birthdate', 'sex', 'civil_status', 'street_address', 'barangay', 'mobile'] },
  { id: 'academic',  label: 'Academic Records',  Icon: GraduationCap, fields: ['school_name', 'course', 'year_level', 'gwa'] },
  { id: 'family',    label: 'Family Background', Icon: Users,         fields: ['annual_income_range', 'num_dependents', 'primary_earner', 'primary_earner_occupation', 'primary_earner_monthly_income', 'financial_need_statement'] },
  { id: 'essay',     label: 'Essay & Statement', Icon: FileText,      fields: ['essay'] },
  { id: 'documents', label: 'Document Upload',   Icon: Upload,        fields: ['doc_acknowledged', 'attest'] },
]

const FALLBACK_DOCUMENTS = [
  { name: 'PSA Birth Certificate',               note: 'Clear scanned copy of the original PSA document.' },
  { name: 'Official Report Card / Form 138',     note: 'Most recent semester or academic year, signed by the principal/registrar.' },
  { name: 'Barangay Certificate of Indigency',   note: "Must state the purpose: 'For Scholarship Application'. Issued within the last 3 months." },
]

const INCOME_RANGES = [
  'Below ₱100,000',
  '₱100,000 – ₱250,000',
  '₱250,001 – ₱500,000',
  'Above ₱500,000',
]

// Essay / statement length rules — kept in sync with the on-screen guidance.
const ESSAY_MIN_WORDS = 500
const STATEMENT_MAX_WORDS = 500

function countWords(s) {
  const t = (s ?? '').trim()
  return t ? t.split(/\s+/).length : 0
}

const docNameOf = (doc) => (typeof doc === 'string' ? doc : doc.name)

function isStepComplete(step, values) {
  return step.fields.every((field) => {
    const v = values[field]
    if (typeof v === 'boolean') return v === true
    if (typeof v === 'number') return Number.isFinite(v)
    return v != null && String(v).trim() !== ''
  })
}

function loadDraft() {
  try {
    return JSON.parse(localStorage.getItem(DRAFT_KEY) ?? 'null') ?? {}
  } catch {
    return {}
  }
}

// ── Shared field helpers ──────────────────────────────────────

function Field({ label, id, error, hint, optional, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-content flex items-center gap-1.5">
        {label}
        {optional && <span className="text-xs text-content-muted font-normal">(Optional)</span>}
      </label>
      {children}
      {error ? (
        <p role="alert" className="text-xs text-danger">{error.message}</p>
      ) : hint ? (
        <p className="text-xs text-content-muted">{hint}</p>
      ) : null}
    </div>
  )
}

const inputCls = (err) =>
  `w-full text-sm px-3 py-3 rounded-lg border bg-surface focus:outline-none focus:border-primary transition-colors ${
    err ? 'border-danger' : 'border-border'
  }`

const iconInputCls = (err) =>
  `w-full text-sm pl-10 pr-4 py-3 rounded-lg border bg-surface focus:outline-none focus:border-primary transition-colors ${
    err ? 'border-danger' : 'border-border'
  }`

function SectionHeading({ children }) {
  return (
    <h2 className="text-base font-bold text-primary pb-3 border-b border-border">
      {children}
    </h2>
  )
}

// ── Step 1: Personal & Contact ────────────────────────────────

function Step1Personal({ register, errors }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-content">Personal & Contact Details</h1>
        <p className="text-sm text-content-muted mt-1">
          Please provide your accurate personal information as it appears on your official documents.
        </p>
      </div>

      <SectionHeading>Basic Information</SectionHeading>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="First Name" id="first_name" error={errors.first_name}>
          <input
            id="first_name" type="text" placeholder="Juan"
            autoComplete="given-name" aria-invalid={!!errors.first_name}
            className={inputCls(errors.first_name)}
            {...register('first_name', { required: 'Required', minLength: { value: 2, message: 'Too short' } })}
          />
        </Field>
        <Field label="Last Name" id="last_name" error={errors.last_name}>
          <input
            id="last_name" type="text" placeholder="Dela Cruz"
            autoComplete="family-name" aria-invalid={!!errors.last_name}
            className={inputCls(errors.last_name)}
            {...register('last_name', { required: 'Required', minLength: { value: 2, message: 'Too short' } })}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Date of Birth" id="birthdate" error={errors.birthdate}>
          <div className="relative">
            <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-content-muted pointer-events-none" />
            <input
              id="birthdate" type="date"
              aria-invalid={!!errors.birthdate}
              className={iconInputCls(errors.birthdate)}
              {...register('birthdate', { required: 'Date of birth is required' })}
            />
          </div>
        </Field>
        <Field label="Sex" id="sex" error={errors.sex}>
          <select
            id="sex" aria-invalid={!!errors.sex}
            className={inputCls(errors.sex)}
            {...register('sex', { required: 'Required' })}
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </select>
        </Field>
      </div>

      <Field label="Civil Status" id="civil_status" error={errors.civil_status}>
        <select
          id="civil_status" aria-invalid={!!errors.civil_status}
          className={inputCls(errors.civil_status)}
          {...register('civil_status', { required: 'Required' })}
        >
          <option value="">Select civil status</option>
          <option value="single">Single</option>
          <option value="married">Married</option>
          <option value="widowed">Widowed</option>
        </select>
      </Field>

      <SectionHeading>Contact Information</SectionHeading>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Mobile Number" id="mobile" error={errors.mobile}>
          <div className="relative">
            <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-content-muted pointer-events-none" />
            <input
              id="mobile" type="tel" placeholder="+63 900 000 0000"
              inputMode="numeric" autoComplete="tel"
              aria-invalid={!!errors.mobile}
              className={iconInputCls(errors.mobile)}
              {...register('mobile', {
                required: 'Mobile number is required',
                pattern: { value: /^(09|\+639)\d{9}$/, message: 'Enter a valid PH mobile number' },
              })}
            />
          </div>
        </Field>
        <Field label="Barangay" id="barangay" error={errors.barangay}>
          <input
            id="barangay" type="text" placeholder="e.g., Barangay 1"
            aria-invalid={!!errors.barangay}
            className={inputCls(errors.barangay)}
            {...register('barangay', { required: 'Barangay is required' })}
          />
        </Field>
      </div>

      <Field label="Current Residential Address" id="street_address" error={errors.street_address}>
        <div className="relative">
          <MapPin size={16} className="absolute left-3.5 top-3.5 text-content-muted pointer-events-none" />
          <textarea
            id="street_address"
            rows={3}
            placeholder="House No., Street, Barangay, Sta. Cruz, Laguna"
            aria-invalid={!!errors.street_address}
            className={`${iconInputCls(errors.street_address)} resize-none`}
            {...register('street_address', { required: 'Address is required' })}
          />
        </div>
      </Field>
    </div>
  )
}

// ── Step 2: Academic Records ──────────────────────────────────

function Step2Academic({ register, errors }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-content">Academic History</h1>
        <p className="text-sm text-content-muted mt-1">
          Please provide details about your current or most recent educational institution.
        </p>
      </div>

      <Field label="School Name" id="school_name" error={errors.school_name}>
        <div className="relative">
          <GraduationCap size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-content-muted pointer-events-none" />
          <input
            id="school_name" type="text"
            placeholder="e.g., University of the Philippines"
            aria-invalid={!!errors.school_name}
            className={iconInputCls(errors.school_name)}
            {...register('school_name', { required: 'School name is required' })}
          />
        </div>
      </Field>

      <Field label="Course / Program" id="course" error={errors.course}>
        <div className="relative">
          <BookOpen size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-content-muted pointer-events-none" />
          <input
            id="course" type="text"
            placeholder="e.g., BS Computer Science"
            aria-invalid={!!errors.course}
            className={iconInputCls(errors.course)}
            {...register('course', { required: 'Course is required' })}
          />
        </div>
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Year Level" id="year_level" error={errors.year_level}>
          <select
            id="year_level" aria-invalid={!!errors.year_level}
            className={inputCls(errors.year_level)}
            {...register('year_level', { required: 'Required' })}
          >
            <option value="">Select Year Level</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
            <option value="5">5th Year</option>
          </select>
        </Field>
        <Field
          label="GPA / General Weighted Average (GWA)"
          id="gwa"
          error={errors.gwa}
          hint={!errors.gwa ? 'Previous semester. e.g., 1.25 or 90.5' : undefined}
        >
          <input
            id="gwa" type="number" step="0.01"
            placeholder="e.g., 1.25"
            inputMode="decimal" aria-invalid={!!errors.gwa}
            className={inputCls(errors.gwa)}
            {...register('gwa', {
              required: 'GWA is required',
              valueAsNumber: true,
              validate: (v) => Number.isFinite(v) || 'Enter a valid GWA',
            })}
          />
        </Field>
      </div>

      <Field label="Academic Honors / Awards" id="academic_honors" optional>
        <textarea
          id="academic_honors"
          rows={3}
          placeholder="List any relevant academic honors, awards, or scholarships received…"
          className={inputCls(false)}
          {...register('academic_honors')}
        />
      </Field>
    </div>
  )
}

// ── Step 3: Family Background ─────────────────────────────────

function Step3Family({ register, errors, values }) {
  const statementWords = countWords(values.financial_need_statement)
  const numericRules = {
    required: 'Required',
    valueAsNumber: true,
    validate: (v) => Number.isFinite(v) || 'Enter a valid number',
    min: { value: 0, message: 'Must be 0 or more' },
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-content">Family & Financial Background</h1>
        <p className="text-sm text-content-muted mt-1">
          Provide information about your family's socioeconomic situation.
        </p>
      </div>

      <SectionHeading>Financial Information</SectionHeading>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Annual Household Income (PHP)" id="annual_income_range" error={errors.annual_income_range}>
          <select
            id="annual_income_range" aria-invalid={!!errors.annual_income_range}
            className={inputCls(errors.annual_income_range)}
            {...register('annual_income_range', { required: 'Required' })}
          >
            <option value="">Select Range</option>
            {INCOME_RANGES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </Field>
        <Field label="Number of Dependents in Household" id="num_dependents" error={errors.num_dependents}>
          <input
            id="num_dependents" type="number" min={0} placeholder="e.g., 3"
            inputMode="numeric" aria-invalid={!!errors.num_dependents}
            className={inputCls(errors.num_dependents)}
            {...register('num_dependents', numericRules)}
          />
        </Field>
      </div>

      <SectionHeading>Parents / Guardian Occupation</SectionHeading>

      <div className="bg-surface-alt border border-border rounded-xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-4">
          <Field label="Primary Earner" id="primary_earner" error={errors.primary_earner}>
            <select
              id="primary_earner" aria-invalid={!!errors.primary_earner}
              className={inputCls(errors.primary_earner)}
              {...register('primary_earner', { required: 'Required' })}
            >
              <option value="">Select</option>
              <option value="father">Father</option>
              <option value="mother">Mother</option>
              <option value="guardian">Guardian</option>
            </select>
          </Field>
          <Field label="Occupation" id="primary_earner_occupation" error={errors.primary_earner_occupation}>
            <input
              id="primary_earner_occupation" type="text" placeholder="e.g., Teacher"
              aria-invalid={!!errors.primary_earner_occupation}
              className={inputCls(errors.primary_earner_occupation)}
              {...register('primary_earner_occupation', { required: 'Required' })}
            />
          </Field>
        </div>
        <div className="space-y-4">
          <Field label="Employer / Business Name" id="primary_earner_employer" optional>
            <input
              id="primary_earner_employer" type="text" placeholder="Name of company"
              className={inputCls(false)}
              {...register('primary_earner_employer')}
            />
          </Field>
          <Field label="Estimated Monthly Income (₱)" id="primary_earner_monthly_income" error={errors.primary_earner_monthly_income}>
            <div className="relative">
              <Banknote size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-content-muted pointer-events-none" />
              <input
                id="primary_earner_monthly_income" type="number" min={0} placeholder="0"
                inputMode="numeric" aria-invalid={!!errors.primary_earner_monthly_income}
                className={iconInputCls(errors.primary_earner_monthly_income)}
                {...register('primary_earner_monthly_income', numericRules)}
              />
            </div>
          </Field>
        </div>
      </div>

      <SectionHeading>Statement of Financial Need</SectionHeading>

      <Field
        label="Briefly explain your financial situation and why this scholarship is necessary for your education. (Max 500 words)"
        id="financial_need_statement"
        error={errors.financial_need_statement}
      >
        <textarea
          id="financial_need_statement"
          rows={5}
          placeholder="Describe any specific financial challenges, unexpected expenses, or circumstances affecting your family's ability to fund your education…"
          aria-invalid={!!errors.financial_need_statement}
          className={`${inputCls(errors.financial_need_statement)} resize-none`}
          {...register('financial_need_statement', {
            required: 'This statement is required',
            validate: (v) => countWords(v) <= STATEMENT_MAX_WORDS || `Please keep this under ${STATEMENT_MAX_WORDS} words.`,
          })}
        />
        <p className={`text-xs text-right ${statementWords > STATEMENT_MAX_WORDS ? 'text-danger font-medium' : 'text-content-muted'}`}>
          {statementWords} / {STATEMENT_MAX_WORDS} words
        </p>
      </Field>
    </div>
  )
}

// ── Step 4: Essay & Statement ─────────────────────────────────

function Step4Essay({ register, errors, values }) {
  const essayWords = countWords(values.essay)
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-content">Essay & Personal Statement</h1>
        <p className="text-sm text-content-muted mt-1">
          Tell us about yourself, your goals, and why you deserve this scholarship.
        </p>
      </div>

      <SectionHeading>Personal Essay</SectionHeading>

      <p className="text-sm text-content-muted leading-relaxed">
        Write a personal essay (500–800 words) describing your academic journey, personal
        challenges, future goals, and how this scholarship will help you achieve them.
        Be honest and specific.
      </p>

      <Field label="Personal Statement" id="essay" error={errors.essay}>
        <textarea
          id="essay"
          rows={12}
          placeholder="Start your personal statement here…"
          aria-invalid={!!errors.essay}
          className={`${inputCls(errors.essay)} resize-none leading-relaxed`}
          {...register('essay', {
            required: 'A personal statement is required',
            validate: (v) => countWords(v) >= ESSAY_MIN_WORDS || `Please write at least ${ESSAY_MIN_WORDS} words.`,
          })}
        />
        <p className={`text-xs text-right ${essayWords < ESSAY_MIN_WORDS ? 'text-content-muted' : 'text-tertiary-dark font-medium'}`}>
          {essayWords} words {essayWords < ESSAY_MIN_WORDS ? `· ${ESSAY_MIN_WORDS - essayWords} to go` : '· minimum met'}
        </p>
      </Field>

      <div className="bg-primary-light border border-primary/20 rounded-lg p-4">
        <p className="text-xs text-primary font-semibold mb-1">Writing Tips</p>
        <ul className="text-xs text-content-muted space-y-1 list-disc list-inside leading-relaxed">
          <li>Be specific about your academic achievements and challenges.</li>
          <li>Explain how the scholarship will impact your education and future career.</li>
          <li>Show your commitment to your studies and your community.</li>
          <li>Proofread before submitting — spelling and grammar matter.</li>
        </ul>
      </div>
    </div>
  )
}

// ── Step 5: Document Upload ───────────────────────────────────

// Controlled: the uploaded File lives in the parent, so it can be reviewed,
// enforced before submit, and reflected in the summary.
function UploadCard({ doc, file, onChange }) {
  const name = docNameOf(doc)
  const note = typeof doc === 'string' ? null : doc.note
  // Soft, non-blocking blur hint (images only).
  const [blurHint, setBlurHint] = useState(false)

  async function handleFile(f) {
    if (!f) return
    const err = validateFile(f)
    if (err) { toast.error(err); return }
    onChange(f)
    setBlurHint(false)
    if (/\.(jpe?g|png)$/i.test(f.name)) {
      const sharpness = await measureSharpness(f)
      if (sharpness != null && sharpness < BLUR_THRESHOLD) setBlurHint(true)
    }
  }

  function removeFile() {
    onChange(null)
    setBlurHint(false)
  }

  return (
    <div className={`bg-surface rounded-xl border shadow-card p-5 relative overflow-hidden ${file ? 'border-success' : 'border-border'}`}>
      <div className={`absolute top-0 left-0 w-1 h-full ${file ? 'bg-success' : 'bg-primary'}`} />

      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-bold text-content">{name}</p>
          {note && <p className="text-xs text-content-muted mt-0.5">{note}</p>}
        </div>
        {file ? (
          <span className="inline-flex items-center gap-1 bg-tertiary-light text-tertiary-dark text-xs font-semibold px-2.5 py-1 rounded-full">
            <Check size={11} strokeWidth={3} /> Uploaded
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 bg-surface-alt text-content-muted text-xs font-semibold px-2.5 py-1 rounded-full border border-border">
            Required
          </span>
        )}
      </div>

      {file ? (
        <>
          <div className="bg-surface-alt border border-border rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded bg-primary-light flex items-center justify-center shrink-0">
                <FileText size={16} className="text-primary" />
              </div>
              <div>
                <p className="text-xs font-semibold text-content">{file.name}</p>
                <p className="text-xs text-content-muted">{(file.size / 1024).toFixed(0)} KB • Uploaded just now</p>
              </div>
            </div>
            <button
              type="button"
              onClick={removeFile}
              className="p-1.5 text-danger hover:bg-danger-light rounded-lg transition-colors"
              aria-label={`Remove ${name}`}
            >
              <Trash2 size={14} />
            </button>
          </div>
          {blurHint && (
            <div className="mt-3 flex items-start gap-2 bg-secondary/15 border border-secondary/40 rounded-lg px-3 py-2.5">
              <AlertTriangle size={15} className="text-content shrink-0 mt-0.5" />
              <p className="text-xs text-content leading-relaxed">
                This image looks a little blurry. A clearer photo is easier for staff to verify — retake it if you can,
                or keep this one if it's the best you have.
              </p>
            </div>
          )}
        </>
      ) : (
        <label className="border-2 border-dashed border-border hover:border-primary bg-surface-alt rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer group transition-colors">
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <CloudUpload size={28} className="text-primary mb-2 group-hover:scale-110 transition-transform" />
          <p className="text-xs font-semibold text-content">Click to browse or drag file here</p>
          <p className="text-xs text-content-muted mt-0.5">PDF, JPG, PNG up to 5MB</p>
        </label>
      )}
    </div>
  )
}

function Step5Documents({ register, errors, documents, values, uploads, setUploads }) {
  const setDoc = (name) => (file) =>
    setUploads((u) => {
      const next = { ...u }
      if (file) next[name] = file
      else delete next[name]
      return next
    })

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Upload cards */}
      <div className="lg:col-span-2 space-y-5">
        <div>
          <h1 className="text-xl font-bold text-content">Document Upload & Review</h1>
          <p className="text-sm text-content-muted mt-1">
            Please provide the final required documents to complete your application.
          </p>
        </div>
        {documents.map((doc) => {
          const name = docNameOf(doc)
          return <UploadCard key={name} doc={doc} file={uploads[name] ?? null} onChange={setDoc(name)} />
        })}
      </div>

      {/* Summary panel */}
      <div className="space-y-4">
        <div className="bg-surface rounded-xl border border-border shadow-card overflow-hidden sticky top-24">
          <div className="bg-surface-alt px-4 py-3 border-b border-border">
            <p className="text-sm font-bold text-content">Application Summary</p>
          </div>
          <div className="p-4 space-y-3 border-b border-border">
            <div className="flex justify-between items-center py-1.5 border-b border-border/50">
              <span className="text-xs text-content-muted">Applicant Name</span>
              <span className="text-xs font-semibold text-content text-right">
                {[values.first_name, values.last_name].filter(Boolean).join(' ') || '—'}
              </span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-border/50">
              <span className="text-xs text-content-muted">Course</span>
              <span className="text-xs font-semibold text-content text-right">{values.course || '—'}</span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-xs text-content-muted">School</span>
              <span className="text-xs font-semibold text-content text-right line-clamp-1 max-w-[120px]">
                {values.school_name || '—'}
              </span>
            </div>
          </div>

          <div className="p-4 border-b border-border">
            <p className="text-xs font-semibold text-content-muted uppercase tracking-wider mb-3">Document Status</p>
            <div className="space-y-2">
              {documents.map((doc) => {
                const name = docNameOf(doc)
                const done = !!uploads[name]
                return (
                  <div key={name} className="flex items-center gap-2">
                    {done
                      ? <Check size={14} strokeWidth={3} className="text-tertiary-dark shrink-0" />
                      : <Circle size={14} className="text-border shrink-0" />}
                    <span className={`text-xs ${done ? 'text-content' : 'text-content-muted'}`}>{name}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="p-4 space-y-4">
            <label className={`flex items-start gap-3 cursor-pointer rounded-lg p-3 border ${errors.doc_acknowledged ? 'border-danger bg-danger-light' : 'border-border bg-surface-alt'}`}>
              <input
                type="checkbox"
                className="w-4 h-4 mt-0.5 accent-primary shrink-0"
                {...register('doc_acknowledged', {
                  required: 'Please confirm to continue.',
                })}
              />
              <span className="text-xs text-content leading-relaxed">
                I certify that all information provided and documents uploaded are true, correct, and legally binding. I understand that false information may lead to disqualification.
              </span>
            </label>
            {errors.doc_acknowledged && (
              <p role="alert" className="text-xs text-danger">{errors.doc_acknowledged.message}</p>
            )}

            <label className={`flex items-start gap-3 cursor-pointer rounded-lg p-3 border ${errors.attest ? 'border-danger bg-danger-light' : 'border-border bg-surface-alt'}`}>
              <input
                type="checkbox"
                className="w-4 h-4 mt-0.5 accent-primary shrink-0"
                {...register('attest', { required: 'You must attest to submit.' })}
              />
              <span className="text-xs text-content leading-relaxed">
                I attest that all information in this application is accurate and complete to the best of my knowledge.
              </span>
            </label>
            {errors.attest && (
              <p role="alert" className="text-xs text-danger">{errors.attest.message}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Sidebar ───────────────────────────────────────────────────

function AppSidebar({ steps, step, setStep, progress, onSaveDraft, values }) {
  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 bg-surface-alt border-r border-border h-full">
      {/* Progress */}
      <div className="px-5 py-5 border-b border-border">
        <p className="text-xs font-bold text-content">Application Status</p>
        <p className="text-xs text-content-muted mt-0.5">{progress}% Completed</p>
        <div className="w-full bg-border rounded-full h-1.5 mt-2">
          <div
            className="bg-primary h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 flex flex-col gap-0.5 overflow-y-auto">
        {steps.map(({ label, Icon }, i) => {
          const active = i === step
          const complete = isStepComplete(steps[i], values)
          return (
            <button
              key={i}
              type="button"
              onClick={() => setStep(i)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors w-full text-left ${
                active
                  ? 'bg-primary text-on-primary font-semibold'
                  : 'text-content hover:bg-border/40'
              }`}
            >
              <Icon size={16} className="shrink-0" />
              {label}
              {complete && !active && (
                <Check size={13} strokeWidth={3} className="ml-auto text-tertiary-dark" />
              )}
            </button>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-border space-y-1">
        <button
          type="button"
          onClick={onSaveDraft}
          className="w-full py-2 text-xs font-semibold text-primary border border-primary rounded-lg hover:bg-primary-light transition-colors"
        >
          Save Draft
        </button>
        <button
          type="button"
          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-content-muted hover:text-content rounded-lg hover:bg-border/40 transition-colors"
        >
          <HelpCircle size={14} /> Help Center
        </button>
      </div>
    </aside>
  )
}

// ── Stepper ───────────────────────────────────────────────────

function Stepper({ steps, current, onStepClick, values }) {
  return (
    <div className="flex items-center">
      <div className="relative flex-1">
        <div className="absolute top-1/2 left-0 w-full h-px bg-border -translate-y-1/2 z-0" />
        <div
          className="absolute top-1/2 left-0 h-px bg-primary -translate-y-1/2 z-0 transition-all duration-500"
          style={{ width: `${(current / (steps.length - 1)) * 100}%` }}
        />
        <div className="relative z-10 flex justify-between">
          {steps.map((_, i) => {
            const done = i < current
            const active = i === current
            const complete = isStepComplete(steps[i], values)
            return (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onStepClick(i)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm transition-colors hover:opacity-80 ${
                    done
                      ? 'bg-primary text-on-primary'
                      : active
                      ? 'bg-primary text-on-primary ring-4 ring-primary/20'
                      : 'bg-surface border border-border text-content-muted hover:border-primary hover:text-primary'
                  }`}
                >
                  {complete && !active ? <Check size={13} strokeWidth={3} /> : i + 1}
                </button>
                <span
                  className={`text-xs font-medium hidden sm:block ${
                    active ? 'text-primary' : done ? 'text-content' : 'text-content-muted'
                  }`}
                >
                  {steps[i].label.split(' ')[0]}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Review modal (pre-submit) ─────────────────────────────────

function ReviewRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 border-b border-border/50 last:border-0">
      <span className="text-xs text-content-muted shrink-0">{label}</span>
      <span className="text-xs font-medium text-content text-right">{value || '—'}</span>
    </div>
  )
}

function ReviewSection({ title, stepIndex, onEdit, children }) {
  return (
    <div className="border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-content">{title}</h3>
        <button type="button" onClick={() => onEdit(stepIndex)} className="text-xs font-semibold text-primary hover:underline">
          Edit
        </button>
      </div>
      {children}
    </div>
  )
}

function ReviewModal({ steps, hasEssay, values, documents, uploads, onEdit, onClose, onConfirm, submitting }) {
  const dialogRef = useDialog(onClose)
  const idx = (id) => steps.findIndex((s) => s.id === id)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="review-modal-title" className="relative bg-surface rounded-xl shadow-modal w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-start justify-between gap-3 shrink-0">
          <div>
            <h2 id="review-modal-title" className="text-base font-bold text-content">Review your application</h2>
            <p className="text-xs text-content-muted mt-0.5">Check everything before submitting — you can still edit any section.</p>
          </div>
          <button onClick={onClose} className="text-content-muted hover:text-content shrink-0" aria-label="Close"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-auto p-6 flex flex-col gap-4 min-h-0">
          <ReviewSection title="Personal & Contact" stepIndex={idx('personal')} onEdit={onEdit}>
            <ReviewRow label="Name" value={[values.first_name, values.last_name].filter(Boolean).join(' ')} />
            <ReviewRow label="Date of birth" value={values.birthdate} />
            <ReviewRow label="Sex" value={values.sex} />
            <ReviewRow label="Mobile" value={values.mobile} />
            <ReviewRow label="Barangay" value={values.barangay} />
            <ReviewRow label="Address" value={values.street_address} />
          </ReviewSection>

          <ReviewSection title="Academic Records" stepIndex={idx('academic')} onEdit={onEdit}>
            <ReviewRow label="School" value={values.school_name} />
            <ReviewRow label="Course" value={values.course} />
            <ReviewRow label="Year level" value={values.year_level} />
            <ReviewRow label="GWA" value={values.gwa} />
          </ReviewSection>

          <ReviewSection title="Family & Financial" stepIndex={idx('family')} onEdit={onEdit}>
            <ReviewRow label="Household income" value={values.annual_income_range} />
            <ReviewRow label="Dependents" value={values.num_dependents} />
            <ReviewRow label="Primary earner" value={values.primary_earner} />
            <ReviewRow label="Occupation" value={values.primary_earner_occupation} />
          </ReviewSection>

          {hasEssay && (
            <ReviewSection title="Essay" stepIndex={idx('essay')} onEdit={onEdit}>
              <p className="text-xs text-content-muted line-clamp-4 leading-relaxed">{values.essay || '—'}</p>
              <p className="text-xs text-content-muted mt-2">{countWords(values.essay)} words</p>
            </ReviewSection>
          )}

          <ReviewSection title="Documents" stepIndex={idx('documents')} onEdit={onEdit}>
            <div className="space-y-1.5">
              {documents.map((d) => {
                const dn = docNameOf(d)
                return (
                  <div key={dn} className="flex items-center gap-2">
                    <Check size={13} strokeWidth={3} className="text-tertiary-dark shrink-0" />
                    <span className="text-xs text-content">{dn}</span>
                    <span className="text-xs text-content-muted ml-auto truncate max-w-[45%]">{uploads[dn]?.name}</span>
                  </div>
                )
              })}
            </div>
          </ReviewSection>
        </div>

        <div className="px-6 py-4 bg-surface-alt border-t border-border flex items-center justify-end gap-3 shrink-0">
          <button type="button" onClick={onClose} className="text-sm font-semibold text-content-muted border border-border px-4 py-2 rounded-lg hover:border-primary hover:text-primary transition-colors">
            Back to edit
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={submitting}
            className="inline-flex items-center gap-2 bg-primary text-on-primary text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Submit Application
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────

export function ApplicationPage() {
  const navigate = useNavigate()
  const brand = useBrand()
  // The essay step is optional per municipality (Maintenance → Application).
  const hasEssay = brand.features?.essay !== false
  const steps = useMemo(
    () => STEP_DEFS.filter((d) => d.id !== 'essay' || hasEssay),
    [hasEssay],
  )
  const [step, setStep] = useState(0)
  // Uploaded files live here (not in the RHF draft — File objects can't be
  // serialized to storage), so they can be enforced and shown in the summary.
  const [uploads, setUploads] = useState({})
  const [reviewOpen, setReviewOpen] = useState(false)

  const {
    register,
    trigger,
    getValues,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: loadDraft() })

  useEffect(() => {
    const sub = watch((values) => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(values))
    })
    return () => sub.unsubscribe()
  }, [watch])

  const values = watch()

  const { data: requirements } = useQuery({
    queryKey: queryKeys.requirements.all,
    queryFn: () => api.get('/requirements').then((r) => r.data),
    retry: false,
    staleTime: 1000 * 60 * 5,
  })
  const documents = requirements?.documents?.length ? requirements.documents : FALLBACK_DOCUMENTS

  const completedSteps = steps.filter((s) => isStepComplete(s, values)).length
  const progress = Math.round((completedSteps / steps.length) * 100)

  function saveDraft() {
    const values = getValues()
    localStorage.setItem(DRAFT_KEY, JSON.stringify(values))
    toast.success('Draft saved.')
  }

  async function handleNext() {
    const fields = steps[step].fields
    if (fields.length) {
      const valid = await trigger(fields)
      if (!valid) return
    }
    setStep((s) => s + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleBack() {
    setStep((s) => s - 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const submitMutation = useMutation({
    mutationFn: (data) => api.post('/applications', data).then((r) => r.data),
    onSuccess: ({ id }) => {
      localStorage.removeItem(DRAFT_KEY)
      toast.success('Application submitted successfully!')
      navigate(`/applications/${id}`)
    },
    onError: (err) => {
      toast.error(err.response?.data?.message ?? 'Submission failed. Please try again.')
    },
  })

  // Validate the whole form + require all documents, then open the review step.
  async function openReview() {
    const valid = await trigger()
    if (!valid) {
      toast.error('Please complete all required fields before reviewing.')
      return
    }
    const missing = documents.filter((d) => !uploads[docNameOf(d)])
    if (missing.length) {
      toast.error(`Please upload all required documents (${missing.length} remaining).`)
      if (step !== steps.length - 1) setStep(steps.length - 1)
      return
    }
    setReviewOpen(true)
  }

  function confirmSubmit() {
    // Files are represented by name here; the actual multipart upload is a
    // backend concern (there's no upload endpoint yet).
    submitMutation.mutate({ ...getValues(), documents: documents.map(docNameOf) })
  }

  const isLast = step === steps.length - 1
  const currentId = steps[step].id

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <AppSidebar steps={steps} step={step} setStep={setStep} progress={progress} onSaveDraft={saveDraft} values={values} />

        {/* Main */}
        <main className="flex-1 bg-surface-alt overflow-y-auto">
          <div className="max-w-3xl mx-auto px-6 py-8">

            {/* Stepper */}
            <div className="mb-8 bg-surface border border-border rounded-xl p-4 shadow-card">
              <Stepper steps={steps} current={step} onStepClick={setStep} values={values} />
            </div>

            {/* Form card */}
            <div className="bg-surface border border-border rounded-xl shadow-card overflow-hidden">
              <div className="p-6 md:p-8">
                <form noValidate>
                  {currentId === 'personal'  && <Step1Personal register={register} errors={errors} />}
                  {currentId === 'academic'  && <Step2Academic register={register} errors={errors} />}
                  {currentId === 'family'    && <Step3Family   register={register} errors={errors} values={values} />}
                  {currentId === 'essay'     && <Step4Essay    register={register} errors={errors} values={values} />}
                  {currentId === 'documents' && (
                    <Step5Documents
                      register={register}
                      errors={errors}
                      documents={documents}
                      values={values}
                      uploads={uploads}
                      setUploads={setUploads}
                    />
                  )}
                </form>
              </div>

              {/* Action bar */}
              <div className="flex items-center justify-between px-6 md:px-8 py-5 border-t border-border bg-surface-alt">
                {step > 0 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="text-sm font-medium text-content-muted hover:text-content transition-colors flex items-center gap-1"
                  >
                    ← {isLast && step > 0 ? `Back to ${steps[step - 1].label}` : 'Back'}
                  </button>
                ) : (
                  <Link
                    to="/dashboard"
                    className="text-sm font-medium text-content-muted hover:text-content transition-colors"
                  >
                    Cancel
                  </Link>
                )}

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={saveDraft}
                    className="text-sm font-medium text-primary border border-primary px-4 py-2 rounded-lg hover:bg-primary-light transition-colors"
                  >
                    Save Draft
                  </button>

                  {isLast ? (
                    <button
                      type="button"
                      onClick={openReview}
                      className="bg-primary text-on-primary text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
                    >
                      <Send size={14} /> Review &amp; Submit
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="bg-primary text-on-primary text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-primary-dark transition-colors"
                    >
                      Next Step →
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>

        {reviewOpen && (
          <ReviewModal
            steps={steps}
            hasEssay={hasEssay}
            values={values}
            documents={documents}
            uploads={uploads}
            onEdit={(i) => { setStep(i); setReviewOpen(false) }}
            onClose={() => setReviewOpen(false)}
            onConfirm={confirmSubmit}
            submitting={submitMutation.isPending}
          />
        )}
    </div>
  )
}
