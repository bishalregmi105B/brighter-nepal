'use client'
// Student Weekly Tests — real API via weeklyTestService
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Users, TrendingUp, BarChart2, ChevronRight, Loader2, Zap, CheckCircle2, Clock } from 'lucide-react'
import { weeklyTestService, type WeeklyTest } from '@/services/weeklyTestService'
import { cn } from '@/lib/utils/cn'

const chartBars = [12, 20, 24, 16, 32, 28]

export default function WeeklyTestsPage() {
  const [tests,   setTests]   = useState<WeeklyTest[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    weeklyTestService.getTests().then((res) => {
      setTests(res.data?.items ?? [])
    }).catch((e) => setError(e.message)).finally(() => setLoading(false))
  }, [])

  const liveTest      = tests.find((t) => t.status === 'live')
  const scheduledTests = tests.filter((t) => t.status === 'scheduled')
  const pastTests     = tests.filter((t) => t.status === 'completed')

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-on-primary-container" /></div>
  if (error)   return <div className="p-10 text-center text-red-500 font-medium">{error}</div>

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-12">

      {/* ── Live Test Banner ─────────────────────────────────── */}
      {liveTest ? (
        <section className="relative overflow-hidden rounded-3xl bg-on-secondary-fixed text-white p-8 md:p-12 shadow-2xl flex flex-col md:flex-row items-center gap-10">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-on-primary-container/20 to-transparent pointer-events-none" />
          <div className="relative z-10 flex-1 space-y-6">
            <div className="inline-flex items-center gap-2 bg-on-primary-container px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" /> LIVE Now
            </div>
            <h1 className="text-4xl md:text-5xl font-headline font-extrabold tracking-tighter leading-tight">
              {liveTest.title}
            </h1>
            <p className="text-lg opacity-80 font-medium">
              {liveTest.duration_min} mins · {liveTest.question_count} questions · {liveTest.subject}
            </p>
            {liveTest.forms_url ? (
              <a
                href={liveTest.forms_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-on-primary-container text-white px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-lg shadow-on-primary-container/20"
              >
                Start Test Now →
              </a>
            ) : (
              <div className="inline-flex items-center gap-3 bg-white/10 border border-white/20 px-6 py-3.5 rounded-xl text-white font-bold">
                <Clock className="w-5 h-5 opacity-60" /> Test Not Started
              </div>
            )}
          </div>
        </section>
      ) : scheduledTests.length > 0 ? (
        <section className="relative overflow-hidden rounded-3xl bg-on-secondary-fixed text-white p-8 md:p-12 shadow-2xl">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
            <Clock className="w-3.5 h-3.5" /> Test Not Started Yet
          </div>
          <h1 className="text-4xl font-headline font-extrabold mb-4">{scheduledTests[0].title}</h1>
          <p className="text-lg opacity-80 mb-6">{scheduledTests[0].duration_min} mins · {scheduledTests[0].subject}</p>
          <div className="inline-flex items-center gap-3 bg-white/10 border border-white/20 px-6 py-3.5 rounded-xl text-white font-bold">
            <Clock className="w-5 h-5 opacity-60" /> Waiting for test to go live...
          </div>
        </section>
      ) : null}


      {/* ── Upcoming Tests ────────────────────────────────────── */}
      {scheduledTests.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-xl font-headline font-bold text-[#1a1a4e]">Upcoming Tests</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scheduledTests.map((test) => (
              <div key={test.id} className="bg-white p-6 rounded-2xl border border-outline-variant/10 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center text-on-primary-container flex-shrink-0">
                  <Zap className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#1a1a4e] truncate">{test.title}</p>
                  <p className="text-xs text-slate-500">{test.subject} · {test.duration_min} mins</p>
                </div>
                <Link href={`/weekly-tests/${test.id}`} className="flex-shrink-0 text-on-primary-container font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                  Details <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Assessment History ────────────────────────────────── */}
      {pastTests.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-end justify-between border-b border-surface-container-highest pb-4">
            <h3 className="text-3xl font-headline font-extrabold text-[#1a1a4e]">Assessment History</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastTests.map((test) => (
              <div key={test.id} className="bg-white p-6 rounded-2xl shadow-sm border border-transparent hover:border-surface-container-highest transition-all">
                <div className="flex items-center gap-1.5 mb-3">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-[10px] font-bold text-green-600 uppercase">Completed</span>
                  <span className="text-[10px] text-slate-400 ml-auto">{test.subject}</span>
                </div>
                <h5 className="font-headline font-bold text-on-surface mb-4 leading-snug">{test.title}</h5>
                <div className="flex items-center justify-between border-t border-surface-container-low pt-4">
                  <div className="h-8 flex items-end gap-1">
                    {chartBars.map((h, i) => (
                      <div key={i} className={cn('w-2 rounded-full', i >= 3 ? 'bg-on-tertiary-container' : 'bg-surface-container-high')} style={{ height: `${h}px` }} />
                    ))}
                  </div>
                  <Link href={`/weekly-tests/${test.id}`} className="text-on-secondary-fixed font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                    Review <BarChart2 className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Support CTA ──────────────────────────────────────── */}
      <section className="bg-surface-container rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 border border-white">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-inner flex-shrink-0">
            <TrendingUp className="w-8 h-8 text-on-primary-container" />
          </div>
          <div>
            <h4 className="text-xl font-headline font-bold text-on-surface">Technical issues during a test?</h4>
            <p className="text-sm text-outline font-medium">BridgeCourse support team is available during all live exams.</p>
          </div>
        </div>
        <button className="bg-on-secondary-fixed text-white px-10 py-3 rounded-xl font-bold hover:bg-secondary transition-all flex-shrink-0">
          Support Desk
        </button>
      </section>
    </div>
  )
}
