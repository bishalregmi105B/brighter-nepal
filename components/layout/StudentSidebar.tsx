'use client'
// Component: StudentSidebar — collapsible sidebar w/ smooth 260→72px transition
// Based exactly on student_dashboard/code.html and student_resources/code.html designs
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, School, HelpCircle, LogOut, Zap } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useSidebarStore } from '@/lib/store/sidebarStore'
import { studentNavItems } from '@/lib/constants/navigation'
import { useAuth } from '@/hooks/useAuth'

export function StudentSidebar() {
  const pathname    = usePathname()
  const router      = useRouter()
  const { isCollapsed, toggle, isMobileOpen, closeMobile } = useSidebarStore()
  const { user, logout } = useAuth()

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm" 
          onClick={closeMobile} 
        />
      )}
      
      <aside
        className={cn(
          'fixed left-0 top-0 h-screen z-50 bg-[#f8f9fb] flex flex-col py-6 gap-2',
          'border-r border-outline-variant/20 transition-all duration-300',
          // Desktop behavior
          !isMobileOpen && (isCollapsed ? 'md:w-[72px]' : 'md:w-[260px]'),
          // Mobile behavior: slide in/out
          'w-[260px]',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
      {/* Logo */}
      <div className={cn('flex items-center gap-3 mb-6 transition-all', isCollapsed ? 'px-4 justify-center' : 'px-6')}>
        <div className="w-9 h-9 rounded-lg bg-[#1a1a4e] flex items-center justify-center flex-shrink-0">
          <School className="w-5 h-5 text-on-primary-container" />
        </div>
        {!isCollapsed && (
          <div>
            <p className="font-headline font-black text-[#1a1a4e] text-lg tracking-tighter leading-none">
              Brighter Nepal
            </p>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mt-0.5">
              Academic Curator
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-1 px-2">
        {studentNavItems.map((item) => {
          const Icon    = item.icon
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.label : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200',
                'font-semibold text-sm group',
                isActive
                  ? 'bg-white text-[#c0622f] shadow-sm'
                  : 'text-slate-600 hover:bg-slate-200/50 hover:translate-x-1',
                isCollapsed && 'justify-center px-2 md:justify-center'
              )}
              onClick={() => {
                if (window.innerWidth < 768) closeMobile()
              }}
            >
              <Icon className={cn('w-5 h-5 flex-shrink-0', isActive ? 'text-[#c0622f]' : 'text-slate-500 group-hover:text-[#1a1a4e]')} />
              <span className={cn(isCollapsed ? 'md:hidden' : 'block')}>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className={cn('transition-opacity duration-200', isCollapsed ? 'md:hidden' : 'block')}>
        <div className="px-4 mt-2">
          <div className="bg-primary-container/10 p-4 rounded-xl mb-4">
            {user?.plan === 'paid' ? (
              <>
                <p className="text-xs font-bold text-on-primary-container mb-2">PRO PLAN ACTIVE</p>
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-on-primary-container w-3/4 rounded-full" />
                </div>
              </>
            ) : (
              <>
                <p className="text-xs font-bold text-on-primary-container mb-1">Upgrade to Pro</p>
                <p className="text-[10px] text-on-surface-variant leading-tight mb-3">
                  Get unlimited access to premium model sets and live sessions.
                </p>
                <button className="w-full py-2 bg-on-primary-container text-white text-xs font-bold rounded-lg active:scale-95 transition-transform">
                  Upgrade Now
                </button>
              </>
            )}
          </div>
        </div>
        
        <div className="px-3 flex flex-col gap-1">
          <Link href="/help" className="flex items-center gap-3 px-3 py-2 text-slate-500 text-xs font-semibold hover:text-on-surface rounded-lg hover:bg-slate-100 transition-colors">
            <HelpCircle className="w-4 h-4" />
            <span>Help Center</span>
          </Link>
          <button
            onClick={async () => { await logout(); router.replace('/login') }}
            className="flex items-center gap-3 px-3 py-2 text-slate-500 text-xs font-semibold hover:text-error rounded-lg hover:bg-slate-100 transition-colors w-full">
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Toggle button (Desktop only) */}
      <button
        onClick={toggle}
        className={cn(
          'hidden md:flex',
          'absolute top-[72px] -right-3 z-10',
          'w-6 h-6 rounded-full bg-white border border-outline-variant/30 shadow-sm',
          'flex items-center justify-center text-on-surface-variant',
          'hover:bg-surface-container transition-colors'
        )}
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed
          ? <ChevronRight className="w-3 h-3" />
          : <ChevronLeft className="w-3 h-3" />
        }
      </button>
    </aside>
    </>
  )
}
