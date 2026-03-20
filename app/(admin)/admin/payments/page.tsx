'use client'
// Admin Payments — fully interactive: live search, status filter, pagination
import { useState, useMemo } from 'react'
import {
  Download, Search, Filter, CalendarDays, Wallet, AlertCircle,
  TrendingUp, Clock, ChevronLeft, ChevronRight, Receipt, TriangleAlert, X,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

type PaymentStatus = 'Completed' | 'Pending' | 'Failed'
type StatusFilter  = 'All' | PaymentStatus

interface Payment {
  initials: string
  name:     string
  email:    string
  plan:     string
  amount:   string
  date:     string
  status:   PaymentStatus
}

const ALL_PAYMENTS: Payment[] = [
  { initials: 'AK', name: 'Anish Koirala',  email: 'anish.k@example.com',    plan: 'Medical Model Set Pack',   amount: 'NPR 1,200',  date: 'Oct 24, 2023', status: 'Completed' },
  { initials: 'SP', name: 'Srijana Poudel', email: 'srijana.p@example.com',   plan: 'Engineering Full Course',  amount: 'NPR 15,000', date: 'Oct 23, 2023', status: 'Pending'   },
  { initials: 'BT', name: 'Bishal Thapa',   email: 'bishal.t@example.com',    plan: 'IOE Weekly Test Series',   amount: 'NPR 500',    date: 'Oct 22, 2023', status: 'Failed'    },
  { initials: 'RS', name: 'Rita Sharma',    email: 'rita.sharma@example.com', plan: 'MBBS Crash Course',        amount: 'NPR 8,500',  date: 'Oct 21, 2023', status: 'Completed' },
  { initials: 'KR', name: 'Kavita Rana',   email: 'kavita.r@example.com',    plan: 'Physics Model Set',        amount: 'NPR 600',    date: 'Oct 20, 2023', status: 'Completed' },
  { initials: 'PG', name: 'Prashant Ghale', email: 'prashant.g@gmail.com',   plan: 'IOE Crash Course',         amount: 'NPR 12,000', date: 'Oct 19, 2023', status: 'Pending'   },
  { initials: 'MK', name: 'Mohan KC',       email: 'mohan.kc@example.com',   plan: 'CSIT Bundle',              amount: 'NPR 3,500',  date: 'Oct 18, 2023', status: 'Failed'    },
]

const STATUS_FILTERS: StatusFilter[] = ['All', 'Completed', 'Pending', 'Failed']
const ROWS_PER_PAGE = 5

const statusStyle: Record<PaymentStatus, string> = {
  Completed: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
  Pending:   'bg-secondary-fixed text-on-secondary-fixed-variant',
  Failed:    'bg-error-container text-error',
}

const avatarStyle: Record<PaymentStatus, string> = {
  Completed: 'bg-tertiary-fixed text-on-tertiary-fixed',
  Pending:   'bg-primary-fixed text-on-primary-fixed',
  Failed:    'bg-error-container text-on-error-container',
}

export default function AdminPaymentsPage() {
  const [query,    setQuery]    = useState('')
  const [filter,   setFilter]   = useState<StatusFilter>('All')
  const [page,     setPage]     = useState(1)

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return ALL_PAYMENTS.filter((p) => {
      const matchFilter = filter === 'All' || p.status === filter
      const matchQ      = !q || p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q) || p.plan.toLowerCase().includes(q)
      return matchFilter && matchQ
    })
  }, [query, filter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE))
  const pageRows   = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE)

  const changeFilter = (f: StatusFilter) => { setFilter(f); setPage(1) }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">

      {/* Summary Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-[0_12px_32px_rgba(25,28,30,0.04)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Wallet className="w-14 h-14" />
          </div>
          <p className="text-sm font-semibold text-secondary mb-2">Total Revenue</p>
          <h3 className="text-3xl font-black text-[#1a1a4e] tracking-tight">NPR 4,280,500</h3>
          <div className="mt-4 flex items-center gap-2 text-on-tertiary-container text-sm font-medium">
            <TrendingUp className="w-4 h-4" />
            <span>12.5% increase from last year</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-[0_12px_32px_rgba(25,28,30,0.04)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <CalendarDays className="w-14 h-14" />
          </div>
          <p className="text-sm font-semibold text-secondary mb-2">This Month</p>
          <h3 className="text-3xl font-black text-[#1a1a4e] tracking-tight">NPR 342,120</h3>
          <div className="mt-4 flex items-center gap-2 text-on-primary-container text-sm font-medium">
            <Clock className="w-4 h-4" />
            <span>42 pending approvals</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-[0_12px_32px_rgba(25,28,30,0.04)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <AlertCircle className="w-14 h-14" />
          </div>
          <p className="text-sm font-semibold text-secondary mb-2">Failed Payments</p>
          <h3 className="text-3xl font-black text-error tracking-tight">18</h3>
          <div className="mt-4 flex items-center gap-2 text-error text-sm font-medium">
            <TriangleAlert className="w-4 h-4" />
            <span>Requires immediate attention</span>
          </div>
        </div>
      </section>

      {/* Table */}
      <section className="bg-white rounded-2xl overflow-hidden shadow-[0_12px_32px_rgba(25,28,30,0.04)]">

        {/* Controls */}
        <div className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-surface-container">
          {/* Search */}
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1) }}
              className="w-full pl-10 pr-8 py-2.5 bg-surface-container rounded-xl border-none focus:ring-2 focus:ring-on-primary-container/20 text-sm"
              placeholder="Search by name, email or plan..."
            />
            {query && (
              <button onClick={() => setQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-on-surface">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {/* Status filter + Export */}
          <div className="flex items-center gap-2 flex-wrap">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => changeFilter(f)}
                className={cn(
                  'px-4 py-2 rounded-xl text-xs font-bold transition-colors',
                  filter === f
                    ? 'bg-[#1a1a4e] text-white'
                    : 'bg-surface-container-low text-slate-600 hover:bg-surface-container'
                )}
              >
                {f}
              </button>
            ))}
            <button className="flex items-center gap-2 px-4 py-2 bg-surface-container-low text-[#1a1a4e] font-bold text-xs rounded-xl hover:bg-surface-container-high transition-colors">
              <CalendarDays className="w-4 h-4" /> Date Range
            </button>
            <button className="flex items-center gap-2 px-5 py-2 bg-on-primary-container text-white font-bold text-xs rounded-full hover:opacity-90 active:scale-95 transition-all">
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>
        </div>

        {/* Table data */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50">
                {['Student Name', 'Plan / Course', 'Amount', 'Date', 'Status', 'Action'].map((col, i) => (
                  <th key={col} className={cn('px-6 py-4 text-xs font-bold text-secondary uppercase tracking-wider', i === 5 && 'text-right')}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-outline font-medium">No payments match your search.</td>
                </tr>
              ) : (
                pageRows.map((p, i) => (
                  <tr key={i} className="hover:bg-surface-bright transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className={cn('h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs', avatarStyle[p.status])}>
                          {p.initials}
                        </div>
                        <div>
                          <p className="font-bold text-[#1a1a4e]">{p.name}</p>
                          <p className="text-xs text-slate-500">{p.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm font-medium text-slate-700">{p.plan}</td>
                    <td className="px-6 py-5 text-sm font-bold text-[#1a1a4e]">{p.amount}</td>
                    <td className="px-6 py-5 text-sm text-slate-600">{p.date}</td>
                    <td className="px-6 py-5">
                      <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold', statusStyle[p.status])}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button
                        className={cn('p-2 transition-colors', p.status === 'Failed' ? 'text-slate-400 hover:text-error' : 'text-slate-400 hover:text-on-primary-container')}
                        title={p.status === 'Failed' ? 'Retry or Contact' : 'Download Receipt'}
                      >
                        {p.status === 'Failed' ? <TriangleAlert className="w-5 h-5" /> : <Receipt className="w-5 h-5" />}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 flex items-center justify-between border-t border-surface-container bg-surface-container-low/30">
          <p className="text-sm text-slate-500">
            Showing <strong>{Math.min((page - 1) * ROWS_PER_PAGE + 1, filtered.length)}–{Math.min(page * ROWS_PER_PAGE, filtered.length)}</strong> of <strong>{filtered.length}</strong> payments
          </p>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg hover:bg-surface-container-high text-slate-400 disabled:opacity-30">
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)} className={cn('px-3 py-1 rounded-lg text-sm font-bold', page === p ? 'bg-on-primary-container text-white' : 'hover:bg-surface-container-high text-slate-600')}>
                {p}
              </button>
            ))}
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg hover:bg-surface-container-high text-slate-600 disabled:opacity-30">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="flex flex-col md:flex-row justify-between items-center py-6 border-t border-surface-container text-slate-400 text-xs">
        <p>© 2024 Brighter Nepal Academic Curator. All financial data is encrypted and PCI-DSS compliant.</p>
        <div className="flex items-center gap-6 mt-4 md:mt-0">
          {['Audit Logs', 'Tax Documents', 'Payout Settings'].map((l) => (
            <button key={l} className="hover:text-on-primary-container transition-colors">{l}</button>
          ))}
        </div>
      </footer>
    </div>
  )
}
