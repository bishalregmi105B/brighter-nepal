'use client'

type SessionCookieUser = {
  role?: string
  onboarding_completed?: boolean
}

function buildCookieAttributes(maxAge?: number) {
  const parts = ['Path=/', 'SameSite=Lax']
  if (typeof maxAge === 'number') parts.push(`Max-Age=${maxAge}`)
  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    parts.push('Secure')
  }
  return parts.join('; ')
}

export function syncSessionCookies(user: SessionCookieUser | null | undefined) {
  if (typeof document === 'undefined') return
  if (!user?.role) {
    clearSessionCookies()
    return
  }

  const attrs = buildCookieAttributes(60 * 60 * 24 * 7)
  const onboarding = user.onboarding_completed === false ? '0' : '1'

  document.cookie = `bn_session=1; ${attrs}`
  document.cookie = `bn_role=${encodeURIComponent(user.role)}; ${attrs}`
  document.cookie = `bn_onboarding=${onboarding}; ${attrs}`
}

export function clearSessionCookies() {
  if (typeof document === 'undefined') return
  const attrs = buildCookieAttributes(0)
  document.cookie = `bn_session=; ${attrs}`
  document.cookie = `bn_role=; ${attrs}`
  document.cookie = `bn_onboarding=; ${attrs}`
}
