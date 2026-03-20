// Admin Weekly Tests Management
// Upcoming/live list + create button + status monitoring table
import {
  Plus,
  Calendar,
  Users,
  Clock,
  Eye,
  BarChart2,
  RadioTower,
  CheckCircle2,
  Circle,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'

type TestStatus = 'live' | 'scheduled' | 'completed' | 'draft'

interface WeeklyTest {
  id:          string
  title:       string
  date:        string
  duration:    string
  enrolled:    number
  submitted?:  number
  status:      TestStatus
}

const tests: WeeklyTest[] = [
  { id: 'wt-01', title: 'Science & Technology Mid-Term Mock 04', date: 'Today, Live Now',    duration: '90 min', enrolled: 1248, submitted: 642, status: 'live'      },
  { id: 'wt-02', title: 'Advanced Mathematics: Calculus II',      date: 'Oct 28, 2023',       duration: '60 min', enrolled: 940,                  status: 'scheduled' },
  { id: 'wt-03', title: 'Modern History & Geopolitics',           date: 'Oct 21, 2023',       duration: '60 min', enrolled: 1102, submitted: 1102, status: 'completed' },
  { id: 'wt-04', title: 'Organic Chemistry Foundations',          date: 'Oct 14, 2023',       duration: '75 min', enrolled: 830,  submitted: 824,  status: 'completed' },
  { id: 'wt-05', title: 'Economics & Public Policy',              date: 'Draft',               duration: '60 min', enrolled: 0,                    status: 'draft'     },
]

const statusStyle: Record<TestStatus, { label: string; bg: string; text: string; Icon: React.ElementType }> = {
  live:       { label: 'Live Now',   bg: 'bg-error-container',   text: 'text-error',                      Icon: RadioTower   },
  scheduled:  { label: 'Scheduled', bg: 'bg-secondary-fixed',   text: 'text-on-secondary-fixed-variant',  Icon: Calendar     },
  completed:  { label: 'Completed', bg: 'bg-tertiary-fixed',    text: 'text-on-tertiary-fixed-variant',   Icon: CheckCircle2 },
  draft:      { label: 'Draft',     bg: 'bg-primary-fixed',     text: 'text-on-primary-fixed-variant',    Icon: Circle       },
}

export default function AdminWeeklyTestsPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">

      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-extrabold text-[#1a1a4e] tracking-tight font-headline mb-1">Weekly Tests</h2>
          <p className="text-slate-500 font-medium">Schedule, monitor, and evaluate live assessment sessions.</p>
        </div>
        <Link
          href="/admin/weekly-tests/create"
          className="bg-[#c0622f] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-[#c0622f]/20"
        >
          <Plus className="w-5 h-5" /> Create Test
        </Link>
      </div>

      {/* Live banner if any live test */}
      {tests.some((t) => t.status === 'live') && (
        <div className="bg-[#1a1a4e] rounded-2xl p-6 flex items-center justify-between gap-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-error/20 flex items-center justify-center flex-shrink-0">
              <RadioTower className="w-6 h-6 text-error" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-error animate-pulse" />
                <span className="font-black text-lg">Science &amp; Technology Mid-Term Mock 04</span>
              </div>
              <p className="text-white/60 text-sm">642 / 1,248 submitted · 90 min session</p>
            </div>
          </div>
          <Link
            href="/admin/weekly-tests/wt-01/monitor"
            className="bg-on-primary-container text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 flex-shrink-0 hover:shadow-lg transition-all"
          >
            <Eye className="w-4 h-4" /> Monitor Live
          </Link>
        </div>
      )}

      {/* Tests table */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-[0_12px_32px_rgba(25,28,30,0.04)]">
        <table className="w-full text-left">
          <thead className="bg-surface-container-low/60">
            <tr>
              {['Test Title', 'Date', 'Duration', 'Enrolled', 'Submitted', 'Status', 'Actions'].map((col) => (
                <th key={col} className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tests.map((test) => {
              const { label, bg, text, Icon } = statusStyle[test.status]
              return (
                <tr key={test.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-5 font-bold text-[#1a1a4e] max-w-xs">
                    <p className="truncate">{test.title}</p>
                  </td>
                  <td className="px-6 py-5">
                    <span className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {test.date}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {test.duration}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="flex items-center gap-1.5 text-sm font-bold text-[#1a1a4e]">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      {test.enrolled.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-sm font-medium text-slate-600">
                    {test.submitted !== undefined ? `${test.submitted.toLocaleString()}` : '—'}
                  </td>
                  <td className="px-6 py-5">
                    <span className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase', bg, text)}>
                      <Icon className="w-3 h-3" /> {label}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                      {test.status === 'live' && (
                        <Link href={`/admin/weekly-tests/${test.id}/monitor`} className="hover:text-[#c0622f] transition-colors" title="Monitor">
                          <Eye className="w-4 h-4" />
                        </Link>
                      )}
                      <Link href={`/admin/weekly-tests/${test.id}/analytics`} className="hover:text-[#c0622f] transition-colors" title="Analytics">
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
    </div>
  )
}
