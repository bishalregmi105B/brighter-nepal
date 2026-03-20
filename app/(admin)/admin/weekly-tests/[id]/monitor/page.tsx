'use client'
// Admin Weekly Test Monitor — live test dashboard with real-time participant tracking
import { useState } from 'react'
import { ArrowLeft, Users, Clock, CheckCircle2, AlertCircle, BarChart2, StopCircle, Eye } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'

interface Participant {
  id:       string
  name:     string
  initials: string
  progress: number   // % questions answered
  score?:   number
  status:   'active' | 'submitted' | 'suspicious'
}

const participants: Participant[] = [
  { id: 'p1', name: 'Prabin Karki',   initials: 'PK', progress: 75,  status: 'active'     },
  { id: 'p2', name: 'Anjali Rai',     initials: 'AR', progress: 100, score: 38, status: 'submitted'  },
  { id: 'p3', name: 'Suresh Mahat',   initials: 'SM', progress: 50,  status: 'suspicious'  },
  { id: 'p4', name: 'Smriti Gurung',  initials: 'SG', progress: 100, score: 34, status: 'submitted'  },
  { id: 'p5', name: 'Aaryan Sharma',  initials: 'AS', progress: 30,  status: 'active'     },
  { id: 'p6', name: 'Kripa Shrestha', initials: 'KS', progress: 90,  status: 'active'     },
]

const statusStyle: Record<Participant['status'], { bg: string; text: string; label: string }> = {
  active:     { bg: 'bg-tertiary-fixed',  text: 'text-on-tertiary-fixed-variant', label: 'Active'     },
  submitted:  { bg: 'bg-primary-fixed',   text: 'text-on-primary-fixed-variant',  label: 'Submitted'  },
  suspicious: { bg: 'bg-error-container', text: 'text-error',                    label: 'Suspicious' },
}

export default function WeeklyTestMonitorPage() {
  const [filter, setFilter] = useState<'all' | 'active' | 'submitted' | 'suspicious'>('all')

  const displayed = filter === 'all' ? participants : participants.filter((p) => p.status === filter)
  const submitted  = participants.filter((p) => p.status === 'submitted').length
  const suspicious = participants.filter((p) => p.status === 'suspicious').length

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">

      {/* Header */}
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
          <p className="text-slate-500 font-medium">Advanced Mathematics: Calculus II · Weekly Test</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/weekly-tests" className="flex items-center gap-2 px-5 py-2.5 bg-surface-container text-[#1a1a4e] font-bold text-sm rounded-xl hover:bg-surface-container-high transition-colors">
            <BarChart2 className="w-4 h-4" /> Analytics
          </Link>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-error/10 text-error font-bold text-sm rounded-xl hover:bg-error/20 transition-colors active:scale-95">
            <StopCircle className="w-4 h-4" /> End Test
          </button>
        </div>
      </div>

      {/* Countdown + Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {[
          { Icon: Clock,        label: 'Time Remaining',  value: '38:42',                       color: 'text-on-primary-container' },
          { Icon: Users,        label: 'Participants',     value: `${participants.length}`,       color: 'text-[#1a1a4e]'            },
          { Icon: CheckCircle2, label: 'Submitted',        value: `${submitted}`,                 color: 'text-on-tertiary-container' },
          { Icon: AlertCircle,  label: 'Suspicious',       value: `${suspicious}`,                color: 'text-error'                },
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

      {/* Participant table */}
      <div className="bg-white rounded-2xl shadow-[0_12px_32px_rgba(25,28,30,0.04)] overflow-hidden">
        {/* Filter tabs */}
        <div className="p-5 border-b border-surface-container flex items-center gap-2">
          {(['all', 'active', 'submitted', 'suspicious'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-bold transition-all capitalize',
                filter === f ? 'bg-[#1a1a4e] text-white' : 'bg-surface-container-low text-slate-600 hover:bg-surface-container'
              )}
            >
              {f === 'all' ? 'All Students' : f}
            </button>
          ))}
          <span className="ml-auto text-xs font-bold text-outline">{displayed.length} student{displayed.length !== 1 ? 's' : ''}</span>
        </div>

        <table className="w-full text-left">
          <thead className="bg-surface-container-low/50">
            <tr>
              {['Student', 'Progress', 'Answered', 'Score', 'Status', ''].map((col) => (
                <th key={col} className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {displayed.map((p) => {
              const { bg, text, label } = statusStyle[p.status]
              return (
                <tr key={p.id} className={cn('hover:bg-slate-50 transition-colors', p.status === 'suspicious' && 'bg-error-container/10')}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-on-primary-container flex items-center justify-center text-white text-xs font-bold">{p.initials}</div>
                      <p className="font-bold text-on-surface">{p.name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-32 h-2 rounded-full bg-surface-container overflow-hidden">
                      <div className={cn('h-full rounded-full', p.status === 'suspicious' ? 'bg-error' : 'bg-on-primary-container')} style={{ width: `${p.progress}%` }} />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-on-surface">{Math.round(p.progress * 0.4)}/40</td>
                  <td className="px-6 py-4 text-sm font-bold text-on-surface">
                    {p.score !== undefined ? `${p.score}/40` : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn('inline-flex px-2.5 py-1 rounded-full text-[10px] font-black uppercase', bg, text)}>{label}</span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="p-2 rounded-lg hover:bg-surface-container-low text-on-surface-variant hover:text-on-primary-container transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
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
