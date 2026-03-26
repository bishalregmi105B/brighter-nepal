export function toStudentGoogleFormUrl(value?: string | null): string {
  const raw = String(value || '').trim()
  if (!raw) return ''

  // Allow plain form IDs as a fallback.
  if (/^[A-Za-z0-9_-]{20,}$/.test(raw)) {
    return `https://docs.google.com/forms/d/e/${raw}/viewform`
  }

  try {
    const parsed = new URL(raw)
    const host = parsed.hostname.toLowerCase()
    if (!host.endsWith('google.com')) return raw

    const parts = parsed.pathname.split('/').filter(Boolean)
    const suffix = `${parsed.search}${parsed.hash}`

    // /forms/d/e/<id>/...
    if (parts.length >= 4 && parts[0] === 'forms' && parts[1] === 'd' && parts[2] === 'e') {
      const formId = parts[3]
      if (formId) return `https://docs.google.com/forms/d/e/${formId}/viewform${suffix}`
    }

    // /forms/d/<id>/...
    if (parts.length >= 3 && parts[0] === 'forms' && parts[1] === 'd' && parts[2] !== 'e') {
      const formId = parts[2]
      if (formId) return `https://docs.google.com/forms/d/e/${formId}/viewform${suffix}`
    }
  } catch {
    // Keep original value on URL parse failures.
  }

  return raw
}
