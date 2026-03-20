// Student Dashboard — based exactly on student_dashboard/code.html
// Bento grid: greeting + live class + test card + notices + stats
import { currentUser } from '@/lib/data/mockUsers'
import { formatDate } from '@/lib/utils/formatDate'
import { BookOpen, Video, Bell, TrendingUp, Clock, Target, Flame } from 'lucide-react'
import Link from 'next/link'

const today = new Date()

export default function StudentDashboardPage() {
  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      {/* Greeting Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-[#1a1a4e] px-8 md:px-12 py-10 mb-10 text-white">
        {/* Decorative glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] right-[-5%] w-64 h-64 rounded-full bg-on-primary-container opacity-15 blur-3xl" />
          <div className="absolute bottom-[-20%] left-[10%] w-48 h-48 rounded-full bg-[#2d6a6a] opacity-20 blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-slate-400 text-sm font-semibold mb-1">
              {formatDate(today, 'EEEE, MMMM d, yyyy')}
            </p>
            <h1 className="font-headline font-black text-3xl md:text-4xl mb-2">
              Good morning, {currentUser.name.split(' ')[0]}! 👋
            </h1>
            <p className="text-slate-300 text-base max-w-xl">
              You&apos;re ranked <span className="text-on-primary-container font-bold">#{currentUser.rank}</span> among all students.
              Keep it up — you&apos;re in the top 5%!
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="flex items-center gap-1.5 justify-center text-on-primary-container mb-1">
                <Flame className="w-5 h-5" />
                <span className="font-headline font-black text-2xl">{currentUser.streak}</span>
              </div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Day Streak</p>
            </div>
            <div className="text-center">
              <p className="font-headline font-black text-2xl text-tertiary-fixed mb-1">{currentUser.studyHours}h</p>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">This Month</p>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Live Class Card */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="relative h-56 bg-slate-900 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a4e]/60 to-[#2d6a6a]/40" />
            {/* Play button */}
            <div className="relative z-10 w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 hover:bg-on-primary-container transition-colors cursor-pointer group">
              <svg className="w-7 h-7 text-white fill-white" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </div>
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-error pulse-red" />
              <span className="text-white text-[10px] font-black tracking-widest uppercase">LIVE</span>
              <span className="text-white/80 text-[10px] font-medium">• 2.4k Watching</span>
            </div>
          </div>
          <div className="p-6 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-on-primary-container" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mathematics • Calculus</span>
              </div>
              <h3 className="font-headline font-bold text-xl text-[#1a1a4e] mb-1">Advanced Calculus II: Integral Foundations</h3>
              <p className="text-slate-500 text-sm">Dr. Sameer Adhikari • Senior Academic Curator</p>
            </div>
            <Link
              href="/live-classes/class-01"
              className="flex-shrink-0 bg-[#c0622f] text-white font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-[#a14f24] active:scale-95 transition-all shadow-lg shadow-[#c0622f]/20"
            >
              Join Now
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex flex-col gap-6">
          {/* Model Set Card */}
          <div className="bg-white rounded-2xl shadow-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-on-primary-container/10 flex items-center justify-center">
                  <Target className="w-5 h-5 text-on-primary-container" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Next Test</p>
                  <p className="font-bold text-[#1a1a4e] text-sm">IOE Mock Set #05</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Starts In</p>
                <p className="font-headline font-black text-[#c0622f]">02:30:00</p>
              </div>
            </div>
            <Link
              href="/model-sets/ioe-model-05"
              className="w-full bg-[#1a1a4e] text-white text-sm font-bold py-3 rounded-xl text-center block hover:bg-[#141432] active:scale-95 transition-all"
            >
              Start Now
            </Link>
          </div>

          {/* Study stats */}
          <div className="bg-white rounded-2xl shadow-card p-6">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">Your Performance</p>
            <div className="space-y-4">
              {[
                { label: 'Physics', score: 72, color: 'bg-[#1a1a4e]' },
                { label: 'Chemistry', score: 88, color: 'bg-[#2d6a6a]' },
                { label: 'Mathematics', score: 75, color: 'bg-on-primary-container' },
              ].map((s) => (
                <div key={s.label}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-bold text-on-surface-variant">{s.label}</span>
                    <span className="text-xs font-bold text-[#1a1a4e]">{s.score}%</span>
                  </div>
                  <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                    <div className={`h-full ${s.color} rounded-full transition-all duration-700`} style={{ width: `${s.score}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Notices */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-headline font-bold text-lg text-[#1a1a4e]">Latest Notices</h3>
            <Link href="/notices" className="text-on-primary-container text-xs font-bold hover:underline">View All</Link>
          </div>
          <div className="space-y-4">
            {[
              { title: 'Board Exam Schedule Released', type: 'urgent', time: '2h ago', dot: true },
              { title: 'Scholarship Orientation — May 15', type: 'important', time: '1d ago', dot: false },
              { title: 'Library Extended Hours', type: 'general', time: '2d ago', dot: true },
            ].map((notice, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${notice.type === 'urgent' ? 'bg-error' : notice.type === 'important' ? 'bg-[#c0622f]' : 'bg-slate-300'}`} />
                <div className="flex-1">
                  <p className="text-sm font-bold text-[#1a1a4e] leading-snug">{notice.title}</p>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{notice.time}</p>
                </div>
                {notice.dot && <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] flex-shrink-0 mt-1" />}
              </div>
            ))}
          </div>
        </div>

        {/* Resources quick access */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-headline font-bold text-lg text-[#1a1a4e]">Recent Resources</h3>
            <Link href="/resources" className="text-on-primary-container text-xs font-bold hover:underline">Browse All</Link>
          </div>
          <div className="space-y-3">
            {[
              { title: 'Aliphatic Compounds Notes', format: 'PDF', color: 'bg-red-100 text-red-600', size: '12.4 MB' },
              { title: 'Rotational Dynamics', format: 'Video', color: 'bg-blue-100 text-blue-600', size: '14:22' },
              { title: 'Integration Formulas', format: 'PDF', color: 'bg-red-100 text-red-600', size: '5.8 MB' },
            ].map((r, i) => (
              <div key={i} className="flex items-center gap-3 group cursor-pointer">
                <div className={`flex-shrink-0 px-2 py-1 rounded text-[10px] font-black uppercase ${r.color}`}>
                  {r.format}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#1a1a4e] truncate group-hover:text-on-primary-container transition-colors">{r.title}</p>
                  <p className="text-[10px] text-slate-400 font-medium">{r.size}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly test stat */}
        <div className="bg-gradient-to-br from-[#1a1a4e] to-[#2d6a6a] rounded-2xl p-6 text-white">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Last Weekly Test</p>
          <div className="text-center py-4">
            <p className="font-headline font-black text-6xl text-white mb-1">85</p>
            <p className="text-slate-400 text-sm font-semibold">out of 100</p>
          </div>
          <div className="flex justify-between mt-6 text-sm">
            <div className="text-center">
              <p className="font-black text-tertiary-fixed">22</p>
              <p className="text-slate-400 text-[10px] uppercase tracking-wider">Correct</p>
            </div>
            <div className="text-center">
              <p className="font-black text-error">5</p>
              <p className="text-slate-400 text-[10px] uppercase tracking-wider">Wrong</p>
            </div>
            <div className="text-center">
              <p className="font-black text-slate-300">3</p>
              <p className="text-slate-400 text-[10px] uppercase tracking-wider">Skipped</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
