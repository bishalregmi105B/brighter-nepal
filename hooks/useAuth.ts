/**
 * useAuth — global client-side auth hook.
 * Reads/writes bn_token and bn_user from localStorage.
 * Exposes the logged-in user, a loading flag, and helper methods.
 */
'use client'
import { useState, useEffect, useCallback } from 'react'
import { authService, type AuthUser } from '@/services/authService'
import { forceLogout } from '@/services/api'

const USER_KEY  = 'bn_user'
const TOKEN_KEY = 'bn_token'

function readCachedUser(): AuthUser | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function hasToken(): boolean {
  if (typeof window === 'undefined') return false
  return Boolean(localStorage.getItem(TOKEN_KEY))
}

export function useAuth() {
  const [user,    setUser]    = useState<AuthUser | null>(readCachedUser)
  const [loading, setLoading] = useState(hasToken())

  const refresh = useCallback(async (options?: { silent?: boolean }) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null
    if (!token) { setUser(null); setLoading(false); return }
    const silent = Boolean(options?.silent && readCachedUser())
    if (!silent) setLoading(true)
    try {
      const me = await authService.getMe()
      localStorage.setItem(USER_KEY, JSON.stringify(me))
      setUser(me)
    } catch {
      // 401 handled globally by api.ts (forceLogout), but clear here too
      localStorage.removeItem(USER_KEY)
      setUser(null)
    } finally {
      if (!silent) setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()

    const handleStorage = (event: StorageEvent) => {
      if (event.key && event.key !== TOKEN_KEY && event.key !== USER_KEY) return
      refresh({ silent: true })
    }
    const handleFocus = () => { refresh({ silent: true }) }
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') refresh({ silent: true })
    }

    window.addEventListener('storage', handleStorage)
    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [refresh])

  const logout = useCallback(async () => {
    try { await authService.logout() } catch {}
    forceLogout('logout')
  }, [])

  const isAdmin   = user?.role === 'admin'
  const isStudent = user?.role === 'student'
  const initials  = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() ?? '?'

  return { user, loading, refresh, logout, isAdmin, isStudent, initials }
}
