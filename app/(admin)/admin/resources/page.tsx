'use client'
// Admin Resources — interactive: subject tabs, type filter, search, delete
import { useState, useMemo } from 'react'
import { Plus, Search, Trash2, FileText, Video, Headphones, Link2, X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

type ResourceType = 'PDF' | 'Video' | 'Audio' | 'Link'

interface Resource {
  id:       string
  title:    string
  subject:  string
  type:     ResourceType
  size:     string
  uploaded: string
  views:    number
}

const typeStyle: Record<ResourceType, { bg: string; text: string; Icon: React.ElementType }> = {
  PDF:   { bg: 'bg-red-100',            text: 'text-red-600',            Icon: FileText   },
  Video: { bg: 'bg-blue-100',           text: 'text-blue-600',           Icon: Video      },
  Audio: { bg: 'bg-purple-100',         text: 'text-purple-600',         Icon: Headphones },
  Link:  { bg: 'bg-surface-container',  text: 'text-on-surface-variant', Icon: Link2      },
}

const INITIAL_RESOURCES: Resource[] = [
  { id: 'r1', title: 'Aliphatic Compounds — Complete Notes', subject: 'Chemistry',   type: 'PDF',   size: '12.4 MB', uploaded: 'Oct 24', views: 1420 },
  { id: 'r2', title: 'Rotational Dynamics — Lecture 3',      subject: 'Physics',     type: 'Video', size: '14:22',   uploaded: 'Oct 22', views: 2891 },
  { id: 'r3', title: 'Integration Formulas Cheat Sheet',     subject: 'Math',        type: 'PDF',   size: '5.8 MB',  uploaded: 'Oct 20', views: 3201 },
  { id: 'r4', title: 'Cell Biology Podcast Episode 2',       subject: 'Biology',     type: 'Audio', size: '38:14',   uploaded: 'Oct 18', views: 441  },
  { id: 'r5', title: 'NEB Syllabus 2024 Official Link',      subject: 'General',     type: 'Link',  size: '—',       uploaded: 'Oct 15', views: 5822 },
  { id: 'r6', title: 'Newton\'s Laws — Derivation Guide',    subject: 'Physics',     type: 'PDF',   size: '8.2 MB',  uploaded: 'Oct 12', views: 1100 },
  { id: 'r7', title: 'Organic Reactions Summary',            subject: 'Chemistry',   type: 'PDF',   size: '6.1 MB',  uploaded: 'Oct 10', views: 920  },
]

const SUBJECTS = ['All', 'Physics', 'Chemistry', 'Math', 'Biology', 'General']
const TYPE_FILTERS: (ResourceType | 'All')[] = ['All', 'PDF', 'Video', 'Audio', 'Link']

export default function AdminResourcesPage() {
  const [query,     setQuery]     = useState('')
  const [subject,   setSubject]   = useState('All')
  const [typeF,     setTypeF]     = useState<ResourceType | 'All'>('All')
  const [resources, setResources] = useState<Resource[]>(INITIAL_RESOURCES)

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return resources.filter((r) => {
      const matchSubject = subject === 'All' || r.subject === subject
      const matchType    = typeF === 'All' || r.type === typeF
      const matchQ       = !q || r.title.toLowerCase().includes(q) || r.subject.toLowerCase().includes(q)
      return matchSubject && matchType && matchQ
    })
  }, [resources, subject, typeF, query])

  const deleteResource = (id: string) => setResources((prev) => prev.filter((r) => r.id !== id))

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-extrabold text-[#1a1a4e] tracking-tight font-headline mb-1">Resources</h2>
          <p className="text-slate-500 font-medium">Upload and manage study materials for your students.</p>
        </div>
        <button className="bg-[#c0622f] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-[#c0622f]/20">
          <Plus className="w-5 h-5" /> Upload Resource
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Files', value: `${resources.length}`,      color: 'text-[#1a1a4e]'             },
          { label: 'Total Views', value: resources.reduce((s, r) => s + r.views, 0).toLocaleString(), color: 'text-on-tertiary-container' },
          { label: 'PDFs',        value: `${resources.filter((r) => r.type === 'PDF').length}`,  color: 'text-[#1a1a4e]' },
          { label: 'Videos',      value: `${resources.filter((r) => r.type === 'Video').length}`, color: 'text-on-primary-container' },
        ].map((s) => (
          <div key={s.label} className="bg-white p-4 rounded-xl shadow-[0_8px_20px_rgba(25,28,30,0.04)] text-center">
            <p className={cn('text-3xl font-black', s.color)}>{s.value}</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-[0_12px_32px_rgba(25,28,30,0.04)]">

        {/* Controls */}
        <div className="p-5 border-b border-surface-container flex flex-col gap-4">
          {/* Row 1: search + upload */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 bg-surface-container rounded-xl border-none focus:ring-2 focus:ring-on-primary-container/20 text-sm"
                placeholder="Search resources..."
              />
              {query && <button onClick={() => setQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-on-surface"><X className="w-4 h-4" /></button>}
            </div>
          </div>
          {/* Row 2: subject tabs + type filter */}
          <div className="flex gap-2 flex-wrap items-center">
            {SUBJECTS.map((sub) => (
              <button
                key={sub}
                onClick={() => setSubject(sub)}
                className={cn(
                  'px-4 py-2 rounded-lg text-xs font-bold transition-colors',
                  subject === sub ? 'bg-[#1a1a4e] text-white' : 'bg-surface-container-low text-slate-600 hover:bg-surface-container'
                )}
              >
                {sub}
              </button>
            ))}
            <div className="ml-auto flex gap-2">
              {TYPE_FILTERS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeF(t)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border',
                    typeF === t ? 'border-on-primary-container text-on-primary-container bg-on-primary-container/5' : 'border-surface-container-high text-slate-500 hover:border-outline'
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Resource table */}
        <table className="w-full text-left">
          <thead className="bg-surface-container-low/50">
            <tr>
              {['File', 'Subject', 'Type', 'Size', 'Uploaded', 'Views', ''].map((col) => (
                <th key={col} className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-16 text-outline font-medium">No resources match your filters.</td></tr>
            ) : (
              filtered.map((res) => {
                const { bg, text, Icon } = typeStyle[res.type]
                return (
                  <tr key={res.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', bg)}>
                          <Icon className={cn('w-4 h-4', text)} />
                        </div>
                        <p className="font-bold text-on-surface text-sm truncate max-w-[200px]">{res.title}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">{res.subject}</td>
                    <td className="px-6 py-4">
                      <span className={cn('text-[10px] font-black px-2 py-1 rounded uppercase', bg, text)}>{res.type}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{res.size}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{res.uploaded}</td>
                    <td className="px-6 py-4 text-sm font-bold text-[#1a1a4e]">{res.views.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => deleteResource(res.id)}
                        className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-surface-container-low text-error hover:shadow transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
