'use client'
// (admin) layout — Admin-authenticated routes with AdminSidebar + TopHeader
import { AdminSidebar } from '@/components/layout/AdminSidebar'
import { TopHeader } from '@/components/layout/TopHeader'
import { useSidebarStore } from '@/lib/store/sidebarStore'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebarStore()

  return (
    <div className="flex min-h-screen bg-surface">
      <AdminSidebar />
      <div
        className="flex flex-col flex-1 min-w-0 transition-all duration-300"
        style={{ marginLeft: isCollapsed ? '72px' : '260px' }}
      >
        <TopHeader role="admin" />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
