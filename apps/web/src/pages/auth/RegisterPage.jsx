import { Link } from 'react-router-dom'

export function RegisterPage() {
  return (
    <div className="min-h-screen bg-surface-alt flex items-center justify-center p-4">
      <div className="bg-surface rounded-lg shadow-card p-8 w-full max-w-sm">
        <h1 className="text-xl font-semibold text-content mb-1">Create Account</h1>
        <p className="text-content-muted text-sm mb-6">Phase 2 — student registration</p>
        <div className="text-sm text-content-muted">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
