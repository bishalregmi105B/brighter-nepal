'use client'
// (student) layout — Auth-guarded student routes with responsive layout:
//   • Mobile (<md): sidebar hidden, bottom nav shown, no margin-left
//   • Tablet (md–lg): sidebar collapsed to 72px icon mode
//   • Desktop (lg+): full 260px sidebar
import { useEffect } from 'react'
import { AuthGuard } from '@/components/layout/AuthGuard'
import { StudentSidebar } from '@/components/layout/StudentSidebar'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'
import { TopHeader } from '@/components/layout/TopHeader'
import { useSidebarStore } from '@/lib/store/sidebarStore'

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { isCollapsed, setCollapsed } = useSidebarStore()

  // On mobile (< 768px) collapse sidebar; on tablet auto-collapse; on desktop expand
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCollapsed(true)
      } else if (window.innerWidth < 1024) {
        setCollapsed(true)   // tablet: icon-only mode
      } else {
        setCollapsed(false)  // desktop: full sidebar
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [setCollapsed])

  return (
    <AuthGuard requiredRole="student">
      <div className="flex h-screen bg-surface overflow-hidden">
        {/* Sidebar — desktop/tablet/mobile handling is inside the component */}
        <StudentSidebar />

        {/* Main content */}
        <div
          className="flex flex-col flex-1 min-w-0 transition-all duration-300"
          style={{
            marginLeft: typeof window !== 'undefined' && window.innerWidth < 768
              ? 0
              : isCollapsed ? '72px' : '260px'
          }}
        >
          <TopHeader role="student" />
          <main className="flex-1 min-h-0 overflow-y-auto pb-20 md:pb-0">
            {children}
          </main>
        </div>

        {/* Mobile bottom navigation (shown only on < md) */}
        <div className="md:hidden">
          <MobileBottomNav role="student" />
        </div>
      </div>
    </AuthGuard>
  )
}
