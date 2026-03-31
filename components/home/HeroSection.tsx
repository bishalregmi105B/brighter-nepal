// Component: HeroSection — Homepage hero from public_homepage/code.html
// Navy background #1a1a4e, teal/orange glows, stat bubbles
import Link from 'next/link'
import { ArrowRight, Play } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="relative min-h-screen bg-[#1a1a4e] flex items-center overflow-hidden pt-20">
      {/* Decorative glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-[#579292] opacity-10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-[#c0622f] opacity-10 blur-[100px]" />
        <div className="absolute top-[30%] left-[10%] w-[300px] h-[300px] rounded-full bg-on-primary-container opacity-5 blur-[80px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left: Copy */}
        <div>
          <span className="inline-flex items-center gap-2 bg-on-primary-container/20 text-on-primary-container text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full mb-8 border border-on-primary-container/30">
            Nepal&apos;s #1 Academic Platform
          </span>

          <h1 className="font-headline font-black text-5xl md:text-6xl lg:text-7xl text-white leading-[1.05] tracking-tighter mb-6">
            Your Path to{' '}
            <span className="text-on-primary-container">Academic</span>{' '}
            Excellence
          </h1>

          <p className="text-slate-300 text-lg leading-relaxed max-w-xl mb-10">
            Access 2,500+ curated study materials, live classes from Nepal&apos;s top educators, and AI-powered mock tests designed for SEE Question Preparation.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 bg-[#c0622f] text-white font-headline font-bold py-4 px-8 rounded-full text-base shadow-[0_8px_20px_rgba(192,98,47,0.35)] hover:bg-[#a14f24] active:scale-[0.98] transition-all"
            >
              Start Learning Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <button className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm text-white font-bold py-4 px-8 rounded-full border border-white/20 hover:bg-white/20 transition-all">
              <Play className="w-5 h-5 fill-white" />
              Watch Demo
            </button>
          </div>

          {/* Social proof */}
          <div className="flex items-center gap-4 mt-12">
            <div className="flex -space-x-3">
              {['PK', 'AR', 'SM', 'SG'].map((initials, i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-on-primary-container border-4 border-[#1a1a4e] flex items-center justify-center text-white text-[10px] font-bold"
                >
                  {initials}
                </div>
              ))}
              <div className="w-10 h-10 rounded-full bg-on-primary-container/30 border-4 border-[#1a1a4e] flex items-center justify-center text-white text-[10px] font-bold">
                +10k
              </div>
            </div>
            <p className="text-sm font-medium text-slate-300">
              Trusted by students across 7 provinces.
            </p>
          </div>
        </div>

        {/* Right: Feature card collage */}
        <div className="hidden lg:flex flex-col gap-4 relative">
          {/* Main card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-on-primary-container text-xs font-bold uppercase tracking-widest">Live Session Active</span>
            </div>
            <h3 className="text-white font-headline font-black text-xl mb-1">Advanced Calculus II</h3>
            <p className="text-slate-300 text-sm mb-4">Dr. Sameer Adhikari • 2.4k Watching</p>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-on-primary-container w-2/3 rounded-full" />
            </div>
          </div>

          {/* Score card */}
          <div className="flex gap-4">
            <div className="flex-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">Mock Rank</p>
              <p className="text-white font-headline font-black text-3xl">#12</p>
              <p className="text-on-primary-container text-xs font-bold mt-1">↑4 this week</p>
            </div>
            <div className="flex-1 bg-on-primary-container/20 backdrop-blur-md border border-on-primary-container/30 rounded-2xl p-5">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">Accuracy</p>
              <p className="text-white font-headline font-black text-3xl">88%</p>
              <p className="text-on-tertiary-container text-xs font-bold mt-1">5% above avg</p>
            </div>
          </div>

          {/* Resources card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-on-primary-container flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xl">📚</span>
            </div>
            <div>
              <p className="text-white font-bold">Aliphatic Compounds Notes</p>
              <p className="text-slate-400 text-xs">PDF • 12.4 MB • Chemistry</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
