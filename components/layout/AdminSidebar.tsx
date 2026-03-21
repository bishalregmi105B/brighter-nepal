'use client'
// Component: AdminSidebar — Admin sidebar with expandable sub-menus
// Based exactly on admin_panel_dashboard/code.html and user_management/code.html
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, ChevronDown, School, HelpCircle, LogOut } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils/cn'
import { useSidebarStore } from '@/lib/store/sidebarStore'
import { adminNavItems } from '@/lib/constants/adminNavigation'
import { useAuth } from '@/hooks/useAuth'

export function AdminSidebar() {
  const pathname    = usePathname()
  const router      = useRouter()
  const { isCollapsed, toggle } = useSidebarStore()
  const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({})
  const { logout } = useAuth()

  const toggleSubMenu = (label: string) => {
    setOpenSubMenus((prev) => ({ ...prev, [label]: !prev[label] }))
  }

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen z-50 bg-[#f8f9fb] flex flex-col py-6',
        'border-r border-outline-variant/20 transition-all duration-300 overflow-hidden',
        isCollapsed ? 'w-[72px]' : 'w-[260px]'
      )}
    >
      {/* Logo */}
      <div className={cn('flex items-center gap-3 mb-8 transition-all', isCollapsed ? 'px-4 justify-center' : 'px-6')}>
        <div className="w-9 h-9 rounded-lg bg-[#1a1a4e] flex items-center justify-center flex-shrink-0">
          <School className="w-5 h-5 text-on-primary-container" />
        </div>
        {!isCollapsed && (
          <div>
            <p className="font-headline font-black text-[#1a1a4e] text-lg tracking-tighter leading-none">
              Brighter Nepal
            </p>
            <p className="text-[10px] font-semibold text-secondary-fixed-dim uppercase tracking-widest mt-0.5">
              Admin Portal
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-0.5 px-2 overflow-y-auto no-scrollbar">
        {adminNavItems.map((item) => {
          const Icon     = item.icon
          const isActive = pathname.startsWith(item.href)
          const hasSubItems = item.subItems && item.subItems.length > 0
          const isOpen   = openSubMenus[item.label]

          return (
            <div key={item.href}>
              <button
                onClick={() => {
                  if (hasSubItems && !isCollapsed) {
                    toggleSubMenu(item.label)
                  } else {
                    window.location.href = item.href
                  }
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                  'font-semibold text-sm group',
                  isActive
                    ? 'bg-white text-[#c0622f] shadow-sm'
                    : 'text-slate-600 hover:bg-slate-200/50',
                  isCollapsed && 'justify-center px-2'
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className={cn('w-5 h-5 flex-shrink-0', isActive ? 'text-[#c0622f]' : 'text-slate-500 group-hover:text-[#1a1a4e]')} />
                {!isCollapsed && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    {hasSubItems && (
                      <ChevronDown
                        className={cn('w-4 h-4 transition-transform text-slate-400', isOpen && 'rotate-180')}
                      />
                    )}
                  </>
                )}
              </button>

              {/* Sub items */}
              {hasSubItems && !isCollapsed && isOpen && (
                <div className="ml-4 mt-0.5 border-l-2 border-surface-container-high pl-2 flex flex-col gap-0.5">
                  {item.subItems!.map((sub) => (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      className={cn(
                        'px-3 py-2 text-xs font-semibold rounded-lg transition-colors',
                        pathname === sub.href
                          ? 'text-[#c0622f] bg-orange-50'
                          : 'text-slate-500 hover:text-[#1a1a4e] hover:bg-slate-100'
                      )}
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Admin tag */}
      {!isCollapsed && (
        <div className="px-4 mt-4">
          <div className="bg-primary-container p-4 rounded-xl mb-4">
            <p className="text-white text-xs font-bold mb-2 uppercase tracking-wider">Admin Access</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-white/70 text-xs">Super Admin</span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <Link href="/admin/settings" className="flex items-center gap-2 px-2 py-2 text-slate-500 text-xs font-semibold hover:text-on-surface rounded-lg">
              <HelpCircle className="w-4 h-4" /> Help Center
            </Link>
            <button
              onClick={async () => { await logout(); router.replace('/login') }}
              className="flex items-center gap-2 px-2 py-2 text-error text-xs font-semibold hover:bg-error/5 rounded-lg w-full">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      )}

      {/* Toggle */}
      <button
        onClick={toggle}
        className="absolute top-[72px] -right-3 z-10 w-6 h-6 rounded-full bg-white border border-outline-variant/30 shadow-sm flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors"
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </aside>
  )
}
