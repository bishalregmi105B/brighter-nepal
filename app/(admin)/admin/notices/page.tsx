'use client'
// Admin Notices — interactive category filter + add/pin toggle + delete confirmation
import { useState } from 'react'
import { Plus, Pin, Bell, Megaphone, Info, AlertTriangle, Edit, Trash2, X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

type NoticeCategory = 'Urgent' | 'Important' | 'General' | 'Event'
type CategoryFilter = 'All' | NoticeCategory

interface Notice {
  id:       string
  title:    string
  body:     string
  date:     string
  category: NoticeCategory
  pinned:   boolean
}

const categoryStyle: Record<NoticeCategory, { bg: string; text: string; Icon: React.ElementType }> = {
  Urgent:    { bg: 'bg-error-container',   text: 'text-error',                     Icon: AlertTriangle },
  Important: { bg: 'bg-primary-fixed',     text: 'text-on-primary-fixed-variant',  Icon: Bell          },
  General:   { bg: 'bg-surface-container', text: 'text-on-surface-variant',        Icon: Info          },
  Event:     { bg: 'bg-tertiary-fixed',    text: 'text-on-tertiary-fixed-variant', Icon: Megaphone     },
}

const INITIAL_NOTICES: Notice[] = [
  { id: 'n1', title: 'NEB Exam Schedule Released for 2024',  body: 'The National Examination Board has officially released the exam schedule.',  date: 'Oct 24, 2023', category: 'Urgent',    pinned: true  },
  { id: 'n2', title: 'Scholarship Orientation — May 15th',   body: 'An orientation session for the Brighter Nepal Scholarship Programme.',        date: 'Oct 20, 2023', category: 'Important', pinned: true  },
  { id: 'n3', title: 'Library Hours Extended to 10 PM',      body: 'Digital resource library extended until 10 PM on weekdays.',                  date: 'Oct 18, 2023', category: 'General',   pinned: false },
  { id: 'n4', title: 'Annual Science Fair — Registration',   body: 'Submit project proposals by Nov 1st via the student portal.',                 date: 'Oct 15, 2023', category: 'Event',     pinned: false },
  { id: 'n5', title: 'System Maintenance on Oct 30th',       body: 'The platform will be offline from 2 AM – 5 AM for scheduled maintenance.',    date: 'Oct 14, 2023', category: 'Urgent',    pinned: false },
]

const CATEGORY_FILTERS: CategoryFilter[] = ['All', 'Urgent', 'Important', 'General', 'Event']

export default function AdminNoticesPage() {
  const [filter,  setFilter]  = useState<CategoryFilter>('All')
  const [notices, setNotices] = useState<Notice[]>(INITIAL_NOTICES)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const displayed = filter === 'All' ? notices : notices.filter((n) => n.category === filter)

  const togglePin = (id: string) =>
    setNotices((prev) => prev.map((n) => n.id === id ? { ...n, pinned: !n.pinned } : n))

  const confirmDelete = (id: string) => setDeleteId(id)
  const doDelete      = () => { setNotices((prev) => prev.filter((n) => n.id !== deleteId)); setDeleteId(null) }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-extrabold text-[#1a1a4e] tracking-tight font-headline mb-1">Notices</h2>
          <p className="text-slate-500 font-medium">Publish and manage announcements visible to all students.</p>
        </div>
        <button className="bg-[#c0622f] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-[#c0622f]/20">
          <Plus className="w-5 h-5" /> New Notice
        </button>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORY_FILTERS.map((cat) => {
          const isAll = cat === 'All'
          const style = isAll ? null : categoryStyle[cat as NoticeCategory]
          return (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={cn(
                'px-5 py-2 text-sm font-bold rounded-full transition-all active:scale-95',
                filter === cat
                  ? isAll ? 'bg-[#1a1a4e] text-white' : cn(style!.bg, style!.text, 'ring-2 ring-offset-1 ring-current/30')
                  : isAll ? 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                  : cn('bg-surface-container-low text-on-surface-variant hover:opacity-90', filter !== cat && 'opacity-60')
              )}
            >
              {cat}
            </button>
          )
        })}
      </div>

      {/* Notices list */}
      <div className="space-y-4">
        {displayed.length === 0 && (
          <div className="text-center py-16 text-outline font-medium">No notices in this category.</div>
        )}
        {displayed.map((notice) => {
          const { bg, text, Icon } = categoryStyle[notice.category]
          return (
            <div key={notice.id} className="bg-white rounded-2xl p-6 shadow-[0_8px_20px_rgba(25,28,30,0.04)] flex gap-5 group hover:shadow-xl transition-all">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', bg)}>
                <Icon className={cn('w-5 h-5', text)} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                  <h3 className="font-headline font-bold text-on-surface">{notice.title}</h3>
                  {notice.pinned && (
                    <span className="flex items-center gap-1 text-[10px] font-black text-on-primary-container bg-primary-fixed px-2 py-0.5 rounded-full">
                      <Pin className="w-2.5 h-2.5" /> Pinned
                    </span>
                  )}
                  <span className={cn('text-[10px] font-black px-2 py-0.5 rounded-full uppercase ml-auto', bg, text)}>
                    {notice.category}
                  </span>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">{notice.body}</p>
                <p className="text-xs text-outline font-medium mt-2">{notice.date}</p>
              </div>
              <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <button
                  onClick={() => togglePin(notice.id)}
                  title={notice.pinned ? 'Unpin' : 'Pin'}
                  className={cn('p-2 rounded-lg hover:bg-surface-container-low transition-colors', notice.pinned ? 'text-on-primary-container' : 'text-on-surface-variant hover:text-on-primary-container')}
                >
                  <Pin className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-lg hover:bg-surface-container-low transition-colors text-on-surface-variant hover:text-[#c0622f]">
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => confirmDelete(notice.id)}
                  className="p-2 rounded-lg hover:bg-surface-container-low transition-colors text-on-surface-variant hover:text-error"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Delete confirmation modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-6">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <h3 className="font-headline font-bold text-xl text-on-surface">Delete Notice?</h3>
              <button onClick={() => setDeleteId(null)} className="text-outline hover:text-on-surface">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-500 mb-8">This notice will be permanently removed and all students will lose access to it.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-3 rounded-xl border border-outline-variant/20 font-bold text-sm text-on-surface hover:bg-surface-container transition-colors">Cancel</button>
              <button onClick={doDelete} className="flex-1 py-3 rounded-xl bg-error text-white font-bold text-sm hover:opacity-90 active:scale-95 transition-all">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
