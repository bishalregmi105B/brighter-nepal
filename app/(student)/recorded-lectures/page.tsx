'use client'
// Recorded Lectures — fetches real recorded class data from liveClassService (completed classes)
import { useEffect, useState, useMemo } from 'react'
import { Play, Clock, BookOpen, Download, Search, X, Loader2 } from 'lucide-react'
import { liveClassService, type LiveClass } from '@/services/liveClassService'
import { cn } from '@/lib/utils/cn'
import Link from 'next/link'

const SUBJECTS = ['All', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English']

const subjectColors: Record<string, string> = {
  Mathematics: 'bg-blue-100 text-blue-700',
  Physics:     'bg-teal-100 text-teal-700',
  Chemistry:   'bg-purple-100 text-purple-700',
  Biology:     'bg-green-100 text-green-700',
  English:     'bg-orange-100 text-orange-700',
}

export default function RecordedLecturesPage() {
  const [lectures, setLectures] = useState<LiveClass[]>([])
  const [loading,  setLoading]  = useState(true)
  const [active,   setActive]   = useState('All')
  const [search,   setSearch]   = useState('')

  useEffect(() => {
    liveClassService.getLiveClasses('completed').then((res) => {
      setLectures(res.data?.items ?? [])
    }).finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return lectures.filter((l) => {
      const matchSub = active === 'All' || l.subject === active
      const matchQ   = !q || l.title.toLowerCase().includes(q) || l.teacher.toLowerCase().includes(q)
      return matchSub && matchQ
    })
  }, [lectures, active, search])

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      <div>
        <span className="text-on-primary-container font-bold text-sm tracking-widest uppercase block mb-2">On-Demand</span>
        <h1 className="font-headline font-extrabold text-4xl md:text-5xl text-[#1a1a4e] leading-tight">Recorded Lectures</h1>
        <p className="text-slate-500 mt-2 max-w-xl">
          Watch past BridgeCourse Nepal live sessions anytime.{lectures.length > 0 && ` All ${lectures.length} recordings available.`}
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title or teacher…"
          className="w-full pl-11 pr-10 py-3 bg-white rounded-xl shadow-sm border border-outline-variant/20 text-sm focus:outline-none focus:ring-2 focus:ring-on-primary-container/20" />
        {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"><X className="w-4 h-4" /></button>}
      </div>

      <div className="flex gap-2 flex-wrap">
        {SUBJECTS.map((s) => (
          <button key={s} onClick={() => setActive(s)} className={cn(
            'px-4 py-2 rounded-xl text-sm font-bold transition-all border',
            active === s ? 'bg-[#c0622f] text-white border-transparent shadow-md' : 'bg-white text-slate-600 border-outline-variant/20 hover:border-[#c0622f]/30'
          )}>{s}</button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48"><Loader2 className="w-8 h-8 animate-spin text-on-primary-container" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-outline">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-bold">{search ? 'No recordings match your search.' : 'No recorded lectures yet.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((lec) => (
            <div key={lec.id} className="bg-white rounded-2xl shadow-[0_8px_20px_rgba(25,28,30,0.04)] overflow-hidden group hover:shadow-xl transition-all">
              <Link href={`/recorded-lectures/${lec.id}`} className="relative h-40 bg-gradient-to-br from-[#1a1a4e]/90 to-[#2d6a6a]/60 flex items-center justify-center cursor-pointer block">
                <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform">
                  <Play className="w-7 h-7 text-white fill-white" />
                </div>
                <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/60 px-2.5 py-1 rounded-full text-white text-[10px] font-bold">
                  <Clock className="w-3 h-3" /> {lec.duration_min ?? '—'}min
                </div>
              </Link>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className={cn('px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase', subjectColors[lec.subject] || 'bg-slate-100 text-slate-600')}>{lec.subject}</span>
                  <span className="text-[10px] text-slate-400 font-medium">{lec.scheduled_at?.slice(0,10) ?? '—'}</span>
                </div>
                <h3 className="font-bold text-[#1a1a4e] leading-snug mb-1 line-clamp-2">{lec.title}</h3>
                <p className="text-xs text-slate-500 mb-4">{lec.teacher}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-outline font-medium">{(lec.watchers ?? 0).toLocaleString()} views</span>
                  <div className="flex gap-2">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container text-on-surface text-xs font-bold rounded-lg hover:bg-surface-container-high transition-colors">
                      <Download className="w-3.5 h-3.5" /> Download
                    </button>
                    <Link href={`/recorded-lectures/${lec.id}`} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#c0622f] text-white text-xs font-bold rounded-lg hover:bg-[#a14f24] transition-colors">
                      <Play className="w-3.5 h-3.5 fill-white" /> Watch
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
