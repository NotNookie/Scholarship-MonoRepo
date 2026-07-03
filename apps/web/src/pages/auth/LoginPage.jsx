import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { Eye, EyeOff, Mail, Lock, ShieldCheck, Building2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../../lib/axios'
import { useAuthStore } from '../../store/authStore'

function LeftPanel() {
  return (
    <div className="hidden md:flex md:w-2/5 bg-primary-dark flex-col justify-between p-10 text-on-primary shrink-0">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
          <Building2 size={18} className="text-on-primary" />
        </div>
        <span className="text-sm font-semibold">Iskolar ng Bayan</span>
      </div>

      <div>
        <h2 className="text-2xl font-bold leading-snug mb-4">
          Empowering the youth through education.
        </h2>
        <p className="text-on-primary/70 text-sm leading-relaxed mb-8">
          Access your Iskolar ng Bayan platform to manage scholarships, view requirements,
          and stay updated with municipal announcements.
        </p>
        <div className="flex items-start gap-3 bg-white/10 rounded-lg p-4">
          <ShieldCheck size={16} className="text-secondary shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-secondary uppercase tracking-wide mb-1">
              Secure Portal
            </p>
            <p className="text-xs text-on-primary/60 leading-relaxed">
              Your data is encrypted and handled in accordance with the Municipal Data Privacy Act.
            </p>
          </div>
        </div>
      </div>

      <p className="text-xs text-on-primary/40">
        © {new Date().getFullYear()} Municipal Youth Development Office, Sta. Cruz, Laguna
      </p>
    </div>
  )
}

export function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const loginMutation = useMutation({
    mutationFn: (data) => api.post('/auth/login', data).then((r) => r.data),
    onSuccess: ({ session_token }) => {
      navigate('/login/verify', { state: { session_token } })
    },
    onError: (err) => {
      toast.error(err.response?.data?.message ?? 'Login failed. Please check your credentials.')
    },
  })

  const onSubmit = handleSubmit((data) => loginMutation.mutate(data))

  return (
    <div className="min-h-screen flex">
      <LeftPanel />

      {/* Right — form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-surface">
        <div className="w-full max-w-md">

          {/* Heading */}
          <h1 className="text-3xl font-bold text-content mb-2">Welcome Back</h1>
          <p className="text-base text-content-muted mb-8">
            Please enter your details to access your account.
          </p>

          {/* Segmented tab */}
          <div className="flex bg-surface-alt border border-border rounded-full p-1 mb-8">
            <span className="flex-1 text-center text-sm font-semibold py-2 rounded-full bg-surface text-primary shadow-sm cursor-default">
              Log In
            </span>
            <Link
              to="/register"
              className="flex-1 text-center text-sm font-medium py-2 rounded-full text-content-muted hover:text-content transition-colors"
            >
              Register
            </Link>
          </div>

          <form onSubmit={onSubmit} noValidate className="space-y-5">

            {/* Email */}
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-medium text-content">
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-content-muted pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  placeholder="student@example.com"
                  autoComplete="email"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  className="w-full text-sm pl-10 pr-4 py-3 rounded-lg border border-border bg-surface-alt focus:outline-none focus:border-primary aria-[invalid=true]:border-danger transition-colors"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Enter a valid email address',
                    },
                  })}
                />
              </div>
              {errors.email && (
                <p id="email-error" role="alert" className="text-xs text-danger">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-sm font-medium text-content">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-content-muted pointer-events-none" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  className="w-full text-sm pl-10 pr-11 py-3 rounded-lg border border-border bg-surface-alt focus:outline-none focus:border-primary aria-[invalid=true]:border-danger transition-colors"
                  {...register('password', {
                    required: 'Password is required',
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-content-muted hover:text-content transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p id="password-error" role="alert" className="text-xs text-danger">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember me + Forgot password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-content cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-border accent-primary"
                  {...register('remember_me')}
                />
                Remember Me
              </label>
              <button type="button" className="text-sm text-primary hover:underline">
                Forgot Password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full bg-primary text-on-primary text-sm font-semibold py-3 rounded-lg hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed transition-colors mt-2"
            >
              {loginMutation.isPending ? 'Signing in…' : 'Sign In →'}
            </button>

          </form>

          {import.meta.env.DEV && (
            <button
              type="button"
              onClick={() => {
                login({ id: 1, name: 'Juan Dela Cruz', first_name: 'Juan', role: 'student', email: 'juan@test.com', mobile: '09123456789' }, 'dev-token')
                navigate('/dashboard')
              }}
              className="mt-4 w-full border border-dashed border-border text-content-muted text-xs py-2 rounded-lg hover:border-primary hover:text-primary transition-colors"
            >
              Dev: Skip Login
            </button>
          )}

          <p className="mt-8 text-center text-sm text-content-muted">
            <Link to="/" className="hover:text-primary transition-colors">
              ← Back to site
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
