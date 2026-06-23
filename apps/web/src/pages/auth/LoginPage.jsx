import { Link } from 'react-router-dom'

export function LoginPage() {
  return (
    <div className="min-h-screen bg-surface-alt flex items-center justify-center p-4">
      <div className="bg-surface rounded-lg shadow-card p-8 w-full max-w-sm">
        <h1 className="text-xl font-semibold text-content mb-1">Student Login</h1>
        <p className="text-content-muted text-sm mb-6">Phase 2 — student auth</p>
        <div className="text-sm text-content-muted space-y-2">
          <p>
            No account?{' '}
            <Link to="/register" className="text-primary hover:underline">
              Register
            </Link>
          </p>
          <p>
            <Link to="/" className="text-content-muted hover:text-primary text-xs">
              ← Back to site
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
