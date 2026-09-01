import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  FolderOpen,
  FileText,
  Map,
  ChevronDown,
  Download,
  Play,
  Clock,
  X,
} from 'lucide-react'
import { api } from '../../lib/axios'
import { queryKeys } from '../../lib/queryKeys'
import { Skeleton } from '../../components/shared/Skeleton'
import { FALLBACK_FORMS } from '../../data/forms'
import { useBrand } from '../../tenant/TenantContext'
import { useEscapeToClose } from '../../lib/useEscapeToClose'

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
  const brand = useBrand()
  const videoUrl = brand.walkthroughVideoUrl
  const hasVideo = !!videoUrl
  // Config-driven with a shared fallback: a municipality can supply its own
  // guide steps / FAQ, otherwise the generic defaults are used.
  const guideSteps = brand.guideSteps ?? GUIDE_STEPS
  const faqs = brand.faqs ?? FAQS
  const [showVideo, setShowVideo] = useState(false)
  useEscapeToClose(() => setShowVideo(false), showVideo)

  const { data, isPending } = useQuery({
    queryKey: queryKeys.forms.all,
    queryFn: () => api.get('/forms').then((r) => r.data),
    placeholderData: { data: FALLBACK_FORMS },
    retry: false,
  })
  const forms = data?.data?.length ? data.data : FALLBACK_FORMS

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

        {isPending ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {forms.map((form) => (
              <div
                key={form.id}
                className="bg-surface border border-border rounded-xl p-5 shadow-card hover:shadow-modal transition-shadow flex flex-col gap-4 group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-surface-alt rounded-bl-full -mr-6 -mt-6 transition-transform group-hover:scale-110" />
                <div className="flex items-start justify-between relative z-10">
                  <div className="w-11 h-11 rounded-lg bg-primary-light flex items-center justify-center shrink-0">
                    <FileText size={20} className="text-primary" />
                  </div>
                  <span className="text-xs text-content-muted bg-surface-alt border border-border px-2 py-0.5 rounded font-medium uppercase">
                    {form.format ?? 'PDF'}
                  </span>
                </div>
                <div className="relative z-10 flex-1">
                  <h3 className="text-sm font-bold text-content mb-1 leading-snug">{form.name}</h3>
                  {form.description && <p className="text-xs text-content-muted leading-snug line-clamp-2">{form.description}</p>}
                </div>
                <div className="relative z-10 pt-3 border-t border-border">
                  {form.url ? (
                    <a href={form.url} download className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
                      <Download size={14} /> Download
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-content-disabled" title="This file hasn't been uploaded by the office yet.">
                      <Download size={14} /> Not yet available
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Application Guide ────────────────────────────────── */}
      <section>
        <div className="flex items-center gap-3 border-b border-border pb-4 mb-6">
          <div className="w-9 h-9 bg-primary-light rounded-lg flex items-center justify-center shrink-0">
            <Map size={18} className="text-primary" />
          </div>
          <h2 className="text-xl font-bold text-content">Application Guide</h2>
        </div>

        <div className={`bg-surface border border-border rounded-2xl overflow-hidden shadow-card grid grid-cols-1 ${hasVideo ? 'lg:grid-cols-5' : ''}`}>
          {/* Video — only when this municipality has one */}
          {hasVideo && (
            <div className="lg:col-span-3 relative min-h-[260px] bg-primary-light flex items-center justify-center border-b lg:border-b-0 lg:border-r border-border">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary-dark/10" />
              <button
                type="button"
                onClick={() => setShowVideo(true)}
                aria-label="Play the application walkthrough video"
                className="relative z-10 w-16 h-16 rounded-full bg-surface/90 flex items-center justify-center shadow-modal hover:scale-105 transition-transform"
              >
                <Play size={22} className="text-primary ml-1" fill="currentColor" />
              </button>
              <div className="absolute bottom-4 left-4 bg-surface/90 px-3 py-1.5 rounded-lg border border-border shadow-sm flex items-center gap-2">
                <Clock size={13} className="text-content-muted" />
                <span className="text-xs font-medium text-content">Walkthrough Video</span>
              </div>
            </div>
          )}

          {/* Steps */}
          <div className={`${hasVideo ? 'lg:col-span-2' : ''} p-7 flex flex-col gap-7 bg-surface-alt`}>
            <h3 className="text-base font-bold text-primary">Step-by-Step Process</h3>
            <div className="flex flex-col gap-6 relative before:absolute before:top-0 before:bottom-0 before:left-3.5 before:w-px before:bg-border">
              {guideSteps.map(({ n, title, desc, done }) => (
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
            {brand.manualUrl ? (
              <a
                href={brand.manualUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 w-full py-2.5 rounded-lg border border-primary text-primary text-xs font-semibold hover:bg-primary-light transition-colors inline-flex items-center justify-center"
              >
                Read Full Manual
              </a>
            ) : (
              <button
                type="button"
                onClick={() => document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' })}
                className="mt-2 w-full py-2.5 rounded-lg border border-primary text-primary text-xs font-semibold hover:bg-primary-light transition-colors"
              >
                Read the FAQ
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section id="faq" className="scroll-mt-20 max-w-3xl mx-auto w-full">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-primary mb-2">Frequently Asked Questions</h2>
          <p className="text-sm text-content-muted">
            Find quick answers to common issues encountered during the application process.
          </p>
        </div>

        <div className="bg-surface border border-border rounded-xl shadow-card px-6">
          {faqs.map((item, i) => (
            <FaqItem key={item.q} q={item.q} a={item.a} defaultOpen={i === 0} />
          ))}
        </div>
      </section>

      {/* Walkthrough video lightbox */}
      {showVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowVideo(false)} />
          <div className="relative bg-surface rounded-xl shadow-modal w-full max-w-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-border">
              <p className="text-sm font-bold text-content">Application Walkthrough</p>
              <button onClick={() => setShowVideo(false)} className="text-content-muted hover:text-content" aria-label="Close video">
                <X size={18} />
              </button>
            </div>
            <video controls autoPlay className="w-full aspect-video bg-black" src={videoUrl}>
              Your browser doesn&rsquo;t support embedded video.
            </video>
            <p className="text-xs text-content-muted px-5 py-3">
              Placeholder walkthrough — replace with your municipality&rsquo;s own guide video.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
