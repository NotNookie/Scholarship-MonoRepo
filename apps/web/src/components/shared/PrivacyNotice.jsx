import { X, ShieldCheck } from 'lucide-react'
import { useDialog } from '../../lib/useDialog'

// Data Privacy Act (RA 10173) notice — shown at registration (before consent)
// and from a scholar's Privacy & Data settings. Content is tenant-branded.
export function PrivacyModal({ brand, onClose }) {
  const ref = useDialog(onClose)
  const email = brand?.contact?.email
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby="privacy-title" className="relative bg-surface rounded-xl shadow-modal w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between shrink-0">
          <h3 id="privacy-title" className="text-base font-bold text-content inline-flex items-center gap-2">
            <ShieldCheck size={18} className="text-primary" /> Data Privacy Notice
          </h3>
          <button onClick={onClose} aria-label="Close" className="text-content-muted hover:text-content"><X size={18} /></button>
        </div>
        <div className="p-6 overflow-y-auto text-sm text-content-muted leading-relaxed space-y-4">
          <p>
            The {brand?.office ?? 'Municipal Scholarship Office'} collects and processes your personal
            data to administer its scholarship programs, in accordance with the <span className="font-semibold text-content">Data
            Privacy Act of 2012 (Republic Act No. 10173)</span> and its Implementing Rules and Regulations.
          </p>
          <div>
            <h4 className="text-sm font-semibold text-content mb-1">What we collect</h4>
            <p>Your name and contact details, academic records, proof of residency and income, and the supporting documents you upload.</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-content mb-1">Why we collect it</h4>
            <p>To verify your eligibility, evaluate and track your application, disburse grants, and communicate decisions and announcements to you.</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-content mb-1">How long we keep it</h4>
            <p>Only as long as necessary for the scholarship program and as required by applicable laws, auditing, and records-retention rules.</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-content mb-1">Your rights</h4>
            <p>
              You may access, correct, or object to the processing of your personal data, and withdraw consent, subject to legal
              limits. To exercise these rights, contact the office{email ? <> at <a href={`mailto:${email}`} className="text-primary hover:underline">{email}</a></> : ''}.
            </p>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-border shrink-0 flex justify-end">
          <button onClick={onClose} className="bg-primary text-on-primary text-sm font-semibold px-5 py-2 rounded-lg hover:bg-primary-dark transition-colors">Got it</button>
        </div>
      </div>
    </div>
  )
}
