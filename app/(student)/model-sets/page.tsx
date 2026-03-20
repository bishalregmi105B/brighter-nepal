'use client'
// Student Model Sets List — interactive filter tabs + sort
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Target, ChevronDown, Play, Eye, Lock, Timer, BookCheck } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

type CardState  = 'in-progress' | 'featured' | 'completed' | 'available' | 'locked'
type Difficulty = 'Easy' | 'Medium' | 'Hard'

interface ModelSet {
  id:           string
  number:       string
  subtitle:     string
  tags:         string[]
  questions:    number
  duration:     string
  difficulty:   Difficulty
  state:        CardState
  progress?:    number
  score?:       string
  reviewCount?: string
  rankLabel?:   string
  badge?:       string
  description?: string
}

const modelSets: ModelSet[] = [
  { id: 'ioe-042', number: 'Set 042', subtitle: 'Last attempted: 2 hours ago',              tags: ['IOE', 'Physics', 'Chemistry', 'Math'], questions: 100, duration: '2hrs', difficulty: 'Medium', state: 'in-progress', progress: 45, badge: 'In Progress' },
  { id: 'ioe-043', number: 'Set 043', subtitle: 'Pulchowk Entrance Mock 2024',              tags: ['IOE', 'Full Syllabus', 'English'],    questions: 100, duration: '2hrs', difficulty: 'Hard',   state: 'featured',    badge: 'Highly Recommended', description: 'Simulates the real pressure of the IOE entrance exam with adaptive difficulty.' },
  { id: 'ioe-041', number: 'Set 041', subtitle: 'Completed on Oct 12, 2023',               tags: ['IOE', 'Botany', 'Zoology', 'Chem'],   questions: 100, duration: '2hrs', difficulty: 'Easy',   state: 'completed',   score: '82/100', reviewCount: '2x', rankLabel: 'Top 5%' },
  { id: 'ioe-044', number: 'Set 044', subtitle: 'Focused on Thermodynamics & Optics',      tags: ['IOE', 'Physics Special'],             questions: 50,  duration: '1hr',  difficulty: 'Medium', state: 'available' },
  { id: 'iom-045', number: 'Set 045', subtitle: 'Biological Sciences Specialization',      tags: ['IOM', 'Botany', 'Zoology'],           questions: 100, duration: '2hrs', difficulty: 'Medium', state: 'available' },
  { id: 'ioe-046', number: 'Set 046', subtitle: 'Advanced Mathematics Module',             tags: ['IOE'],                                questions: 100, duration: '2hrs', difficulty: 'Hard',   state: 'locked' },
]

const FILTER_TABS  = ['All Sets', 'IOE Focus', 'IOM Focus', 'CSIT']
const SORT_OPTIONS = ['Newest First', 'Difficulty (Low → High)', 'Recommended']
const TAB_TAG: Record<string, string> = { 'IOE Focus': 'IOE', 'IOM Focus': 'IOM', 'CSIT': 'CSIT' }
const DIFF_ORDER: Record<Difficulty, number> = { Easy: 0, Medium: 1, Hard: 2 }

function DifficultyPill({ difficulty, featured }: { difficulty: Difficulty; featured?: boolean }) {
  const map: Record<Difficulty, string> = {
    Easy:   'text-on-primary-fixed-variant bg-primary-fixed/30',
    Medium: 'text-on-tertiary-container bg-tertiary-fixed/30',
    Hard:   featured ? 'text-white/80 border border-white/20' : 'text-on-tertiary-container bg-tertiary-fixed/30',
  }
  return <span className={cn('text-[10px] font-bold px-2 py-1 rounded uppercase', map[difficulty])}>{difficulty}</span>
}

export default function ModelSetsPage() {
  const [activeTab, setActiveTab] = useState('All Sets')
  const [sortBy,    setSortBy]    = useState('Newest First')

  const displayed = useMemo(() => {
    let sets = [...modelSets]
    if (activeTab !== 'All Sets') {
      const tagKey = TAB_TAG[activeTab]
      if (tagKey) sets = sets.filter((s) => s.tags.includes(tagKey))
    }
    if (sortBy === 'Difficulty (Low → High)') {
      sets = [...sets].sort((a, b) => DIFF_ORDER[a.difficulty] - DIFF_ORDER[b.difficulty])
    }
    return sets
  }, [activeTab, sortBy])

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">

      {/* Hero */}
      <section className="mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-on-primary-container font-bold text-sm tracking-widest uppercase mb-2 block">Exam Preparation</span>
            <h3 className="font-headline text-4xl md:text-5xl font-extrabold text-[#1a1a4e] leading-tight">
              Master the Entrance <br />with Curated Mock Sets.
            </h3>
          </div>
          <div className="bg-white p-4 rounded-xl border border-outline-variant/10 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed-variant">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase">Current Accuracy</p>
              <p className="text-xl font-headline font-black text-[#1a1a4e]">78.4%</p>
            </div>
          </div>
        </div>
      </section>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex bg-surface-container-low p-1 rounded-lg">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-6 py-2 font-bold text-sm rounded-md transition-colors',
                activeTab === tab ? 'bg-white text-[#c0622f] shadow-sm' : 'text-slate-500 hover:text-on-surface'
              )}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-transparent border-none text-sm font-bold text-[#1a1a4e] focus:ring-0 cursor-pointer"
          >
            {SORT_OPTIONS.map((o) => <option key={o}>{o}</option>)}
          </select>
        </div>
      </div>

      {/* Card grid */}
      {displayed.length === 0 ? (
        <div className="text-center py-24 text-outline font-medium">No sets match this filter.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayed.map((set) => {
            const isFeatured = set.state === 'featured'
            const isLocked   = set.state === 'locked'

            return (
              <div
                key={set.id}
                className={cn(
                  'group rounded-2xl p-6 flex flex-col transition-all duration-300 relative overflow-hidden',
                  isFeatured ? 'bg-[#1a1a4e] hover:shadow-[0_20px_40px_rgba(26,26,78,0.2)]'
                  : isLocked  ? 'bg-surface-container'
                  : 'bg-white hover:shadow-[0_12px_32px_rgba(25,28,30,0.06)]'
                )}
              >
                {/* Badge */}
                {set.badge && (
                  <div className="absolute top-4 right-4">
                    <span className={cn(
                      'text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest',
                      set.state === 'in-progress' ? 'bg-secondary-fixed text-on-secondary-fixed' : 'bg-on-primary-container text-white'
                    )}>
                      {set.badge}
                    </span>
                  </div>
                )}

                {/* Locked overlay */}
                {isLocked && (
                  <div className="absolute inset-0 bg-slate-100/40 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center text-center p-6">
                    <Lock className="w-10 h-10 text-slate-400 mb-3" />
                    <p className="font-bold text-[#1a1a4e] text-sm">Premium Set</p>
                    <p className="text-[10px] text-slate-500 mt-1">Upgrade to Pro to unlock 200+ exclusive mock exams.</p>
                    <button className="mt-4 px-4 py-2 bg-[#1a1a4e] text-white text-xs font-bold rounded-lg active:scale-95 transition-transform">Unlock Now</button>
                  </div>
                )}

                {/* Set number + subtitle */}
                <div className={cn('mb-6', isLocked && 'opacity-30')}>
                  <div className="flex items-center justify-between mb-2">
                    <p className={cn('font-headline text-3xl font-black', isFeatured ? 'text-white' : 'text-[#1a1a4e]')}>{set.number}</p>
                    {set.score && <span className="text-on-tertiary-container font-bold text-xs">Score: {set.score}</span>}
                  </div>
                  <p className={cn('text-xs font-medium', isFeatured ? 'text-slate-300' : 'text-slate-500')}>{set.subtitle}</p>
                </div>

                {/* Tags + meta */}
                <div className={cn('space-y-4 mb-8', isLocked && 'opacity-30')}>
                  {set.tags.filter((t) => !['IOE', 'IOM', 'CSIT'].includes(t)).length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {set.tags.filter((t) => !['IOE', 'IOM', 'CSIT'].includes(t)).map((tag) => (
                        <span key={tag} className={cn('text-[10px] font-bold px-3 py-1 rounded-md', isFeatured ? 'bg-white/10 text-white' : 'bg-surface-container-low text-slate-600')}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className={cn('flex items-center gap-6', isFeatured ? 'text-slate-300' : 'text-on-surface')}>
                    <span className="flex items-center gap-1.5 text-sm font-semibold"><BookCheck className="w-4 h-4" /> {set.questions}Q</span>
                    <span className="flex items-center gap-1.5 text-sm font-semibold"><Timer className="w-4 h-4" /> {set.duration}</span>
                    {set.reviewCount && <span className="text-sm font-semibold">Reviewed {set.reviewCount}</span>}
                    {set.rankLabel  && <span className="text-sm font-semibold text-on-tertiary-container">{set.rankLabel}</span>}
                  </div>

                  {set.state === 'in-progress' && set.progress !== undefined && (
                    <div className="w-full bg-surface-container-low h-1.5 rounded-full overflow-hidden">
                      <div className="bg-secondary-fixed-dim h-full rounded-full transition-all" style={{ width: `${set.progress}%` }} />
                    </div>
                  )}
                  {set.description && <p className="text-xs text-white/60 leading-relaxed">{set.description}</p>}
                </div>

                {/* CTA */}
                {!isLocked && (
                  <div className="mt-auto flex items-center justify-between">
                    <DifficultyPill difficulty={set.difficulty} featured={isFeatured} />
                    <Link
                      href={`/model-sets/${set.id}`}
                      className={cn(
                        'font-bold px-6 py-2.5 rounded-xl active:scale-95 transition-all flex items-center gap-2 text-sm shadow-sm',
                        set.state === 'completed'   ? 'bg-tertiary-fixed text-on-tertiary-fixed hover:bg-tertiary-fixed-dim'
                        : set.state === 'in-progress' ? 'bg-secondary text-white hover:opacity-90'
                        : isFeatured                  ? 'bg-on-primary-container text-white hover:shadow-[0_0_20px_rgba(207,110,58,0.4)]'
                        : 'bg-on-primary-container text-white hover:opacity-90'
                      )}
                    >
                      {set.state === 'completed'   && <Eye  className="w-4 h-4" />}
                      {set.state === 'in-progress' && <Play className="w-4 h-4 fill-current" />}
                      {set.state === 'completed' ? 'Review' : set.state === 'in-progress' ? 'Resume' : 'Start Exam'}
                    </Link>
                  </div>
                )}

                {isFeatured && (
                  <div className="absolute -bottom-10 -right-10 opacity-10 pointer-events-none text-[120px] text-white select-none">★</div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Load more */}
      <div className="mt-16 flex flex-col items-center gap-6">
        <button className="group flex items-center gap-3 px-8 py-4 bg-white border border-outline-variant/20 rounded-full hover:bg-surface-container-low transition-colors shadow-sm">
          <span className="text-sm font-bold text-[#1a1a4e]">Load More Sets</span>
          <ChevronDown className="w-5 h-5 text-slate-400 group-hover:translate-y-1 transition-transform" />
        </button>
        <p className="text-xs text-slate-400 font-medium">Showing {displayed.length} of 124 available sets</p>
      </div>
    </div>
  )
}
