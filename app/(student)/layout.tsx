'use client'
// (student) layout — Student-authenticated routes with collapsible sidebar + top header
import { StudentSidebar } from '@/components/layout/StudentSidebar'
import { TopHeader } from '@/components/layout/TopHeader'
import { useSidebarStore } from '@/lib/store/sidebarStore'

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebarStore()

  return (
    <div className="flex min-h-screen bg-surface">
      <StudentSidebar />
      <div
        className="flex flex-col flex-1 min-w-0 transition-all duration-300"
        style={{ marginLeft: isCollapsed ? '72px' : '260px' }}
      >
        <TopHeader role="student" />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
