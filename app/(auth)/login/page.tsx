'use client'
// Login Page — wired to real Flask API via authService
import Link from 'next/link'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { School, Mail, Lock, ArrowRight, Eye, EyeOff, AlertCircle, Info } from 'lucide-react'
import { authService } from '@/services/authService'
import { cn } from '@/lib/utils/cn'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const reason = searchParams.get('reason')

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Show a friendly info banner (not an error) for session_expired redirects
  const sessionBanner = reason === 'session_expired'
    ? 'Your session expired or you logged in on another device. Please log in again.'
    : reason === 'logout'
    ? ''
    : null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    if (!identifier || !password) { setErrorMsg('Please fill in all fields.'); return }
    setLoading(true)
    try {
      const { user } = await authService.login(identifier.trim(), password)
      if (user.role === 'admin') {
        router.replace('/admin/dashboard')
      } else {
        router.replace('/dashboard')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed. Please try again.'
      setErrorMsg(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Left branding panel */}
      <section className="hidden md:flex md:w-5/12 lg:w-1/2 bg-[#1a1a4e] relative overflow-hidden flex-col justify-between p-12 text-white">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-96 h-96 rounded-full bg-on-tertiary-container blur-[120px]" />
          <div className="absolute bottom-[-5%] left-[-5%] w-80 h-80 rounded-full bg-on-primary-container blur-[100px]" />
        </div>
        <div className="relative z-10 flex items-center gap-2 mb-16">
          <School className="w-9 h-9 text-on-primary-container" />
          <h1 className="font-headline text-3xl font-black tracking-tighter">Brighter Nepal</h1>
        </div>
        <div className="relative z-10 max-w-md">
          <h2 className="font-headline text-5xl font-extrabold leading-[1.1] mb-6">Welcome back, Scholar.</h2>
          <p className="text-secondary-fixed text-lg leading-relaxed opacity-90">
            Nepal&apos;s most trusted IOE · IOM · CSIT entrance preparation platform. Continue where you left off.
          </p>
        </div>
        <div className="relative z-10 flex items-center gap-4 mt-auto">
          <div className="flex -space-x-3">
            {['AM', 'BP', 'DG', 'KP'].map((init, i) => (
              <div key={i} className="w-12 h-12 rounded-full border-4 border-[#1a1a4e] bg-on-primary-container flex items-center justify-center text-white text-[10px] font-bold">{init}</div>
            ))}
            <div className="w-12 h-12 rounded-full border-4 border-[#1a1a4e] bg-on-primary-container/30 flex items-center justify-center text-xs font-bold">+800</div>
          </div>
          <p className="text-sm font-medium text-secondary-fixed">Trusted by 800+ aspirants across Nepal.</p>
        </div>
      </section>

      {/* Right form */}
      <section className="flex-1 flex items-center justify-center p-6 md:p-12 lg:p-24 bg-surface-bright">
        <div className="w-full max-w-md">
          <div className="md:hidden flex items-center gap-2 mb-8">
            <School className="w-8 h-8 text-on-primary-container" />
            <span className="font-headline text-xl font-black text-[#1a1a4e]">Brighter Nepal</span>
          </div>

          <header className="mb-8">
            <h3 className="font-headline text-3xl font-extrabold text-[#1a1a4e] tracking-tight mb-2">Login to Your Account</h3>
            <p className="text-on-surface-variant font-medium">Enter your credentials to continue.</p>
          </header>

          {/* Session expired / info banner */}
          {sessionBanner && (
            <div className="mb-5 flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-blue-700 text-sm font-medium">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {sessionBanner}
            </div>
          )}

          {/* Demo credentials hint — updated to match current seed */}
          <div className="mb-5 p-4 bg-surface-container rounded-xl border border-outline-variant/20">
            <p className="text-xs font-bold text-slate-500 mb-1.5">Demo Credentials</p>
            <p className="text-xs text-slate-600"><span className="font-bold">Admin:</span> admin@brighternepal.edu.np / BrighterAdmin@2081</p>
            <p className="text-xs text-slate-600"><span className="font-bold">Student:</span> aashish.maharjan@gmail.com / Student@2081</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error banner (login failures only) */}
            {errorMsg && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm font-medium">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {errorMsg}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-[#1a1a4e] ml-1" htmlFor="identifier">Email or Student ID</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
                <input
                  id="identifier" type="text" value={identifier} onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="name@example.com or BC-XXXX"
                  autoComplete="username"
                  className="w-full pl-12 pr-4 py-3.5 bg-surface-container-highest rounded-xl border-none focus:ring-2 focus:ring-on-primary-container transition-all text-on-surface placeholder:text-outline/60 font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-[#1a1a4e] ml-1" htmlFor="password">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
                <input
                  id="password" type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full pl-12 pr-12 py-3.5 bg-surface-container-highest rounded-xl border-none focus:ring-2 focus:ring-on-primary-container transition-all text-on-surface placeholder:text-outline/60 font-medium"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors">
                  {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-sm font-bold text-on-primary-container hover:underline">Forgot Password?</Link>
            </div>

            <button
              type="submit" disabled={loading}
              className={cn(
                'w-full bg-[#c0622f] hover:bg-[#a14f24] text-white font-headline font-bold py-4 rounded-xl',
                'shadow-[0_8px_20px_rgba(192,98,47,0.25)] active:scale-[0.98] transition-all',
                'flex items-center justify-center gap-2 mt-4',
                loading && 'opacity-70 cursor-not-allowed'
              )}
            >
              {loading ? 'Logging in…' : 'Login'}
              {!loading && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>

          <footer className="mt-8 text-center">
            <p className="text-on-surface-variant font-medium">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-[#1a1a4e] font-extrabold hover:text-on-primary-container transition-colors ml-1">Sign Up</Link>
            </p>
          </footer>
        </div>
      </section>
    </>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}
