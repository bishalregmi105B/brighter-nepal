// Student Weekly Tests — based exactly on weekly_tests_list/code.html
// Live banner with countdown + grouped assessment history + support CTA
import Link from 'next/link'
import { Users, TrendingUp, BarChart2, ChevronRight, Loader2, Zap, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

// ─── Data ────────────────────────────────────────────────────────────────────

type TestStatus = 'open' | 'result-released' | 'completed' | 'pending'

interface TestHistoryCard {
  date:    string
  rank?:   string
  title:   string
  score?:  string
  status:  TestStatus
}

interface TestGroup {
  month: string
  tests: TestHistoryCard[]
  variant: 'featured' | 'grid'
}

const testHistory: TestGroup[] = [
  {
    month:   'October 2023',
    variant: 'featured',
    tests:   [
      {
        date:   'Oct 15',
        title:  'Advanced Mathematics: Calculus II',
        status: 'open',
      },
      {
        date:   'Oct 12',
        rank:   'Rank: 12',
        title:  'Modern History & Geopolitics',
        score:  '88%',
        status: 'result-released',
      },
    ],
  },
  {
    month:   'September 2023',
    variant: 'grid',
    tests:   [
      { date: 'Sept 28', rank: 'Rank: 42', title: 'Organic Chemistry Foundations', score: '74%', status: 'completed' },
      { date: 'Sept 21', rank: 'Awaiting Result', title: 'World Literature: The Classics', status: 'pending' },
      { date: 'Sept 14', rank: 'Rank: 05', title: 'Economics & Public Policy', score: '92%', status: 'completed' },
    ],
  },
]

// Bar chart heights for the performance mini-chart (result-released card)
const chartBars = [12, 20, 24, 16, 32, 28]

// ─── Sub-components ──────────────────────────────────────────────────────────

function CountdownBlock() {
  return (
    <div className="relative z-10 bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] text-center min-w-[280px]">
      <p className="text-on-primary-container font-bold text-sm uppercase mb-4 tracking-widest">Starts In</p>
      <div className="flex justify-center items-center gap-3">
        {[{ val: '02', label: 'Hours' }, { val: '45', label: 'Mins' }, { val: '12', label: 'Secs' }].map((t, i) => (
          <div key={t.label} className="flex items-center gap-3">
            {i > 0 && <span className="text-4xl font-headline font-black opacity-30">:</span>}
            <div className="text-center">
              <span className="block text-4xl font-headline font-black">{t.val}</span>
              <span className="text-[10px] uppercase font-bold opacity-60">{t.label}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-center gap-3">
        <Users className="w-5 h-5 text-on-primary-container" />
        <span className="text-sm font-medium">1,248 students registered</span>
      </div>
    </div>
  )
}

function OpenTestCard({ test }: { test: TestHistoryCard }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-on-primary-container/10 shadow-[0_8px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between group hover:shadow-xl transition-all">
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-on-primary-container/10 text-on-primary-container text-[10px] font-bold uppercase mb-3">
            <Zap className="w-3.5 h-3.5" /> Open Now
          </div>
          <h4 className="text-xl font-headline font-bold text-on-surface">{test.title}</h4>
          <p className="text-sm text-outline mt-1">Time Limit: 60 Mins • 40 Questions</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center text-on-primary-container flex-shrink-0">
          <span className="text-2xl font-headline font-black">∑</span>
        </div>
      </div>
      <div className="flex items-center justify-between pt-6 border-t border-surface-container mt-auto">
        <div className="w-8 h-8 rounded-full bg-surface-container-high border-2 border-white flex items-center justify-center text-[10px] font-bold">
          +12k
        </div>
        <Link
          href="/weekly-tests/wt-calculus"
          className="bg-on-primary-container text-white px-6 py-2 rounded-lg font-bold text-sm shadow-md group-hover:px-8 transition-all"
        >
          Start Test
        </Link>
      </div>
    </div>
  )
}

function ResultReleasedCard({ test }: { test: TestHistoryCard }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-[0_8px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between border border-transparent hover:border-on-tertiary-container/20 transition-all">
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-on-tertiary-container/10 text-on-tertiary-container text-[10px] font-bold uppercase mb-3">
            <CheckCircle2 className="w-3.5 h-3.5" /> Result Released
          </div>
          <h4 className="text-xl font-headline font-bold text-on-surface">{test.title}</h4>
          <p className="text-sm text-outline mt-1">Completed: {test.date}, 2023</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-headline font-black text-on-tertiary-container">{test.score}</div>
          <p className="text-[10px] uppercase font-bold text-outline">Score</p>
        </div>
      </div>
      <div className="flex items-center justify-between pt-6 border-t border-surface-container">
        <div className="flex-1">
          <p className="text-[10px] uppercase font-bold text-outline mb-2">Performance Trend</p>
          <div className="h-8 flex items-end gap-1">
            {chartBars.map((h, i) => (
              <div
                key={i}
                className={cn('w-2 rounded-full', i >= 3 ? 'bg-on-tertiary-container' : 'bg-surface-container-high')}
                style={{ height: `${h}px` }}
              />
            ))}
          </div>
        </div>
        <button className="text-on-secondary-fixed font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">
          Review Answers <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

function SmallTestCard({ test }: { test: TestHistoryCard }) {
  const rankColor = test.status === 'pending'
    ? 'bg-secondary-fixed/50 text-secondary-fixed-dim'
    : 'bg-on-tertiary-container/10 text-on-tertiary-container'

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-transparent hover:border-surface-container-highest transition-all">
      <div className="flex justify-between mb-4">
        <span className="text-[10px] font-bold text-outline uppercase">{test.date}</span>
        {test.rank && (
          <span className={cn('text-[10px] font-bold uppercase px-2 py-0.5 rounded', rankColor)}>
            {test.rank}
          </span>
        )}
      </div>
      <h5 className="font-headline font-bold text-on-surface mb-6">{test.title}</h5>
      <div className="flex items-center justify-between border-t border-surface-container-low pt-4">
        {test.status === 'pending' ? (
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 text-secondary animate-spin" />
            <span className="text-xs font-medium text-outline">In Grading...</span>
          </div>
        ) : (
          <>
            <div className={cn(
              'text-xl font-headline font-black',
              test.rank === 'Rank: 05' ? 'text-on-tertiary-container' : 'text-on-surface/40'
            )}>
              {test.score}
            </div>
            <button className="p-2 rounded-full hover:bg-surface-container-low transition-colors">
              <BarChart2 className="w-5 h-5 text-outline" />
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function WeeklyTestsPage() {
  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-12">

      {/* ── Live Test Banner ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl bg-on-secondary-fixed text-white p-8 md:p-12 shadow-2xl flex flex-col md:flex-row items-center gap-10">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-on-primary-container/20 to-transparent pointer-events-none" />

        <div className="relative z-10 flex-1 space-y-6">
          <div className="inline-flex items-center gap-2 bg-on-primary-container px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            Next Live Assessment
          </div>
          <h1 className="text-4xl md:text-5xl font-headline font-extrabold tracking-tighter leading-tight">
            Science &amp; Technology <br />
            <span className="text-on-primary-container">Mid-Term Mock 04</span>
          </h1>
          <p className="text-lg opacity-80 max-w-lg font-body font-light">
            This test covers Genetics, Thermodynamics, and Space Exploration.
            Results will contribute to your national ranking.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <button className="bg-on-primary-container text-white px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-lg shadow-on-primary-container/20">
              Join Waiting Room
            </button>
            <button className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/20 transition-all">
              Review Syllabus
            </button>
          </div>
        </div>

        <CountdownBlock />
      </section>

      {/* ── Assessment History ───────────────────────────────────────────── */}
      <section className="space-y-10">
        <div className="flex items-end justify-between border-b border-surface-container-highest pb-6">
          <div>
            <h3 className="text-3xl font-headline font-extrabold text-[#1a1a4e]">Assessment History</h3>
            <p className="text-outline font-medium mt-1">Track your progress and performance trends</p>
          </div>
          <div className="flex gap-2">
            <button className="bg-surface-container-low px-4 py-2 rounded-lg text-sm font-bold text-on-surface-variant hover:bg-surface-container transition-colors">
              Filter
            </button>
            <button className="bg-surface-container-low px-4 py-2 rounded-lg text-sm font-bold text-on-surface-variant hover:bg-surface-container transition-colors">
              Export All
            </button>
          </div>
        </div>

        {testHistory.map((group) => (
          <div key={group.month} className="space-y-6">
            {/* Month divider */}
            <div className="flex items-center gap-4">
              <span className={cn(
                'text-xs font-black uppercase tracking-[0.2em]',
                group.month.startsWith('October') ? 'text-[#c0622f]' : 'text-outline'
              )}>
                {group.month}
              </span>
              <div className="h-px flex-1 bg-surface-container-high" />
            </div>

            {/* Cards */}
            {group.variant === 'featured' ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {group.tests.map((test) =>
                  test.status === 'open'
                    ? <OpenTestCard       key={test.title} test={test} />
                    : <ResultReleasedCard key={test.title} test={test} />
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {group.tests.map((test) => (
                  <SmallTestCard key={test.title} test={test} />
                ))}
              </div>
            )}
          </div>
        ))}
      </section>

      {/* ── Support CTA ──────────────────────────────────────────────────── */}
      <section className="bg-surface-container rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 border border-white">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-inner flex-shrink-0">
            <TrendingUp className="w-8 h-8 text-on-primary-container" />
          </div>
          <div>
            <h4 className="text-xl font-headline font-bold text-on-surface">Technical issues during a test?</h4>
            <p className="text-sm text-outline font-medium">Our academic curators are available 24/7 for exam support.</p>
          </div>
        </div>
        <button className="bg-on-secondary-fixed text-white px-10 py-3 rounded-xl font-bold hover:bg-secondary transition-all flex-shrink-0">
          Support Desk
        </button>
      </section>
    </div>
  )
}
