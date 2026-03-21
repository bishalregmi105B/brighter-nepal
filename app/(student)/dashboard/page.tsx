'use client'
// Student Dashboard — fetches real data from dashboardService
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BookOpen, Bell, Flame, BarChart2, Loader2 } from 'lucide-react'
import { dashboardService, type DashboardData } from '@/services/dashboardService'
import { authService, type AuthUser } from '@/services/authService'
import { noticeService, type Notice } from '@/services/noticeService'
import { formatDate } from '@/lib/utils/formatDate'
import { cn } from '@/lib/utils/cn'

const today = new Date()

export default function StudentDashboardPage() {
  const [data,    setData]    = useState<DashboardData | null>(null)
  const [user,    setUser]    = useState<AuthUser | null>(null)
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      dashboardService.getDashboard().catch(() => ({ data: null })),
      authService.getMe().catch(() => null),
      noticeService.getNotices().catch(() => ({ data: [] })),
    ]).then(([dash, me, nots]) => {
      setData((dash as { data: DashboardData }).data)
      setUser(me as AuthUser | null)
      setNotices(((nots as { data: Notice[] }).data ?? []).slice(0, 3))
    }).finally(() => setLoading(false))
  }, [])

  const liveClass   = data?.live_class ?? null
  const liveActive  = liveClass?.status === 'live'
  const dailyHours  = data?.daily_hours ?? [
    { day: 'Mon', hours: 2.5 }, { day: 'Tue', hours: 4.0 }, { day: 'Wed', hours: 1.5 },
    { day: 'Thu', hours: 3.0 }, { day: 'Fri', hours: 5.0 }, { day: 'Sat', hours: 2.0 }, { day: 'Sun', hours: 3.5 },
  ]
  const maxHours    = Math.max(...dailyHours.map((d) => d.hours), 1)

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <Loader2 className="w-8 h-8 animate-spin text-on-primary-container" />
    </div>
  )

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      {/* Greeting Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-[#1a1a4e] px-8 md:px-12 py-10 mb-10 text-white">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] right-[-5%] w-64 h-64 rounded-full bg-on-primary-container opacity-15 blur-3xl" />
          <div className="absolute bottom-[-20%] left-[10%] w-48 h-48 rounded-full bg-[#2d6a6a] opacity-20 blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-slate-400 text-sm font-semibold mb-1">{formatDate(today, 'EEEE, MMMM d, yyyy')}</p>
            <h1 className="font-headline font-black text-3xl md:text-4xl mb-2">
              Good morning, {user?.name?.split(' ')[0] ?? 'Scholar'}! 👋
            </h1>
            <p className="text-slate-300 text-base max-w-xl">
              Welcome back to BridgeCourse Nepal — keep preparing for your IOE/IOM entrance!
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="flex items-center gap-1.5 justify-center text-on-primary-container mb-1">
                <Flame className="w-5 h-5" />
                <span className="font-headline font-black text-2xl">{data?.tests_appeared ?? 0}</span>
              </div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Tests Done</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

        {/* Live Class Card */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-[0_8px_20px_rgba(25,28,30,0.04)] overflow-hidden">
          <div className={cn(
            'relative h-48 flex items-center justify-center',
            liveActive ? 'bg-[#1a1a4e]' : 'bg-gradient-to-br from-slate-200 to-slate-300'
          )}>
            {liveActive ? (
              <>
                <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a4e]/60 to-[#2d6a6a]/40" />
                <div className="relative z-10 w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 cursor-pointer hover:bg-on-primary-container transition-colors">
                  <svg className="w-7 h-7 text-white fill-white" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                </div>
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-white text-[10px] font-black tracking-widest uppercase">LIVE</span>
                  <span className="text-white/80 text-[10px] font-medium">• {liveClass?.watchers?.toLocaleString()} Watching</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 text-slate-500 opacity-60">
                <BookOpen className="w-16 h-16 text-slate-400" />
                <p className="text-sm font-bold">No live session right now</p>
              </div>
            )}
          </div>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-on-primary-container" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {liveClass?.subject ?? 'Mathematics'} • BridgeCourse Nepal
              </span>
            </div>
            <h3 className="font-headline font-bold text-xl text-[#1a1a4e] mb-1">
              {liveClass?.title ?? 'No upcoming class scheduled'}
            </h3>
            <p className="text-slate-500 text-sm mb-5">{liveClass?.teacher ?? '—'}</p>

            {liveActive ? (
              <Link
                href={`/live-classes/${liveClass?.id}`}
                className="w-full block bg-[#c0622f] text-white font-black text-base py-4 rounded-xl text-center hover:bg-[#a14f24] active:scale-95 transition-all shadow-lg shadow-[#c0622f]/20"
              >
                Join Now →
              </Link>
            ) : (
              <button disabled className="w-full block bg-slate-200 text-slate-500 font-black text-base py-4 rounded-xl text-center cursor-not-allowed">
                Class Not Started Yet
              </button>
            )}
          </div>
        </div>

        {/* Performance Widget (static) */}
        <div className="bg-white rounded-2xl shadow-[0_8px_20px_rgba(25,28,30,0.04)] p-6">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">Your Performance</p>
          <div className="space-y-4">
            {[
              { label: 'Physics',     score: 72, color: 'bg-[#1a1a4e]'           },
              { label: 'Chemistry',   score: 88, color: 'bg-[#2d6a6a]'           },
              { label: 'Mathematics', score: 75, color: 'bg-on-primary-container' },
            ].map((s) => (
              <div key={s.label}>
                <div className="flex justify-between mb-1">
                  <span className="text-xs font-bold text-on-surface-variant">{s.label}</span>
                  <span className="text-xs font-bold text-[#1a1a4e]">{s.score}%</span>
                </div>
                <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                  <div className={`h-full ${s.color} rounded-full`} style={{ width: `${s.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Notices */}
        <div className="bg-white rounded-2xl shadow-[0_8px_20px_rgba(25,28,30,0.04)] p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-headline font-bold text-lg text-[#1a1a4e]">Latest Notices</h3>
            <Link href="/notices" className="text-on-primary-container text-xs font-bold hover:underline">View All</Link>
          </div>
          <div className="space-y-4">
            {notices.length > 0 ? notices.map((notice) => (
              <div key={notice.id} className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${notice.category === 'urgent' ? 'bg-red-500' : notice.category === 'important' ? 'bg-[#c0622f]' : 'bg-slate-300'}`} />
                <div className="flex-1">
                  <p className="text-sm font-bold text-[#1a1a4e] leading-snug">{notice.title}</p>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{notice.category}</p>
                </div>
              </div>
            )) : (
              <p className="text-sm text-slate-400 font-medium">No recent notices.</p>
            )}
          </div>
        </div>

        {/* Weekly Tests Stat */}
        <div className="bg-white rounded-2xl shadow-[0_8px_20px_rgba(25,28,30,0.04)] p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Weekly Tests</p>
            <Bell className="w-4 h-4 text-outline" />
          </div>
          <div>
            <p className="font-headline font-black text-5xl text-[#1a1a4e] leading-none">{data?.tests_appeared ?? 0}</p>
            <p className="text-slate-400 text-sm font-semibold mt-1">Tests appeared to date</p>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 bg-surface-container rounded-xl p-3 text-center">
              <p className="font-black text-lg text-on-primary-container">78.4%</p>
              <p className="text-[10px] text-outline uppercase font-bold">Avg Score</p>
            </div>
            <div className="flex-1 bg-surface-container rounded-xl p-3 text-center">
              <p className="font-black text-lg text-[#2d6a6a]">{data?.homework_attempted ?? 0}</p>
              <p className="text-[10px] text-outline uppercase font-bold">Homework Done</p>
            </div>
          </div>
        </div>

        {/* Daily Study Hours Graph */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-[0_8px_20px_rgba(25,28,30,0.04)] p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-on-surface text-base">Daily Study Hours</h3>
              <p className="text-xs text-outline font-medium">Last 7 days on platform</p>
            </div>
            <BarChart2 className="w-5 h-5 text-outline" />
          </div>
          <div className="flex items-end gap-3 h-28">
            {dailyHours.map((d) => {
              const pct = (d.hours / maxHours) * 100
              return (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5 group">
                  <span className="text-[10px] font-bold text-outline opacity-0 group-hover:opacity-100 transition-opacity">{d.hours}h</span>
                  <div className="w-full relative" style={{ height: '80px' }}>
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#c0622f] to-[#c0622f]/50 rounded-t-lg transition-all duration-700 group-hover:from-[#1a1a4e] group-hover:to-[#1a1a4e]/50"
                      style={{ height: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">{d.day}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
