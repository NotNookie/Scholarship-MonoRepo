import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

// Reusable right-hand drawer shell for the platform console: scrim, slide-in
// panel, header (title/subtitle/close), footer (Cancel + submit), focus trap,
// Esc-to-close, and focus restore. Callers supply the body fields as children
// and own their form state + validity + submit.
export function PlatformDrawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  submitLabel = 'Save',
  onSubmit,
  canSubmit = true,
}) {
  const drawerRef = useRef(null)
  const restoreRef = useRef(null)

  // Focus the first field on open; restore focus to the opener on close.
  useEffect(() => {
    if (!open) return
    restoreRef.current = document.activeElement
    const t = setTimeout(() => {
      const first = drawerRef.current?.querySelector('.pf-drawer-body input, .pf-drawer-body select, .pf-drawer-body textarea')
      first?.focus()
    }, 120)
    return () => {
      clearTimeout(t)
      restoreRef.current?.focus?.()
    }
  }, [open])

  // Esc to close + trap Tab within the drawer.
  useEffect(() => {
    if (!open) return
    function onKey(e) {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key !== 'Tab') return
      const nodes = drawerRef.current?.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
      const focusable = Array.from(nodes ?? []).filter((n) => !n.disabled && n.offsetParent !== null)
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <>
      <div className={`pf-scrim${open ? ' show' : ''}`} onClick={onClose} />
      <aside
        ref={drawerRef}
        className={`pf-drawer${open ? ' show' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pf-drawer-title"
        aria-hidden={!open}
      >
        <div className="pf-drawer-head">
          <div>
            <h2 id="pf-drawer-title">{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button className="pf-drawer-close" type="button" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="pf-drawer-body">{children}</div>

        <div className="pf-drawer-foot">
          <button className="pf-btn pf-btn--ghost" type="button" onClick={onClose}>Cancel</button>
          <button className="pf-btn" type="button" onClick={onSubmit} disabled={!canSubmit}>{submitLabel}</button>
        </div>
      </aside>
    </>
  )
}
