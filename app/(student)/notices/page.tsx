// Student Notices Page — based exactly on student_notices/code.html
// Pinned notices + latest notices feed with status badges
import { mockNotices } from '@/lib/data/mockNotices'
import { Bell, Pin, Circle } from 'lucide-react'

export default function NoticesPage() {
  const pinnedNotices = mockNotices.filter((n) => n.pinned)
  const latestNotices = mockNotices.filter((n) => !n.pinned)

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="font-headline font-black text-4xl text-[#1a1a4e] tracking-tight mb-2">Notices</h2>
          <p className="text-on-surface-variant font-medium">Stay updated with academic announcements and alerts.</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-on-primary-container/10 flex items-center justify-center">
          <Bell className="w-6 h-6 text-on-primary-container" />
        </div>
      </div>

      {/* Pinned Notices */}
      <section className="mb-10">
        <h3 className="font-headline font-bold text-xl text-[#1a1a4e] mb-5 flex items-center gap-2">
          <Pin className="w-5 h-5 text-on-primary-container" /> Pinned Announcements
        </h3>
        <div className="space-y-4">
          {pinnedNotices.map((notice) => (
            <div
              key={notice.id}
              className={`relative overflow-hidden bg-white border-l-4 rounded-xl shadow-card p-6 cursor-pointer hover:shadow-lg transition-all ${
                notice.category === 'urgent'    ? 'border-error'
                : notice.category === 'important' ? 'border-on-primary-container'
                : 'border-secondary'
              }`}
            >
              {notice.status === 'unread' && (
                <div className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
              )}
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                  notice.category === 'urgent' ? 'bg-error/10' : notice.category === 'important' ? 'bg-on-primary-container/10' : 'bg-secondary/10'
                }`}>
                  <Bell className={`w-6 h-6 ${
                    notice.category === 'urgent' ? 'text-error' : notice.category === 'important' ? 'text-on-primary-container' : 'text-secondary'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      notice.category === 'urgent' ? 'bg-error/10 text-error' : notice.category === 'important' ? 'bg-on-primary-container/10 text-on-primary-container' : 'bg-secondary/10 text-secondary'
                    }`}>
                      {notice.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">{notice.department}</span>
                  </div>
                  <h4 className="font-bold text-base text-[#1a1a4e] mb-2">{notice.title}</h4>
                  <p className="text-on-surface-variant text-sm leading-relaxed">{notice.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Latest Notices */}
      <section>
        <h3 className="font-headline font-bold text-xl text-[#1a1a4e] mb-5">Latest Notices</h3>
        <div className="space-y-3">
          {latestNotices.map((notice) => (
            <div
              key={notice.id}
              className="bg-white rounded-xl shadow-sm p-5 flex items-start gap-4 cursor-pointer hover:shadow-card transition-all"
            >
              {notice.status === 'unread' && (
                <Circle className="w-2.5 h-2.5 text-blue-500 fill-blue-500 flex-shrink-0 mt-1.5" />
              )}
              {notice.status === 'read' && (
                <Circle className="w-2.5 h-2.5 text-slate-200 fill-slate-200 flex-shrink-0 mt-1.5" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="font-bold text-sm text-[#1a1a4e]">{notice.title}</h4>
                  <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                    notice.category === 'urgent' ? 'bg-error/10 text-error' : notice.category === 'important' ? 'bg-on-primary-container/10 text-on-primary-container' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {notice.category}
                  </span>
                </div>
                <p className="text-slate-400 text-xs font-semibold">{notice.department}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
