'use client'
// Admin Dashboard — updated stats from API, BridgeCourse Nepal branding
import { useEffect, useState } from 'react'
import { TrendingUp, Users, CreditCard, BookOpen, Plus, Video, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { userService } from '@/services/userService'
import { paymentService } from '@/services/paymentService'

const quickActions = [
  { label: 'Add Resource',     icon: BookOpen, color: 'bg-[#1a1a4e] text-white',          href: '/admin/resources' },
  { label: 'Create Model Set', icon: Plus,     color: 'bg-on-primary-container text-white', href: '/admin/model-sets/create' },
  { label: 'Post Notice',      icon: Users,    color: 'bg-[#2d6a6a] text-white',            href: '/admin/notices' },
  { label: 'Schedule Class',   icon: Video,    color: 'bg-secondary text-white',            href: '/admin/live-classes' },
]

const recentActivity = [
  { user: 'Aarav Sharma',    action: 'Completed IOE Mock Set — Set A', score: '82/100', time: '5m ago',  tier: 'Premium' },
  { user: 'Binita Thapa',    action: 'Started 7-day trial',            score: '—',      time: '12m ago', tier: '7-Day Trial' },
  { user: 'Chirag Adhikari', action: 'Downloaded Organic Chem Notes',  score: '—',      time: '23m ago', tier: '7-Day Trial' },
  { user: 'Dipika Rai',      action: 'Attended Live Calculus Class',   score: '—',      time: '1h ago',  tier: 'Premium' },
  { user: 'Kritika Shrestha','action': 'Completed Weekly Test — Optics', score: '91/100', time: '2h ago', tier: 'Premium' },
]

export default function AdminDashboardPage() {
  const [totalUsers,    setTotalUsers]    = useState<number | null>(null)
  const [totalRevenue,  setTotalRevenue]  = useState<string>('—')

  useEffect(() => {
    userService.getUsers({ limit: 1 }).then((res) => {
      setTotalUsers(res.data?.total ?? null)
    }).catch(() => {})

    paymentService.getPayments({ status: 'completed', page: 1 }).then((res) => {
      const items = res.data?.items ?? []
      const sum   = items.reduce((s, p) => s + p.amount, 0)
      setTotalRevenue(`NPR ${sum.toLocaleString()}`)
    }).catch(() => {})
  }, [])

  const statsCards = [
    { label: 'Total Students', value: totalUsers !== null ? totalUsers.toLocaleString() : '…', change: 'BridgeCourse', up: true,  color: 'text-teal-600 bg-teal-50' },
    { label: 'Revenue',        value: totalRevenue,                                             change: 'Collected',   up: true,  color: 'text-on-primary-container bg-orange-50' },
    { label: 'Active Batches', value: '3',                                                      change: 'IOE·IOM·CSIT',up: true,  color: 'text-secondary bg-secondary/5' },
    { label: 'Model Sets Live', value: '9',                                                     change: 'Published',   up: true,  color: 'text-[#2d6a6a] bg-teal-50' },
  ]

  return (
    <div className="p-4 md:p-6 lg:p-10 max-w-7xl mx-auto">
      <div className="mb-6 md:mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline font-black text-2xl md:text-4xl text-[#1a1a4e] tracking-tight mb-1">Admin Dashboard</h2>
          <p className="text-on-surface-variant font-medium text-sm">BridgeCourse Nepal — academic ecosystem overview.</p>
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

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        {statsCards.map((stat, i) => (
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
              { label: 'IOE Batch 2081', pct: 45, color: 'bg-on-primary-container' },
              { label: 'IOM/MBBS Batch', pct: 35, color: 'bg-[#1a1a4e]' },
              { label: 'CSIT/BIT Batch', pct: 20, color: 'bg-on-tertiary-container' },
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

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="p-6 border-b border-surface-container">
          <h3 className="font-headline font-bold text-lg text-[#1a1a4e]">Recent Activity</h3>
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
              {recentActivity.map((row, i) => (
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
                  <td className="px-6 py-4 text-xs text-on-surface-variant font-medium">{row.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
