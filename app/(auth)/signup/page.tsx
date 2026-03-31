'use client'
// Signup Page — DISABLED: Signup is currently disabled. Redirect to login.
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/login')
  }, [router])
  return null
}

/*
// Original Signup Page — commented out
import Link from 'next/link'
import { useState } from 'react'
import { School, User, Mail, Phone, Lock, ArrowRight, AlertCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { authService } from '@/services/authService'
import { cn } from '@/lib/utils/cn'

const signupSchema = z.object({
  fullName:        z.string().min(2, 'Full name is required'),
  email:           z.string().email('Please enter a valid email address'),
  phone:           z.string().min(10, 'Please enter a valid phone number'),
  password:        z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  terms:           z.boolean().refine((v) => v, 'You must accept the terms'),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path:    ['confirmPassword'],
})
type SignupForm = z.infer<typeof signupSchema>

export default function SignupPage() {
  const router = useRouter()
  const [apiError, setApiError] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  })

  const onSubmit = async (data: SignupForm) => {
    setApiError('')
    try {
      await authService.signup(data.fullName, data.email, data.password)
      router.push('/onboarding')
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Signup failed')
    }
  }

  const inputClass = (hasError?: boolean) => cn(
    'w-full pl-12 pr-4 py-3.5 bg-surface-container-highest rounded-xl border-none',
    'focus:ring-2 focus:ring-on-primary-container transition-all',
    'text-on-surface placeholder:text-outline/60 font-medium',
    hasError && 'ring-2 ring-error'
  )

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
          <h2 className="font-headline text-5xl font-extrabold leading-[1.1] mb-6">
            Empowering the next generation of scholars.
          </h2>
          <p className="text-secondary-fixed text-lg leading-relaxed opacity-90">
            Join Nepal&apos;s premier digital learning platform and access world-class resources curated for your success.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-4 mt-auto">
          <div className="flex -space-x-3">
            {['PK', 'AR', 'SG', 'AS'].map((init, i) => (
              <div key={i} className="w-12 h-12 rounded-full border-4 border-[#1a1a4e] bg-on-primary-container flex items-center justify-center text-white text-[10px] font-bold">
                {init}
              </div>
            ))}
            <div className="w-12 h-12 rounded-full border-4 border-[#1a1a4e] bg-on-primary-container/30 flex items-center justify-center text-xs font-bold">
              +10k
            </div>
          </div>
          <p className="text-sm font-medium text-secondary-fixed">Trusted by students across 7 provinces.</p>
        </div>
      </section>

      {/* Right: Form */}
      <section className="flex-1 flex items-center justify-center p-6 md:p-12 lg:p-24 bg-surface-bright overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="md:hidden flex items-center gap-2 mb-8">
            <School className="w-8 h-8 text-on-primary-container" />
            <span className="font-headline text-xl font-black text-[#1a1a4e]">Brighter Nepal</span>
          </div>

          <header className="mb-10">
            <h3 className="font-headline text-3xl font-extrabold text-[#1a1a4e] tracking-tight mb-2">
              Create Your Account
            </h3>
            <p className="text-on-surface-variant font-medium">Start your academic journey today.</p>
          </header>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-[#1a1a4e] ml-1" htmlFor="fullName">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
                <input {...register('fullName')} id="fullName" type="text" placeholder="John Doe" className={inputClass(!!errors.fullName)} />
              </div>
              {errors.fullName && <p className="text-error text-xs font-medium ml-1">{errors.fullName.message}</p>}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-[#1a1a4e] ml-1" htmlFor="signup-email">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
                <input {...register('email')} id="signup-email" type="email" placeholder="name@example.com" className={inputClass(!!errors.email)} />
              </div>
              {errors.email && <p className="text-error text-xs font-medium ml-1">{errors.email.message}</p>}
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-[#1a1a4e] ml-1" htmlFor="phone">Phone</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
                <input {...register('phone')} id="phone" type="tel" placeholder="+977 98XXXXXXXX" className={inputClass(!!errors.phone)} />
              </div>
              {errors.phone && <p className="text-error text-xs font-medium ml-1">{errors.phone.message}</p>}
            </div>

            {/* Password grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-[#1a1a4e] ml-1" htmlFor="signup-password">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
                  <input {...register('password')} id="signup-password" type="password" placeholder="••••••••" className={inputClass(!!errors.password)} />
                </div>
                {errors.password && <p className="text-error text-xs font-medium ml-1">{errors.password.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-[#1a1a4e] ml-1" htmlFor="confirmPassword">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
                  <input {...register('confirmPassword')} id="confirmPassword" type="password" placeholder="••••••••" className={inputClass(!!errors.confirmPassword)} />
                </div>
                {errors.confirmPassword && <p className="text-error text-xs font-medium ml-1">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3 py-2">
              <div className="flex items-center h-5">
                <input
                  {...register('terms')}
                  id="terms"
                  type="checkbox"
                  className="w-5 h-5 rounded border-outline-variant text-on-primary-container focus:ring-on-primary-container cursor-pointer bg-surface-container-highest"
                />
              </div>
              <label className="text-sm text-on-surface-variant leading-tight select-none" htmlFor="terms">
                I agree to the{' '}
                <Link href="/terms" className="text-on-primary-container font-bold hover:underline">Terms of Service</Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-on-primary-container font-bold hover:underline">Privacy Policy</Link>.
              </label>
            </div>
            {errors.terms && <p className="text-error text-xs font-medium">{errors.terms.message}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                'w-full bg-[#c0622f] hover:bg-[#a14f24] text-white font-headline font-bold py-4 rounded-xl',
                'shadow-[0_8px_20px_rgba(192,98,47,0.25)] active:scale-[0.98] transition-all mt-4',
                'flex items-center justify-center gap-2',
                isSubmitting && 'opacity-70 cursor-not-allowed'
              )}
            >
              {isSubmitting ? 'Creating account...' : 'Create Account'}
              {!isSubmitting && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>

          <footer className="mt-8 text-center">
            <p className="text-on-surface-variant font-medium">
              Already have an account?{' '}
              <Link href="/login" className="text-[#1a1a4e] font-extrabold hover:text-on-primary-container transition-colors ml-1">Login</Link>
            </p>
          </footer>
        </div>
      </section>
    </>
  )
}
*/
