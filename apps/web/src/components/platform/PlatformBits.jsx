import { STATUS_META, sigilOf } from '../../store/platformStore'

// Platform crest — a drawn civic emblem for the operator console (distinct from
// any municipal logo). Monoline shield + star.
export function Crest({ className = 'pf-crest' }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <path
        d="M20 3.5 33.5 8v10.5c0 8.4-5.6 15-13.5 18-7.9-3-13.5-9.6-13.5-18V8L20 3.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M20 12.5l1.9 3.9 4.3.6-3.1 3 .7 4.3-3.8-2-3.8 2 .7-4.3-3.1-3 4.3-.6L20 12.5Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function StatusTag({ status }) {
  const meta = STATUS_META[status] ?? STATUS_META.active
  return <span className={`pf-tag ${meta.cls}`}>{meta.label}</span>
} 

export function Sigil({ name, className = 'pf-sigil' }) {
  return <div className={className}>{sigilOf(name)}</div>
}
