import { FileText, Download } from 'lucide-react'
import { formatFileSize } from '../../lib/markdown'

export function AttachmentList({ files = [], className = '' }) {
  if (!files.length) return null
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {files.map((f) => (
        <a
          key={f.id ?? f.name}
          href={f.url ?? '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 border border-border rounded-lg p-3 hover:border-primary transition-colors group"
        >
          <div className="w-9 h-9 rounded-lg bg-primary-light flex items-center justify-center shrink-0">
            <FileText size={16} className="text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-content truncate">{f.name}</p>
            <p className="text-xs text-content-muted">{formatFileSize(f.size)}</p>
          </div>
          <Download size={15} className="text-content-muted group-hover:text-primary transition-colors shrink-0" />
        </a>
      ))}
    </div>
  )
}
