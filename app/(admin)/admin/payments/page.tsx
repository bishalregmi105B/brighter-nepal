'use client'
// Admin Payments — fetches real data from paymentService
import { useEffect, useState, useMemo } from 'react'
import { Download, Search, CalendarDays, Wallet, AlertCircle, TrendingUp, Clock, ChevronLeft, ChevronRight, Receipt, TriangleAlert, X, Loader2 } from 'lucide-react'
import { paymentService, type Payment } from '@/services/paymentService'
import { cn } from '@/lib/utils/cn'

type StatusFilter = 'All' | 'completed' | 'pending' | 'failed'
const STATUS_FILTERS: StatusFilter[] = ['All', 'completed', 'pending', 'failed']
const ROWS_PER_PAGE = 8

const statusStyle: Record<string, string> = {
  completed: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
  pending:   'bg-secondary-fixed text-on-secondary-fixed-variant',
  failed:    'bg-error-container text-error',
}

export default function AdminPaymentsPage() {
  const [query,    setQuery]    = useState('')
  const [filter,   setFilter]   = useState<StatusFilter>('All')
  const [page,     setPage]     = useState(1)
  const [payments, setPayments] = useState<Payment[]>([])
  const [total,    setTotal]    = useState(0)
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    setLoading(true)
    paymentService.getPayments({
      status: filter === 'All' ? '' : filter,
      search: query,
      page,
    }).then((res) => {
      setPayments(res.data?.items ?? [])
      setTotal(res.data?.total ?? 0)
    }).finally(() => setLoading(false))
  }, [filter, query, page])

  const totalPages  = Math.max(1, Math.ceil(total / ROWS_PER_PAGE))
  const changeFilter = (f: StatusFilter) => { setFilter(f); setPage(1) }

  // Compute summary from loaded data
  const totalRevenue = payments.filter(p => p.status === 'completed').reduce((s, p) => s + p.amount, 0)
  const failedCount  = payments.filter(p => p.status === 'failed').length

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">

      {/* Summary Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-[0_12px_32px_rgba(25,28,30,0.04)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Wallet className="w-14 h-14" /></div>
          <p className="text-sm font-semibold text-secondary mb-2">Total Revenue</p>
          <h3 className="text-3xl font-black text-[#1a1a4e] tracking-tight">NPR {totalRevenue.toLocaleString()}</h3>
          <div className="mt-4 flex items-center gap-2 text-on-tertiary-container text-sm font-medium">
            <TrendingUp className="w-4 h-4" /><span>From {total} payments loaded</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-[0_12px_32px_rgba(25,28,30,0.04)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><CalendarDays className="w-14 h-14" /></div>
          <p className="text-sm font-semibold text-secondary mb-2">Course Fees</p>
          <h3 className="text-3xl font-black text-[#1a1a4e] tracking-tight">NPR 8,500</h3>
          <div className="mt-4 flex items-center gap-2 text-on-primary-container text-sm font-medium">
            <Clock className="w-4 h-4" /><span>Standard rate per student</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-[0_12px_32px_rgba(25,28,30,0.04)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><AlertCircle className="w-14 h-14" /></div>
          <p className="text-sm font-semibold text-secondary mb-2">Failed Payments</p>
          <h3 className="text-3xl font-black text-error tracking-tight">{failedCount}</h3>
          <div className="mt-4 flex items-center gap-2 text-error text-sm font-medium">
            <TriangleAlert className="w-4 h-4" /><span>Requires immediate attention</span>
          </div>
        </div>
      </section>

      {/* Table */}
      <section className="bg-white rounded-2xl overflow-hidden shadow-[0_12px_32px_rgba(25,28,30,0.04)]">
        <div className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-surface-container">
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1) }}
              className="w-full pl-10 pr-8 py-2.5 bg-surface-container rounded-xl border-none focus:ring-2 focus:ring-on-primary-container/20 text-sm"
              placeholder="Search by name or email..." />
            {query && <button onClick={() => setQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2"><X className="w-4 h-4 text-slate-400 hover:text-on-surface" /></button>}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {STATUS_FILTERS.map((f) => (
              <button key={f} onClick={() => changeFilter(f)} className={cn(
                'px-4 py-2 rounded-xl text-xs font-bold transition-colors capitalize',
                filter === f ? 'bg-[#1a1a4e] text-white' : 'bg-surface-container-low text-slate-600 hover:bg-surface-container'
              )}>{f}</button>
            ))}
            <button className="flex items-center gap-2 px-5 py-2 bg-on-primary-container text-white font-bold text-xs rounded-full hover:opacity-90 active:scale-95 transition-all">
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48"><Loader2 className="w-6 h-6 animate-spin text-on-primary-container" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low/50">
                  {['Student', 'Method', 'Amount', 'Date', 'Status', 'Action'].map((col, i) => (
                    <th key={col} className={cn('px-6 py-4 text-xs font-bold text-secondary uppercase tracking-wider', i===5 && 'text-right')}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {payments.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-16 text-outline font-medium">No payments match your search.</td></tr>
                ) : payments.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-bright transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className={cn('h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs',
                          p.status==='completed' ? 'bg-tertiary-fixed text-on-tertiary-fixed' : p.status==='pending' ? 'bg-primary-fixed text-on-primary-fixed' : 'bg-error-container text-on-error-container')}>
                          {(p.user_name ?? '??').split(' ').map(n=>n[0]).join('').slice(0,2)}
                        </div>
                        <div>
                          <p className="font-bold text-[#1a1a4e]">{p.user_name ?? `User #${p.user_id}`}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm font-medium text-slate-700">{p.method}</td>
                    <td className="px-6 py-5 text-sm font-bold text-[#1a1a4e]">NPR {p.amount.toLocaleString()}</td>
                    <td className="px-6 py-5 text-sm text-slate-600">{p.created_at?.slice(0,10)}</td>
                    <td className="px-6 py-5">
                      <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold capitalize', statusStyle[p.status] ?? 'bg-slate-100 text-slate-600')}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button className={cn('p-2 transition-colors', p.status==='failed' ? 'text-slate-400 hover:text-error' : 'text-slate-400 hover:text-on-primary-container')}
                        title={p.status==='failed' ? 'Retry or Contact' : 'Download Receipt'}>
                        {p.status==='failed' ? <TriangleAlert className="w-5 h-5" /> : <Receipt className="w-5 h-5" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-6 py-4 flex items-center justify-between border-t border-surface-container bg-surface-container-low/30">
          <p className="text-sm text-slate-500">Page {page} of {totalPages} · {total} total</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage((p) => Math.max(1,p-1))} disabled={page===1} className="p-2 rounded-lg hover:bg-surface-container-high text-slate-400 disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
            {Array.from({length: Math.min(totalPages,5)}, (_,i)=>i+1).map((p)=>(
              <button key={p} onClick={() => setPage(p)} className={cn('px-3 py-1 rounded-lg text-sm font-bold', page===p ? 'bg-on-primary-container text-white' : 'hover:bg-surface-container-high text-slate-600')}>{p}</button>
            ))}
            <button onClick={() => setPage((p) => Math.min(totalPages,p+1))} disabled={page===totalPages} className="p-2 rounded-lg hover:bg-surface-container-high text-slate-600 disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </section>

      <footer className="flex flex-col md:flex-row justify-between items-center py-6 border-t border-surface-container text-slate-400 text-xs">
        <p>© 2081 BridgeCourse Nepal. All financial data is encrypted and PCI-DSS compliant.</p>
      </footer>
    </div>
  )
}
