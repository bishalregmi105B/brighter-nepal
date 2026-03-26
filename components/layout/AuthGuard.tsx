'use client'
// AuthGuard — wraps any layout that requires authentication.
// On mount, checks for a valid token. Redirects to /login if missing.
// Redirects admin to /admin/dashboard, student to /dashboard based on role.
import { useEffect, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

interface AuthGuardProps {
  children: ReactNode
  /** If set, also checks that the user has this role — redirects to / if not */
  requiredRole?: 'admin' | 'student'
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (loading) return
    // No token / no user → redirect to login
    const token = typeof window !== 'undefined' ? localStorage.getItem('bn_token') : null
    if (!token || !user) {
      router.replace('/login')
      return
    }
    // Wrong role? Redirect to the appropriate home
    if (requiredRole && user.role !== requiredRole) {
      router.replace(user.role === 'admin' ? '/admin/dashboard' : '/dashboard')
      return
    }
    // Student must complete onboarding once before entering student area.
    if (user.role === 'student' && user.onboarding_completed === false && pathname !== '/onboarding') {
      router.replace('/onboarding')
    }
  }, [loading, user, requiredRole, router, pathname])

  // While loading show a branded spinner
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#1a1a4e] flex items-center justify-center">
            <span className="text-white font-black text-lg">B</span>
          </div>
          <div className="w-6 h-6 border-2 border-[#c0622f] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Loading your session…</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
