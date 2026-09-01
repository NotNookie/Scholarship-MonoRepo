import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ChevronLeft,
  ShieldAlert,
  Send,
  CloudUpload,
  Trash2,
  Info,
  CheckCircle2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../../lib/axios'
import { queryKeys } from '../../lib/queryKeys'
import { Skeleton } from '../../components/shared/Skeleton'
import { useBrand } from '../../tenant/TenantContext'

const APPEAL_REASONS = [
  'Document was incorrectly marked as invalid',
  'I have additional supporting documents',
  'There was an error in my submitted information',
  'My circumstances have changed',
  'Other',
]

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

export function AppealPage() {
  const { id } = useParams()
  const brand = useBrand()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [file, setFile] = useState(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { reason: '', statement: '' },
  })

  // Load the application to confirm it exists and is actually rejected.
  const { data, isPending } = useQuery({
    queryKey: queryKeys.applications.detail(id),
    queryFn: () => api.get(`/applications/${id}`).then((r) => r.data?.data ?? r.data),
    retry: false,
  })

  const application = data ?? null

  const mutation = useMutation({
    mutationFn: (payload) => {
      const form = new FormData()
      form.append('reason', payload.reason)
      form.append('statement', payload.statement)
      if (file) form.append('supporting_document', file)
      return api.post(`/applications/${id}/appeal`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    },
    onSuccess: () => {
      toast.success('Your appeal has been submitted for review.')
      queryClient.invalidateQueries({ queryKey: queryKeys.applications.detail(id) })
      navigate(`/applications/${id}`)
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message ?? 'Failed to submit appeal. Please try again.')
    },
  })

  function onSubmit(values) {
    mutation.mutate(values)
  }

  function handleFileChange(e) {
    const selected = e.target.files?.[0]
    if (selected) setFile(selected)
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 flex flex-col gap-8">

      {/* ── Back link ──────────────────────────────────────────── */}
      <Link to={`/applications/${id}`} className="inline-flex items-center gap-1.5 text-sm text-content-muted hover:text-primary transition-colors w-fit">
        <ChevronLeft size={15} /> Back to Application
      </Link>

      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="flex items-start gap-4">
        <div className="w-12 h-12 bg-danger-light rounded-xl flex items-center justify-center shrink-0">
          <ShieldAlert size={22} className="text-danger" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-content">Appeal for Reconsideration</h1>
          <p className="text-sm text-content-muted mt-1">
            Submit a formal request to have your scholarship application reviewed again by the {brand.officeShort} committee.
          </p>
        </div>
      </header>

      {/* ── Context card ───────────────────────────────────────── */}
      {isPending ? (
        <Skeleton className="h-20 w-full rounded-xl" />
      ) : application ? (
        <div className="bg-surface-alt border border-border rounded-xl px-5 py-4">
          <p className="text-xs text-content-muted">Appealing application</p>
          <p className="text-sm font-bold text-content mt-0.5">
            {application.scholarship_name ?? 'Scholarship Application'}
            <span className="text-content-muted font-normal"> · AY {application.academic_year ?? '2026–2027'}</span>
          </p>
          {application.decision_remarks && (
            <p className="text-xs text-danger mt-2 leading-snug">
              <span className="font-semibold">Decision remarks:</span> {application.decision_remarks}
            </p>
          )}
        </div>
      ) : null}

      {/* ── Guidance ───────────────────────────────────────────── */}
      <div className="flex items-start gap-3 bg-primary-light border border-primary/20 rounded-xl px-5 py-4">
        <Info size={16} className="text-primary shrink-0 mt-0.5" />
        <p className="text-xs text-content-muted leading-relaxed">
          Appeals must be filed within <span className="font-semibold text-content">15 days</span> of the
          decision. Provide a clear explanation and attach any new supporting documents that address the
          reason for rejection. The committee's decision on an appeal is final.
        </p>
      </div>

      {/* ── Form ───────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-surface border border-border rounded-xl shadow-card p-6 flex flex-col gap-6">

        <Field label="Reason for Appeal" id="reason" error={errors.reason}>
          <select
            id="reason"
            aria-invalid={!!errors.reason}
            className={inputCls(errors.reason)}
            {...register('reason', { required: 'Please select a reason for your appeal.' })}
          >
            <option value="">Select a reason…</option>
            {APPEAL_REASONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </Field>

        <Field
          label="Explanation / Statement"
          id="statement"
          error={errors.statement}
          hint="Explain why your application should be reconsidered. Be specific and factual."
        >
          <textarea
            id="statement"
            rows={6}
            placeholder="Provide a detailed explanation supporting your appeal…"
            aria-invalid={!!errors.statement}
            className={inputCls(errors.statement)}
            {...register('statement', {
              required: 'An explanation is required.',
              minLength: { value: 30, message: 'Please provide at least 30 characters.' },
            })}
          />
        </Field>

        {/* Supporting document upload */}
        <Field label="Supporting Document" id="supporting_document" optional hint="Attach one file (PDF, JPG, or PNG, max 5MB) if it supports your appeal.">
          {file ? (
            <div className="flex items-center justify-between border border-border rounded-lg px-4 py-3 bg-surface-alt">
              <div className="flex items-center gap-3 min-w-0">
                <CheckCircle2 size={16} className="text-tertiary-dark shrink-0" />
                <span className="text-sm text-content truncate">{file.name}</span>
              </div>
              <button
                type="button"
                onClick={() => setFile(null)}
                className="text-content-muted hover:text-danger transition-colors shrink-0"
                aria-label="Remove file"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ) : (
            <label
              htmlFor="supporting_document"
              className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-lg px-4 py-8 cursor-pointer hover:border-primary hover:bg-primary-light/40 transition-colors"
            >
              <CloudUpload size={24} className="text-content-muted" />
              <span className="text-sm text-content-muted">
                <span className="text-primary font-semibold">Click to upload</span> or drag and drop
              </span>
              <input
                id="supporting_document"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}
        </Field>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
          <Link
            to={`/applications/${id}`}
            className="text-sm font-medium text-content-muted px-4 py-2.5 rounded-lg hover:text-content transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="inline-flex items-center gap-2 bg-primary text-on-primary text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Send size={15} />
            {mutation.isPending ? 'Submitting…' : 'Submit Appeal'}
          </button>
        </div>
      </form>
    </div>
  )
}
