// jsPDF + autotable are heavy (~hundreds of KB) and only needed when a user
// actually exports a PDF, so they're dynamically imported inside downloadPdf().
// This keeps them out of the eager bundle for the many pages that only do CSV.

function triggerDownload(blob, name) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function csvCell(v) {
  const s = String(v ?? '')
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

function stamp() {
  return new Date().toISOString().slice(0, 10)
}

/** Excel-compatible CSV (BOM-prefixed for UTF-8). */
export function downloadCsv(baseName, columns, rows) {
  const csv = [columns, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n')
  const blob = new Blob([String.fromCharCode(0xFEFF) + csv], { type: 'text/csv;charset=utf-8;' })
  triggerDownload(blob, `${baseName}-${stamp()}.csv`)
}

/** Formatted PDF via jsPDF + autotable. RGB literals are the brand primary (jsPDF has no token system). */
export async function downloadPdf(title, columns, rows, subtitle) {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ])
  const doc = new jsPDF()
  doc.setFontSize(14)
  doc.setTextColor(15, 23, 42) // content
  doc.text(title, 14, 18)
  doc.setFontSize(9)
  doc.setTextColor(100, 116, 139) // content-muted
  doc.text(subtitle ?? `Generated ${new Date().toLocaleString('en-PH')}`, 14, 24)
  autoTable(doc, {
    startY: 30,
    head: [columns],
    body: rows.length ? rows : [Array(columns.length).fill('').map((_, i) => (i === 0 ? 'No records' : ''))],
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [0, 56, 168], textColor: 255 }, // primary #0038a8
    alternateRowStyles: { fillColor: [248, 249, 252] }, // surface-alt
  })
  doc.save(`${title.replace(/\s+/g, '-').toLowerCase()}-${stamp()}.pdf`)
}
