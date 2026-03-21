'use client'
// Admin Model Sets — fetches real data from modelSetService
import { useEffect, useState } from 'react'
import { Plus, Archive, Eye, Edit, Library, CheckCircle2, FileEdit, Users, Search, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { modelSetService, type ModelSet } from '@/services/modelSetService'
import { cn } from '@/lib/utils/cn'

const ROWS_PER_PAGE = 8

export default function AdminModelSetsPage() {
  const [sets,    setSets]    = useState<ModelSet[]>([])
  const [total,   setTotal]   = useState(0)
  const [page,    setPage]    = useState(1)
  const [search,  setSearch]  = useState('')
  const [loading, setLoading] = useState(true)

  const fetchSets = (p: number, q: string) => {
    setLoading(true)
    modelSetService.getModelSets({ page: p, search: q, limit: ROWS_PER_PAGE, status: 'all' })
      .then((res) => {
        const d = res.data as { items?: ModelSet[]; total?: number } | ModelSet[]
        if (Array.isArray(d)) { setSets(d); setTotal(d.length) }
        else { setSets(d.items ?? []); setTotal(d.total ?? 0) }
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchSets(page, search) }, [page, search])

  const totalPages    = Math.max(1, Math.ceil(total / ROWS_PER_PAGE))
  const published     = sets.filter(s => s.status === 'published').length
  const drafts        = sets.filter(s => s.status === 'draft').length

  return (
    <div className="p-8">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h2 className="text-4xl font-extrabold text-[#1a1a4e] tracking-tight mb-2 font-headline">Model Sets Management</h2>
          <p className="text-slate-500 font-medium">BridgeCourse Nepal — IOE, IOM, and CSIT mock examination sets.</p>
        </div>
        <Link href="/admin/model-sets/create" className="bg-[#c0622f] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-[#c0622f]/20">
          <Plus className="w-5 h-5" /> Create New Model Set
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        {[
          { icon: <Library      className="w-5 h-5" />, value: total,     label: 'Total Sets',       iconBg: 'bg-primary-fixed text-[#c0622f]',                           border: '' },
          { icon: <CheckCircle2 className="w-5 h-5" />, value: published, label: 'Published',        iconBg: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',           border: 'border-b-4 border-tertiary-fixed' },
          { icon: <FileEdit     className="w-5 h-5" />, value: drafts,    label: 'Drafts',           iconBg: 'bg-primary-fixed-dim text-on-primary-fixed-variant',         border: 'border-b-4 border-primary-fixed' },
          { icon: <Users        className="w-5 h-5" />, value: '—',       label: 'Active Attempts',  iconBg: 'bg-secondary-container text-on-secondary-container',         border: 'border-b-4 border-secondary-container' },
        ].map((stat) => (
          <div key={stat.label} className={cn('bg-white p-6 rounded-2xl shadow-[0_12px_32px_rgba(25,28,30,0.04)]', stat.border)}>
            <div className="flex justify-between items-start mb-4">
              <div className={cn('p-2 rounded-lg', stat.iconBg)}>{stat.icon}</div>
              <span className="text-[10px] font-bold text-slate-400 tracking-tighter uppercase">{stat.label}</span>
            </div>
            <p className="text-3xl font-black text-[#1a1a4e]">{loading ? '…' : stat.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-[0_12px_32px_rgba(25,28,30,0.06)]">
        <div className="p-4 md:p-6 bg-surface-container-low flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h3 className="font-bold text-[#1a1a4e] text-lg">Inventory Pipeline</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
            <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="pl-9 pr-4 py-2 bg-white rounded-full border border-slate-200/50 focus:ring-2 focus:ring-[#c0622f]/20 text-sm w-56"
              placeholder="Search model sets..." />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48"><Loader2 className="w-6 h-6 animate-spin text-on-primary-container" /></div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-surface-container-low/50">
              <tr>
                {['Set Title', 'Target', 'Questions', 'Duration', 'Status', 'Actions'].map((col) => (
                  <th key={col} className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sets.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-16 text-outline font-medium">No model sets found.</td></tr>
              ) : sets.map((set) => (
                <tr key={set.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-5">
                    <p className="font-bold text-[#1a1a4e]">{set.title}</p>
                    <p className="text-xs text-slate-400">BC-MS-{String(set.id).padStart(4,'0')}</p>
                  </td>
                  <td className="px-6 py-5">
                    <span className="px-2 py-0.5 bg-slate-100 text-[10px] font-bold text-slate-600 rounded">{set.targets?.[0] ?? '—'}</span>
                  </td>
                  <td className="px-6 py-5 font-bold text-on-surface-variant">{set.total_questions ?? '—'} Qs</td>
                  <td className="px-6 py-5 font-medium text-on-surface-variant">{set.duration_min ?? '—'} min</td>
                  <td className="px-6 py-5">
                    <span className={cn('px-3 py-1 text-[11px] font-black rounded-full uppercase tracking-tighter',
                      set.status === 'published' ? 'bg-tertiary-fixed text-on-tertiary-fixed-variant' : 'bg-primary-fixed text-on-primary-fixed-variant')}>
                      {set.status}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                      <Link href={`/admin/model-sets/${set.id}/edit`} className="hover:text-[#c0622f] transition-colors" title="Edit"><Edit className="w-4 h-4" /></Link>
                      <button className="hover:text-[#c0622f] transition-colors" title="Preview"><Eye className="w-4 h-4" /></button>
                      <button className="hover:text-error transition-colors" title="Archive"><Archive className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="px-6 py-6 bg-surface-container-low/30 border-t border-slate-100 flex items-center justify-between">
          <p className="text-sm font-medium text-slate-500">Page {page} of {totalPages} · {total} total</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1} className="p-2 bg-white rounded-lg border border-slate-200/50 hover:bg-slate-50 transition-colors disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
            {Array.from({length: Math.min(totalPages,5)}, (_,i) => i+1).map(p => (
              <button key={p} onClick={() => setPage(p)} className={cn('px-4 py-2 rounded-lg text-sm font-bold transition-colors', p===page ? 'bg-white border border-slate-200/50 text-[#c0622f]' : 'text-slate-500 hover:text-[#1a1a4e]')}>{p}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages} className="p-2 bg-white rounded-lg border border-slate-200/50 hover:bg-slate-50 transition-colors disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    </div>
  )
}
