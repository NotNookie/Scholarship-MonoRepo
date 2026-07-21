import ReactMarkdown from 'react-markdown'

/**
 * Safe markdown renderer. react-markdown does not render raw HTML by default,
 * so admin-authored bodies can be shown on public/student pages without an XSS risk.
 */
export function Markdown({ children, className = '' }) {
  return (
    <div
      className={`flex flex-col gap-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-primary [&_a]:underline [&_strong]:font-semibold ${className}`}
    >
      <ReactMarkdown>{children ?? ''}</ReactMarkdown>
    </div>
  )
}
