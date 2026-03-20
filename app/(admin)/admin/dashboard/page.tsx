// Admin Dashboard — based exactly on admin_panel_dashboard/code.html
// Quick actions + stats cards + line chart placeholder + donut chart + recent activity table
import { TrendingUp, Users, CreditCard, BookOpen, Video, Plus } from 'lucide-react'

const statsCards = [
  { label: 'Total Users',    value: '12,842', change: '+14%', up: true,  color: 'text-teal-600 bg-teal-50' },
  { label: 'Revenue (NRS)',  value: '2.4M',   change: '+8%',  up: true,  color: 'text-on-primary-container bg-orange-50' },
  { label: 'Active Today',   value: '3,241',  change: '+5%',  up: true,  color: 'text-secondary bg-secondary/5' },
  { label: 'Model Sets Done', value: '8,920', change: '-2%',  up: false, color: 'text-error bg-error/5' },
]

const quickActions = [
  { label: 'Add Resource',    icon: BookOpen, color: 'bg-[#1a1a4e] text-white' },
  { label: 'Create Model Set', icon: Plus,    color: 'bg-on-primary-container text-white' },
  { label: 'Post Notice',     icon: Users,   color: 'bg-[#2d6a6a] text-white' },
  { label: 'Schedule Class',  icon: Video,   color: 'bg-secondary text-white' },
]

const recentActivity = [
  { user: 'Prabin Karki',   action: 'Completed IOE Mock Set #04', score: '78/100', time: '5 min ago', tier: 'Premium Plus' },
  { user: 'Anjali Rai',     action: 'Started 7-day trial',       score: '—',      time: '12 min ago', tier: '7-Day Trial' },
  { user: 'Suresh Mahat',   action: 'Downloaded Chemistry Notes', score: '—',      time: '23 min ago', tier: 'Premium Plus' },
  { user: 'Smriti Gurung',  action: 'Attended Live Class',       score: '—',      time: '1h ago',     tier: 'Basic Tier' },
  { user: 'Aaryan Sharma',  action: 'Completed Weekly Test #12', score: '91/100', time: '2h ago',     tier: 'Premium Plus' },
]

export default function AdminDashboardPage() {
  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline font-black text-4xl text-[#1a1a4e] tracking-tight mb-2">
            Admin Dashboard
          </h2>
          <p className="text-on-surface-variant font-medium">
            Academic ecosystem overview — this week&apos;s metrics.
          </p>
        </div>
        <div className="flex gap-3">
          {quickActions.map((action, i) => {
            const Icon = action.icon
            return (
              <button
                key={i}
                className={`${action.color} px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-sm`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden md:inline">{action.label}</span>
              </button>
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
              <h3 className="font-headline font-extrabold text-3xl text-[#1a1a4e]">{stat.value}</h3>
              <span className={`text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-0.5 ${stat.color}`}>
                <TrendingUp className="w-3 h-3" /> {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        {/* Line chart placeholder */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-headline font-bold text-lg text-[#1a1a4e]">Student Growth</h3>
            <div className="flex gap-2">
              {['7D', '1M', '3M', 'All'].map((t) => (
                <button key={t} className={`text-xs font-bold px-3 py-1 rounded-lg transition-colors ${t === '1M' ? 'bg-on-primary-container text-white' : 'text-on-surface-variant hover:bg-surface-container-low'}`}>{t}</button>
              ))}
            </div>
          </div>
          {/* Simulated bar chart */}
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

        {/* Donut chart placeholder */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h3 className="font-headline font-bold text-lg text-[#1a1a4e] mb-6">User Tiers</h3>
          <div className="relative w-40 h-40 mx-auto mb-6">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Donut segments */}
              <circle cx="50" cy="50" r="40" fill="none" stroke="#cf6e3a" strokeWidth="16" strokeDasharray="100 152" strokeDashoffset="-38" />
              <circle cx="50" cy="50" r="40" fill="none" stroke="#141448" strokeWidth="16" strokeDasharray="60 192" strokeDashoffset="-138" />
              <circle cx="50" cy="50" r="40" fill="none" stroke="#579292" strokeWidth="16" strokeDasharray="92 160" strokeDashoffset="-198" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="font-headline font-black text-xl text-[#1a1a4e]">12k</p>
                <p className="text-[10px] text-slate-400 font-bold">Total</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Premium Plus', pct: 33, color: 'bg-on-primary-container' },
              { label: '7-Day Trial',  pct: 49, color: 'bg-[#1a1a4e]' },
              { label: 'Basic Tier',   pct: 18, color: 'bg-on-tertiary-container' },
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

      {/* Recent Activity Table */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="p-6 border-b border-surface-container">
          <h3 className="font-headline font-bold text-lg text-[#1a1a4e]">Recent Activity</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low/50">
                {['Student', 'Action', 'Score', 'Academic Tier', 'Time'].map((col) => (
                  <th key={col} className="px-6 py-4 text-[11px] font-black text-on-surface-variant uppercase tracking-widest border-b border-surface-container">
                    {col}
                  </th>
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
                    <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${row.tier === 'Premium Plus' ? 'bg-orange-50 text-on-primary-container' : row.tier === '7-Day Trial' ? 'bg-secondary/10 text-secondary' : 'bg-surface-container-high text-on-surface-variant'}`}>
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
