'use client'
// Admin Live Classes — fetches real data from liveClassService
import { useEffect, useState } from 'react'
import { Plus, Video, RadioTower, Calendar, Clock, Users, Eye, Settings, StopCircle, PlayCircle, ChevronRight, Loader2, X, Edit } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { liveClassService, type LiveClass } from '@/services/liveClassService'
import { cn } from '@/lib/utils/cn'

type SessionStatus = 'live' | 'upcoming' | 'completed' | 'cancelled'

const statusStyle: Record<string, { label: string; bg: string; text: string; Icon: React.ElementType }> = {
  live:      { label: 'Live Now',   bg: 'bg-error-container', text: 'text-error',                     Icon: RadioTower },
  upcoming:  { label: 'Scheduled', bg: 'bg-secondary-fixed', text: 'text-on-secondary-fixed-variant', Icon: Calendar  },
  completed: { label: 'Completed', bg: 'bg-tertiary-fixed',  text: 'text-on-tertiary-fixed-variant',  Icon: Video     },
  cancelled: { label: 'Cancelled', bg: 'bg-slate-100',       text: 'text-slate-500',                  Icon: Clock     },
  scheduled: { label: 'Scheduled', bg: 'bg-secondary-fixed', text: 'text-on-secondary-fixed-variant', Icon: Calendar  },
}

const STATUS_TABS: (SessionStatus | 'all')[] = ['all', 'live', 'upcoming', 'completed']

export default function AdminLiveClassesPage() {
  const [sessions,   setSessions]   = useState<LiveClass[]>([])
  const [loading,    setLoading]    = useState(true)
  const [activeTab,  setActiveTab]  = useState<SessionStatus | 'all'>('all')
  const router = useRouter()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isCreating,      setIsCreating]      = useState(false)
  const [createForm,      setCreateForm]      = useState({ title: '', teacher: '', subject: 'Physics', scheduled_at: '', duration_min: 60, stream_url: '', status: 'scheduled' })

  const [showEditModal, setShowEditModal] = useState(false)
  const [isEditing,     setIsEditing]     = useState(false)
  const [editId,        setEditId]        = useState<number | null>(null)
  const [editForm,      setEditForm]      = useState({ title: '', teacher: '', subject: 'Physics', scheduled_at: '', duration_min: 60, stream_url: '' })

  const fetchClasses = () => {
    setLoading(true)
    liveClassService.getLiveClasses().then((res) => setSessions(res.data?.items ?? [])).finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchClasses()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)
    try {
      await liveClassService.createClass(createForm)
      setShowCreateModal(false)
      setCreateForm({ title: '', teacher: '', subject: 'Physics', scheduled_at: '', duration_min: 60, stream_url: '', status: 'scheduled' })
      fetchClasses() // reload list
    } catch (err) {
      alert('Failed to schedule live class')
    } finally {
      setIsCreating(false)
    }
  }

  const handleStartLive = async (id: number) => {
    try {
      if (!confirm('Start this class right now? Students will be notified.')) return
      await liveClassService.updateClass(id, { status: 'live' })
      router.push(`/admin/live-classes/${id}/monitor`)
    } catch {
      alert('Failed to start live class')
    }
  }

  const handleEndLive = async (id: number) => {
    try {
      if (!confirm('End this live session? It will be published to Recorded Lectures immediately.')) return
      await liveClassService.updateClass(id, { status: 'completed' })
      fetchClasses() // reload list
    } catch {
      alert('Failed to end live class')
    }
  }

  const openEditModal = (session: LiveClass) => {
    setEditId(session.id)
    setEditForm({
      title: session.title,
      teacher: session.teacher,
      subject: session.subject,
      scheduled_at: session.scheduled_at ? new Date(session.scheduled_at).toISOString().slice(0, 16) : '',
      duration_min: session.duration_min,
      stream_url: session.stream_url ?? ''
    })
    setShowEditModal(true)
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editId) return
    setIsEditing(true)
    try {
      await liveClassService.updateClass(editId, editForm)
      setShowEditModal(false)
      fetchClasses() // reload list
    } catch (err) {
      alert('Failed to update live class')
    } finally {
      setIsEditing(false)
    }
  }

  const displayed  = activeTab === 'all' ? sessions : sessions.filter(s => s.status === activeTab)
  const liveNow    = sessions.find(s => s.status === 'live')

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-extrabold text-[#1a1a4e] tracking-tight font-headline mb-1">Live Classes</h2>
          <p className="text-slate-500 font-medium">BridgeCourse Nepal — schedule, broadcast, and monitor IOE/IOM/CSIT sessions.</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="bg-[#c0622f] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-[#c0622f]/20 self-start md:self-auto">
          <Plus className="w-5 h-5" /> Schedule Class
        </button>
      </div>

      {/* Live now banner */}
      {liveNow && (
        <div className="bg-[#1a1a4e] rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 text-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-error/20 flex items-center justify-center flex-shrink-0"><RadioTower className="w-6 h-6 text-error" /></div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-error animate-pulse" />
                <span className="font-black text-lg">{liveNow.title}</span>
              </div>
              <p className="text-white/60 text-sm flex items-center gap-4">
                {liveNow.watchers && <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {liveNow.watchers.toLocaleString()} watching</span>}
                <span>{liveNow.teacher} · {liveNow.subject}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link href={`/admin/live-classes/${liveNow.id}/monitor`} className="bg-on-primary-container text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:shadow-lg transition-all">
              <Eye className="w-4 h-4" /> Monitor
            </Link>
            <button onClick={() => handleEndLive(liveNow.id)} className="bg-error/20 text-error px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-error/30 transition-colors">
              <StopCircle className="w-4 h-4" /> End Session
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {[
          { label: 'Total Sessions', value: sessions.length.toString(),                                              color: 'text-[#1a1a4e]'              },
          { label: 'Live Now',       value: sessions.filter(s=>s.status==='live').length.toString(),                 color: 'text-error'                  },
          { label: 'Scheduled',      value: sessions.filter(s=>s.status==='upcoming').length.toString(),             color: 'text-on-secondary-container' },
          { label: 'Total Viewers',  value: sessions.reduce((sum,s)=>sum+(s.watchers??0),0).toLocaleString(),        color: 'text-on-tertiary-container'  },
        ].map((s) => (
          <div key={s.label} className="bg-white p-5 rounded-xl shadow-[0_8px_20px_rgba(25,28,30,0.04)] text-center">
            <p className={cn('text-3xl font-black', s.color)}>{loading ? '…' : s.value}</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-[0_12px_32px_rgba(25,28,30,0.04)]">
        <div className="p-5 border-b border-surface-container flex items-center gap-2">
          {STATUS_TABS.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={cn(
              'px-5 py-2 rounded-xl text-sm font-bold transition-all capitalize',
              activeTab === tab ? 'bg-[#1a1a4e] text-white' : 'bg-surface-container-low text-slate-600 hover:bg-surface-container'
            )}>
              {tab === 'all' ? 'All Sessions' : tab === 'live' ? '🔴 Live' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
          <span className="ml-auto text-xs font-bold text-outline">{displayed.length} session{displayed.length !== 1 ? 's' : ''}</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48"><Loader2 className="w-6 h-6 animate-spin text-on-primary-container" /></div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-surface-container-low/50">
              <tr>{['Session Title', 'Teacher', 'Subject', 'Date', 'Duration', 'Status', ''].map((col) => (
                <th key={col} className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">{col}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayed.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-16 text-outline font-medium">No sessions in this category.</td></tr>
              ) : displayed.map((session) => {
                const s = statusStyle[session.status ?? 'upcoming'] || statusStyle.upcoming || statusStyle.scheduled
                const Icon = s.Icon
                return (
                  <tr key={session.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-5"><p className="font-bold text-[#1a1a4e] max-w-[240px] truncate">{session.title}</p></td>
                    <td className="px-6 py-5 text-sm text-slate-600 font-medium">{session.teacher}</td>
                    <td className="px-6 py-5"><span className="text-[10px] font-bold px-2 py-1 rounded bg-surface-container text-on-surface-variant">{session.subject}</span></td>
                    <td className="px-6 py-5 text-sm text-slate-600">
                      <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-slate-400" />{session.scheduled_at?.slice(0,10)}</span>
                      <span className="flex items-center gap-1.5 text-xs text-outline mt-0.5"><Clock className="w-3 h-3" />{session.scheduled_at ? new Date(session.scheduled_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}) : '—'}</span>
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-600">{session.duration_min}min</td>
                    <td className="px-6 py-5">
                      <span className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase', s.bg, s.text)}>
                        <Icon className="w-3 h-3" /> {s.label}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {session.status === 'live' ? (
                          <>
                            <Link href={`/admin/live-classes/${session.id}/monitor`} className="p-2 rounded-lg hover:bg-surface-container-low text-on-primary-container" title="Monitor">
                              <Eye className="w-4 h-4" />
                            </Link>
                            <button onClick={() => handleEndLive(session.id)} className="p-2 rounded-lg hover:bg-error/10 text-error" title="End Session & Publish">
                              <StopCircle className="w-4 h-4" />
                            </button>
                          </>
                        ) : session.status === 'upcoming' ? (
                          <>
                            <button onClick={() => handleStartLive(session.id)} className="p-2 rounded-lg hover:bg-surface-container-low text-on-surface-variant hover:text-[#c0622f]" title="Start Early / Go Live"><PlayCircle className="w-4 h-4" /></button>
                            <button onClick={() => openEditModal(session)} className="p-2 rounded-lg hover:bg-surface-container-low text-on-surface-variant hover:text-[#c0622f]" title="Edit Class Details"><Settings className="w-4 h-4" /></button>
                          </>
                        ) : (
                          <Link href={`/admin/live-classes/${session.id}/monitor`} className="flex items-center gap-1 text-xs font-bold text-on-primary-container hover:underline">
                            View Recap <ChevronRight className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-surface-container">
              <h3 className="font-headline font-bold text-xl text-[#1a1a4e]">Schedule Live Class</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-outline uppercase">Title</label>
                <input required value={createForm.title} onChange={e => setCreateForm(prev => ({...prev, title: e.target.value}))} className="w-full mt-1 px-4 py-2 border border-surface-container-high rounded-xl text-sm focus:ring-2 focus:ring-on-primary-container/20 focus:outline-none" placeholder="e.g. Kinematics Part 1" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-outline uppercase">Teacher Name</label>
                  <input required value={createForm.teacher} onChange={e => setCreateForm(prev => ({...prev, teacher: e.target.value}))} className="w-full mt-1 px-4 py-2 border border-surface-container-high rounded-xl text-sm focus:ring-2 focus:ring-on-primary-container/20 focus:outline-none" placeholder="Mr. Someone" />
                </div>
                <div>
                  <label className="text-xs font-bold text-outline uppercase">Subject</label>
                  <select value={createForm.subject} onChange={e => setCreateForm(prev => ({...prev, subject: e.target.value}))} className="w-full mt-1 px-4 py-2 border border-surface-container-high rounded-xl text-sm focus:ring-2 focus:ring-on-primary-container/20 focus:outline-none bg-white">
                    {['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English', 'General'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-outline uppercase">Date & Time</label>
                  <input type="datetime-local" required value={createForm.scheduled_at} onChange={e => setCreateForm(prev => ({...prev, scheduled_at: e.target.value}))} className="w-full mt-1 px-4 py-2 border border-surface-container-high rounded-xl text-sm focus:ring-2 focus:ring-on-primary-container/20 focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-outline uppercase">Duration (min)</label>
                  <input type="number" min={15} required value={createForm.duration_min} onChange={e => setCreateForm(prev => ({...prev, duration_min: parseInt(e.target.value) || 60}))} className="w-full mt-1 px-4 py-2 border border-surface-container-high rounded-xl text-sm focus:ring-2 focus:ring-on-primary-container/20 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-outline uppercase flex items-center gap-1.5"><Video className="w-3.5 h-3.5" /> Stream URL (YouTube)</label>
                <input value={createForm.stream_url} onChange={e => setCreateForm(prev => ({...prev, stream_url: e.target.value}))} className="w-full mt-1 px-4 py-2 border border-surface-container-high rounded-xl text-sm focus:ring-2 focus:ring-on-primary-container/20 focus:outline-none" placeholder="https://youtube.com/watch?v=..." />
              </div>
              <div>
                <label className="text-xs font-bold text-outline uppercase">Status</label>
                <select value={createForm.status} onChange={e => setCreateForm(prev => ({...prev, status: e.target.value}))} className="w-full mt-1 px-4 py-2 border border-surface-container-high rounded-xl text-sm focus:ring-2 focus:ring-on-primary-container/20 focus:outline-none bg-white">
                  <option value="scheduled">Scheduled (upcoming)</option>
                  <option value="live">Live Now</option>
                  <option value="completed">Completed (recording)</option>
                </select>
              </div>
              
              <div className="pt-4 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors">Cancel</button>
                <button type="submit" disabled={isCreating} className="px-6 py-2.5 bg-[#c0622f] text-white rounded-xl text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-all active:scale-95 shadow-lg shadow-[#c0622f]/20 flex items-center gap-2">
                  {isCreating ? <><Loader2 className="w-4 h-4 animate-spin" /> Scheduling…</> : 'Schedule Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-surface-container">
              <h3 className="font-headline font-bold text-xl text-[#1a1a4e]">Edit Live Class</h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleEdit} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-outline uppercase">Title</label>
                <input required value={editForm.title} onChange={e => setEditForm(prev => ({...prev, title: e.target.value}))} className="w-full mt-1 px-4 py-2 border border-surface-container-high rounded-xl text-sm focus:ring-2 focus:ring-on-primary-container/20 focus:outline-none" placeholder="e.g. Kinematics Part 1" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-outline uppercase">Teacher Name</label>
                  <input required value={editForm.teacher} onChange={e => setEditForm(prev => ({...prev, teacher: e.target.value}))} className="w-full mt-1 px-4 py-2 border border-surface-container-high rounded-xl text-sm focus:ring-2 focus:ring-on-primary-container/20 focus:outline-none" placeholder="Mr. Someone" />
                </div>
                <div>
                  <label className="text-xs font-bold text-outline uppercase">Subject</label>
                  <select value={editForm.subject} onChange={e => setEditForm(prev => ({...prev, subject: e.target.value}))} className="w-full mt-1 px-4 py-2 border border-surface-container-high rounded-xl text-sm focus:ring-2 focus:ring-on-primary-container/20 focus:outline-none bg-white">
                    {['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English', 'General'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-outline uppercase">Date & Time</label>
                  <input type="datetime-local" required value={editForm.scheduled_at} onChange={e => setEditForm(prev => ({...prev, scheduled_at: e.target.value}))} className="w-full mt-1 px-4 py-2 border border-surface-container-high rounded-xl text-sm focus:ring-2 focus:ring-on-primary-container/20 focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-outline uppercase">Duration (min)</label>
                  <input type="number" min={15} required value={editForm.duration_min} onChange={e => setEditForm(prev => ({...prev, duration_min: parseInt(e.target.value) || 60}))} className="w-full mt-1 px-4 py-2 border border-surface-container-high rounded-xl text-sm focus:ring-2 focus:ring-on-primary-container/20 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-outline uppercase flex items-center gap-1.5"><Video className="w-3.5 h-3.5" /> Stream URL (YouTube)</label>
                <input value={editForm.stream_url} onChange={e => setEditForm(prev => ({...prev, stream_url: e.target.value}))} className="w-full mt-1 px-4 py-2 border border-surface-container-high rounded-xl text-sm focus:ring-2 focus:ring-on-primary-container/20 focus:outline-none" placeholder="https://youtube.com/watch?v=..." />
              </div>
              
              <div className="pt-4 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors">Cancel</button>
                <button type="submit" disabled={isEditing} className="px-6 py-2.5 bg-[#c0622f] text-white rounded-xl text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-all active:scale-95 shadow-lg shadow-[#c0622f]/20 flex items-center gap-2">
                  {isEditing ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><Edit className="w-4 h-4" /> Save Changes</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
