'use client'
// Admin Dashboard — updated stats from API, Brighter Nepal branding
import { useEffect, useState } from 'react'
import { TrendingUp, Users, CreditCard, BookOpen, Plus, Video, Loader2, UserCheck, Clock } from 'lucide-react'
import Link from 'next/link'
import { userService, type UserStats } from '@/services/userService'
import { api } from '@/services/api'

const quickActions = [
  { label: 'Add Resource',     icon: BookOpen, color: 'bg-[#1a1a4e] text-white',          href: '/admin/resources' },
  { label: 'Create Model Set', icon: Plus,     color: 'bg-on-primary-container text-white', href: '/admin/model-sets/create' },
  { label: 'Post Notice',      icon: Users,    color: 'bg-[#2d6a6a] text-white',            href: '/admin/notices' },
  { label: 'Schedule Class',   icon: Video,    color: 'bg-secondary text-white',            href: '/admin/live-classes' },
]

type ActivityRow = { user: string; action: string; score: string; tier: string; time: string }

function relativeTime(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60)   return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400)return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function AdminDashboardPage() {
  const [stats,    setStats]    = useState<UserStats | null>(null)
  const [activity, setActivity] = useState<ActivityRow[]>([])

  useEffect(() => {
    userService.getStats().then(res => setStats(res.data as UserStats)).catch(() => {})
    api.get<{ data: ActivityRow[] }>('/api/users/recent-activity').then(res => setActivity(res.data ?? [])).catch(() => {})
  }, [])

  const fmt = (n: number) => n.toLocaleString()
  const fmtNpr = (n: number) => `NPR ${n.toLocaleString()}`

  const topCards = [
    { label: 'Total Students', value: stats ? fmt(stats.total_users)        : '…', icon: Users,     change: 'Brighter Nepal', color: 'text-teal-600 bg-teal-50' },
    { label: 'Paid Students',  value: stats ? fmt(stats.paid_users)         : '…', icon: UserCheck,  change: 'Paid Tier',    color: 'text-on-primary-container bg-orange-50' },
    { label: 'Trial Students', value: stats ? fmt(stats.trial_users)        : '…', icon: Clock,      change: 'Trial Period',  color: 'text-secondary bg-secondary/5' },
    { label: 'Total Revenue',  value: stats ? fmtNpr(stats.total_payment)   : '…', icon: CreditCard, change: 'Collected',    color: 'text-[#2d6a6a] bg-teal-50' },
  ]

  const todayCards = [
    { label: "Today's Revenue",     value: stats ? fmtNpr(stats.today_payment) : '…', color: 'text-green-600 bg-green-50',  change: 'Today' },
    { label: "Today's Enrollments", value: stats ? fmt(stats.today_enroll)     : '…', color: 'text-blue-600 bg-blue-50',    change: 'New' },
  ]

  return (
    <div className="p-4 md:p-6 lg:p-10 max-w-7xl mx-auto">
      <div className="mb-6 md:mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline font-black text-2xl md:text-4xl text-[#1a1a4e] tracking-tight mb-1">Admin Dashboard</h2>
          <p className="text-on-surface-variant font-medium text-sm">Brighter Nepal — SEE Questions preparation ecosystem overview.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Link key={action.label} href={action.href} className={`${action.color} px-3 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-sm`}>
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline text-xs">{action.label}</span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Top Stats — 4 main cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {topCards.map((stat, i) => {
          const Icon = stat.icon
          return (
            <div key={i} className="bg-white rounded-2xl shadow-card p-6">
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-4">{stat.label}</p>
              <div className="flex items-end justify-between gap-2">
                <h3 className="font-headline font-extrabold text-3xl text-[#1a1a4e]">
                  {stat.value === '…' ? <Loader2 className="w-6 h-6 animate-spin inline" /> : stat.value}
                </h3>
                <span className={`text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-0.5 ${stat.color}`}>
                  <TrendingUp className="w-3 h-3" /> {stat.change}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Today Stats — 2 "today" cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        {todayCards.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-card p-5 flex items-center justify-between">
            <p className="text-sm font-bold text-on-surface-variant">{stat.label}</p>
            <div className="flex items-center gap-2">
              <span className="font-headline font-extrabold text-2xl text-[#1a1a4e]">
                {stat.value === '…' ? <Loader2 className="w-5 h-5 animate-spin inline" /> : stat.value}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${stat.color}`}>{stat.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-headline font-bold text-lg text-[#1a1a4e]">Student Growth</h3>
            <div className="flex gap-2">
              {['7D', '1M', '3M', 'All'].map((t) => (
                <button key={t} className={`text-xs font-bold px-3 py-1 rounded-lg transition-colors ${t === '1M' ? 'bg-on-primary-container text-white' : 'text-on-surface-variant hover:bg-surface-container-low'}`}>{t}</button>
              ))}
            </div>
          </div>
          <div className="h-48 flex items-end gap-2 px-2">
            {[40, 65, 50, 80, 75, 95, 85, 100, 90, 88, 92, 100].map((h, i) => (
              <div key={i} className={`flex-1 rounded-t-lg transition-all ${i === 11 ? 'bg-on-primary-container' : 'bg-surface-container-high'}`} style={{ height: `${h}%` }} />
            ))}
          </div>
          <div className="flex justify-between mt-2 px-2 text-[10px] text-slate-400 font-medium">
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-6">
          <h3 className="font-headline font-bold text-lg text-[#1a1a4e] mb-6">Batch Distribution</h3>
          <div className="relative w-40 h-40 mx-auto mb-6">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#cf6e3a" strokeWidth="16" strokeDasharray="100 152" strokeDashoffset="-38" />
              <circle cx="50" cy="50" r="40" fill="none" stroke="#141448" strokeWidth="16" strokeDasharray="60 192" strokeDashoffset="-138" />
              <circle cx="50" cy="50" r="40" fill="none" stroke="#579292" strokeWidth="16" strokeDasharray="92 160" strokeDashoffset="-198" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="font-headline font-black text-xl text-[#1a1a4e]">3</p>
                <p className="text-[10px] text-slate-400 font-bold">Batches</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { label: 'SEE Batch 2081', pct: 60, color: 'bg-on-primary-container' },
              { label: 'SEE Batch 2082', pct: 40, color: 'bg-[#1a1a4e]' },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${s.color}`} />
                  <span className="text-xs font-medium text-on-surface-variant">{s.label}</span>
                </div>
                <span className="text-xs font-bold text-[#1a1a4e]">{s.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity — real data */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="p-6 border-b border-surface-container flex items-center justify-between">
          <h3 className="font-headline font-bold text-lg text-[#1a1a4e]">Recent Activity</h3>
          {activity.length === 0 && <span className="text-xs text-slate-400">No exam submissions yet</span>}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low/50">
                {['Student', 'Action', 'Score', 'Batch Tier', 'Time'].map((col) => (
                  <th key={col} className="px-6 py-4 text-[11px] font-black text-on-surface-variant uppercase tracking-widest border-b border-surface-container">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activity.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400 text-sm">Students haven&apos;t submitted any exams yet.</td></tr>
              ) : activity.map((row, i) => (
                <tr key={i} className="hover:bg-surface-container-low transition-colors border-b border-surface-container last:border-0">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-on-primary-container flex items-center justify-center text-white text-xs font-bold">
                        {row.user.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <span className="font-bold text-sm text-[#1a1a4e]">{row.user}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant">{row.action}</td>
                  <td className="px-6 py-4 text-sm font-bold text-on-tertiary-container">{row.score}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${row.tier === 'Premium' ? 'bg-orange-50 text-on-primary-container' : 'bg-secondary/10 text-secondary'}`}>
                      {row.tier}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-on-surface-variant font-medium">{relativeTime(row.time)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
