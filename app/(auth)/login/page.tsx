'use client'
// Login Page — based exactly on login_page/code.html
// Left navy branding panel + right form with social login
import Link from 'next/link'
import { useState } from 'react'
import { School, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { cn } from '@/lib/utils/cn'

const loginSchema = z.object({
  email:    z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})
type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    await new Promise((r) => setTimeout(r, 1000))
    // TODO: integrate auth
    console.log(data)
  }

  return (
    <>
      {/* Left: Branding Panel */}
      <section className="hidden md:flex md:w-5/12 lg:w-1/2 bg-[#1a1a4e] relative overflow-hidden flex-col justify-between p-12 text-white">
        {/* Decorative glows */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-96 h-96 rounded-full bg-on-tertiary-container blur-[120px]" />
          <div className="absolute bottom-[-5%] left-[-5%] w-80 h-80 rounded-full bg-on-primary-container blur-[100px]" />
        </div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-2 mb-16">
          <School className="w-9 h-9 text-on-primary-container" />
          <h1 className="font-headline text-3xl font-black tracking-tighter">Brighter Nepal</h1>
        </div>

        {/* Hero copy */}
        <div className="relative z-10 max-w-md">
          <h2 className="font-headline text-5xl font-extrabold leading-[1.1] mb-6">
            Welcome back, Scholar.
          </h2>
          <p className="text-secondary-fixed text-lg leading-relaxed opacity-90">
            Continue your academic journey and pick up right where you left off.
          </p>
        </div>

        {/* Social proof */}
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
          <p className="text-sm font-medium text-secondary-fixed">
            Trusted by students across 7 provinces.
          </p>
        </div>
      </section>

      {/* Right: Login Form */}
      <section className="flex-1 flex items-center justify-center p-6 md:p-12 lg:p-24 bg-surface-bright">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="md:hidden flex items-center gap-2 mb-8">
            <School className="w-8 h-8 text-on-primary-container" />
            <span className="font-headline text-xl font-black text-[#1a1a4e]">Brighter Nepal</span>
          </div>

          <header className="mb-10">
            <h3 className="font-headline text-3xl font-extrabold text-[#1a1a4e] tracking-tight mb-2">
              Login to Your Account
            </h3>
            <p className="text-on-surface-variant font-medium">
              Enter your credentials to continue.
            </p>
          </header>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-[#1a1a4e] ml-1" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
                <input
                  {...register('email')}
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className={cn(
                    'w-full pl-12 pr-4 py-3.5 bg-surface-container-highest rounded-xl border-none',
                    'focus:ring-2 focus:ring-on-primary-container transition-all',
                    'text-on-surface placeholder:text-outline/60 font-medium',
                    errors.email && 'ring-2 ring-error'
                  )}
                />
              </div>
              {errors.email && (
                <p className="text-error text-xs font-medium ml-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-[#1a1a4e] ml-1" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
                <input
                  {...register('password')}
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={cn(
                    'w-full pl-12 pr-12 py-3.5 bg-surface-container-highest rounded-xl border-none',
                    'focus:ring-2 focus:ring-on-primary-container transition-all',
                    'text-on-surface placeholder:text-outline/60 font-medium',
                    errors.password && 'ring-2 ring-error'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-error text-xs font-medium ml-1">{errors.password.message}</p>
              )}
            </div>

            {/* Forgot password */}
            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-sm font-bold text-on-primary-container hover:underline">
                Forgot Password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                'w-full bg-[#c0622f] hover:bg-[#a14f24] text-white font-headline font-bold py-4 rounded-xl',
                'shadow-[0_8px_20px_rgba(192,98,47,0.25)] active:scale-[0.98] transition-all',
                'flex items-center justify-center gap-2 mt-4',
                isSubmitting && 'opacity-70 cursor-not-allowed'
              )}
            >
              {isSubmitting ? 'Logging in...' : 'Login'}
              {!isSubmitting && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>

          <footer className="mt-8 text-center">
            <p className="text-on-surface-variant font-medium">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-[#1a1a4e] font-extrabold hover:text-on-primary-container transition-colors ml-1">
                Sign Up
              </Link>
            </p>
          </footer>
        </div>
      </section>
    </>
  )
}
