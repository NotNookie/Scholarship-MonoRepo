import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery } from '@tanstack/react-query'
import {
  User, Phone, MapPin, Calendar, BookOpen,
  GraduationCap, FileText, Check, Banknote,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../../lib/axios'
import { queryKeys } from '../../lib/queryKeys'

// ── Constants ────────────────────────────────────────────────

const DRAFT_KEY = 'iskolar-application-draft'

const STEPS = [
  { label: 'Personal Info' },
  { label: 'Family Background' },
  { label: 'Academic Info' },
  { label: 'Documents' },
  { label: 'Review & Submit' },
]

const STEP_FIELDS = [
  ['first_name', 'last_name', 'birthdate', 'sex', 'civil_status', 'street_address', 'barangay', 'mobile'],
  ['father_name', 'father_occupation', 'father_monthly_income', 'mother_name', 'mother_occupation', 'mother_monthly_income', 'num_siblings', 'annual_family_income'],
  ['school_name', 'course', 'year_level', 'gwa', 'student_id'],
  ['doc_acknowledged'],
  ['attest'],
]

const FALLBACK_DOCUMENTS = [
  { name: 'PSA Birth Certificate',               note: 'Clear scanned copy of the original PSA document.' },
  { name: 'Official Report Card / Form 138',     note: 'Most recent semester or academic year, signed by the principal/registrar.' },
  { name: 'Barangay Certificate of Indigency',   note: "Must state the purpose: 'For Scholarship Application'. Issued within the last 3 months." },
  { name: "Voter's Registration / Certification", note: "Applicant or Parent's Comelec Certification from Sta. Cruz." },
  { name: 'ITR or Tax Exemption Certificate',    note: "Parents' Income Tax Return (ITR) or Certificate of Tax Exemption from BIR." },
]

function loadDraft() {
  try {
    return JSON.parse(sessionStorage.getItem(DRAFT_KEY) ?? 'null') ?? {}
  } catch {
    return {}
  }
}

// ── Stepper ──────────────────────────────────────────────────

function Stepper({ current }) {
  return (
    <div className="flex items-start">
      {STEPS.map((step, i) => {
        const done = i < current
        const active = i === current
        return (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5 shrink-0">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  done
                    ? 'bg-primary text-on-primary'
                    : active
                    ? 'bg-primary text-on-primary ring-4 ring-primary/20'
                    : 'bg-border text-content-muted'
                }`}
              >
                {done ? <Check size={14} strokeWidth={3} /> : i + 1}
              </div>
              <span
                className={`text-xs font-medium text-center leading-tight hidden sm:block ${
                  active ? 'text-primary' : done ? 'text-content' : 'text-content-muted'
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`flex-1 h-px mx-2 mt-4 sm:mt-0 sm:mb-5 ${i < current ? 'bg-primary' : 'bg-border'}`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Shared input helpers ─────────────────────────────────────

function Field({ label, id, error, hint, children }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium text-content">
        {label}
      </label>
      {children}
      {error ? (
        <p role="alert" className="text-xs text-danger">
          {error.message}
        </p>
      ) : hint ? (
        <p className="text-xs text-content-muted">{hint}</p>
      ) : null}
    </div>
  )
}

const inputCls = (err) =>
  `w-full text-sm px-3 py-3 rounded-lg border bg-surface-alt focus:outline-none focus:border-primary transition-colors ${
    err ? 'border-danger' : 'border-border'
  }`

const iconInputCls = (err) =>
  `w-full text-sm pl-10 pr-4 py-3 rounded-lg border bg-surface-alt focus:outline-none focus:border-primary transition-colors ${
    err ? 'border-danger' : 'border-border'
  }`

function SectionLabel({ children }) {
  return (
    <p className="text-xs font-semibold text-content-muted uppercase tracking-wider">
      {children}
    </p>
  )
}

// ── Steps ────────────────────────────────────────────────────

function Step1Personal({ register, errors }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-content">Personal Information</h2>
        <p className="text-sm text-content-muted mt-0.5">
          Provide your details as they appear on official documents.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="First Name" id="first_name" error={errors.first_name}>
          <div className="relative">
            <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-content-muted pointer-events-none" />
            <input
              id="first_name" type="text" placeholder="Juan"
              autoComplete="given-name" aria-invalid={!!errors.first_name}
              className={iconInputCls(errors.first_name)}
              {...register('first_name', { required: 'Required', minLength: { value: 2, message: 'Too short' } })}
            />
          </div>
        </Field>
        <Field label="Last Name" id="last_name" error={errors.last_name}>
          <div className="relative">
            <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-content-muted pointer-events-none" />
            <input
              id="last_name" type="text" placeholder="Dela Cruz"
              autoComplete="family-name" aria-invalid={!!errors.last_name}
              className={iconInputCls(errors.last_name)}
              {...register('last_name', { required: 'Required', minLength: { value: 2, message: 'Too short' } })}
            />
          </div>
        </Field>
      </div>

      <Field label="Middle Name" id="middle_name" hint="Leave blank if none.">
        <input
          id="middle_name" type="text" placeholder="Santos (optional)"
          autoComplete="additional-name"
          className={inputCls(false)}
          {...register('middle_name')}
        />
      </Field>

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
            <option value="">Select sex</option>
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

      <Field label="Street / House No." id="street_address" error={errors.street_address}>
        <div className="relative">
          <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-content-muted pointer-events-none" />
          <input
            id="street_address" type="text" placeholder="123 Rizal St."
            aria-invalid={!!errors.street_address}
            className={iconInputCls(errors.street_address)}
            {...register('street_address', { required: 'Street address is required' })}
          />
        </div>
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Barangay" id="barangay" error={errors.barangay}>
          <input
            id="barangay" type="text" placeholder="e.g., Barangay 1"
            aria-invalid={!!errors.barangay}
            className={inputCls(errors.barangay)}
            {...register('barangay', { required: 'Barangay is required' })}
          />
        </Field>
        <Field label="Municipality">
          <input
            type="text" value="Sta. Cruz, Laguna" readOnly
            className="w-full text-sm px-3 py-3 rounded-lg border border-border bg-border/40 text-content-muted cursor-not-allowed"
          />
        </Field>
      </div>

      <Field label="Mobile Number" id="mobile" error={errors.mobile} hint="Used for verification and application updates.">
        <div className="relative">
          <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-content-muted pointer-events-none" />
          <input
            id="mobile" type="tel" placeholder="09XXXXXXXXX"
            inputMode="numeric" autoComplete="tel"
            aria-invalid={!!errors.mobile}
            className={iconInputCls(errors.mobile)}
            {...register('mobile', {
              required: 'Mobile number is required',
              pattern: { value: /^09\d{9}$/, message: 'Enter a valid PH mobile number (e.g. 09XXXXXXXXX)' },
            })}
          />
        </div>
      </Field>
    </div>
  )
}

function Step2Family({ register, errors }) {
  const numericRules = {
    required: 'Required',
    valueAsNumber: true,
    validate: (v) => Number.isFinite(v) || 'Enter a valid number',
    min: { value: 0, message: 'Must be 0 or more' },
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-content">Family & Economic Background</h2>
        <p className="text-sm text-content-muted mt-0.5">
          Provide information about your family's socioeconomic situation.
        </p>
      </div>

      <SectionLabel>Father / Male Guardian</SectionLabel>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Full Name" id="father_name" error={errors.father_name}>
          <input
            id="father_name" type="text" placeholder="Juan Dela Cruz Sr."
            aria-invalid={!!errors.father_name}
            className={inputCls(errors.father_name)}
            {...register('father_name', { required: 'Required' })}
          />
        </Field>
        <Field label="Occupation" id="father_occupation" error={errors.father_occupation}>
          <input
            id="father_occupation" type="text" placeholder="Farmer"
            aria-invalid={!!errors.father_occupation}
            className={inputCls(errors.father_occupation)}
            {...register('father_occupation', { required: 'Required' })}
          />
        </Field>
      </div>
      <Field label="Monthly Income (₱)" id="father_monthly_income" error={errors.father_monthly_income}>
        <div className="relative">
          <Banknote size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-content-muted pointer-events-none" />
          <input
            id="father_monthly_income" type="number" min={0} placeholder="0"
            inputMode="numeric" aria-invalid={!!errors.father_monthly_income}
            className={iconInputCls(errors.father_monthly_income)}
            {...register('father_monthly_income', numericRules)}
          />
        </div>
      </Field>

      <div className="border-t border-border pt-5 space-y-4">
        <SectionLabel>Mother / Female Guardian</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Full Name" id="mother_name" error={errors.mother_name}>
            <input
              id="mother_name" type="text" placeholder="Maria Santos Dela Cruz"
              aria-invalid={!!errors.mother_name}
              className={inputCls(errors.mother_name)}
              {...register('mother_name', { required: 'Required' })}
            />
          </Field>
          <Field label="Occupation" id="mother_occupation" error={errors.mother_occupation}>
            <input
              id="mother_occupation" type="text" placeholder="Housewife"
              aria-invalid={!!errors.mother_occupation}
              className={inputCls(errors.mother_occupation)}
              {...register('mother_occupation', { required: 'Required' })}
            />
          </Field>
        </div>
        <Field label="Monthly Income (₱)" id="mother_monthly_income" error={errors.mother_monthly_income}>
          <div className="relative">
            <Banknote size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-content-muted pointer-events-none" />
            <input
              id="mother_monthly_income" type="number" min={0} placeholder="0"
              inputMode="numeric" aria-invalid={!!errors.mother_monthly_income}
              className={iconInputCls(errors.mother_monthly_income)}
              {...register('mother_monthly_income', numericRules)}
            />
          </div>
        </Field>
      </div>

      <div className="border-t border-border pt-5 space-y-4">
        <SectionLabel>Household</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Number of Siblings" id="num_siblings" error={errors.num_siblings}>
            <input
              id="num_siblings" type="number" min={0} placeholder="0"
              inputMode="numeric" aria-invalid={!!errors.num_siblings}
              className={inputCls(errors.num_siblings)}
              {...register('num_siblings', numericRules)}
            />
          </Field>
          <Field label="Combined Annual Family Income (₱)" id="annual_family_income" error={errors.annual_family_income}>
            <div className="relative">
              <Banknote size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-content-muted pointer-events-none" />
              <input
                id="annual_family_income" type="number" min={0} placeholder="0"
                inputMode="numeric" aria-invalid={!!errors.annual_family_income}
                className={iconInputCls(errors.annual_family_income)}
                {...register('annual_family_income', numericRules)}
              />
            </div>
          </Field>
        </div>
      </div>
    </div>
  )
}

function Step3Academic({ register, errors }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-content">Academic Information</h2>
        <p className="text-sm text-content-muted mt-0.5">
          Provide your current school and academic details.
        </p>
      </div>

      <Field label="School / University" id="school_name" error={errors.school_name}>
        <div className="relative">
          <GraduationCap size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-content-muted pointer-events-none" />
          <input
            id="school_name" type="text"
            placeholder="e.g., Laguna State Polytechnic University"
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
            placeholder="e.g., BS Information Technology"
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
            <option value="">Select year level</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
            <option value="5">5th Year</option>
          </select>
        </Field>
        <Field
          label="General Weighted Average"
          id="gwa"
          error={errors.gwa}
          hint={!errors.gwa ? 'Previous semester. Enter as percentage (e.g. 90.5).' : undefined}
        >
          <input
            id="gwa" type="number" step="0.01" min={1} max={100}
            placeholder="e.g., 90.5"
            inputMode="decimal" aria-invalid={!!errors.gwa}
            className={inputCls(errors.gwa)}
            {...register('gwa', {
              required: 'GWA is required',
              valueAsNumber: true,
              validate: (v) => Number.isFinite(v) || 'Enter a valid GWA',
              min: { value: 1, message: 'GWA must be between 1 and 100' },
              max: { value: 100, message: 'GWA cannot exceed 100' },
            })}
          />
        </Field>
      </div>

      <Field label="Student ID Number" id="student_id" error={errors.student_id}>
        <input
          id="student_id" type="text" placeholder="e.g., 2024-00001"
          aria-invalid={!!errors.student_id}
          className={inputCls(errors.student_id)}
          {...register('student_id', { required: 'Student ID is required' })}
        />
      </Field>
    </div>
  )
}

function Step4Documents({ register, errors, documents }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-content">Required Documents</h2>
        <p className="text-sm text-content-muted mt-0.5">
          Review the list below. You will upload the actual files after submitting this form.
        </p>
      </div>

      <div className="space-y-2.5">
        {documents.map((doc, i) => {
          const name = typeof doc === 'string' ? doc : doc.name
          const note = typeof doc === 'string' ? null : doc.note
          return (
            <div key={i} className="flex items-start gap-3 bg-surface-alt rounded-lg px-4 py-3 border border-border">
              <FileText size={15} className="text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-content">{name}</p>
                {note && <p className="text-xs text-content-muted mt-0.5">{note}</p>}
              </div>
            </div>
          )
        })}
      </div>

      <div
        className={`rounded-lg border p-4 ${
          errors.doc_acknowledged ? 'border-danger bg-danger-light' : 'border-border bg-surface-alt'
        }`}
      >
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 mt-0.5 rounded accent-primary shrink-0"
            {...register('doc_acknowledged', {
              required: 'Please confirm you have read and will prepare the required documents.',
            })}
          />
          <span className="text-sm text-content">
            I have read the list above and will prepare all required documents for upload after submitting this form.
          </span>
        </label>
        {errors.doc_acknowledged && (
          <p role="alert" className="text-xs text-danger mt-2 ml-7">
            {errors.doc_acknowledged.message}
          </p>
        )}
      </div>
    </div>
  )
}

function ReviewRow({ label, value }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-4 py-2.5 border-b border-border last:border-0">
      <span className="text-xs text-content-muted sm:w-44 shrink-0">{label}</span>
      <span className="text-sm text-content">{value || '—'}</span>
    </div>
  )
}

const SEX_LABELS    = { male: 'Male', female: 'Female', prefer_not_to_say: 'Prefer not to say' }
const CIVIL_LABELS  = { single: 'Single', married: 'Married', widowed: 'Widowed' }
const YEAR_LABELS   = { 1: '1st Year', 2: '2nd Year', 3: '3rd Year', 4: '4th Year', 5: '5th Year' }

function Step5Review({ values, register, errors }) {
  const php = (n) => `₱${Number(n ?? 0).toLocaleString()}`
  const fullName = [values.first_name, values.middle_name, values.last_name].filter(Boolean).join(' ')
  const address  = [values.street_address, values.barangay, 'Sta. Cruz, Laguna'].filter(Boolean).join(', ')

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-content">Review Your Application</h2>
        <p className="text-sm text-content-muted mt-0.5">
          Please review all details carefully before submitting.
        </p>
      </div>

      <div>
        <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Personal Information</p>
        <div className="bg-surface-alt rounded-lg px-4">
          <ReviewRow label="Full Name"     value={fullName} />
          <ReviewRow label="Date of Birth" value={values.birthdate} />
          <ReviewRow label="Sex"           value={SEX_LABELS[values.sex]} />
          <ReviewRow label="Civil Status"  value={CIVIL_LABELS[values.civil_status]} />
          <ReviewRow label="Address"       value={address} />
          <ReviewRow label="Mobile"        value={values.mobile} />
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Family & Economic Background</p>
        <div className="bg-surface-alt rounded-lg px-4">
          <ReviewRow label="Father / Guardian" value={`${values.father_name ?? '—'} · ${values.father_occupation ?? '—'} · ${php(values.father_monthly_income)}/mo`} />
          <ReviewRow label="Mother / Guardian" value={`${values.mother_name ?? '—'} · ${values.mother_occupation ?? '—'} · ${php(values.mother_monthly_income)}/mo`} />
          <ReviewRow label="No. of Siblings"   value={String(values.num_siblings ?? '—')} />
          <ReviewRow label="Annual Income"      value={php(values.annual_family_income)} />
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Academic Information</p>
        <div className="bg-surface-alt rounded-lg px-4">
          <ReviewRow label="School / University" value={values.school_name} />
          <ReviewRow label="Course / Program"    value={values.course} />
          <ReviewRow label="Year Level"          value={YEAR_LABELS[values.year_level]} />
          <ReviewRow label="GWA"                 value={values.gwa?.toString()} />
          <ReviewRow label="Student ID"          value={values.student_id} />
        </div>
      </div>

      <div
        className={`rounded-lg border p-4 ${
          errors.attest ? 'border-danger bg-danger-light' : 'border-border bg-surface-alt'
        }`}
      >
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 mt-0.5 rounded accent-primary shrink-0"
            {...register('attest', {
              required: 'You must attest to the accuracy of the information provided.',
            })}
          />
          <span className="text-sm text-content">
            I certify that all information provided in this application is true, correct, and complete to the best of my knowledge. I understand that any false or misleading information may result in the disqualification of my application.
          </span>
        </label>
        {errors.attest && (
          <p role="alert" className="text-xs text-danger mt-2 ml-7">
            {errors.attest.message}
          </p>
        )}
      </div>
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────

export function ApplicationPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: loadDraft() })

  useEffect(() => {
    const sub = watch((values) => {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(values))
    })
    return () => sub.unsubscribe()
  }, [watch])

  const { data: requirements } = useQuery({
    queryKey: queryKeys.requirements.all,
    queryFn: () => api.get('/requirements').then((r) => r.data),
    retry: false,
    staleTime: 1000 * 60 * 5,
  })
  const documents = requirements?.documents?.length ? requirements.documents : FALLBACK_DOCUMENTS

  async function handleNext() {
    const fields = STEP_FIELDS[step]
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
      sessionStorage.removeItem(DRAFT_KEY)
      toast.success('Application submitted successfully!')
      navigate(`/applications/${id}`)
    },
    onError: (err) => {
      toast.error(err.response?.data?.message ?? 'Submission failed. Please try again.')
    },
  })

  const onSubmit = handleSubmit((data) => submitMutation.mutate(data))
  const isLast = step === STEPS.length - 1

  const now = new Date()
  const ay = `${now.getFullYear()}–${now.getFullYear() + 1}`

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-content">Scholarship Application</h1>
        <p className="text-sm text-content-muted mt-1">
          AY {ay} · Complete all sections before submitting.
        </p>
      </div>

      <Stepper current={step} />

      <div className="bg-surface rounded-xl shadow-card p-6 mt-6">
        {step === 0 && <Step1Personal register={register} errors={errors} />}
        {step === 1 && <Step2Family   register={register} errors={errors} />}
        {step === 2 && <Step3Academic register={register} errors={errors} />}
        {step === 3 && <Step4Documents register={register} errors={errors} documents={documents} />}
        {step === 4 && <Step5Review values={getValues()} register={register} errors={errors} />}

        <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
          {step > 0 ? (
            <button
              type="button"
              onClick={handleBack}
              className="text-sm font-medium text-content-muted hover:text-content transition-colors"
            >
              ← Back
            </button>
          ) : (
            <div />
          )}

          {isLast ? (
            <button
              type="button"
              onClick={onSubmit}
              disabled={submitMutation.isPending}
              className="bg-primary text-on-primary text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {submitMutation.isPending ? 'Submitting…' : 'Submit Application →'}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="bg-primary text-on-primary text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-primary-dark transition-colors"
            >
              Next →
            </button>
          )}
        </div>
      </div>

      <p className="text-center text-xs text-content-muted mt-4">
        Step {step + 1} of {STEPS.length} — {STEPS[step].label}
      </p>
    </div>
  )
}
