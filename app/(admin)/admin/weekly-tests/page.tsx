'use client'
// Admin Weekly Tests — fetches real data from weeklyTestService
import { useEffect, useState } from 'react'
import { Plus, Calendar, Users, Clock, Eye, BarChart2, RadioTower, CheckCircle2, Circle, Loader2, Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { weeklyTestService, type WeeklyTest } from '@/services/weeklyTestService'
import { cn } from '@/lib/utils/cn'

type TestStatus = 'live' | 'upcoming' | 'completed' | 'draft'

const statusStyle: Record<string, { label: string; bg: string; text: string; Icon: React.ElementType }> = {
  live:      { label: 'Live Now',   bg: 'bg-error-container', text: 'text-error',                      Icon: RadioTower   },
  scheduled: { label: 'Scheduled',  bg: 'bg-secondary-fixed', text: 'text-on-secondary-fixed-variant',  Icon: Calendar     },
  completed: { label: 'Completed',  bg: 'bg-tertiary-fixed',  text: 'text-on-tertiary-fixed-variant',   Icon: CheckCircle2 },
  draft:     { label: 'Draft',      bg: 'bg-primary-fixed',   text: 'text-on-primary-fixed-variant',    Icon: Circle       },
  upcoming:  { label: 'Upcoming',   bg: 'bg-secondary-fixed', text: 'text-on-secondary-fixed-variant',  Icon: Calendar     },
}

export default function AdminWeeklyTestsPage() {
  const [tests,   setTests]   = useState<WeeklyTest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    weeklyTestService.getTests().then((res) => setTests(res.data?.items ?? [])).finally(() => setLoading(false))
  }, [])

  const liveTests = tests.filter(t => t.status === 'live')

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-extrabold text-[#1a1a4e] tracking-tight font-headline mb-1">Weekly Tests</h2>
          <p className="text-slate-500 font-medium">Brighter Nepal — schedule, monitor, and evaluate SEE preparation tests.</p>
        </div>
        <Link href="/admin/weekly-tests/create" className="bg-[#c0622f] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-[#c0622f]/20">
          <Plus className="w-5 h-5" /> Create Test
        </Link>
      </div>

      {/* Live banner */}
      {liveTests.map((test) => (
        <div key={test.id} className="bg-[#1a1a4e] rounded-2xl p-6 flex items-center justify-between gap-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-error/20 flex items-center justify-center flex-shrink-0"><RadioTower className="w-6 h-6 text-error" /></div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-error animate-pulse" />
                <span className="font-black text-lg">{test.title}</span>
              </div>
              <p className="text-white/60 text-sm">{test.duration_min}min session</p>
            </div>
          </div>
          <Link href={`/admin/weekly-tests/${test.id}/monitor`} className="bg-on-primary-container text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 flex-shrink-0 hover:shadow-lg transition-all">
            <Eye className="w-4 h-4" /> Monitor Live
          </Link>
        </div>
      ))}

      {/* Tests table */}
      {loading ? (
        <div className="flex items-center justify-center h-48"><Loader2 className="w-6 h-6 animate-spin text-on-primary-container" /></div>
      ) : (
        <div className="bg-white rounded-2xl overflow-hidden shadow-[0_12px_32px_rgba(25,28,30,0.04)]">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low/60">
              <tr>
                {['Test Title', 'Subject', 'Duration', 'Status', 'Actions'].map((col) => (
                  <th key={col} className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tests.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-16 text-outline font-medium">No weekly tests found.</td></tr>
              ) : tests.map((test) => {
                const style = statusStyle[test.status ?? 'draft'] || statusStyle.draft
                const Icon = style.Icon
                return (
                  <tr key={test.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-5 font-bold text-[#1a1a4e] max-w-xs"><p className="truncate">{test.title}</p></td>
                    <td className="px-6 py-5">
                      <span className="flex items-center gap-1.5 text-sm font-medium text-slate-600"><Calendar className="w-3.5 h-3.5 text-slate-400" />{test.subject}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="flex items-center gap-1.5 text-sm font-medium text-slate-600"><Clock className="w-3.5 h-3.5 text-slate-400" />{test.duration_min}min</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase', style.bg, style.text)}>
                        <Icon className="w-3 h-3" /> {style.label}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                        <Link href={`/admin/weekly-tests/${test.id}/edit`} className="hover:text-[#c0622f] transition-colors" title="Edit">
                          <Pencil className="w-4 h-4" />
                        </Link>
                        {test.status === 'live' && (
                          <Link href={`/admin/weekly-tests/${test.id}/monitor`} className="hover:text-[#c0622f] transition-colors" title="Monitor">
                            <Eye className="w-4 h-4" />
                          </Link>
                        )}
                        <Link href={`/admin/weekly-tests/${test.id}/monitor`} className="hover:text-[#c0622f] transition-colors" title="Analytics">
                          <BarChart2 className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
