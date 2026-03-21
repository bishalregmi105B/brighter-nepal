'use client'
// TopHeader — fully responsive top header with real logged-in user data
import { useState } from 'react'
import { Bell, Settings, Search, LogOut, Menu, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import { useAuth } from '@/hooks/useAuth'
import { useSidebarStore } from '@/lib/store/sidebarStore'

interface TopHeaderProps {
  role:        'student' | 'admin'
  pageTitle?:  string
  showSearch?: boolean
}

export function TopHeader({ role, pageTitle, showSearch = true }: TopHeaderProps) {
  const { user, loading, logout, initials } = useAuth()
  const { toggleMobile } = useSidebarStore()
  const router = useRouter()
  const [searchOpen, setSearchOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    router.replace('/login')
  }

  const planLabel = user?.plan === 'paid' ? 'Premium' : 'Free Trial'
  const roleLabel = role === 'admin' ? 'Admin' : planLabel

  return (
    <header className={cn(
      'sticky top-0 w-full z-40',
      'bg-white/90 backdrop-blur-md',
      'shadow-[0_4px_20px_rgba(25,28,30,0.06)]',
      'border-b border-slate-200/30',
    )}>
      {/* Main row */}
      <div className="flex items-center gap-3 px-4 md:px-8 py-3 md:py-4">
        {/* Left: Title or Search */}
        <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
          <button
            onClick={toggleMobile}
            className="md:hidden p-1 -ml-1 text-slate-500 hover:text-[#c0622f] focus:outline-none"
            title="Open Menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          {pageTitle && (
            <h2 className="font-headline font-bold text-lg md:text-xl tracking-tight text-[#1a1a4e] flex-shrink-0 truncate">
              {pageTitle}
            </h2>
          )}
          {showSearch && !searchOpen && (
            <div className={cn('relative hidden md:block', pageTitle ? 'w-64 lg:w-80' : 'w-full max-w-md')}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder={role === 'admin' ? 'Search students, emails...' : 'Search resources, classes...'}
                className="w-full pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-full text-sm focus:ring-2 focus:ring-on-primary-container/20 focus:bg-white transition-all"
              />
            </div>
          )}
        </div>

        {/* Right: Actions + User */}
        <div className="flex items-center gap-1 md:gap-3 flex-shrink-0">
          {/* Mobile search toggle */}
          {showSearch && (
            <button
              className="md:hidden p-2 text-slate-500 hover:text-[#c0622f] transition-colors"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              {searchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
            </button>
          )}

          <button className="p-2 text-slate-500 hover:text-[#c0622f] transition-colors hidden sm:block">
            <Bell className="w-5 h-5" />
          </button>
          {role === 'admin' ? (
            <Link href="/admin/settings" className="p-2 text-slate-500 hover:text-[#c0622f] transition-colors hidden sm:block">
              <Settings className="w-5 h-5" />
            </Link>
          ) : (
            <Link href="/profile" className="p-2 text-slate-500 hover:text-[#c0622f] transition-colors hidden sm:block">
              <Settings className="w-5 h-5" />
            </Link>
          )}

          <div className="h-6 w-[1px] bg-slate-200 mx-1 hidden sm:block" />

          {/* User info */}
          <div className="flex items-center gap-2">
            <div className="text-right hidden lg:block">
              {loading ? (
                <div className="w-20 h-2.5 bg-surface-container rounded animate-pulse" />
              ) : (
                <>
                  <p className="text-sm font-bold text-[#1a1a4e] leading-none">{user?.name ?? 'Guest'}</p>
                  <p className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase mt-0.5">{roleLabel}</p>
                </>
              )}
            </div>
            <div
              title={user?.name ?? 'User'}
              className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-on-primary-container flex items-center justify-center text-white text-xs md:text-sm font-bold ring-2 ring-white shadow-sm flex-shrink-0"
            >
              {loading ? '…' : initials}
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 md:p-2 text-slate-400 hover:text-error transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile search expanded row */}
      {searchOpen && (
        <div className="md:hidden px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              autoFocus
              type="text"
              placeholder={role === 'admin' ? 'Search students, emails...' : 'Search resources, classes...'}
              className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border-none rounded-xl text-sm focus:ring-2 focus:ring-on-primary-container/20"
            />
          </div>
        </div>
      )}
    </header>
  )
}
