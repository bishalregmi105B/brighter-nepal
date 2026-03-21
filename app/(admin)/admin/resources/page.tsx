'use client'
// Admin Resources — fetches real data from resourceService
import { useEffect, useState, useMemo } from 'react'
import { Plus, Search, Trash2, FileText, Video, Headphones, Link2, X, Loader2 } from 'lucide-react'
import { resourceService, type Resource } from '@/services/resourceService'
import { cn } from '@/lib/utils/cn'

const typeStyle: Record<string, { bg: string; text: string; Icon: React.ElementType }> = {
  pdf:   { bg: 'bg-red-100',           text: 'text-red-600',            Icon: FileText   },
  video: { bg: 'bg-blue-100',          text: 'text-blue-600',           Icon: Video      },
  audio: { bg: 'bg-purple-100',        text: 'text-purple-600',         Icon: Headphones },
  link:  { bg: 'bg-surface-container', text: 'text-on-surface-variant', Icon: Link2      },
  notes: { bg: 'bg-green-100',         text: 'text-green-600',          Icon: FileText   },
}

const SUBJECTS      = ['All', 'Physics', 'Chemistry', 'Mathematics', 'Biology', 'English', 'General']
const TYPE_FILTERS  = ['All', 'pdf', 'video', 'audio', 'notes', 'link']

export default function AdminResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading,   setLoading]   = useState(true)
  const [query,     setQuery]     = useState('')
  const [subject,   setSubject]   = useState('All')
  const [typeF,     setTypeF]     = useState('All')

  const fetchResources = () => {
    setLoading(true)
    resourceService.getResources({ section: subject === 'All' ? '' : subject, search: query })
      .then((res) => {
        const d = res.data
        setResources(Array.isArray(d) ? d : (d as { items?: Resource[] }).items ?? [])
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchResources() }, [subject, query])

  const filtered = useMemo(() => {
    if (typeF === 'All') return resources
    return resources.filter(r => r.format === typeF)
  }, [resources, typeF])

  const deleteResource = async (id: number) => {
    await resourceService.deleteResource(id).catch(() => {})
    setResources(prev => prev.filter(r => r.id !== id))
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-extrabold text-[#1a1a4e] tracking-tight font-headline mb-1">Resources</h2>
          <p className="text-slate-500 font-medium">BridgeCourse Nepal — manage IOE/IOM/CSIT study materials.</p>
        </div>
        <button className="bg-[#c0622f] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-[#c0622f]/20">
          <Plus className="w-5 h-5" /> Upload Resource
        </button>
      </div>

      {/* Stats from real data */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Files', value: resources.length.toString(),                                   color: 'text-[#1a1a4e]'             },
          { label: 'Total Views', value: resources.reduce((s, r) => s + (r.downloads ?? 0), 0).toLocaleString(), color: 'text-on-tertiary-container' },
          { label: 'PDFs',        value: resources.filter(r => r.format === 'pdf').length.toString(),   color: 'text-[#1a1a4e]'             },
          { label: 'Videos',      value: resources.filter(r => r.format === 'video').length.toString(), color: 'text-on-primary-container'  },
        ].map((s) => (
          <div key={s.label} className="bg-white p-4 rounded-xl shadow-[0_8px_20px_rgba(25,28,30,0.04)] text-center">
            <p className={cn('text-3xl font-black', s.color)}>{loading ? '…' : s.value}</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-[0_12px_32px_rgba(25,28,30,0.04)]">
        <div className="p-5 border-b border-surface-container flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
              <input value={query} onChange={(e) => { setQuery(e.target.value) }}
                className="w-full pl-9 pr-8 py-2.5 bg-surface-container rounded-xl border-none focus:ring-2 focus:ring-on-primary-container/20 text-sm"
                placeholder="Search resources..." />
              {query && <button onClick={() => setQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-on-surface"><X className="w-4 h-4" /></button>}
            </div>
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            {SUBJECTS.map((sub) => (
              <button key={sub} onClick={() => setSubject(sub)} className={cn(
                'px-4 py-2 rounded-lg text-xs font-bold transition-colors',
                subject === sub ? 'bg-[#1a1a4e] text-white' : 'bg-surface-container-low text-slate-600 hover:bg-surface-container'
              )}>{sub}</button>
            ))}
            <div className="ml-auto flex gap-2">
              {TYPE_FILTERS.map((t) => (
                <button key={t} onClick={() => setTypeF(t)} className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border uppercase',
                  typeF === t ? 'border-on-primary-container text-on-primary-container bg-on-primary-container/5' : 'border-surface-container-high text-slate-500 hover:border-outline'
                )}>{t}</button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48"><Loader2 className="w-6 h-6 animate-spin text-on-primary-container" /></div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-surface-container-low/50">
              <tr>{['File', 'Subject', 'Type', 'Downloads', 'Tags', ''].map((col) => (
                <th key={col} className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">{col}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-16 text-outline font-medium">No resources match your filters.</td></tr>
              ) : filtered.map((res) => {
                const style = typeStyle[res.format] ?? typeStyle.pdf
                const Icon  = style.Icon
                return (
                  <tr key={res.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', style.bg)}>
                          <Icon className={cn('w-4 h-4', style.text)} />
                        </div>
                        <p className="font-bold text-on-surface text-sm truncate max-w-[200px]">{res.title}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">{res.subject}</td>
                    <td className="px-6 py-4">
                      <span className={cn('text-[10px] font-black px-2 py-1 rounded uppercase', style.bg, style.text)}>{res.format}</span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-[#1a1a4e]">{(res.downloads ?? 0).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(res.tags ?? []).slice(0,2).map((t: string) => (
                          <span key={t} className="text-[10px] px-1.5 py-0.5 bg-surface-container rounded text-outline">{t}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => deleteResource(res.id)}
                        className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-surface-container-low text-error hover:shadow transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
