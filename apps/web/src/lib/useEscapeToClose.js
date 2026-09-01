import { useEffect } from 'react'

// Dismiss an open overlay (modal / lightbox) when the user presses Escape —
// keyboard users can't click the backdrop. Pass the same handler the backdrop
// uses. `active` lets a caller gate the listener (e.g. only while open).
export function useEscapeToClose(onClose, active = true) {
  useEffect(() => {
    if (!active || typeof onClose !== 'function') return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose, active])
}
