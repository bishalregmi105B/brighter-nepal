'use client'
// Student Notices — fetches real data from noticeService
import { useEffect, useState } from 'react'
import { noticeService, type Notice } from '@/services/noticeService'
import { Bell, ExternalLink, Circle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export default function NoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    noticeService.getNotices().then((res) => {
      const d = res.data
      const items = Array.isArray(d) ? d : (d as { items?: Notice[] }).items ?? []
      const sorted = [...items].sort((a, b) => {
        const bt = new Date(b.created_at ?? '').getTime()
        const at = new Date(a.created_at ?? '').getTime()
        if (Number.isNaN(bt) || Number.isNaN(at)) return 0
        return bt - at
      })
      setNotices(sorted)
    }).catch((e) => setError(e.message)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-on-primary-container" /></div>
  if (error)   return <div className="p-10 text-center text-red-500 font-medium">{error}</div>

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="font-headline font-black text-4xl text-[#1a1a4e] tracking-tight mb-2">Notices</h2>
          <p className="text-on-surface-variant font-medium">Stay updated with Brighter Nepal announcements and alerts.</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-on-primary-container/10 flex items-center justify-center">
          <Bell className="w-6 h-6 text-on-primary-container" />
        </div>
      </div>

      {/* Notices — flat list, no pinned section */}
      <div className="space-y-4">
        {notices.map((notice) => (
          <div key={notice.id} className="bg-white rounded-2xl shadow-[0_4px_16px_rgba(25,28,30,0.05)] p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="pt-1 flex-shrink-0">
                <Circle className="w-2.5 h-2.5 text-blue-500 fill-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className={cn(
                    'px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider',
                    notice.category === 'urgent'    ? 'bg-red-100 text-red-600'
                    : notice.category === 'important' ? 'bg-on-primary-container/10 text-on-primary-container'
                    : 'bg-slate-100 text-slate-500'
                  )}>
                    {notice.category}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">{notice.department}</span>
                </div>

                {/* Title — bolder */}
                <h3 className="font-black text-xl text-[#1a1a4e] leading-snug mb-2">{notice.title}</h3>

                {notice.body && (
                  <p className="text-on-surface-variant text-sm leading-relaxed mb-4">{notice.body}</p>
                )}

                {/* Open Link */}
                <button
                  onClick={() => window.open(notice.link_url || '#', '_blank')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-on-primary-container/10 text-on-primary-container font-bold text-xs rounded-xl hover:bg-on-primary-container/20 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Open Link
                </button>
              </div>
            </div>
          </div>
        ))}

        {notices.length === 0 && (
          <div className="text-center py-20 text-outline">
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-bold">No notices at this time.</p>
          </div>
        )}
      </div>
    </div>
  )
}
