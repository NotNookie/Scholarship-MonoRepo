import { FileText, Clock, AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react'

// Scholarship application lifecycle statuses.
// Per design mockups: "Pending Review" (amber) is the single working status;
// `under_review` is an internal alias that renders the same. Incomplete = light blue.
export const APPLICATION_STATUS = {
  draft:        { label: 'Draft',          Icon: FileText,      color: 'text-content-muted', bg: 'bg-surface-alt',     border: 'border-border' },
  submitted:    { label: 'Pending Review', Icon: Clock,         color: 'text-secondary-dark',  bg: 'bg-secondary-light', border: 'border-secondary/30' },
  under_review: { label: 'Pending Review', Icon: Clock,         color: 'text-secondary-dark',  bg: 'bg-secondary-light', border: 'border-secondary/30' },
  incomplete:   { label: 'Incomplete',     Icon: AlertTriangle, color: 'text-primary',       bg: 'bg-primary-light',   border: 'border-primary/20' },
  approved:     { label: 'Approved',       Icon: CheckCircle2,  color: 'text-tertiary-dark', bg: 'bg-tertiary-light',  border: 'border-tertiary/30' },
  rejected:     { label: 'Not Approved',   Icon: AlertCircle,   color: 'text-danger',        bg: 'bg-danger-light',    border: 'border-danger/30' },
}

// Per-document verification statuses.
export const DOCUMENT_STATUS = {
  verified: { label: 'Verified', Icon: CheckCircle2, color: 'text-tertiary-dark', bg: 'bg-tertiary-light',  border: 'border-tertiary/30' },
  pending:  { label: 'Pending',  Icon: Clock,        color: 'text-secondary-dark',  bg: 'bg-secondary-light', border: 'border-secondary/30' },
  rejected: { label: 'Rejected', Icon: AlertCircle,  color: 'text-danger',        bg: 'bg-danger-light',    border: 'border-danger/30' },
}
