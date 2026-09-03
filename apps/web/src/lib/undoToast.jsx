import toast from 'react-hot-toast'
import { CheckCircle2 } from 'lucide-react'

// A success toast with an Undo affordance — reversible actions beat a bare
// confirmation. Pass a message and the function that reverses the action.
export function undoToast(message, onUndo, opts = {}) {
  toast((t) => (
    <span className="flex items-center gap-3 text-sm text-content">
      <CheckCircle2 size={16} className="text-tertiary-dark shrink-0" />
      {message}
      <button
        onClick={() => { onUndo(); toast.dismiss(t.id) }}
        className="font-semibold text-primary hover:underline shrink-0"
      >
        Undo
      </button>
    </span>
  ), { duration: 6000, ...opts })
}
