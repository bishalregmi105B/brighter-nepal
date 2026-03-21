'use client'
// TopHeader — fully responsive top header with real logged-in user data
import { useState, useEffect, useRef } from 'react'
import { Bell, Settings, Search, LogOut, Menu, X, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import { useAuth } from '@/hooks/useAuth'
import { useSidebarStore } from '@/lib/store/sidebarStore'
import { noticeService, Notice } from '@/services/noticeService'

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
  const [notices, setNotices] = useState<Notice[]>([])
  const [showNotices, setShowNotices] = useState(false)
  const noticesRef = useRef<HTMLDivElement>(null)

  const handleLogout = async () => {
    await logout()
    router.replace('/login')
  }

  useEffect(() => {
    if (!loading && user) {
      noticeService.getNotices().then((res: any) => {
        const payload = res?.data?.data || res?.data || res
        if (Array.isArray(payload)) setNotices(payload)
        else if (payload && 'items' in payload) setNotices(payload.items as Notice[])
      }).catch(console.error)
    }
  }, [loading, user])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (noticesRef.current && !noticesRef.current.contains(e.target as Node)) {
        setShowNotices(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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

          {/* Notifications Dropdown */}
          <div className="relative hidden sm:block" ref={noticesRef}>
            <button 
              onClick={() => setShowNotices(!showNotices)}
              className={cn(
                "p-2 transition-colors relative rounded-full",
                showNotices ? "bg-slate-100 text-[#1a1a4e]" : "text-slate-500 hover:text-[#c0622f] hover:bg-slate-100/50"
              )}
            >
              <Bell className="w-5 h-5" />
              {notices.length > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 bg-error text-white text-[9px] font-black flex items-center justify-center rounded-full ring-2 ring-white shadow-sm">
                  {notices.length > 99 ? '99+' : notices.length}
                </span>
              )}
            </button>

            {showNotices && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 animate-in fade-in slide-in-from-top-2 z-50 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="font-bold text-[#1a1a4e]">Notifications</h3>
                  <span className="text-xs font-bold text-white bg-[#c0622f] px-2 py-0.5 rounded-full">{notices.length} New</span>
                </div>
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                  {notices.length === 0 ? (
                    <div className="p-6 text-center text-slate-500 text-sm">No new notifications</div>
                  ) : (
                    notices.slice(0, 5).map(notice => (
                      <div key={notice.id} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors last:border-0">
                        <p className="text-sm font-bold text-[#1a1a4e] mb-1 line-clamp-1">{notice.title}</p>
                        <p className="text-xs text-slate-500 line-clamp-2">{notice.body}</p>
                        <p className="text-[10px] text-slate-400 mt-2 font-medium">{new Date(notice.created_at).toLocaleDateString()}</p>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-2 border-t border-slate-100 bg-slate-50/50">
                  <Link 
                    href={role === 'admin' ? '/admin/notices' : '/notices'} 
                    onClick={() => setShowNotices(false)}
                    className="flex items-center justify-center gap-1.5 w-full py-2 text-sm font-bold text-[#c0622f] hover:text-[#8a421c] transition-colors rounded-lg hover:bg-[#c0622f]/10"
                  >
                    View All Notices <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}
          </div>

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
