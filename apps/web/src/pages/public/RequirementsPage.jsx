import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, FileText, AlertCircle, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/axios'
import { queryKeys } from '../../lib/queryKeys'
import { Skeleton } from '../../components/shared/Skeleton'

const FALLBACK_QUALIFICATIONS = [
  'Official resident of Sta. Cruz, Laguna',
  'Currently enrolled in School Year 2026–2027',
  'General weighted average of at least 85% (or equivalent)',
  'With good moral character and no pending administrative case',
  'Not a recipient of another government scholarship',
]

const FALLBACK_DOCUMENTS = [
  { name: 'Accomplished Application Form', note: 'Download from the Forms page' },
  { name: 'Certificate of Residency (Barangay)', note: 'Issued by your barangay hall' },
  { name: 'Certified True Copy of Grades / Form 137', note: 'Certified by your school registrar' },
  { name: 'Certificate of Enrollment / Acceptance Letter', note: 'For the current school year' },
  { name: 'Barangay Certificate of Indigency / ITR of parents', note: 'Income Tax Return as alternative' },
  { name: '2x2 ID Picture (white background)', note: 'Taken within the last 6 months' },
  { name: 'Photocopy of valid government ID of guardian', note: 'Any government-issued ID' },
]

export function RequirementsPage() {
  const { data, isPending, isError } = useQuery({
    queryKey: queryKeys.requirements.all,
    queryFn: () => api.get('/requirements').then((r) => r.data),
    retry: false,
  })

  const useFallback = !isPending && (isError || !data?.qualifications?.length)
  const qualifications = useFallback ? FALLBACK_QUALIFICATIONS : (data?.qualifications ?? [])
  const documents = useFallback ? FALLBACK_DOCUMENTS : (data?.documents ?? [])

  return (
    <>
      {/* ── Page header ────────────────────────────────────── */}
      <section className="bg-primary-dark text-on-primary">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <h1 className="text-3xl font-bold mb-2">Scholarship Requirements</h1>
          <p className="text-on-primary/70 text-sm">
            Review the qualifications and required documents before you apply.
          </p>
        </div>
      </section>

      {/* ── Main content ───────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-8 items-start">

          {/* Qualifications */}
          <div className="bg-surface rounded-xl shadow-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center shrink-0">
                <CheckCircle2 size={20} className="text-primary" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-content">Qualifications</h2>
                <p className="text-xs text-content-muted">All criteria must be met</p>
              </div>
            </div>

            {isPending ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-5 w-full" />
                ))}
              </div>
            ) : (
              <ul className="space-y-4">
                {qualifications.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-success shrink-0 mt-0.5" />
                    <span className="text-sm text-content leading-snug">
                      {typeof item === 'string' ? item : item.text}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Required Documents */}
          <div className="bg-surface rounded-xl shadow-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center shrink-0">
                <FileText size={20} className="text-primary" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-content">Required Documents</h2>
                <p className="text-xs text-content-muted">
                  {isPending ? '—' : `${documents.length} documents required`}
                </p>
              </div>
            </div>

            {isPending ? (
              <div className="space-y-3">
                {Array.from({ length: 7 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-md" />
                ))}
              </div>
            ) : (
              <ol className="space-y-3">
                {documents.map((doc, i) => {
                  const name = typeof doc === 'string' ? doc : doc.name
                  const note = typeof doc === 'string' ? null : doc.note
                  return (
                    <li
                      key={i}
                      className="flex items-start gap-3 bg-surface-alt rounded-md px-4 py-3"
                    >
                      <span className="w-5 h-5 bg-primary text-on-primary text-xs font-bold rounded flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-content leading-snug">{name}</p>
                        {note && (
                          <p className="text-xs text-content-muted mt-0.5">{note}</p>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ol>
            )}
          </div>
        </div>

        {/* Download form callout */}
        <div className="mt-8 bg-primary-light rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <p className="text-sm font-semibold text-primary">Need the Application Form?</p>
            <p className="text-xs text-content-muted mt-0.5">
              Download the official scholarship application form from the Forms page.
            </p>
          </div>
          <Link
            to="/forms"
            className="inline-flex items-center gap-2 bg-primary text-on-primary text-sm px-5 py-2.5 rounded font-medium hover:bg-primary-dark transition-colors shrink-0"
          >
            Download Forms <ExternalLink size={13} />
          </Link>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 flex items-start gap-3 bg-warning-light border border-warning/20 rounded-lg p-4">
          <AlertCircle size={16} className="text-warning shrink-0 mt-0.5" />
          <p className="text-xs text-content leading-relaxed">
            Requirements are managed by the LYDO office and may be updated without prior notice. Always
            check this page for the latest list before submitting your application. For questions, contact
            the LYDO office at the Municipality of Sta. Cruz, Laguna.
          </p>
        </div>
      </section>
    </>
  )
}
