import { useQuery } from '@tanstack/react-query'
import { FileText, Download, FolderOpen } from 'lucide-react'
import { api } from '../../lib/axios'
import { queryKeys } from '../../lib/queryKeys'
import { Skeleton } from '../../components/shared/Skeleton'
import { EmptyState } from '../../components/shared/EmptyState'

const FALLBACK_FORMS = [
  {
    id: 1,
    name: 'Scholarship Application Form',
    description: 'For new applicants applying for the scholarship for the first time.',
    format: 'PDF',
    url: null,
  },
  {
    id: 2,
    name: 'Renewal Application Form',
    description: 'For continuing scholars renewing their scholarship for another term.',
    format: 'PDF',
    url: null,
  },
  {
    id: 3,
    name: 'Program Guidelines & Mechanics',
    description: 'Official scholarship program guidelines, terms, and conditions.',
    format: 'PDF',
    url: null,
  },
  {
    id: 4,
    name: 'Appeal / Reconsideration Form',
    description: 'For applicants who wish to appeal a rejected or incomplete application.',
    format: 'PDF',
    url: null,
  },
]

export function FormsPage() {
  const { data, isPending } = useQuery({
    queryKey: queryKeys.forms.all,
    queryFn: () => api.get('/forms').then((r) => r.data),
    placeholderData: { data: FALLBACK_FORMS },
    retry: false,
  })

  const forms = data?.data?.length ? data.data : FALLBACK_FORMS

  return (
    <>
      {/* ── Page header ────────────────────────────────────── */}
      <section className="bg-primary-dark text-on-primary">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <h1 className="text-3xl font-bold mb-2">Downloadable Forms</h1>
          <p className="text-on-primary/70 text-sm">
            Download the official scholarship forms from the LYDO office.
          </p>
        </div>
      </section>

      {/* ── Forms grid ─────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        {isPending ? (
          <div className="grid md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : forms.length === 0 ? (
          <EmptyState
            icon={FolderOpen}
            title="No forms available yet"
            description="Downloadable forms will be published here by the LYDO office."
          />
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {forms.map((form) => (
              <div
                key={form.id}
                className="bg-surface rounded-xl shadow-card p-5 flex items-center gap-4"
              >
                {/* Icon */}
                <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center shrink-0">
                  <FileText size={22} className="text-primary" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-content leading-snug">{form.name}</p>
                  {form.description && (
                    <p className="text-xs text-content-muted mt-0.5 leading-snug">
                      {form.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-xs bg-border-muted text-content-muted px-2 py-0.5 rounded font-medium uppercase tracking-wide">
                      {form.format ?? 'PDF'}
                    </span>
                    {form.size && (
                      <span className="text-xs text-content-disabled">{form.size}</span>
                    )}
                  </div>
                </div>

                {/* Download button */}
                {form.url ? (
                  <a
                    href={form.url}
                    download
                    className="shrink-0 inline-flex items-center gap-2 bg-primary text-on-primary text-sm px-4 py-2 rounded font-medium hover:bg-primary-dark transition-colors"
                  >
                    <Download size={14} />
                    <span className="hidden sm:inline">Download</span>
                  </a>
                ) : (
                  <button
                    disabled
                    className="shrink-0 inline-flex items-center gap-2 bg-border text-content-disabled text-sm px-4 py-2 rounded font-medium cursor-not-allowed"
                    title="File not yet uploaded"
                  >
                    <Download size={14} />
                    <span className="hidden sm:inline">Download</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <p className="mt-10 text-xs text-content-disabled text-center">
          Forms are managed by the LYDO office. For questions, contact the office at the Municipality
          of Sta. Cruz, Laguna.
        </p>
      </section>
    </>
  )
}
