import { useEffect, useRef } from 'react'

// Accessibility helper for modal dialogs. Attach the returned ref to the modal
// panel (the element that should carry role="dialog" aria-modal="true"). While
// mounted it:
//   • closes on Escape (keyboard users can't click the backdrop),
//   • traps Tab focus inside the panel,
//   • moves focus into the panel on open and restores it to the previously
//     focused element on close.
// Pass `active` to gate it when the panel is always mounted but toggled.
export function useDialog(onClose, active = true) {
  const ref = useRef(null)

  useEffect(() => {
    if (!active) return
    const panel = ref.current
    const previouslyFocused = document.activeElement

    const focusables = () =>
      Array.from(
        panel?.querySelectorAll(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((el) => el.offsetParent !== null || el === document.activeElement)

    // Move focus into the dialog (first field, else the panel itself).
    const first = focusables()[0]
    if (first) first.focus()
    else if (panel) {
      panel.setAttribute('tabindex', '-1')
      panel.focus()
    }

    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose?.()
        return
      }
      if (e.key !== 'Tab') return
      const items = focusables()
      if (items.length === 0) {
        e.preventDefault()
        return
      }
      const firstEl = items[0]
      const lastEl = items[items.length - 1]
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault()
        lastEl.focus()
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault()
        firstEl.focus()
      }
    }

    document.addEventListener('keydown', onKey, true)
    return () => {
      document.removeEventListener('keydown', onKey, true)
      // Restore focus to whatever opened the dialog, if it's still around.
      if (previouslyFocused instanceof HTMLElement && document.contains(previouslyFocused)) {
        previouslyFocused.focus()
      }
    }
  }, [onClose, active])

  return ref
}
