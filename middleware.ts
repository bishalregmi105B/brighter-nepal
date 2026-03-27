import { NextRequest, NextResponse } from 'next/server'

const AUTH_PATHS = new Set(['/login', '/signup', '/forgot-password'])
const PUBLIC_PATHS = new Set(['/'])
const STUDENT_PREFIXES = [
  '/dashboard',
  '/resources',
  '/recorded-lectures',
  '/live-classes',
  '/model-sets',
  '/weekly-tests',
  '/notices',
  '/groups',
  '/profile',
  '/help',
  '/onboarding',
]

function isStudentProtectedPath(pathname: string) {
  return STUDENT_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
}

function redirectTo(req: NextRequest, target: string) {
  return NextResponse.redirect(new URL(target, req.url))
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname === '/favicon.ico') {
    return NextResponse.next()
  }

  const hasSession = req.cookies.get('bn_session')?.value === '1'
  const role = req.cookies.get('bn_role')?.value || ''
  const onboarding = req.cookies.get('bn_onboarding')?.value || '1'

  if (AUTH_PATHS.has(pathname)) {
    if (!hasSession) return NextResponse.next()
    if (role === 'admin') return redirectTo(req, '/admin/dashboard')
    return redirectTo(req, onboarding === '0' ? '/onboarding' : '/dashboard')
  }

  if (PUBLIC_PATHS.has(pathname)) {
    return NextResponse.next()
  }

  if (pathname.startsWith('/admin')) {
    if (!hasSession) return redirectTo(req, '/login')
    if (role !== 'admin') return redirectTo(req, onboarding === '0' ? '/onboarding' : '/dashboard')
    return NextResponse.next()
  }

  if (isStudentProtectedPath(pathname)) {
    if (!hasSession) return redirectTo(req, '/login')
    if (role === 'admin') return redirectTo(req, '/admin/dashboard')
    if (pathname !== '/onboarding' && onboarding === '0') return redirectTo(req, '/onboarding')
    if (pathname === '/onboarding' && onboarding !== '0') return redirectTo(req, '/dashboard')
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)'],
}
