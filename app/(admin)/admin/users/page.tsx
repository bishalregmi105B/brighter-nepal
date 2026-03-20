'use client'
// Admin User Management — fully interactive
// Working: tab filter (All/Trial/Paid), search, checkbox bulk-select, status toggle, pagination
import { useState, useMemo } from 'react'
import { Download, UserPlus, MoreVertical, ChevronLeft, ChevronRight, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import Link from 'next/link'

// ─── Data ────────────────────────────────────────────────────────────────────

type Plan   = 'paid' | 'trial'
type Status = 'active' | 'suspended'
type Tab    = 'all' | 'trial' | 'paid'

interface Student {
  id:       string
  name:     string
  initials: string
  email:    string
  joinedAt: string
  plan:     Plan
  status:   Status
}

const INITIAL_STUDENTS: Student[] = [
  { id: 'BN-4920', name: 'Prabin Karki',    initials: 'PK', email: 'prabin.k@gmail.com',       joinedAt: '2023-10-12', plan: 'paid',  status: 'active'    },
  { id: 'BN-4981', name: 'Anjali Rai',      initials: 'AR', email: 'anjali.rai@yahoo.com',      joinedAt: '2023-11-05', plan: 'trial', status: 'active'    },
  { id: 'BN-3012', name: 'Suresh Mahat',    initials: 'SM', email: 'mahat.s@edu.com.np',        joinedAt: '2023-11-18', plan: 'paid',  status: 'suspended' },
  { id: 'BN-5104', name: 'Smriti Gurung',   initials: 'SG', email: 'smriti.g@gmail.com',        joinedAt: '2023-12-01', plan: 'paid',  status: 'active'    },
  { id: 'BN-5200', name: 'Aaryan Sharma',   initials: 'AS', email: 'aaryan.sharma@gmail.com',   joinedAt: '2023-12-15', plan: 'paid',  status: 'active'    },
  { id: 'BN-5411', name: 'Kripa Shrestha',  initials: 'KS', email: 'kripa.s@gmail.com',         joinedAt: '2024-01-02', plan: 'trial', status: 'active'    },
  { id: 'BN-5502', name: 'Suman Adhikari',  initials: 'SA', email: 'suman.a@proton.me',         joinedAt: '2024-01-10', plan: 'paid',  status: 'active'    },
  { id: 'BN-5690', name: 'Nisha Poudel',    initials: 'NP', email: 'nisha.p@yahoo.com',         joinedAt: '2024-01-22', plan: 'trial', status: 'suspended' },
]

const ROWS_PER_PAGE = 5

const stats = [
  { label: 'Total Users',   value: '12,842', badge: '+14%',        badgeColor: 'text-teal-600 bg-teal-50'               },
  { label: 'Paid Students', value: '4,210',  badge: 'Premium Tier', badgeColor: 'text-on-primary-container bg-orange-50' },
  { label: 'Active Trials', value: '8,632',  badge: 'Trial Period', badgeColor: 'text-secondary bg-secondary/10'         },
  { label: 'Churn Rate',    value: '2.4%',   badge: 'Low Risk',     badgeColor: 'text-error bg-error/5'                  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function UserManagementPage() {
  const [tab,      setTab]      = useState<Tab>('all')
  const [query,    setQuery]    = useState('')
  const [page,     setPage]     = useState(1)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS)

  // ── Derived data ────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return students.filter((s) => {
      const matchTab = tab === 'all' || (tab === 'trial' ? s.plan === 'trial' : s.plan === 'paid')
      const matchQ   = !q || s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || s.id.toLowerCase().includes(q)
      return matchTab && matchQ
    })
  }, [students, tab, query])

  const totalPages  = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE))
  const pageRows    = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE)
  const allOnPage   = pageRows.length > 0 && pageRows.every((s) => selected.has(s.id))

  // ── Handlers ────────────────────────────────────────────────────────────────
  const changeTab = (t: Tab) => { setTab(t); setPage(1); setSelected(new Set()) }

  const toggleSelect = (id: string) =>
    setSelected((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })

  const toggleSelectAll = () =>
    setSelected((prev) => {
      if (allOnPage) { const s = new Set(prev); pageRows.forEach((r) => s.delete(r.id)); return s }
      return new Set(Array.from(prev).concat(pageRows.map((r) => r.id)))
    })

  const toggleStatus = (id: string) =>
    setStudents((prev) => prev.map((s) => s.id === id ? { ...s, status: s.status === 'active' ? 'suspended' : 'active' } : s))

  const bulkMoveToPaid = () => {
    setStudents((prev) => prev.map((s) => selected.has(s.id) ? { ...s, plan: 'paid' } : s))
    setSelected(new Set())
  }

  const bulkDeactivate = () => {
    setStudents((prev) => prev.map((s) => selected.has(s.id) ? { ...s, status: 'suspended' } : s))
    setSelected(new Set())
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">

      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="font-headline font-black text-4xl text-[#1a1a4e] tracking-tight mb-2">User Management</h2>
          <p className="text-on-surface-variant font-medium">Oversee academic tiers, performance, and user status across the ecosystem.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-surface-container-highest text-[#1a1a4e] px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-surface-container-high transition-colors">
            <Download className="w-4 h-4" /> Export Report
          </button>
          <Link href="/admin/users/bulk-generate" className="bg-[#c0622f] text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all">
            <UserPlus className="w-4 h-4" /> Manual Enrollment
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
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

      {/* Table card */}
      <div className="bg-white rounded-[2rem] shadow-[0_12px_32px_rgba(25,28,30,0.06)] overflow-hidden">

        {/* Controls row */}
        <div className="p-5 border-b border-surface-container flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          {/* Tab filter */}
          <div className="flex bg-surface-container-low p-1.5 rounded-2xl">
            {([['all', 'All Users'], ['trial', 'Trial Only'], ['paid', 'Paid Only']] as [Tab, string][]).map(([key, label]) => (
              <button
                key={key}
                onClick={() => changeTab(key)}
                className={cn(
                  'px-6 py-2 rounded-xl text-sm font-bold transition-all',
                  tab === key ? 'bg-white text-on-primary-container shadow-sm' : 'text-on-surface-variant hover:text-[#1a1a4e]'
                )}
              >
                {label}
              </button>
            ))}
          </div>
          {/* Search + Bulk */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
              <input
                value={query}
                onChange={(e) => { setQuery(e.target.value); setPage(1) }}
                placeholder="Search users..."
                className="pl-9 pr-8 py-2 bg-surface-container rounded-xl text-sm border-none focus:ring-2 focus:ring-on-primary-container/20 w-48"
              />
              {query && (
                <button onClick={() => setQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {selected.size > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-on-surface-variant">{selected.size} selected:</span>
                <button onClick={bulkMoveToPaid} className="bg-secondary/10 text-[#1a1a4e] px-4 py-2 rounded-xl text-xs font-bold hover:bg-secondary/20 transition-all active:scale-95">Move to Paid</button>
                <button onClick={bulkDeactivate} className="bg-error/10 text-error px-4 py-2 rounded-xl text-xs font-bold hover:bg-error/20 transition-all active:scale-95">Deactivate</button>
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead>
              <tr className="bg-surface-container-low/50">
                <th className="px-6 py-4 border-b border-surface-container">
                  <input
                    type="checkbox"
                    checked={allOnPage}
                    onChange={toggleSelectAll}
                    className="rounded text-on-primary-container border-outline-variant cursor-pointer"
                  />
                </th>
                {['Student Name', 'Email Address', 'Joined Date', 'Academic Tier', 'Account Status', ''].map((col) => (
                  <th key={col} className="px-6 py-4 text-[11px] font-black text-on-surface-variant uppercase tracking-widest border-b border-surface-container">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-outline font-medium">
                    No students match your filters.
                  </td>
                </tr>
              ) : (
                pageRows.map((student, i) => {
                  const isSelected = selected.has(student.id)
                  return (
                    <tr
                      key={student.id}
                      className={cn(
                        'hover:bg-surface-container-low transition-colors cursor-pointer',
                        isSelected ? 'bg-primary-fixed/20' : i % 2 === 1 ? 'bg-surface-container-low/20' : ''
                      )}
                    >
                      <td className="px-6 py-5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(student.id)}
                          className="rounded text-on-primary-container border-outline-variant cursor-pointer"
                        />
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-on-primary-container flex items-center justify-center text-white text-xs font-bold">
                            {student.initials}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-[#1a1a4e]">{student.name}</p>
                            <p className="text-[11px] text-on-surface-variant">ID: {student.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm font-medium text-on-surface-variant">{student.email}</td>
                      <td className="px-6 py-5 text-sm font-medium text-on-surface-variant">{student.joinedAt}</td>
                      <td className="px-6 py-5">
                        <span className={cn(
                          'px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider',
                          student.plan === 'paid' ? 'bg-orange-50 text-on-primary-container' : 'bg-secondary/10 text-secondary'
                        )}>
                          {student.plan === 'paid' ? 'Premium Plus' : '7-Day Trial'}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleStatus(student.id)}
                            className={cn(
                              'w-10 h-5 rounded-full relative shadow-inner transition-colors',
                              student.status === 'active' ? 'bg-teal-500' : 'bg-surface-container-highest'
                            )}
                          >
                            <div className={cn(
                              'w-4 h-4 bg-white rounded-full absolute top-0.5 shadow-sm transition-all',
                              student.status === 'active' ? 'right-0.5' : 'left-0.5'
                            )} />
                          </button>
                          <span className={cn('text-xs font-bold', student.status === 'active' ? 'text-teal-600' : 'text-on-surface-variant')}>
                            {student.status === 'active' ? 'Active' : 'Suspended'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <Link href={`/admin/users/${student.id}`} className="text-on-surface-variant hover:text-[#1a1a4e] p-2 rounded-lg hover:bg-surface-container transition-all inline-block">
                          <MoreVertical className="w-5 h-5" />
                        </Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-6 bg-surface-container-low/30 border-t border-surface-container flex items-center justify-between">
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
            Showing {Math.min((page - 1) * ROWS_PER_PAGE + 1, filtered.length)}–{Math.min(page * ROWS_PER_PAGE, filtered.length)} of {filtered.length} results
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-9 h-9 rounded-xl flex items-center justify-center border border-surface-container hover:bg-white transition-all text-on-surface-variant disabled:opacity-30"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={cn(
                  'w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-all',
                  page === p ? 'bg-[#1a1a4e] text-white shadow-md' : 'hover:bg-white text-on-surface-variant'
                )}
              >
                {p}
              </button>
            ))}
            {totalPages > 5 && <span className="mx-1 text-on-surface-variant">...</span>}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-9 h-9 rounded-xl flex items-center justify-center border border-surface-container hover:bg-white transition-all text-on-surface-variant disabled:opacity-30"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
