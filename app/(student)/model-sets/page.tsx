'use client'
// Student Model Sets — fetches real data from modelSetService
import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { BookCheck, Timer, Play, ChevronDown, Target, Loader2, ExternalLink } from 'lucide-react'
import { modelSetService, type ModelSet } from '@/services/modelSetService'
import { cn } from '@/lib/utils/cn'
import { DeveloperWatermark } from '@/components/ui/DeveloperWatermark'
import { toStudentGoogleFormUrl } from '@/lib/utils/googleForms'

type Difficulty = 'Easy' | 'Medium' | 'Hard'
const SORT_OPTIONS = ['Newest First', 'Difficulty (Low → High)']
const DIFF_ORDER: Record<string, number> = { Easy: 0, Medium: 1, Hard: 2 }

function DifficultyPill({ difficulty, featured }: { difficulty: string; featured?: boolean }) {
  const map: Record<Difficulty, string> = {
    Easy:   'text-on-primary-fixed-variant bg-primary-fixed/30',
    Medium: 'text-on-tertiary-container bg-tertiary-fixed/30',
    Hard:   featured ? 'text-white/80 border border-white/20' : 'text-on-tertiary-container bg-tertiary-fixed/30',
  }
  return <span className={cn('text-[10px] font-bold px-2 py-1 rounded uppercase', map[difficulty as Difficulty] ?? 'bg-slate-100 text-slate-600')}>{difficulty}</span>
}

export default function ModelSetsPage() {
  const [sets,      setSets]     = useState<ModelSet[]>([])
  const [targets,   setTargets]  = useState<string[]>([])
  const [resultAvailability, setResultAvailability] = useState<Record<number, boolean>>({})
  const [loading,   setLoading]  = useState(true)
  const [error,     setError]    = useState('')
  const [activeTab, setActiveTab] = useState('All Sets')
  const [sortBy,    setSortBy]   = useState('Newest First')

  useEffect(() => {
    Promise.all([
      modelSetService.getTargets().catch(() => ({ data: [] })),
      modelSetService.getModelSets(activeTab === 'All Sets' ? 'all' : activeTab.toLowerCase())
    ]).then(([targetsRes, res]) => {
      setTargets(targetsRes.data as string[])
      const d = res.data
      setSets(Array.isArray(d) ? d : (d as { items?: ModelSet[] }).items ?? [])
    }).catch((e) => setError(e.message)).finally(() => setLoading(false))
  }, [activeTab])

  const displayed = useMemo(() => {
    let result = [...sets]
    if (sortBy === 'Difficulty (Low → High)') {
      result = result.sort((a, b) => (DIFF_ORDER[a.difficulty] ?? 1) - (DIFF_ORDER[b.difficulty] ?? 1))
    }
    return result
  }, [sets, sortBy])

  useEffect(() => {
    let cancelled = false
    if (sets.length === 0) {
      setResultAvailability({})
      return
    }

    Promise.allSettled(
      sets.map(async (set) => {
        const res = await modelSetService.getMyResult(set.id)
        return [set.id, Boolean(res.data?.has_result)] as const
      })
    ).then((items) => {
      if (cancelled) return
      const next: Record<number, boolean> = {}
      items.forEach((entry) => {
        if (entry.status !== 'fulfilled') return
        next[entry.value[0]] = entry.value[1]
      })
      setResultAvailability(next)
    })

    return () => {
      cancelled = true
    }
  }, [sets])

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">

      {/* Hero */}
      <section className="mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-on-primary-container font-bold text-sm tracking-widest uppercase mb-2 block">Brighter Nepal</span>
            <h3 className="font-headline text-4xl md:text-5xl font-extrabold text-[#1a1a4e] leading-tight">
              Mock Tests <br />& Model Sets
            </h3>
          </div>
          <div className="bg-white p-4 rounded-xl border border-outline-variant/10 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed-variant">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase">Available Sets</p>
              <p className="text-xl font-headline font-black text-[#1a1a4e]">{sets.length}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex flex-wrap gap-2 bg-surface-container-low p-1 rounded-lg">
          {['All Sets', ...targets].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={cn(
              'px-6 py-2 font-bold text-sm rounded-md transition-colors',
              activeTab === tab ? 'bg-white text-[#c0622f] shadow-sm' : 'text-slate-500 hover:text-on-surface'
            )}>
              {tab === 'All Sets' ? tab : `${tab} Focus`}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Sort:</span>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-transparent border-none text-sm font-bold text-[#1a1a4e] focus:ring-0 cursor-pointer">
            {SORT_OPTIONS.map((o) => <option key={o}>{o}</option>)}
          </select>
        </div>
      </div>

      {/* Loading / Error / Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-on-primary-container" /></div>
      ) : error ? (
        <div className="text-center py-24 text-red-500 font-medium">{error}</div>
      ) : displayed.length === 0 ? (
        <div className="text-center py-24 text-outline font-medium">No sets match this filter.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayed.map((set, idx) => {
            const isFeatured = idx === 1 // highlight second item as featured
            const studentFormsUrl = toStudentGoogleFormUrl(set.forms_view_url, set.forms_url)
            const hasResult = Boolean(resultAvailability[set.id])
            return (
              <div key={set.id} className={cn(
                'group rounded-2xl p-6 flex flex-col transition-all duration-300 relative overflow-hidden',
                isFeatured ? 'bg-[#1a1a4e] hover:shadow-[0_20px_40px_rgba(26,26,78,0.2)]'
                : 'bg-white hover:shadow-[0_12px_32px_rgba(25,28,30,0.06)]'
              )}>
                {isFeatured && (
                  <div className="absolute top-4 right-4">
                    <span className="text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest bg-on-primary-container text-white">
                      Highly Recommended
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className={cn('font-headline text-2xl font-black', isFeatured ? 'text-white' : 'text-[#1a1a4e]')}>
                      {set.title.replace(/^(SEE|Brighter\s*Nepal)\s*/i, '').slice(0, 22)}
                    </p>
                  </div>
                  <p className={cn('text-xs font-medium', isFeatured ? 'text-slate-300' : 'text-slate-500')}>
                    {set.targets.join(' · ')}
                  </p>
                </div>

                <div className="space-y-4 mb-8">
                  <div className={cn('flex items-center gap-6', isFeatured ? 'text-slate-300' : 'text-on-surface')}>
                    <span className="flex items-center gap-1.5 text-sm font-semibold"><BookCheck className="w-4 h-4" /> {set.total_questions}Q</span>
                    <span className="flex items-center gap-1.5 text-sm font-semibold"><Timer className="w-4 h-4" /> {set.duration_min}m</span>
                  </div>
                </div>

                <div className="mt-auto flex items-center justify-between gap-2">
                  <DifficultyPill difficulty={set.difficulty} featured={isFeatured} />
                  <div className="flex items-center gap-2">
                    {studentFormsUrl ? (
                      <a
                        href={studentFormsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          'font-bold px-4 py-2.5 rounded-xl active:scale-95 transition-all flex items-center gap-2 text-sm shadow-sm',
                          isFeatured ? 'bg-on-primary-container text-white hover:shadow-[0_0_20px_rgba(207,110,58,0.4)]'
                          : 'bg-on-primary-container text-white hover:opacity-90'
                        )}
                      >
                        <ExternalLink className="w-4 h-4" /> Open Form
                      </a>
                    ) : (
                      <Link
                        href={`/model-sets/${set.id}`}
                        className={cn(
                          'font-bold px-4 py-2.5 rounded-xl active:scale-95 transition-all flex items-center gap-2 text-sm shadow-sm',
                          isFeatured ? 'bg-on-primary-container text-white hover:shadow-[0_0_20px_rgba(207,110,58,0.4)]'
                          : 'bg-on-primary-container text-white hover:opacity-90'
                        )}
                      >
                        <Play className="w-4 h-4 fill-current" /> Start Exam
                      </Link>
                    )}
                    {hasResult && (
                      <Link
                        href={`/model-sets/${set.id}/results`}
                        className="font-bold px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-[#1a1a4e] active:scale-95 transition-all text-sm hover:bg-slate-50"
                      >
                        View Result
                      </Link>
                    )}
                  </div>
                </div>

                {isFeatured && (
                  <div className="absolute -bottom-10 -right-10 opacity-10 pointer-events-none text-[120px] text-white select-none">★</div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <div className="mt-16 flex flex-col items-center gap-6">
        <button className="group flex items-center gap-3 px-8 py-4 bg-white border border-outline-variant/20 rounded-full hover:bg-surface-container-low transition-colors shadow-sm">
          <span className="text-sm font-bold text-[#1a1a4e]">Load More Sets</span>
          <ChevronDown className="w-5 h-5 text-slate-400 group-hover:translate-y-1 transition-transform" />
        </button>
        <p className="text-xs text-slate-400 font-medium">Showing {displayed.length} sets</p>
      </div>

      {/* Developer Watermark */}
      <div className="mt-12 pt-8 border-t border-surface-container">
        <DeveloperWatermark variant="page" />
      </div>
    </div>
  )
}
