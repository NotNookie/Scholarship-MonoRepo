import { Link } from 'react-router-dom'

export function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-primary-dark flex items-center justify-center p-4">
      <div className="bg-surface rounded-lg shadow-modal p-8 w-full max-w-sm">
        <h1 className="text-xl font-semibold text-content mb-1">Admin Login</h1>
        <p className="text-content-muted text-sm mb-6">Phase 3 — LYDO staff access</p>
        <Link to="/" className="text-xs text-content-muted hover:text-primary">
          ← Back to site
        </Link>
      </div>
    </div>
  )
}
