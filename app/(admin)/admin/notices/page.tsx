'use client'
// Admin Notices — fetches from noticeService, supports create/pin/delete via API
import { useEffect, useState } from 'react'
import { Plus, Pin, Bell, Megaphone, Info, AlertTriangle, Trash2, X, Loader2 } from 'lucide-react'
import { noticeService, type Notice } from '@/services/noticeService'
import { cn } from '@/lib/utils/cn'

type CategoryFilter = 'All' | 'urgent' | 'important' | 'general' | 'event'

const categoryStyle: Record<string, { bg: string; text: string; Icon: React.ElementType }> = {
  urgent:    { bg: 'bg-error-container',   text: 'text-error',                     Icon: AlertTriangle },
  important: { bg: 'bg-primary-fixed',     text: 'text-on-primary-fixed-variant',  Icon: Bell          },
  general:   { bg: 'bg-surface-container', text: 'text-on-surface-variant',        Icon: Info          },
  event:     { bg: 'bg-tertiary-fixed',    text: 'text-on-tertiary-fixed-variant', Icon: Megaphone     },
}

const CATEGORY_FILTERS: CategoryFilter[] = ['All', 'urgent', 'important', 'general', 'event']

export default function AdminNoticesPage() {
  const [filter,   setFilter]   = useState<CategoryFilter>('All')
  const [notices,  setNotices]  = useState<Notice[]>([])
  const [loading,  setLoading]  = useState(true)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [showModal, setShowModal] = useState(false)

  const fetchNotices = () => {
    setLoading(true)
    noticeService.getNotices({ category: filter === 'All' ? '' : filter })
      .then((res) => {
        const d = res.data
        setNotices(Array.isArray(d) ? d : (d as { items?: Notice[] }).items ?? [])
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchNotices() }, [filter])

  const doDelete = async () => {
    if (!deleteId) return
    await noticeService.deleteNotice(deleteId).catch(() => {})
    setDeleteId(null)
    fetchNotices()
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-extrabold text-[#1a1a4e] tracking-tight font-headline mb-1">Notices</h2>
          <p className="text-slate-500 font-medium">BridgeCourse Nepal — publish announcements to all students.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-[#c0622f] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-[#c0622f]/20">
          <Plus className="w-5 h-5" /> New Notice
        </button>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORY_FILTERS.map((cat) => {
          const isAll = cat === 'All'
          const s     = isAll ? null : categoryStyle[cat]
          return (
            <button key={cat} onClick={() => setFilter(cat)} className={cn(
              'px-5 py-2 text-sm font-bold rounded-full transition-all active:scale-95 capitalize',
              filter === cat
                ? isAll ? 'bg-[#1a1a4e] text-white' : cn(s!.bg, s!.text, 'ring-2 ring-offset-1')
                : isAll ? 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                        : 'bg-surface-container-low text-on-surface-variant hover:opacity-90 opacity-60'
            )}>{cat}</button>
          )
        })}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48"><Loader2 className="w-6 h-6 animate-spin text-on-primary-container" /></div>
      ) : (
        <div className="space-y-4">
          {notices.length === 0 && <div className="text-center py-16 text-outline font-medium">No notices in this category.</div>}
          {notices.map((notice) => {
            const style = categoryStyle[notice.category?.toLowerCase()] ?? categoryStyle.general
            const Icon  = style.Icon
            return (
              <div key={notice.id} className="bg-white rounded-2xl p-6 shadow-[0_8px_20px_rgba(25,28,30,0.04)] flex gap-5 group hover:shadow-xl transition-all">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', style.bg)}>
                  <Icon className={cn('w-5 h-5', style.text)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                    <h3 className="font-headline font-bold text-on-surface">{notice.title}</h3>
                    {notice.pinned && (
                      <span className="flex items-center gap-1 text-[10px] font-black text-on-primary-container bg-primary-fixed px-2 py-0.5 rounded-full">
                        <Pin className="w-2.5 h-2.5" /> Pinned
                      </span>
                    )}
                    <span className={cn('text-[10px] font-black px-2 py-0.5 rounded-full uppercase ml-auto capitalize', style.bg, style.text)}>
                      {notice.category}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed max-w-3xl">{notice.body}</p>
                  <p className="text-xs text-outline font-medium mt-2">{notice.created_at?.slice(0,10)}</p>
                </div>
                <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button className={cn('p-2 rounded-lg hover:bg-surface-container-low transition-colors', notice.pinned ? 'text-on-primary-container' : 'text-on-surface-variant')}>
                    <Pin className="w-4 h-4" />
                  </button>
                  <button onClick={() => setDeleteId(notice.id)} className="p-2 rounded-lg hover:bg-surface-container-low transition-colors text-on-surface-variant hover:text-error">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Delete modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-6">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <h3 className="font-headline font-bold text-xl text-on-surface">Delete Notice?</h3>
              <button onClick={() => setDeleteId(null)} className="text-outline hover:text-on-surface"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-sm text-slate-500 mb-8">This notice will be permanently removed from BridgeCourse Nepal and all students will lose access to it.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-3 rounded-xl border border-outline-variant/20 font-bold text-sm text-on-surface hover:bg-surface-container transition-colors">Cancel</button>
              <button onClick={doDelete} className="flex-1 py-3 rounded-xl bg-error text-white font-bold text-sm hover:opacity-90 active:scale-95 transition-all">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Create modal */}
      {showModal && (
        <NoticeModal onClose={() => setShowModal(false)} onSaved={fetchNotices} />
      )}
    </div>
  )
}

function NoticeModal({ onClose, onSaved }: { onClose: () => void, onSaved: () => void }) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [category, setCategory] = useState('general')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    if (!title.trim() || !body.trim()) { setError('Title and message are required.'); return }
    setSaving(true)
    setError('')
    try {
      await noticeService.createNotice({ title: title.trim(), body: body.trim(), category })
      onSaved()
      onClose()
    } catch {
      setError('Failed to publish notice.')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full md:max-w-xl bg-white md:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col">
        <div className="px-6 py-4 border-b border-surface-container flex items-center justify-between">
          <h2 className="font-headline font-bold text-xl text-[#1a1a4e]">New Notice</h2>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-5">
          {error && <div className="p-3 bg-error-container text-error rounded-xl text-sm font-bold">{error}</div>}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="E.g., Scholarship Exam Postponed"
              className="w-full px-4 py-3 bg-surface-container-low rounded-xl border-none focus:ring-2 focus:ring-on-primary-container text-sm font-bold placeholder:font-medium placeholder:text-outline" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Message Body</label>
            <textarea value={body} onChange={e => setBody(e.target.value)} rows={4} placeholder="Full announcement text..."
              className="w-full px-4 py-3 bg-surface-container-low rounded-xl border-none focus:ring-2 focus:ring-on-primary-container text-sm font-medium placeholder:text-outline resize-none" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Priority Level</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {['general', 'important', 'urgent', 'event'].map(cat => (
                <button key={cat} onClick={() => setCategory(cat)} className={cn('py-2 text-xs font-bold rounded-lg border-2 capitalize transition-all',
                  category === cat ? 'border-[#c0622f] bg-[#c0622f]/10 text-[#c0622f]' : 'border-surface-container text-slate-400 hover:border-slate-300')}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-surface-container bg-surface-container-low flex justify-end gap-3 rounded-b-2xl">
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-colors">Discard</button>
          <button onClick={handleSave} disabled={saving} className="bg-[#1a1a4e] text-white px-8 py-2.5 rounded-xl font-bold hover:opacity-90 active:scale-95 transition-all text-sm shadow-lg shadow-[#1a1a4e]/20 disabled:opacity-50 flex items-center gap-2">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Publishing</> : 'Publish Notice'}
          </button>
        </div>
      </div>
    </div>
  )
}
