'use client'
// Admin Weekly Test Monitor — loads real participants from weeklyTestService
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, Users, Clock, CheckCircle2, AlertCircle, BarChart2, StopCircle, Eye, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { weeklyTestService, type WeeklyTest, type WeeklyTestAttempt } from '@/services/weeklyTestService'
import { cn } from '@/lib/utils/cn'

type ParticipantStatus = 'active' | 'submitted' | 'suspicious'

const statusStyle: Record<ParticipantStatus, { bg: string; text: string; label: string }> = {
  active:     { bg: 'bg-tertiary-fixed',  text: 'text-on-tertiary-fixed-variant', label: 'Active'     },
  submitted:  { bg: 'bg-primary-fixed',   text: 'text-on-primary-fixed-variant',  label: 'Submitted'  },
  suspicious: { bg: 'bg-error-container', text: 'text-error',                     label: 'Suspicious' },
}

export default function WeeklyTestMonitorPage() {
  const params = useParams<{ id: string }>()
  const [test,    setTest]    = useState<WeeklyTest | null>(null)
  const [participants, setParticipants] = useState<WeeklyTestAttempt[]>([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState<'all' | ParticipantStatus>('all')

  useEffect(() => {
    if (!params.id) return
    Promise.all([
      weeklyTestService.getTest(params.id),
      weeklyTestService.getParticipants(Number(params.id)),
    ]).then(([testRes, partRes]) => {
      setTest(testRes.data)
      setParticipants(partRes.data ?? [])
    }).finally(() => setLoading(false))
  }, [params.id])

  const submitted  = participants.length
  const suspicious = 0

  const displayed = filter === 'all' ? participants : participants

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-on-primary-container" /></div>

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center gap-4 mb-2">
        <Link href="/admin/weekly-tests" className="p-2 rounded-xl hover:bg-surface-container text-on-surface-variant transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h2 className="font-headline font-black text-3xl text-[#1a1a4e]">Live Monitor</h2>
            <span className="flex items-center gap-1.5 bg-error/90 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span className="text-white text-[10px] font-black tracking-widest uppercase">Live</span>
            </span>
          </div>
          <p className="text-slate-500 font-medium">{test?.title ?? '—'} · Weekly Test</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/admin/weekly-tests`} className="flex items-center gap-2 px-5 py-2.5 bg-surface-container text-[#1a1a4e] font-bold text-sm rounded-xl hover:bg-surface-container-high transition-colors">
            <BarChart2 className="w-4 h-4" /> Analytics
          </Link>
          <button onClick={() => weeklyTestService.updateTest(Number(params.id), { status: 'completed' })}
            className="flex items-center gap-2 px-5 py-2.5 bg-error/10 text-error font-bold text-sm rounded-xl hover:bg-error/20 transition-colors active:scale-95">
            <StopCircle className="w-4 h-4" /> End Test
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {[
          { Icon: Clock,        label: 'Duration',      value: `${test?.duration_min ?? '—'} min`, color: 'text-on-primary-container' },
          { Icon: Users,        label: 'Participants',   value: `${participants.length}`,           color: 'text-[#1a1a4e]'            },
          { Icon: CheckCircle2, label: 'Submitted',      value: `${submitted}`,                     color: 'text-on-tertiary-container' },
          { Icon: AlertCircle,  label: 'Suspicious',     value: `${suspicious}`,                    color: 'text-error'                },
        ].map(({ Icon, label, value, color }) => (
          <div key={label} className="bg-white rounded-xl p-5 shadow-[0_8px_20px_rgba(25,28,30,0.04)] flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center flex-shrink-0">
              <Icon className={cn('w-5 h-5', color)} />
            </div>
            <div>
              <p className={cn('text-2xl font-black font-headline', color)}>{value}</p>
              <p className="text-xs font-bold text-outline uppercase tracking-wider">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-[0_12px_32px_rgba(25,28,30,0.04)] overflow-hidden">
        <div className="p-5 border-b border-surface-container flex items-center gap-2">
          {(['all', 'active', 'submitted', 'suspicious'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={cn(
              'px-4 py-2 rounded-xl text-xs font-bold transition-all capitalize',
              filter === f ? 'bg-[#1a1a4e] text-white' : 'bg-surface-container-low text-slate-600 hover:bg-surface-container'
            )}>
              {f === 'all' ? 'All Students' : f}
            </button>
          ))}
          <span className="ml-auto text-xs font-bold text-outline">{displayed.length} student{displayed.length !== 1 ? 's' : ''}</span>
        </div>
        <table className="w-full text-left">
          <thead className="bg-surface-container-low/50">
            <tr>{['Student', 'Score', 'Submitted At', 'Status', ''].map((col) => (
              <th key={col} className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">{col}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {displayed.length === 0 ? (
              <tr><td colSpan={5} className="py-16 text-center text-outline font-medium">No participants yet.</td></tr>
            ) : displayed.map((p) => {
              const style = statusStyle['submitted']
              return (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-on-primary-container flex items-center justify-center text-white text-xs font-bold">U</div>
                      <p className="font-bold text-on-surface">User #{p.user_id}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-on-surface">{p.score}/{p.total}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{p.submitted_at?.slice(0,16).replace('T',' ')}</td>
                  <td className="px-6 py-4">
                    <span className={cn('inline-flex px-2.5 py-1 rounded-full text-[10px] font-black uppercase', style.bg, style.text)}>{style.label}</span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="p-2 rounded-lg hover:bg-surface-container-low text-on-surface-variant hover:text-on-primary-container transition-colors"><Eye className="w-4 h-4" /></button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
