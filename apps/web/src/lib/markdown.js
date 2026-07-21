/**
 * Flatten markdown to plain text for clamped previews, so snippets never show
 * raw syntax like ** or [](). Full bodies render via the <Markdown> component.
 */
export function stripMarkdown(md = '') {
  return String(md)
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')       // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')    // links → their text
    .replace(/`{1,3}[^`]*`{1,3}/g, '')          // code
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')         // headings
    .replace(/^\s{0,3}>\s?/gm, '')              // block quotes
    .replace(/^\s*[-*+]\s+/gm, '')              // bullets
    .replace(/^\s*\d+\.\s+/gm, '')              // ordered list markers
    .replace(/(\*\*|__)(.*?)\1/g, '$2')         // bold
    .replace(/(\*|_)(.*?)\1/g, '$2')            // italic
    .replace(/~~(.*?)~~/g, '$1')                // strikethrough
    .replace(/\s+/g, ' ')
    .trim()
}

export function formatFileSize(bytes) {
  if (bytes == null) return ''
  const mb = bytes / (1024 * 1024)
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`
}
