import { useEffect, useRef } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { ShieldCheck, Building2, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../../lib/axios'
import { useAuthStore } from '../../store/authStore'
import { roleHome } from '../../lib/roleHome'

export function LoginVerifyPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const inputRef = useRef(null)

  const sessionToken = location.state?.session_token
  const from = location.state?.from ?? null

  // Redirect back to login if arrived here without a session token
  useEffect(() => {
    if (!sessionToken) navigate('/login', { replace: true })
    else inputRef.current?.focus()
  }, [sessionToken, navigate])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const { ref: rhfRef, ...otpField } = register('otp', {
    required: 'Please enter the verification code',
    pattern: {
      value: /^\d{6}$/,
      message: 'Code must be exactly 6 digits',
    },
  })

  const verifyMutation = useMutation({
    mutationFn: (data) =>
      api.post('/auth/verify-otp', { session_token: sessionToken, otp: data.otp }).then((r) => r.data),
    onSuccess: ({ user, token }) => {
      login(user, token)
      // Return to the intended page, else the role's home portal
      navigate(from ?? roleHome(user.role), { replace: true })
    },
    onError: (err) => {
      toast.error(err.response?.data?.message ?? 'Invalid code. Please try again.')
    },
  })

  const resendMutation = useMutation({
    mutationFn: () =>
      api.post('/auth/resend-otp', { session_token: sessionToken }).then((r) => r.data),
    onSuccess: () => toast.success('A new code has been sent to your mobile number.'),
    onError: () => toast.error('Could not resend the code. Please try again.'),
  })

  const onSubmit = handleSubmit((data) => verifyMutation.mutate(data))

  if (!sessionToken) return null

  return (
    <div className="min-h-screen flex">

      {/* Left panel */}
      <div className="hidden md:flex md:w-2/5 bg-primary-dark flex-col justify-between p-10 text-on-primary shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
            <Building2 size={18} className="text-on-primary" />
          </div>
          <span className="text-sm font-semibold">Iskolar ng Bayan</span>
        </div>

        <div>
          <h2 className="text-2xl font-bold leading-snug mb-4">
            One last step to keep your account secure.
          </h2>
          <p className="text-on-primary/70 text-sm leading-relaxed mb-8">
            Two-factor authentication adds an extra layer of protection to your scholarship portal account.
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

      {/* Right — verify form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-surface">
        <div className="w-full max-w-sm">

          {/* Icon */}
          <div className="w-14 h-14 bg-primary-light rounded-2xl flex items-center justify-center mb-6">
            <ShieldCheck size={28} className="text-primary" />
          </div>

          <h1 className="text-2xl font-bold text-content mb-2">Two-Factor Authentication</h1>
          <p className="text-sm text-content-muted mb-8 leading-relaxed">
            Enter the 6-digit verification code sent to your registered mobile number to complete sign-in.
          </p>

          <form onSubmit={onSubmit} noValidate className="space-y-5">

            {/* OTP input */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="otp" className="text-sm font-medium text-content">
                Verification Code
              </label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="Enter 6-digit code"
                autoComplete="one-time-code"
                aria-invalid={!!errors.otp}
                aria-describedby={errors.otp ? 'otp-error' : 'otp-hint'}
                className="w-full text-center text-2xl font-bold tracking-[0.5em] py-4 rounded-lg border border-border bg-surface-alt focus:outline-none focus:border-primary aria-[invalid=true]:border-danger transition-colors"
                ref={(el) => {
                  rhfRef(el)
                  inputRef.current = el
                }}
                {...otpField}
              />
              {errors.otp ? (
                <p id="otp-error" role="alert" className="text-xs text-danger text-center">
                  {errors.otp.message}
                </p>
              ) : (
                <p id="otp-hint" className="text-xs text-content-muted text-center">
                  The code expires in 10 minutes.
                </p>
              )}
            </div>

            {/* Verify button */}
            <button
              type="submit"
              disabled={verifyMutation.isPending}
              className="w-full bg-primary text-on-primary text-sm font-semibold py-3 rounded-lg hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {verifyMutation.isPending ? 'Verifying…' : 'Verify'}
            </button>
          </form>

          {/* Resend */}
          <div className="mt-6 flex items-center justify-center gap-1.5 text-sm text-content-muted">
            <MessageSquare size={14} />
            <span>Didn't receive a code?</span>
            <button
              type="button"
              onClick={() => resendMutation.mutate()}
              disabled={resendMutation.isPending}
              className="text-primary font-medium hover:underline disabled:opacity-60"
            >
              {resendMutation.isPending ? 'Sending…' : 'Resend SMS'}
            </button>
          </div>

          <p className="mt-4 text-center text-xs text-content-muted">
            <Link to="/login" className="hover:text-primary transition-colors">
              ← Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
