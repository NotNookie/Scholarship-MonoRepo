import { APPLICATION_STATUS, DOCUMENT_STATUS } from './statusConfig'

/**
 * Status badge shared across the student portal.
 * @param {string} status         key into the chosen status map
 * @param {'application'|'document'} kind  which status vocabulary to use
 * @param {'sm'|'md'} size         pill size
 */
export function StatusPill({ status, kind = 'application', size = 'md' }) {
  const map = kind === 'document' ? DOCUMENT_STATUS : APPLICATION_STATUS
  const cfg = map[status] ?? Object.values(map)[0]
  const { Icon, label, color, bg, border } = cfg
  const pad = size === 'sm' ? 'text-xs px-2.5 py-1' : 'text-xs px-3 py-1.5'
  const iconSize = size === 'sm' ? 11 : 13
  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full border ${pad} ${color} ${bg} ${border}`}>
      <Icon size={iconSize} strokeWidth={2.5} />
      {label}
    </span>
  )
}
