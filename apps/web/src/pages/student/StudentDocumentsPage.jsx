import { useQuery } from '@tanstack/react-query'
import { FileText, Upload, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/axios'
import { Skeleton } from '../../components/shared/Skeleton'
import { StatusPill } from '../../components/shared/StatusPill'

export function StudentDocumentsPage() {
  const { data, isPending } = useQuery({
    queryKey: ['student', 'documents'],
    queryFn: () => api.get('/student/documents').then((r) => r.data),
    retry: false,
  })

  const documents = data?.data ?? []

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 flex flex-col gap-8">
      <header>
        <h1 className="text-2xl font-bold text-primary">My Documents</h1>
        <p className="text-sm text-content-muted mt-1">
          Track the verification status of documents submitted with your scholarship application.
        </p>
      </header>

      {isPending ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-surface border border-border rounded-xl p-5 shadow-card flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          ))}
        </div>
      ) : documents.length > 0 ? (
        <div className="space-y-3">
          {documents.map((doc) => (
            <div key={doc.id} className="bg-surface border border-border rounded-xl p-5 shadow-card flex items-center gap-4">
              <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center shrink-0">
                <FileText size={18} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-content">{doc.name}</p>
                <p className="text-xs text-content-muted mt-0.5">
                  Uploaded {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                </p>
              </div>
              <StatusPill status={doc.status} kind="document" size="sm" />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-xl shadow-card p-12 flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 bg-primary-light rounded-full flex items-center justify-center">
            <Upload size={24} className="text-primary" />
          </div>
          <div>
            <p className="text-base font-bold text-content">No documents yet</p>
            <p className="text-sm text-content-muted mt-1 max-w-sm">
              Documents are uploaded as part of your scholarship application.
            </p>
          </div>
          <Link
            to="/apply"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary border border-primary px-5 py-2 rounded-lg hover:bg-primary-light transition-colors"
          >
            Go to Application <ChevronRight size={14} />
          </Link>
        </div>
      )}
    </div>
  )
}
