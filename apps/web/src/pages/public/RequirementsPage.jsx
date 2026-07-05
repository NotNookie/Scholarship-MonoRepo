import { useState } from 'react'
import {
  FolderOpen,
  FileText,
  Map,
  ChevronDown,
  Download,
  UserPlus,
  Upload,
  Search,
  Play,
  Clock,
} from 'lucide-react'

const FORMS = [
  {
    Icon: FileText,
    iconBg: 'bg-danger-light',
    iconColor: 'text-danger',
    label: 'PDF • 2.4 MB',
    title: 'Official Application Form 2024',
    desc: 'The primary application document required for all new scholarship applicants.',
  },
  {
    Icon: FileText,
    iconBg: 'bg-primary-light',
    iconColor: 'text-primary',
    label: 'DOCX • 1.1 MB',
    title: 'Certificate of Indigency Template',
    desc: 'Standard format to be filled out and signed by your local Barangay Captain.',
  },
  {
    Icon: FileText,
    iconBg: 'bg-secondary-light',
    iconColor: 'text-on-secondary',
    label: 'XLSX • 0.8 MB',
    title: 'Grade Computation Sheet',
    desc: 'A helpful excel tool to calculate your General Weighted Average (GWA) accurately.',
  },
]

const GUIDE_STEPS = [
  {
    n: 1,
    title: 'Prepare Documents',
    desc: 'Gather your grades, ID, and certificate of indigency before starting.',
    done: true,
  },
  {
    n: 2,
    title: 'Create an Account',
    desc: 'Register using your valid student email address and verify it.',
    done: false,
  },
  {
    n: 3,
    title: 'Submit Application',
    desc: 'Fill out the digital form and securely upload your scanned documents.',
    done: false,
  },
]

const FAQS = [
  {
    q: 'What file formats are accepted for document uploads?',
    a: 'The system currently accepts PDF, JPEG, and PNG formats. Please ensure that all scans or photos are clear, legible, and do not exceed 5MB per file.',
  },
  {
    q: 'How long does it take to process my application?',
    a: 'Processing typically takes 2–3 weeks after the submission deadline. You can track your application status in real-time through your Student Dashboard.',
  },
  {
    q: 'Can I update my documents after submitting?',
    a: "Once an application is marked as 'Submitted', you cannot modify the attached documents directly. If you made an error, please contact the scholarship office immediately to request a temporary unlock of your file.",
  },
]

function FaqItem({ q, a, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-border last:border-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 py-5 text-left"
      >
        <span className="text-sm font-semibold text-content">{q}</span>
        <ChevronDown
          size={16}
          className={`text-content-muted shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <p className="text-sm text-content-muted leading-relaxed pb-5 pr-6">{a}</p>
      )}
    </div>
  )
}

export function RequirementsPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12 flex flex-col gap-14">

      {/* ── Page header ──────────────────────────────────────── */}
      <header className="max-w-2xl">
        <h1 className="text-3xl font-bold text-primary mb-3">Applicant Resources</h1>
        <p className="text-sm text-content-muted leading-relaxed">
          Everything you need to successfully apply for the municipal scholarship program.
          Download official forms, follow step-by-step guides, and find answers to common questions.
        </p>
      </header>

      {/* ── Downloadable Forms ───────────────────────────────── */}
      <section>
        <div className="flex items-center gap-3 border-b border-border pb-4 mb-6">
          <div className="w-9 h-9 bg-primary-light rounded-lg flex items-center justify-center shrink-0">
            <FolderOpen size={18} className="text-primary" />
          </div>
          <h2 className="text-xl font-bold text-content">Downloadable Forms</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {FORMS.map(({ Icon, iconBg, iconColor, label, title, desc }) => (
            <div
              key={title}
              className="bg-surface border border-border rounded-xl p-5 shadow-card hover:shadow-modal transition-shadow flex flex-col gap-4 group cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-surface-alt rounded-bl-full -mr-6 -mt-6 transition-transform group-hover:scale-110" />
              <div className="flex items-start justify-between relative z-10">
                <div className={`w-11 h-11 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
                  <Icon size={20} className={iconColor} />
                </div>
                <span className="text-xs text-content-muted bg-surface-alt border border-border px-2 py-0.5 rounded font-medium">
                  {label}
                </span>
              </div>
              <div className="relative z-10 flex-1">
                <h3 className="text-sm font-bold text-content mb-1 group-hover:text-primary transition-colors leading-snug">
                  {title}
                </h3>
                <p className="text-xs text-content-muted leading-snug line-clamp-2">{desc}</p>
              </div>
              <div className="relative z-10 pt-3 border-t border-border flex items-center justify-between">
                <span className="text-xs font-semibold text-primary group-hover:underline">Download</span>
                <Download size={14} className="text-primary group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Application Guide ────────────────────────────────── */}
      <section>
        <div className="flex items-center gap-3 border-b border-border pb-4 mb-6">
          <div className="w-9 h-9 bg-primary-light rounded-lg flex items-center justify-center shrink-0">
            <Map size={18} className="text-primary" />
          </div>
          <h2 className="text-xl font-bold text-content">Application Guide</h2>
        </div>

        <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-card grid grid-cols-1 lg:grid-cols-5">
          {/* Video */}
          <div className="lg:col-span-3 relative min-h-[260px] bg-primary-light flex items-center justify-center border-b lg:border-b-0 lg:border-r border-border">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary-dark/10" />
            <button
              type="button"
              className="relative z-10 w-16 h-16 rounded-full bg-surface/90 flex items-center justify-center shadow-modal hover:scale-105 transition-transform"
            >
              <Play size={22} className="text-primary ml-1" fill="currentColor" />
            </button>
            <div className="absolute bottom-4 left-4 bg-surface/90 px-3 py-1.5 rounded-lg border border-border shadow-sm flex items-center gap-2">
              <Clock size={13} className="text-content-muted" />
              <span className="text-xs font-medium text-content">5:30 Walkthrough Video</span>
            </div>
          </div>

          {/* Steps */}
          <div className="lg:col-span-2 p-7 flex flex-col gap-7 bg-surface-alt">
            <h3 className="text-base font-bold text-primary">Step-by-Step Process</h3>
            <div className="flex flex-col gap-6 relative before:absolute before:top-0 before:bottom-0 before:left-3.5 before:w-px before:bg-border">
              {GUIDE_STEPS.map(({ n, title, desc, done }) => (
                <div key={n} className="flex gap-4 relative">
                  <div
                    className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold shadow-sm z-10 relative ${
                      done
                        ? 'bg-primary text-on-primary'
                        : n === 2
                        ? 'bg-surface border-2 border-primary text-primary'
                        : 'bg-surface border-2 border-border text-content-muted'
                    }`}
                  >
                    {n}
                  </div>
                  <div className="pt-0.5">
                    <p className="text-sm font-semibold text-content">{title}</p>
                    <p className="text-xs text-content-muted mt-0.5 leading-snug">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="mt-2 w-full py-2.5 rounded-lg border border-primary text-primary text-xs font-semibold hover:bg-primary-light transition-colors"
            >
              Read Full Manual
            </button>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto w-full">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-primary mb-2">Frequently Asked Questions</h2>
          <p className="text-sm text-content-muted">
            Find quick answers to common issues encountered during the application process.
          </p>
        </div>

        <div className="bg-surface border border-border rounded-xl shadow-card px-6">
          {FAQS.map((item, i) => (
            <FaqItem key={item.q} q={item.q} a={item.a} defaultOpen={i === 0} />
          ))}
        </div>
      </section>
    </div>
  )
}
