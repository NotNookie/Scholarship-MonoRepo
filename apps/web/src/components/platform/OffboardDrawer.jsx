import { useEffect, useRef, useState } from 'react'
import { X, AlertTriangle } from 'lucide-react'

// Destructive confirm drawer for permanently removing a tenant. Kept separate
// from the shared PlatformDrawer so it can use a danger submit and a
// type-the-name gate. Caller owns the actual removal in onConfirm.
export function OffboardDrawer({ open, tenant, onClose, onConfirm }) {
  const [typed, setTyped] = useState('')
  const ref = useRef(null)
  const restoreRef = useRef(null)

  // Clear the confirm field on every close so it never carries over.
  const close = () => { setTyped(''); onClose() }

  useEffect(() => {
    if (!open) return
    restoreRef.current = document.activeElement
    const t = setTimeout(() => ref.current?.querySelector('input')?.focus(), 120)
    return () => { clearTimeout(t); restoreRef.current?.focus?.() }
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKey(e) { if (e.key === 'Escape') close() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const canConfirm = typed.trim() === tenant?.name

  return (
    <>
      <div className={`pf-scrim${open ? ' show' : ''}`} onClick={close} />
      <aside
        ref={ref}
        className={`pf-drawer${open ? ' show' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pf-offboard-title"
        aria-hidden={!open}
      >
        <div className="pf-drawer-head">
          <div>
            <h2 id="pf-offboard-title">Offboard {tenant?.name}</h2>
            <p>This permanently removes the municipality and all its data from the platform.</p>
          </div>
          <button className="pf-drawer-close" type="button" onClick={close} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="pf-drawer-body">
          <div className="pf-banner pf-banner--stop" style={{ margin: '0 0 22px' }}>
            <AlertTriangle size={30} strokeWidth={2} />
            <div>
              <div className="bt">This cannot be undone</div>
              <div className="bs">Scholars, applications and staff accounts for this tenant will be removed. Export the data first if you need a record.</div>
            </div>
          </div>

          <div className="pf-field">
            <label htmlFor="offboard-confirm">
              Type <b>{tenant?.name}</b> to confirm
            </label>
            <input
              id="offboard-confirm"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={tenant?.name}
              autoComplete="off"
            />
          </div>
        </div>

        <div className="pf-drawer-foot">
          <button className="pf-btn pf-btn--ghost" type="button" onClick={close}>Cancel</button>
          <button className="pf-btn pf-btn--danger" type="button" onClick={onConfirm} disabled={!canConfirm}>
            Remove permanently
          </button>
        </div>
      </aside>
    </>
  )
}
