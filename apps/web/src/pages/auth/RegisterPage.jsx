import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { Eye, EyeOff, Mail, Lock, Phone, User } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../../lib/axios'

export function RegisterPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm()

  const password = watch('password')

  const registerMutation = useMutation({
    mutationFn: (data) => api.post('/auth/register', data).then((r) => r.data),
    onSuccess: () => {
      toast.success('Account created! Please log in.')
      navigate('/login', { replace: true })
    },
    onError: (err) => {
      toast.error(err.response?.data?.message ?? 'Registration failed. Please try again.')
    },
  })

  const onSubmit = handleSubmit((data) => {
    const payload = { ...data }
    delete payload.password_confirmation
    registerMutation.mutate(payload)
  })

  return (
    <>
      {/* Heading */}
      <h1 className="text-3xl font-bold text-content mb-2">Create Account</h1>
      <p className="text-base text-content-muted mb-8">
        Fill in your details to register for the scholarship portal.
      </p>

      <form onSubmit={onSubmit} noValidate className="space-y-5">

            {/* Name row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="first_name" className="text-sm font-medium text-content">
                  First Name
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-content-muted pointer-events-none" />
                  <input
                    id="first_name"
                    type="text"
                    placeholder="Juan"
                    autoComplete="given-name"
                    aria-invalid={!!errors.first_name}
                    aria-describedby={errors.first_name ? 'first-name-error' : undefined}
                    className="w-full text-sm pl-10 pr-3 py-3 rounded-lg border border-border bg-surface-alt focus:outline-none focus:border-primary aria-[invalid=true]:border-danger transition-colors"
                    {...register('first_name', {
                      required: 'Required',
                      minLength: { value: 2, message: 'Too short' },
                    })}
                  />
                </div>
                {errors.first_name && (
                  <p id="first-name-error" role="alert" className="text-xs text-danger">
                    {errors.first_name.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="last_name" className="text-sm font-medium text-content">
                  Last Name
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-content-muted pointer-events-none" />
                  <input
                    id="last_name"
                    type="text"
                    placeholder="Dela Cruz"
                    autoComplete="family-name"
                    aria-invalid={!!errors.last_name}
                    aria-describedby={errors.last_name ? 'last-name-error' : undefined}
                    className="w-full text-sm pl-10 pr-3 py-3 rounded-lg border border-border bg-surface-alt focus:outline-none focus:border-primary aria-[invalid=true]:border-danger transition-colors"
                    {...register('last_name', {
                      required: 'Required',
                      minLength: { value: 2, message: 'Too short' },
                    })}
                  />
                </div>
                {errors.last_name && (
                  <p id="last-name-error" role="alert" className="text-xs text-danger">
                    {errors.last_name.message}
                  </p>
                )}
              </div>
            </div>

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
                  placeholder="juan@example.com"
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

            {/* Mobile */}
            <div className="flex flex-col gap-2">
              <label htmlFor="mobile" className="text-sm font-medium text-content">
                Mobile Number
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-content-muted pointer-events-none" />
                <input
                  id="mobile"
                  type="tel"
                  placeholder="09XXXXXXXXX"
                  autoComplete="tel"
                  inputMode="numeric"
                  aria-invalid={!!errors.mobile}
                  aria-describedby={errors.mobile ? 'mobile-error' : 'mobile-hint'}
                  className="w-full text-sm pl-10 pr-4 py-3 rounded-lg border border-border bg-surface-alt focus:outline-none focus:border-primary aria-[invalid=true]:border-danger transition-colors"
                  {...register('mobile', {
                    required: 'Mobile number is required',
                    pattern: {
                      value: /^09\d{9}$/,
                      message: 'Enter a valid PH mobile number (e.g. 09XXXXXXXXX)',
                    },
                  })}
                />
              </div>
              {errors.mobile ? (
                <p id="mobile-error" role="alert" className="text-xs text-danger">
                  {errors.mobile.message}
                </p>
              ) : (
                <p id="mobile-hint" className="text-xs text-content-muted">
                  Used for 2FA verification codes.
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
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  className="w-full text-sm pl-10 pr-11 py-3 rounded-lg border border-border bg-surface-alt focus:outline-none focus:border-primary aria-[invalid=true]:border-danger transition-colors"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 8, message: 'Password must be at least 8 characters' },
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

            {/* Confirm Password */}
            <div className="flex flex-col gap-2">
              <label htmlFor="password_confirmation" className="text-sm font-medium text-content">
                Confirm Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-content-muted pointer-events-none" />
                <input
                  id="password_confirmation"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  aria-invalid={!!errors.password_confirmation}
                  aria-describedby={errors.password_confirmation ? 'confirm-error' : undefined}
                  className="w-full text-sm pl-10 pr-11 py-3 rounded-lg border border-border bg-surface-alt focus:outline-none focus:border-primary aria-[invalid=true]:border-danger transition-colors"
                  {...register('password_confirmation', {
                    required: 'Please confirm your password',
                    validate: (val) => val === password || "Passwords don't match",
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-content-muted hover:text-content transition-colors"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password_confirmation && (
                <p id="confirm-error" role="alert" className="text-xs text-danger">
                  {errors.password_confirmation.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full bg-primary text-on-primary text-sm font-semibold py-3 rounded-lg hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed transition-colors mt-2"
            >
              {registerMutation.isPending ? 'Creating account…' : 'Create Account →'}
            </button>
          </form>

      <p className="mt-8 text-center text-sm text-content-muted">
        <Link to="/" className="hover:text-primary transition-colors">
          ← Back to site
        </Link>
      </p>
    </>
  )
}
