import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { ArrowLeft, GraduationCap, CheckCircle2, Send } from 'lucide-react'
import '../../styles/landing.css'

// Onboarding request — an LGU asks to be provisioned. No backend in demo:
// on submit we show a success state. The fields map to an onboarding-request
// record that the super-admin console (Platform → Onboarding) would review.
const STEPS = [
  { b: 'Submit this request', p: 'Tell us about your municipality and program. Takes about a minute.' },
  { b: 'We review and reach out', p: 'Our team confirms details with your LYDO or scholarship office.' },
  { b: 'We provision your tenant', p: 'Your municipality gets its own configured Iskolar space — rules, branding, and roles.' },
  { b: 'Your team and scholars log in', p: 'Staff start reviewing; scholars apply. You’re running the whole lifecycle.' },
]

function Field({ label, optional, error, children }) {
  return (
    <div className={`isk-field${label.full ? ' full' : ''}`}>
      <label className="isk-label" htmlFor={label.id}>
        {label.text} {optional && <em>optional</em>}
      </label>
      {children}
      {error && <span className="isk-err" role="alert">{error}</span>}
    </div>
  )
}

export function PlatformRequestPage() {
  const [submitted, setSubmitted] = useState(null)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()

  const onSubmit = handleSubmit(async (data) => {
    // Simulate the request landing in the onboarding pipeline.
    await new Promise((r) => setTimeout(r, 650))
    setSubmitted(data)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })

  return (
    <div className="isk isk-req isk-scroll" id="top">
      {/* Top bar */}
      <div className="isk-req-top">
        <div className="isk-container isk-req-topbar">
          <Link className="isk-brand isk-brand--dark" to="/iskolar">
            <span className="isk-brand-mark"><GraduationCap size={18} /></span>
            Iskolar
          </Link>
          <div className="right">
            <Link className="isk-back" to="/iskolar"><ArrowLeft size={15} /> Back to site</Link>
          </div>
        </div>
      </div>

      <main className="isk-req-main">
        <div className="isk-container isk-req-grid">

          {/* Left — what happens next */}
          <aside className="isk-req-aside">
            <h1 className="isk-h2">Request onboarding for your municipality.</h1>
            <p>
              Iskolar is invite-and-onboard, not self-serve — so every LGU gets a
              properly configured space. Here’s how it goes.
            </p>
            <ol className="isk-steps">
              {STEPS.map((s, i) => (
                <li className="isk-step" key={s.b}>
                  <span className="isk-step-n isk-tnum">{i + 1}</span>
                  <div><b>{s.b}</b><p>{s.p}</p></div>
                </li>
              ))}
            </ol>
            <div className="isk-req-pilot">
              <span className="dot" />
              Currently piloting with the Sta. Cruz, Laguna LYDO — and onboarding more municipalities now.
            </div>
          </aside>

          {/* Right — the form / success */}
          <div className="isk-form-card">
            {submitted ? (
              <div className="isk-success">
                <div className="isk-success-ico"><CheckCircle2 size={34} /></div>
                <h3>Request received.</h3>
                <p>
                  Thanks, {submitted.name?.split(' ')[0] || 'there'} — we’ll review
                  {' '}{submitted.municipality || 'your municipality'}’s request and reach
                  out at your email within a few working days.
                </p>
                <div className="recap">
                  <div><span>Municipality</span><b>{submitted.municipality}</b></div>
                  <div><span>Contact</span><b>{submitted.email}</b></div>
                  {submitted.scholars && <div><span>Program size</span><b>{submitted.scholars}</b></div>}
                </div>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 26, flexWrap: 'wrap' }}>
                  <Link className="isk-btn isk-btn-primary" to="/iskolar">Back to site</Link>
                </div>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate>
                <div className="isk-form-grid">
                  <Field label={{ id: 'municipality', text: 'Municipality / LGU', full: true }} error={errors.municipality?.message}>
                    <input id="municipality" className="isk-input" placeholder="e.g. Municipality of Sta. Cruz"
                      aria-invalid={!!errors.municipality}
                      {...register('municipality', { required: 'Please name your municipality' })} />
                  </Field>

                  <Field label={{ id: 'province', text: 'Province' }} error={errors.province?.message}>
                    <input id="province" className="isk-input" placeholder="e.g. Laguna"
                      aria-invalid={!!errors.province}
                      {...register('province', { required: 'Required' })} />
                  </Field>

                  <Field label={{ id: 'scholars', text: 'Approx. scholars' }} optional error={errors.scholars?.message}>
                    <input id="scholars" className="isk-input" placeholder="e.g. 500–1,000"
                      {...register('scholars')} />
                  </Field>

                  <Field label={{ id: 'name', text: 'Your name' }} error={errors.name?.message}>
                    <input id="name" className="isk-input" placeholder="Full name" autoComplete="name"
                      aria-invalid={!!errors.name}
                      {...register('name', { required: 'Please enter your name' })} />
                  </Field>

                  <Field label={{ id: 'position', text: 'Position / role' }} error={errors.position?.message}>
                    <input id="position" className="isk-input" placeholder="e.g. LYDO Head"
                      aria-invalid={!!errors.position}
                      {...register('position', { required: 'Required' })} />
                  </Field>

                  <Field label={{ id: 'email', text: 'Official email' }} error={errors.email?.message}>
                    <input id="email" type="email" className="isk-input" placeholder="you@lgu.gov.ph" autoComplete="email"
                      aria-invalid={!!errors.email}
                      {...register('email', {
                        required: 'Please enter your email',
                        pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' },
                      })} />
                  </Field>

                  <Field label={{ id: 'contact', text: 'Contact number' }} error={errors.contact?.message}>
                    <input id="contact" type="tel" className="isk-input" placeholder="09XX XXX XXXX" autoComplete="tel"
                      aria-invalid={!!errors.contact}
                      {...register('contact', { required: 'Required' })} />
                  </Field>

                  <Field label={{ id: 'message', text: 'Anything we should know?', full: true }} optional>
                    <textarea id="message" className="isk-textarea" placeholder="Your current process, timeline, or questions…"
                      {...register('message')} />
                  </Field>
                </div>

                <div className="isk-form-foot">
                  <p className="note">We use this only to set up and reach out about your onboarding.</p>
                  <button type="submit" className="isk-btn isk-btn-primary isk-btn-lg" disabled={isSubmitting}>
                    {isSubmitting ? 'Sending…' : <>Send request <Send size={16} /></>}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
