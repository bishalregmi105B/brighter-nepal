'use client'
// (admin) layout — Auth-guarded admin routes, fully responsive:
//   • Mobile (<md): sidebar hidden, bottom nav shown
//   • Tablet (md): icon-only sidebar (72px)
//   • Desktop (lg+): full 260px sidebar
import { useEffect } from 'react'
import { AuthGuard } from '@/components/layout/AuthGuard'
import { AdminSidebar } from '@/components/layout/AdminSidebar'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'
import { TopHeader } from '@/components/layout/TopHeader'
import { useSidebarStore } from '@/lib/store/sidebarStore'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isCollapsed, setCollapsed } = useSidebarStore()

  useEffect(() => {
    const handleResize = () => {
      setCollapsed(window.innerWidth < 1024)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [setCollapsed])

  return (
    <AuthGuard requiredRole="admin">
      <div className="flex h-screen bg-surface overflow-hidden">
        {/* Sidebar — handling mobile slide-in inherently */}
        <AdminSidebar />
        <div
          className="flex flex-col flex-1 min-w-0 transition-all duration-300"
          style={{
            marginLeft: typeof window !== 'undefined' && window.innerWidth < 768
              ? 0
              : isCollapsed ? '72px' : '260px'
          }}
        >
          <TopHeader role="admin" />
          <main className="flex-1 min-h-0 overflow-y-auto pb-20 md:pb-0">
            {children}
          </main>
        </div>
        <div className="md:hidden">
          <MobileBottomNav role="admin" />
        </div>
      </div>
    </AuthGuard>
  )
}
