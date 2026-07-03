import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, FileText, AlertCircle, GraduationCap, UserPlus, Upload, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/axios'
import { queryKeys } from '../../lib/queryKeys'
import { Skeleton } from '../../components/shared/Skeleton'

const FALLBACK_QUALIFICATIONS = [
  {
    label: 'Residency',
    text: 'Must be a bona fide resident of Sta. Cruz, Laguna for at least three (3) years.',
  },
  {
    label: 'Academic Standing',
    text: 'General Weighted Average (GWA) of at least 85% or its equivalent, with no failing grades.',
  },
  {
    label: 'Income Bracket',
    text: 'Combined annual family income must not exceed ₱250,000.',
  },
  {
    label: 'Enrollment Status',
    text: 'Must be enrolled or intending to enroll in a recognized State University or College (SUC) or CHED-accredited institution.',
  },
]

const FALLBACK_DOCUMENTS = [
  { name: 'PSA Birth Certificate',              note: 'Clear scanned copy of the original PSA document.' },
  { name: 'Official Report Card / Form 138',    note: 'Most recent semester or academic year, signed by the principal/registrar.' },
  { name: 'Barangay Certificate of Indigency',  note: "Must state the purpose: 'For Scholarship Application'. Issued within the last 3 months." },
  { name: "Voter's Registration / Certification", note: "Applicant or Parent's Comelec Certification from Sta. Cruz." },
  { name: 'ITR or Tax Exemption Certificate',   note: "Parents' Income Tax Return (ITR) or Certificate of Tax Exemption from BIR." },
]

const HOW_TO_STEPS = [
  { n: 1, Icon: UserPlus,  title: 'Create an Account',   desc: 'Register on the Iskolar ng Bayan portal using a valid email address.' },
  { n: 2, Icon: FileText,  title: 'Prepare Documents',   desc: 'Scan all required documents clearly and save them in PDF format.' },
  { n: 3, Icon: Upload,    title: 'Submit Online',        desc: 'Fill out the digital application form and upload your documents securely.' },
  { n: 4, Icon: Search,    title: 'Track Status',         desc: 'Monitor your dashboard for evaluation updates and interview schedules.' },
]

export function RequirementsPage() {
  const { data, isPending } = useQuery({
    queryKey: queryKeys.requirements.all,
    queryFn: () => api.get('/requirements').then((r) => r.data),
    placeholderData: { qualifications: FALLBACK_QUALIFICATIONS, documents: FALLBACK_DOCUMENTS },
    retry: false,
  })

  const qualifications = data?.qualifications?.length ? data.qualifications : FALLBACK_QUALIFICATIONS
  const documents = data?.documents?.length ? data.documents : FALLBACK_DOCUMENTS

  return (
    <>
      {/* ── Page header ────────────────────────────────────── */}
      <section className="bg-primary-dark text-on-primary">
        <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-2 bg-white/10 text-secondary text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
              <span className="w-1.5 h-1.5 bg-secondary rounded-full shrink-0" />
              AY 2026–2027
            </div>
            <h1 className="text-3xl font-bold mb-3">Iskolar ng Bayan Requirements</h1>
            <p className="text-on-primary/70 text-sm leading-relaxed max-w-lg mb-6">
              Prepare your documents early. Review the eligibility criteria and comprehensive list of
              requirements below to ensure a smooth application process for the Municipal Youth
              Development Office scholarship program in Sta. Cruz, Laguna.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-primary text-on-primary text-sm px-5 py-2.5 rounded font-semibold hover:bg-primary-light hover:text-primary transition-colors border border-on-primary/20"
              >
                <UserPlus size={15} />
                Start Application
              </Link>
              <button
                disabled
                title="Download coming soon"
                className="inline-flex items-center gap-2 border border-on-primary/30 text-on-primary/60 text-sm px-5 py-2.5 rounded font-medium cursor-not-allowed"
              >
                <FileText size={15} />
                Download Checklist
              </button>
            </div>
          </div>

          {/* Right — illustration placeholder */}
          <div className="hidden md:flex w-56 h-56 rounded-2xl bg-white/10 items-center justify-center shrink-0 border border-white/10">
            <GraduationCap size={72} strokeWidth={1.2} className="text-on-primary/30" />
          </div>
        </div>
      </section>

      {/* ── Requirements columns ───────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-8 items-start">

          {/* Eligibility Criteria */}
          <div className="bg-surface rounded-xl shadow-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center shrink-0">
                <CheckCircle2 size={20} className="text-primary" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-content">Eligibility Criteria</h2>
                <p className="text-xs text-content-muted">All criteria must be met</p>
              </div>
            </div>

            {isPending ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-1.5">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                ))}
              </div>
            ) : (
              <ul className="space-y-5">
                {qualifications.map((item, i) => {
                  const label = typeof item === 'string' ? null : item.label
                  const text = typeof item === 'string' ? item : item.text
                  return (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 size={16} className="text-success shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        {label && (
                          <p className="text-xs font-semibold text-primary mb-0.5">{label}</p>
                        )}
                        <p className="text-sm text-content leading-snug">{text}</p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          {/* Required Documents */}
          <div className="bg-surface rounded-xl shadow-card p-6">
            <div className="flex items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-3">
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
              <span className="text-xs bg-border text-content-muted px-2 py-1 rounded font-medium shrink-0">
                Format: PDF only
              </span>
            </div>

            {isPending ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-md" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {documents.map((doc, i) => {
                  const name = typeof doc === 'string' ? doc : doc.name
                  const note = typeof doc === 'string' ? null : doc.note
                  return (
                    <div
                      key={i}
                      className="bg-surface-alt rounded-lg p-3 flex flex-col gap-1"
                    >
                      <div className="flex items-start gap-2">
                        <FileText size={14} className="text-primary shrink-0 mt-0.5" />
                        <p className="text-xs font-semibold text-content leading-snug">{name}</p>
                      </div>
                      {note && (
                        <p className="text-xs text-content-muted leading-snug pl-5">{note}</p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── How to Apply ─────────────────────────────────── */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-content text-center mb-2">How to Apply</h2>
          <p className="text-sm text-content-muted text-center mb-10">
            Follow these steps to complete your scholarship application.
          </p>

          <div className="relative flex flex-col md:flex-row items-stretch md:items-start gap-6 md:gap-0">
            <div className="hidden md:block absolute top-6 left-[12%] right-[12%] h-px bg-border z-0" />
            {HOW_TO_STEPS.map(({ n, Icon, title, desc }) => (
              <div
                key={n}
                className="flex-1 flex flex-row md:flex-col items-start md:items-center gap-4 md:gap-3 relative z-10 md:px-4"
              >
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                    <Icon size={20} className="text-on-primary" />
                  </div>
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-secondary text-on-secondary text-xs font-bold rounded-full flex items-center justify-center">
                    {n}
                  </span>
                </div>
                <div className="md:text-center">
                  <p className="text-sm font-semibold text-content">{title}</p>
                  <p className="text-xs text-content-muted mt-0.5 md:max-w-[130px]">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-10 flex items-start gap-3 bg-warning-light border border-warning/20 rounded-lg p-4">
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
