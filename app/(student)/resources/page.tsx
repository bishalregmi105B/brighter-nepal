'use client'
// Student Study Materials — fetches real data from resourceService
import { useEffect, useState, useMemo } from 'react'
import { Search, BookOpen, Video, FileText, Eye, X, Loader2, Globe, FileArchive } from 'lucide-react'
import { resourceService, type Resource } from '@/services/resourceService'
import { subjectService } from '@/services/subjectService'
import { cn } from '@/lib/utils/cn'
import Link from 'next/link'
import { DEFAULT_SUBJECTS, mergeSubjectOptions } from '@/lib/utils/subjects'

const formatBadge: Record<string, string> = {
  pdf:   'bg-red-100 text-red-600',
  video: 'bg-blue-100 text-blue-600',
  notes: 'bg-green-100 text-green-600',
  link:  'bg-sky-100 text-sky-600',
  file:  'bg-orange-100 text-orange-600',
  audio: 'bg-purple-100 text-purple-600',
}
const formatLabel: Record<string, string> = {
  pdf:   'PDF',
  video: 'Video',
  notes: 'Notes',
  link:  'Link',
  file:  'File',
  audio: 'Audio',
}

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([])
  const [subjects,  setSubjects]  = useState<string[]>([])
  const [loading,   setLoading]   = useState(true)
  const [query,     setQuery]     = useState('')
  const [section,   setSection]   = useState('All')

  // Load distinct subjects from API
  useEffect(() => {
    subjectService.getSubjects()
      .then((res) => {
        const subs = Array.isArray(res.data) ? res.data : (res.data as { data?: string[] })?.data ?? []
        setSubjects(mergeSubjectOptions(subs, DEFAULT_SUBJECTS))
      })
      .catch(() => {}) // graceful fail
  }, [])

  useEffect(() => {
    setLoading(true)
    resourceService.getResources({ subject: section === 'All' ? '' : section, search: query })
      .then((res) => {
        const d = res.data
        setResources(Array.isArray(d) ? d : (d as { items?: Resource[] }).items ?? [])
      })
      .finally(() => setLoading(false))
  }, [section, query])

  const displayed = useMemo(() => {
    const q = query.toLowerCase()
    return resources.filter((r) => {
      const matchQ = !q || r.title.toLowerCase().includes(q) || r.subject.toLowerCase().includes(q) ||
        r.tags?.some((t: string) => t.toLowerCase().includes(q))
      return matchQ
    })
  }, [resources, query])

  const tabs = ['All', ...subjects]

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="font-headline font-black text-4xl text-[#1a1a4e] tracking-tight mb-2">Study Materials</h2>
        <p className="text-on-surface-variant font-medium">BridgeCourse Nepal — curated PDFs, videos, and notes.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_8px_20px_rgba(25,28,30,0.04)] p-5 mb-8 space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} type="text"
            placeholder="Search by title, subject, or topic..."
            className="w-full pl-12 pr-10 py-3 bg-surface-container-low rounded-xl text-sm border-none focus:ring-2 focus:ring-on-primary-container/20" />
          {query && <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-on-surface"><X className="w-5 h-5" /></button>}
        </div>
        <div className="flex flex-wrap gap-2">
          {tabs.map((s) => (
            <button key={s} onClick={() => setSection(s)} className={cn(
              'px-4 py-1.5 rounded-full text-sm font-bold transition-all whitespace-nowrap',
              section === s ? 'bg-on-primary-container text-white' : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
            )}>{s}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48"><Loader2 className="w-8 h-8 animate-spin text-on-primary-container" /></div>
      ) : displayed.length === 0 ? (
        <div className="text-center py-24 text-outline font-medium">No resources match your filters.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayed.map((res) => (
            <div key={res.id} className="bg-white rounded-2xl shadow-[0_8px_20px_rgba(25,28,30,0.04)] overflow-hidden hover:shadow-xl transition-all group">
              <Link href={`/resources/${res.id}`}
                className={cn('h-36 flex flex-col items-center justify-center block',
                  res.format === 'pdf' ? 'bg-red-50' : res.format === 'video' ? 'bg-blue-50' : 'bg-green-50')}>
                {res.format === 'video'
                  ? <div className="w-12 h-12 rounded-full bg-blue-600/20 flex items-center justify-center"><Video className="w-6 h-6 text-blue-600" /></div>
                  : res.format === 'pdf'
                  ? <FileText className="w-10 h-10 text-red-400" />
                  : <BookOpen className="w-10 h-10 text-green-500" />}
              </Link>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className={cn('px-2 py-0.5 rounded text-[10px] font-black uppercase', formatBadge[res.format] ?? 'bg-slate-100 text-slate-600')}>
                    {formatLabel[res.format] ?? res.format}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">{res.subject}</span>
                </div>
                <Link href={`/resources/${res.id}`}>
                  <h3 className="font-headline font-bold text-base text-[#1a1a4e] mb-3 leading-snug group-hover:text-on-primary-container transition-colors">{res.title}</h3>
                </Link>
                <div className="flex flex-wrap gap-1 mb-4">
                  {(res.tags ?? []).map((tag: string) => (
                    <span key={tag} className="px-2 py-0.5 bg-surface-container-low text-on-surface-variant text-[10px] font-semibold rounded-full">{tag}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-slate-400 font-medium">{res.downloads?.toLocaleString()} views</span>
                  <div className="flex gap-2">
                    <Link href={`/resources/${res.id}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#c0622f] text-white text-xs font-bold rounded-lg hover:bg-[#a14f24] transition-colors">
                      <Eye className="w-3.5 h-3.5" />{res.format === 'video' ? 'Watch' : 'View'}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
