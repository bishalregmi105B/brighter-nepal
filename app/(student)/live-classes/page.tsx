'use client'
// Student Live Classes — fetches real data from liveClassService
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Video, Clock, Users, Play, CalendarDays, Lock, BarChart2, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { liveClassService, type LiveClass } from '@/services/liveClassService'
import { cn } from '@/lib/utils/cn'

const subjectColors: Record<string, string> = {
  Mathematics: 'bg-primary-fixed text-on-primary-fixed-variant',
  Physics:     'bg-tertiary-fixed text-on-tertiary-fixed-variant',
  Chemistry:   'bg-secondary-fixed text-on-secondary-fixed-variant',
  Biology:     'bg-surface-container-high text-on-surface-variant',
}

const weeklyChart = [
  { week: 'Wk 1', joined: 4, missed: 1 },
  { week: 'Wk 2', joined: 3, missed: 2 },
  { week: 'Wk 3', joined: 5, missed: 0 },
  { week: 'Wk 4', joined: 2, missed: 3 },
  { week: 'Wk 5', joined: 4, missed: 1 },
]
const maxWeekTotal = Math.max(...weeklyChart.map((w) => w.joined + w.missed))

export default function LiveClassesPage() {
  const [classes,       setClasses]       = useState<LiveClass[]>([])
  const [loading,       setLoading]       = useState(true)
  const [historyFilter, setHistoryFilter] = useState<'all' | 'joined' | 'missed'>('all')

  useEffect(() => {
    liveClassService.getLiveClasses().then((res) => {
      setClasses(res.data?.items ?? [])
    }).finally(() => setLoading(false))
  }, [])

  const current   = classes.filter((c) => c.status === 'live' || c.status === 'upcoming' || c.status === 'locked')
  const completed = classes.filter((c) => c.status === 'completed')
  const liveCount = classes.filter((c) => c.status === 'live').length

  // Build "history" from completed classes — alternate joined/missed for demo
  const history = completed.map((c, i) => ({
    id:       c.id,
    title:    c.title,
    subject:  c.subject,
    date:     c.scheduled_at?.slice(0, 10) ?? '—',
    status:   (i % 3 === 1 ? 'missed' : 'joined') as 'joined' | 'missed',
    duration: `${c.duration_min}m`,
  }))

  const filteredHistory = history.filter((h) => historyFilter === 'all' || h.status === historyFilter)

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-on-primary-container" /></div>

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10">

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-on-primary-container font-bold text-sm tracking-widest uppercase mb-2 block">BridgeCourse Nepal</span>
          <h1 className="font-headline text-4xl md:text-5xl font-extrabold text-[#1a1a4e] leading-tight">Live Classes</h1>
          <p className="text-slate-500 mt-2 max-w-xl">Join expert-led IOE/IOM/CSIT sessions in real time.</p>
        </div>
        {liveCount > 0 && (
          <div className="flex items-center gap-3 bg-white p-3 rounded-xl shadow-sm border border-outline-variant/10">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-sm font-bold text-[#1a1a4e]">{liveCount} Live Now</span>
            <span className="text-xs text-slate-400 font-medium">{classes.find(c=>c.status==='live')?.watchers?.toLocaleString()} watching</span>
          </div>
        )}
      </div>

      {/* Today's Sessions */}
      <section className="space-y-4">
        <h2 className="text-xl font-headline font-bold text-[#1a1a4e] flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-on-primary-container" /> Today&apos;s Sessions
        </h2>
        {current.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl text-slate-400 font-medium">No sessions scheduled today.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {current.map((cls) => (
              <div key={cls.id} className={cn(
                'bg-white rounded-2xl overflow-hidden shadow-[0_8px_20px_rgba(25,28,30,0.04)] flex flex-col transition-all duration-300',
                cls.status === 'live' ? 'ring-2 ring-on-primary-container/30' : 'hover:shadow-xl'
              )}>
                <div className={cn('h-32 relative flex items-center justify-center',
                  cls.status === 'live' ? 'bg-[#1a1a4e]' : cls.status === 'locked' ? 'bg-surface-container-high' : 'bg-gradient-to-br from-[#1a1a4e]/80 to-[#2d6a6a]/60'
                )}>
                  {cls.status === 'live' && (
                    <>
                      <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                        <Play className="w-7 h-7 text-white fill-white" />
                      </div>
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-500/90 px-2.5 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        <span className="text-white text-[10px] font-black tracking-widest">LIVE</span>
                      </div>
                      {(cls.watchers ?? 0) > 0 && (
                        <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/50 px-2 py-1 rounded-full">
                          <Users className="w-3 h-3 text-white" />
                          <span className="text-white text-[10px] font-medium">{((cls.watchers ?? 0) / 1000).toFixed(1)}k</span>
                        </div>
                      )}
                    </>
                  )}
                  {cls.status === 'locked' && <Lock className="w-10 h-10 text-slate-400" />}
                  {cls.status === 'upcoming' && <Video className="w-10 h-10 text-white/40" />}
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded inline-block w-fit mb-3', subjectColors[cls.subject] ?? 'bg-surface-container text-on-surface')}>
                    {cls.subject}
                  </span>
                  <h3 className="font-headline font-bold text-[#1a1a4e] leading-snug mb-1">{cls.title}</h3>
                  <p className="text-xs text-slate-500 mb-4">{cls.teacher}</p>
                  <div className="mt-auto flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-outline">
                      <Clock className="w-3.5 h-3.5" />
                      {cls.status === 'live' ? 'Live Now' : cls.scheduled_at ? new Date(cls.scheduled_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '—'}
                    </span>
                    {cls.status === 'live' ? (
                      <Link href={`/live-classes/${cls.id}`} className="bg-[#c0622f] text-white text-sm font-bold px-5 py-2 rounded-xl hover:bg-[#a14f24] active:scale-95 transition-all">
                        Join Now
                      </Link>
                    ) : cls.status === 'upcoming' ? (
                      <button className="text-on-primary-container text-sm font-bold border border-on-primary-container/20 px-5 py-2 rounded-xl hover:bg-on-primary-container/5 transition-colors">
                        Set Reminder
                      </button>
                    ) : (
                      <button className="text-slate-400 text-sm font-bold px-5 py-2 rounded-xl border border-slate-200/50 cursor-not-allowed opacity-60">Locked</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Attendance History + Chart */}
      {completed.length > 0 && (
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 bg-white rounded-2xl shadow-[0_8px_20px_rgba(25,28,30,0.04)] overflow-hidden">
            <div className="p-5 border-b border-surface-container flex items-center justify-between">
              <h3 className="font-bold text-on-surface">Class History</h3>
              <div className="flex gap-2">
                {(['all', 'joined', 'missed'] as const).map((f) => (
                  <button key={f} onClick={() => setHistoryFilter(f)} className={cn(
                    'px-3 py-1 text-xs font-bold rounded-lg transition-colors capitalize',
                    historyFilter === f ? 'bg-[#1a1a4e] text-white' : 'bg-surface-container text-slate-500 hover:bg-surface-container-high'
                  )}>{f}</button>
                ))}
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {filteredHistory.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors">
                  <div className={cn('w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0', item.status === 'joined' ? 'bg-green-100' : 'bg-red-100')}>
                    {item.status === 'joined' ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-red-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#1a1a4e] truncate">{item.title}</p>
                    <p className="text-xs text-slate-400">{item.subject} · {item.date} · {item.duration}</p>
                  </div>
                  <Link href="/recorded-lectures" className="flex-shrink-0 flex items-center gap-1.5 text-xs font-bold text-on-primary-container bg-on-primary-container/10 px-3 py-1.5 rounded-lg hover:bg-on-primary-container/20 transition-colors">
                    <Play className="w-3 h-3 fill-current" /> Watch Recorded
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-[0_8px_20px_rgba(25,28,30,0.04)] p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-on-surface text-sm">Weekly Attendance</h3>
                <p className="text-xs text-outline font-medium">Joined vs Missed</p>
              </div>
              <BarChart2 className="w-4 h-4 text-outline" />
            </div>
            <div className="flex items-end gap-3 h-36">
              {weeklyChart.map((w) => {
                const totalH = 120
                const joinH = Math.round((w.joined / maxWeekTotal) * totalH)
                const missH = Math.round((w.missed / maxWeekTotal) * totalH)
                return (
                  <div key={w.week} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex flex-col justify-end" style={{ height: `${totalH}px` }}>
                      <div className="w-full bg-red-400/70 rounded-t" style={{ height: `${missH}px` }} />
                      <div className="w-full bg-[#2d6a6a] rounded-t" style={{ height: `${joinH}px` }} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">{w.week}</span>
                  </div>
                )
              })}
            </div>
            <div className="flex items-center justify-center gap-4 mt-4">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-[#2d6a6a]" /><span className="text-[10px] text-outline font-bold">Joined</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-red-400/70" /><span className="text-[10px] text-outline font-bold">Missed</span></div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
