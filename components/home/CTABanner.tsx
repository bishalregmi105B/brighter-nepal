// Component: CTABanner — Call-to-action from public_homepage/code.html
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function CTABanner() {
  return (
    <section className="py-24 bg-[#1a1a4e] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-on-primary-container opacity-10 blur-[100px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] rounded-full bg-[#2d6a6a] opacity-15 blur-[80px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 md:px-12 text-center">
        <span className="inline-block px-3 py-1 bg-on-primary-container/20 text-on-primary-container text-[10px] font-black tracking-widest uppercase rounded-full mb-6 border border-on-primary-container/30">
          Limited Time Offer
        </span>
        <h2 className="font-headline font-black text-4xl md:text-6xl text-white tracking-tight leading-[1.05] mb-6">
          Join 10,000+ Students{' '}
          <span className="text-on-primary-container">Already Succeeding</span>
        </h2>
        <p className="text-slate-300 text-lg leading-relaxed max-w-2xl mx-auto mb-10">
          Start your free 7-day trial today. No credit card needed. Access all features including model sets, live classes, and study resources.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center gap-2 bg-[#c0622f] text-white font-headline font-bold py-5 px-10 rounded-full text-lg shadow-[0_8px_24px_rgba(192,98,47,0.4)] hover:bg-[#a14f24] active:scale-[0.98] transition-all"
          >
            Start Free Trial
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 bg-white/10 text-white font-bold py-5 px-10 rounded-full text-lg border border-white/20 hover:bg-white/20 transition-all"
          >
            Login to Account
          </Link>
        </div>
        <p className="mt-6 text-slate-500 text-sm font-medium">
          No credit card required • 7-day free trial • Cancel anytime
        </p>
      </div>
    </section>
  )
}
