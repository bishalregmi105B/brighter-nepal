'use client'
// Student Resources Page — interactive: subject filter + format filter + search
import { useState, useMemo } from 'react'
import { Search, BookOpen, Video, FileText, Clock, Download, X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

type Format = 'pdf' | 'video' | 'notes'

interface Resource {
  id:        string
  title:     string
  subject:   string
  format:    Format
  size:      string
  downloads: number
  tags:      string[]
}

const mockResources: Resource[] = [
  { id: '1', title: 'Aliphatic & Cyclic Compounds',         subject: 'Chemistry',   format: 'pdf',   size: '12.4 MB', downloads: 3240, tags: ['Organic Chemistry', 'IOE'] },
  { id: '2', title: 'Rotational Dynamics — Complete Notes', subject: 'Physics',     format: 'pdf',   size: '8.6 MB',  downloads: 4120, tags: ['Mechanics', 'IOE'] },
  { id: '3', title: 'Integral Calculus Lecture 3',          subject: 'Mathematics', format: 'video', size: '14:22',   downloads: 1890, tags: ['Calculus', 'IOE'] },
  { id: '4', title: 'Electrochemistry Quick Notes',         subject: 'Chemistry',   format: 'notes', size: '3.2 MB',  downloads: 2100, tags: ['Physical Chemistry', 'CEE'] },
  { id: '5', title: 'Error & Measurement',                  subject: 'Physics',     format: 'pdf',   size: '5.2 MB',  downloads: 3900, tags: ['Measurement', 'IOE'] },
  { id: '6', title: 'Differential Equations',               subject: 'Mathematics', format: 'video', size: '22:15',   downloads: 1200, tags: ['Calculus', 'IOE'] },
  { id: '7', title: 'Human Anatomy — Organ Systems',        subject: 'Biology',     format: 'notes', size: '7.4 MB',  downloads: 1800, tags: ['Biology', 'IOM'] },
  { id: '8', title: 'Inorganic Chemistry Reactions',        subject: 'Chemistry',   format: 'pdf',   size: '9.1 MB',  downloads: 2600, tags: ['Chemistry', 'IOE'] },
]

const formatBadge: Record<Format, string> = {
  pdf:   'bg-red-100 text-red-600',
  video: 'bg-blue-100 text-blue-600',
  notes: 'bg-green-100 text-green-600',
}
const formatLabel: Record<Format, string> = { pdf: 'PDF', video: 'Video', notes: 'Notes' }
const subjectFilters = ['All', 'Physics', 'Chemistry', 'Mathematics', 'Biology', 'English']
const formatFilters: (Format | 'All')[] = ['All', 'pdf', 'video', 'notes']

export default function ResourcesPage() {
  const [query,   setQuery]   = useState('')
  const [subject, setSubject] = useState('All')
  const [format,  setFormat]  = useState<Format | 'All'>('All')

  const displayed = useMemo(() => {
    const q = query.toLowerCase()
    return mockResources.filter((r) => {
      const matchSubject = subject === 'All' || r.subject === subject
      const matchFormat  = format  === 'All' || r.format === format
      const matchQ       = !q || r.title.toLowerCase().includes(q) || r.subject.toLowerCase().includes(q) || r.tags.some((t) => t.toLowerCase().includes(q))
      return matchSubject && matchFormat && matchQ
    })
  }, [query, subject, format])

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="font-headline font-black text-4xl text-[#1a1a4e] tracking-tight mb-2">Study Resources</h2>
        <p className="text-on-surface-variant font-medium">2,500+ curated PDFs, videos, and notes for entrance exam prep.</p>
      </div>

      {/* Search + Filters */}
      <div className="bg-white rounded-2xl shadow-[0_8px_20px_rgba(25,28,30,0.04)] p-5 mb-8 space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="text"
            placeholder="Search resources by title, subject, or topic..."
            className="w-full pl-12 pr-10 py-3 bg-surface-container-low rounded-xl text-sm border-none focus:ring-2 focus:ring-on-primary-container/20 transition-all"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-on-surface">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Subject tabs */}
        <div className="flex flex-wrap gap-2">
          {subjectFilters.map((sub) => (
            <button
              key={sub}
              onClick={() => setSubject(sub)}
              className={cn(
                'px-4 py-1.5 rounded-full text-sm font-bold transition-all',
                subject === sub ? 'bg-on-primary-container text-white' : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
              )}
            >
              {sub}
            </button>
          ))}
          <div className="ml-auto flex gap-2">
            {formatFilters.map((f) => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors',
                  format === f ? 'border-on-primary-container text-on-primary-container bg-on-primary-container/5' : 'border-surface-container-high text-slate-500 hover:border-outline'
                )}
              >
                {f === 'All' ? 'All Types' : formatLabel[f]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Resource Grid */}
      {displayed.length === 0 ? (
        <div className="text-center py-24 text-outline font-medium">No resources match your filters.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayed.map((res) => (
            <div key={res.id} className="bg-white rounded-2xl shadow-[0_8px_20px_rgba(25,28,30,0.04)] overflow-hidden hover:shadow-xl transition-all group cursor-pointer">
              {/* Preview area */}
              <div className={cn('h-36 flex flex-col items-center justify-center', res.format === 'pdf' ? 'bg-red-50' : res.format === 'video' ? 'bg-blue-50' : 'bg-green-50')}>
                {res.format === 'video' ? (
                  <div className="w-12 h-12 rounded-full bg-blue-600/20 flex items-center justify-center">
                    <Video className="w-6 h-6 text-blue-600" />
                  </div>
                ) : res.format === 'pdf' ? (
                  <FileText className="w-10 h-10 text-red-400" />
                ) : (
                  <BookOpen className="w-10 h-10 text-green-500" />
                )}
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className={cn('px-2 py-0.5 rounded text-[10px] font-black uppercase', formatBadge[res.format])}>
                    {formatLabel[res.format]}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">{res.subject}</span>
                </div>
                <h3 className="font-headline font-bold text-base text-[#1a1a4e] mb-3 leading-snug group-hover:text-on-primary-container transition-colors">
                  {res.title}
                </h3>
                <div className="flex flex-wrap gap-1 mb-4">
                  {res.tags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 bg-surface-container-low text-on-surface-variant text-[10px] font-semibold rounded-full">{tag}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                    <span className="flex items-center gap-1">
                      {res.format === 'video' ? <Clock className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                      {res.size}
                    </span>
                    <span>{res.downloads.toLocaleString()} downloads</span>
                  </div>
                  <button className="p-2 hover:bg-on-primary-container/10 rounded-lg transition-colors">
                    <Download className="w-4 h-4 text-slate-400 group-hover:text-on-primary-container transition-colors" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load more */}
      <div className="flex justify-center mt-12">
        <button className="flex items-center gap-2 px-8 py-3 font-bold text-[#1a1a4e] hover:text-on-primary-container transition-colors border border-surface-container-high rounded-full hover:border-on-primary-container">
          Load More Resources
        </button>
      </div>
    </div>
  )
}
