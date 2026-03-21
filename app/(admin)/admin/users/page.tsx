'use client'
// Admin User Management — fetches real data from userService
import { useEffect, useState, useMemo } from 'react'
import { Download, UserPlus, MoreVertical, ChevronLeft, ChevronRight, Search, X, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { userService, type User } from '@/services/userService'
import { cn } from '@/lib/utils/cn'

type Tab = 'all' | 'trial' | 'paid'
const ROWS_PER_PAGE = 8

export default function UserManagementPage() {
  const [tab,      setTab]      = useState<Tab>('all')
  const [query,    setQuery]    = useState('')
  const [page,     setPage]     = useState(1)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [users,    setUsers]    = useState<User[]>([])
  const [total,    setTotal]    = useState(0)
  const [loading,  setLoading]  = useState(true)

  const fetchUsers = (t: Tab, q: string, p: number) => {
    setLoading(true)
    userService.getUsers({ tab: t === 'all' ? '' : t, search: q, page: p, limit: ROWS_PER_PAGE })
      .then((res) => {
        setUsers(res.data?.items ?? [])
        setTotal(res.data?.total ?? 0)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchUsers(tab, query, page) }, [tab, query, page])

  const totalPages = Math.max(1, Math.ceil(total / ROWS_PER_PAGE))
  const changeTab  = (t: Tab) => { setTab(t); setPage(1); setSelected(new Set()) }

  const toggleSelect    = (id: number) => setSelected((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })
  const toggleSelectAll = () => setSelected((prev) => {
    if (users.every((u) => prev.has(u.id))) {
      const s = new Set(prev); users.forEach((u) => s.delete(u.id)); return s
    }
    return new Set([...Array.from(prev), ...users.map((u) => u.id)])
  })

  const toggleStatus = async (u: User) => {
    await userService.updateUser(u.id, { status: u.status === 'active' ? 'suspended' : 'active' })
    fetchUsers(tab, query, page)
  }

  const stats = [
    { label: 'Total Users',   value: total.toLocaleString(),     badge: 'BridgeCourse', badgeColor: 'text-teal-600 bg-teal-50' },
    { label: 'Paid Students', value: users.filter(u=>u.plan==='paid').length.toString(),  badge: 'Paid Tier',    badgeColor: 'text-on-primary-container bg-orange-50' },
    { label: 'Active Trials', value: users.filter(u=>u.plan==='trial').length.toString(), badge: 'Trial Period', badgeColor: 'text-secondary bg-secondary/10' },
  ]

  return (
    <div className="p-4 md:p-6 lg:p-10 max-w-7xl mx-auto">
      <div className="mb-6 md:mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline font-black text-2xl md:text-4xl text-[#1a1a4e] tracking-tight mb-1">User Management</h2>
          <p className="text-on-surface-variant font-medium text-sm md:text-base">BridgeCourse Nepal — manage students and their academic tiers.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button className="bg-surface-container-highest text-[#1a1a4e] px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-surface-container-high transition-colors">
            <Download className="w-4 h-4" /> <span className="hidden sm:inline">Export</span>
          </button>
          <Link href="/admin/users/bulk-generate" className="bg-[#c0622f] text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all">
            <UserPlus className="w-4 h-4" /> <span className="hidden sm:inline">Enroll Students</span>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl shadow-[0_8px_20px_rgba(25,28,30,0.04)]">
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-4">{stat.label}</p>
            <div className="flex items-end justify-between">
              <h3 className="font-headline font-extrabold text-3xl text-[#1a1a4e]">{stat.value}</h3>
              <span className={cn('text-xs font-bold px-2 py-1 rounded-lg', stat.badgeColor)}>{stat.badge}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[2rem] shadow-[0_12px_32px_rgba(25,28,30,0.06)] overflow-hidden">
        {/* Controls */}
        <div className="p-5 border-b border-surface-container flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex bg-surface-container-low p-1.5 rounded-2xl">
            {(['all','trial','paid'] as Tab[]).map((key) => (
              <button key={key} onClick={() => changeTab(key)} className={cn(
                'px-6 py-2 rounded-xl text-sm font-bold transition-all',
                tab === key ? 'bg-white text-on-primary-container shadow-sm' : 'text-on-surface-variant hover:text-[#1a1a4e]'
              )}>
                {key === 'all' ? 'All Users' : key === 'trial' ? 'Trial Only' : 'Paid Only'}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
            <input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1) }}
              placeholder="Search users..." className="pl-9 pr-8 py-2 bg-surface-container rounded-xl text-sm border-none focus:ring-2 focus:ring-on-primary-container/20 w-48" />
            {query && <button onClick={() => setQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2"><X className="w-4 h-4 text-outline" /></button>}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center h-48"><Loader2 className="w-6 h-6 animate-spin text-on-primary-container" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low/50">
                  <th className="px-6 py-4 border-b border-surface-container">
                    <input type="checkbox" checked={users.length > 0 && users.every(u => selected.has(u.id))} onChange={toggleSelectAll} className="rounded text-on-primary-container border-outline-variant cursor-pointer" />
                  </th>
                  {['Student Name', 'Email', 'Joined', 'Plan', 'Status', ''].map((col) => (
                    <th key={col} className="px-6 py-4 text-[11px] font-black text-on-surface-variant uppercase tracking-widest border-b border-surface-container">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-16 text-outline font-medium">No students match your filters.</td></tr>
                ) : users.map((u, i) => (
                  <tr key={u.id} className={cn('hover:bg-surface-container-low transition-colors', selected.has(u.id) ? 'bg-primary-fixed/20' : i%2===1 ? 'bg-surface-container-low/20':'')}>
                    <td className="px-6 py-5">
                      <input type="checkbox" checked={selected.has(u.id)} onChange={() => toggleSelect(u.id)} className="rounded text-on-primary-container border-outline-variant cursor-pointer" />
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-on-primary-container flex items-center justify-center text-white text-xs font-bold">
                          {u.name.split(' ').map(n=>n[0]).join('').slice(0,2)}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-[#1a1a4e]">{u.name}</p>
                          <p className="text-[11px] text-on-surface-variant">BC-{String(u.id).padStart(4,'0')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm text-on-surface-variant">{u.email ?? '—'}</td>
                    <td className="px-6 py-5 text-sm text-on-surface-variant">{u.created_at?.slice(0,10)}</td>
                    <td className="px-6 py-5">
                      <span className={cn('px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider',
                        u.plan === 'paid' ? 'bg-orange-50 text-on-primary-container' : 'bg-secondary/10 text-secondary')}>
                        {u.plan === 'paid' ? 'Premium' : '7-Day Trial'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <button onClick={() => toggleStatus(u)} className={cn('w-10 h-5 rounded-full relative shadow-inner transition-colors', u.status === 'active' ? 'bg-teal-500' : 'bg-surface-container-highest')}>
                          <div className={cn('w-4 h-4 bg-white rounded-full absolute top-0.5 shadow-sm transition-all', u.status==='active' ? 'right-0.5' : 'left-0.5')} />
                        </button>
                        <span className={cn('text-xs font-bold', u.status==='active' ? 'text-teal-600' : 'text-on-surface-variant')}>
                          {u.status==='active' ? 'Active' : 'Suspended'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <Link href={`/admin/users/${u.id}`} className="text-on-surface-variant hover:text-[#1a1a4e] p-2 rounded-lg hover:bg-surface-container transition-all inline-block">
                        <MoreVertical className="w-5 h-5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="p-6 bg-surface-container-low/30 border-t border-surface-container flex items-center justify-between">
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
            Page {page} of {totalPages} · {total} total users
          </p>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p-1))} disabled={page===1} className="w-9 h-9 rounded-xl flex items-center justify-center border border-surface-container hover:bg-white transition-all text-on-surface-variant disabled:opacity-30">
              <ChevronLeft className="w-5 h-5" />
            </button>
            {Array.from({length: Math.min(totalPages, 5)}, (_, i) => i+1).map((p) => (
              <button key={p} onClick={() => setPage(p)} className={cn('w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-all', page===p ? 'bg-[#1a1a4e] text-white shadow-md' : 'hover:bg-white text-on-surface-variant')}>{p}</button>
            ))}
            <button onClick={() => setPage((p) => Math.min(totalPages, p+1))} disabled={page===totalPages} className="w-9 h-9 rounded-xl flex items-center justify-center border border-surface-container hover:bg-white transition-all text-on-surface-variant disabled:opacity-30">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
