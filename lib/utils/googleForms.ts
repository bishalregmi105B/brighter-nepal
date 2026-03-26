export function toStudentGoogleFormUrl(value?: string | null, legacyFallback?: string | null): string {
  const primary = String(value || '').trim()
  if (primary) return primary

  // Backward compatibility for older rows where only forms_url existed.
  // Do not auto-convert path formats anymore; accept only explicit responder URLs here.
  const fallback = String(legacyFallback || '').trim()
  if (fallback && /\/viewform(?:[/?#]|$)/i.test(fallback)) return fallback

  return ''
}
