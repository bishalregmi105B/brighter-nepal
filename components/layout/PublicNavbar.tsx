'use client'
// Component: PublicNavbar — Transparent→glass scrolling public nav
// Based exactly on public_homepage/code.html, #1a1a4e brand nav
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { School, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const navLinks = [
  { href: '/#features',     label: 'Features' },
  { href: '/#how-it-works', label: 'How It Works' },
  { href: '/#testimonials', label: 'Testimonials' },
  { href: '/pricing',       label: 'Pricing' },
]

export function PublicNavbar() {
  const [scrolled,  setScrolled]  = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-white/90 backdrop-blur-md shadow-[0_4px_24px_rgba(25,28,30,0.08)]'
          : 'bg-transparent'
      )}
    >
      <nav className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-lg bg-[#1a1a4e] flex items-center justify-center">
            <School className="w-5 h-5 text-on-primary-container" />
          </div>
          <span className={cn(
            'font-headline font-black text-xl tracking-tighter transition-colors',
            scrolled ? 'text-[#1a1a4e]' : 'text-white'
          )}>
            Brighter Nepal
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'font-semibold text-sm transition-colors hover:text-[#c0622f]',
                scrolled ? 'text-slate-600' : 'text-white/80'
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className={cn(
              'font-bold text-sm px-5 py-2.5 rounded-full transition-all',
              scrolled
                ? 'text-[#1a1a4e] hover:bg-surface-container'
                : 'text-white hover:bg-white/10'
            )}
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="font-bold text-sm px-6 py-2.5 rounded-full bg-[#c0622f] text-white hover:bg-[#a14f24] shadow-[0_4px_16px_rgba(192,98,47,0.3)] active:scale-[0.98] transition-all"
          >
            Get Started Free
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          className={cn('md:hidden p-2 rounded-lg', scrolled ? 'text-[#1a1a4e]' : 'text-white')}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 px-6 py-4 flex flex-col gap-2 animate-fade-in">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-semibold text-sm text-slate-600 py-2 hover:text-[#c0622f] transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <hr className="border-slate-100 my-2" />
          <Link href="/login" className="font-bold text-sm text-[#1a1a4e] py-2">Login</Link>
          <Link href="/signup" className="w-full py-3 bg-[#c0622f] text-white font-bold text-sm rounded-xl text-center active:scale-95 transition-transform">
            Get Started Free
          </Link>
        </div>
      )}
    </header>
  )
}
