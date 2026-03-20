// 404 Not Found Page
// Friendly error with illustration-like text, back home CTA
import Link from 'next/link'
import { ArrowLeft, BookOpen } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f8f9fb] flex items-center justify-center p-6">
      <div className="text-center max-w-lg mx-auto">

        {/* Large 404 */}
        <div className="relative mb-8 inline-block">
          <span className="text-[140px] md:text-[180px] font-headline font-black text-[#1a1a4e] leading-none select-none opacity-[0.06]">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 rounded-[24px] bg-[#1a1a4e] flex items-center justify-center shadow-2xl">
              <BookOpen className="w-12 h-12 text-on-primary-container" />
            </div>
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-headline font-extrabold text-[#1a1a4e] mb-4">
          Page Not Found
        </h1>
        <p className="text-slate-500 text-base mb-10 leading-relaxed max-w-sm mx-auto">
          Looks like this page went off-syllabus. It might have been moved, deleted, or never existed in the first place.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 bg-[#1a1a4e] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#141432] active:scale-95 transition-all shadow-lg"
          >
            <ArrowLeft className="w-5 h-5" /> Back to Home
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 bg-white text-[#1a1a4e] px-8 py-4 rounded-xl font-bold border border-outline-variant/20 hover:bg-surface-container-low transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>

        {/* Quick links */}
        <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm font-semibold text-slate-400">
          {[
            { label: 'Model Sets',   href: '/model-sets'   },
            { label: 'Live Classes', href: '/live-classes'  },
            { label: 'Resources',    href: '/resources'     },
            { label: 'Help Center',  href: '/help'          },
          ].map((link) => (
            <Link key={link.label} href={link.href} className="hover:text-on-primary-container transition-colors">
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
