// Component: PublicFooter — Homepage footer from public_homepage/code.html
import Link from 'next/link'
import { School } from 'lucide-react'

const footerLinks = {
  Platform: [
    { href: '/dashboard', label: 'Student Portal' },
    { href: '/model-sets', label: 'Model Sets' },
    { href: '/live-classes', label: 'Live Classes' },
    { href: '/resources', label: 'Resources' },
  ],
  Exams: [
    { href: '#', label: 'SEE Question Preparation' },
  ],
  Company: [
    { href: '#', label: 'About Us' },
    { href: '#', label: 'Blog' },
    { href: '#', label: 'Careers' },
    { href: '#', label: 'Contact' },
  ],
} as const

export function PublicFooter() {
  return (
    <footer className="bg-[#1a1a4e] text-white">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-lg bg-on-primary-container/20 flex items-center justify-center">
                <School className="w-6 h-6 text-on-primary-container" />
              </div>
              <span className="font-headline font-black text-2xl tracking-tighter">
                Brighter Nepal
              </span>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed max-w-xs mb-8">
              Nepal's premier digital learning platform. Curated resources, model sets, and live classes for SEE Question Preparation.
            </p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
              Trusted by 10,000+ students across 7 provinces
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-bold text-sm uppercase tracking-widest text-slate-400 mb-6">
                {category}
              </h4>
              <ul className="space-y-4">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-300 hover:text-on-primary-container transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-500">
            © 2024 Brighter Nepal. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="#" className="text-xs text-slate-500 hover:text-on-primary-container transition-colors">Privacy Policy</Link>
            <Link href="#" className="text-xs text-slate-500 hover:text-on-primary-container transition-colors">Terms of Service</Link>
            <Link href="#" className="text-xs text-slate-500 hover:text-on-primary-container transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
