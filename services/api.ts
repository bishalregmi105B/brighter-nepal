/**
 * Base API fetcher — wraps fetch with JWT auth + global error handling.
 * - Automatically attaches Bearer token from localStorage
 * - On 401 (token expired / session invalidated): clears token and redirects to /login
 * - All service modules import this instead of fetch directly.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
    this.name = 'ApiError'
  }
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('bn_token')
}

/** Force logout: clear token + redirect to /login (works client-side only) */
export function forceLogout(reason = 'session_expired') {
  if (typeof window === 'undefined') return
  localStorage.removeItem('bn_token')
  localStorage.removeItem('bn_user')
  // Don't redirect if already on an auth page — prevents infinite loops
  const path = window.location.pathname
  if (path.startsWith('/login') || path.startsWith('/signup')) return
  window.location.replace(`/login?reason=${reason}`)
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_URL}${path}`, { ...options, headers })

  if (res.status === 401) {
    // Token expired or session invalidated — force logout
    forceLogout('session_expired')
    throw new ApiError('Session expired. Please log in again.', 401)
  }

  if (!res.ok) {
    let message = 'An error occurred'
    try {
      const body = await res.json()
      message = body.message ?? message
    } catch {}
    throw new ApiError(message, res.status)
  }

  return res.json() as Promise<T>
}

/** Shorthand helpers */
export const api = {
  get:    <T>(path: string) => apiFetch<T>(path),
  post:   <T>(path: string, body: unknown) =>
    apiFetch<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch:  <T>(path: string, body: unknown) =>
    apiFetch<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) =>
    apiFetch<T>(path, { method: 'DELETE' }),
}
