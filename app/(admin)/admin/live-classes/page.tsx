'use client'
// Admin Live Classes — fetches real data from liveClassService
import { useEffect, useState } from 'react'
import { Plus, Video, RadioTower, Calendar, Clock, Users, Eye, Settings, StopCircle, PlayCircle, ChevronRight, Loader2 } from 'lucide-react'
import Link from 'next/link'
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

  useEffect(() => {
    liveClassService.getLiveClasses().then((res) => setSessions(res.data?.items ?? [])).finally(() => setLoading(false))
  }, [])

  const displayed  = activeTab === 'all' ? sessions : sessions.filter(s => s.status === activeTab)
  const liveNow    = sessions.find(s => s.status === 'live')

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-extrabold text-[#1a1a4e] tracking-tight font-headline mb-1">Live Classes</h2>
          <p className="text-slate-500 font-medium">BridgeCourse Nepal — schedule, broadcast, and monitor IOE/IOM/CSIT sessions.</p>
        </div>
        <button className="bg-[#c0622f] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-[#c0622f]/20 self-start md:self-auto">
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
            <button className="bg-error/20 text-error px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-error/30 transition-colors">
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
                          <Link href={`/admin/live-classes/${session.id}/monitor`} className="p-2 rounded-lg hover:bg-surface-container-low text-on-primary-container" title="Monitor">
                            <Eye className="w-4 h-4" />
                          </Link>
                        ) : session.status === 'upcoming' ? (
                          <>
                            <button className="p-2 rounded-lg hover:bg-surface-container-low text-on-surface-variant hover:text-[#c0622f]" title="Start Early"><PlayCircle className="w-4 h-4" /></button>
                            <button className="p-2 rounded-lg hover:bg-surface-container-low text-on-surface-variant hover:text-[#c0622f]" title="Edit"><Settings className="w-4 h-4" /></button>
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
    </div>
  )
}
