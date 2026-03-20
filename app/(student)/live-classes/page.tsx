// Student Live Classes List — browse and join upcoming/ongoing live classes
import Link from 'next/link'
import { Video, Clock, Users, Play, CalendarDays, Lock } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

type LiveClassStatus = 'live' | 'upcoming' | 'completed' | 'locked'

interface LiveClass {
  id:        string
  subject:   string
  title:     string
  teacher:   string
  time:      string
  watchers?: number
  status:    LiveClassStatus
  duration?: string
}

const classes: LiveClass[] = [
  { id: 'lc-01', subject: 'Mathematics', title: 'Advanced Calculus II: Integral Foundations', teacher: 'Dr. Sameer Adhikari',     time: 'Live Now',       watchers: 2400, status: 'live'      },
  { id: 'lc-02', subject: 'Physics',     title: 'Electromagnetic Induction & Faraday\'s Law', teacher: 'Dr. Hemant K.C.',        time: 'Today, 4:00 PM', watchers: 0,    status: 'upcoming'  },
  { id: 'lc-03', subject: 'Chemistry',   title: 'Organic Chemistry: Aliphatic Compounds',    teacher: 'Prof. Sita Sharma',      time: 'Today, 6:30 PM', watchers: 0,    status: 'upcoming'  },
  { id: 'lc-04', subject: 'Biology',     title: 'Cellular Respiration & Energy Metabolism',   teacher: 'Dr. Ram Prasad Thapa',  time: 'Oct 24, 8:00 PM',watchers: 0,    status: 'locked'    },
  { id: 'lc-05', subject: 'Mathematics', title: 'Differential Equations: Theory & Practice',  teacher: 'Dr. Sameer Adhikari',   time: 'Oct 12',         duration: '1h 42m', status: 'completed' },
  { id: 'lc-06', subject: 'Physics',     title: 'Optics: Light Reflection & Refraction',      teacher: 'Dr. Hemant K.C.',       time: 'Oct 10',         duration: '2h 05m', status: 'completed' },
]

const subjectColors: Record<string, string> = {
  Mathematics: 'bg-primary-fixed text-on-primary-fixed-variant',
  Physics:     'bg-tertiary-fixed text-on-tertiary-fixed-variant',
  Chemistry:   'bg-secondary-fixed text-on-secondary-fixed-variant',
  Biology:     'bg-surface-container-high text-on-surface-variant',
}

export default function LiveClassesPage() {
  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10">

      {/* Hero */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-on-primary-container font-bold text-sm tracking-widest uppercase mb-2 block">Interactive Learning</span>
          <h1 className="font-headline text-4xl md:text-5xl font-extrabold text-[#1a1a4e] leading-tight">
            Live Classes
          </h1>
          <p className="text-slate-500 mt-2 max-w-xl">
            Join expert-led sessions in real time. Ask questions, follow along, and master your syllabus.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white p-3 rounded-xl shadow-sm border border-outline-variant/10">
          <div className="w-2.5 h-2.5 rounded-full bg-error animate-pulse" />
          <span className="text-sm font-bold text-[#1a1a4e]">1 Live Now</span>
          <span className="text-xs text-slate-400 font-medium">2.4k watching</span>
        </div>
      </div>

      {/* Today's Classes */}
      <section className="space-y-4">
        <h2 className="text-xl font-headline font-bold text-[#1a1a4e] flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-on-primary-container" /> Today&apos;s Sessions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {classes.filter((c) => c.status !== 'completed').map((cls) => (
            <div
              key={cls.id}
              className={cn(
                'bg-white rounded-2xl overflow-hidden shadow-[0_8px_20px_rgba(25,28,30,0.04)] flex flex-col transition-all duration-300',
                cls.status === 'live' ? 'ring-2 ring-on-primary-container/30' : 'hover:shadow-xl'
              )}
            >
              {/* Thumbnail */}
              <div className={cn(
                'h-32 relative flex items-center justify-center',
                cls.status === 'live'     ? 'bg-[#1a1a4e]'
                : cls.status === 'locked' ? 'bg-surface-container-high'
                : 'bg-gradient-to-br from-[#1a1a4e]/80 to-[#2d6a6a]/60'
              )}>
                {cls.status === 'live' && (
                  <>
                    <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                      <Play className="w-7 h-7 text-white fill-white" />
                    </div>
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-error/90 px-2.5 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      <span className="text-white text-[10px] font-black tracking-widest">LIVE</span>
                    </div>
                    {(cls.watchers ?? 0) > 0 && (
                      <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/50 px-2 py-1 rounded-full">
                        <Users className="w-3 h-3 text-white" />
                        <span className="text-white text-[10px] font-medium">{((cls.watchers ?? 0) / 1000).toFixed(1)}k</span>
                      </div>
                    )}
                  </>
                )}
                {cls.status === 'locked' && (
                  <Lock className="w-10 h-10 text-slate-400" />
                )}
                {cls.status === 'upcoming' && (
                  <Video className="w-10 h-10 text-white/40" />
                )}
              </div>

              {/* Info */}
              <div className="p-5 flex flex-col flex-1">
                <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded inline-block w-fit mb-3', subjectColors[cls.subject] ?? 'bg-surface-container text-on-surface')}>
                  {cls.subject}
                </span>
                <h3 className="font-headline font-bold text-[#1a1a4e] leading-snug mb-1">{cls.title}</h3>
                <p className="text-xs text-slate-500 mb-4">{cls.teacher}</p>

                <div className="mt-auto flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-outline">
                    <Clock className="w-3.5 h-3.5" /> {cls.time}
                  </span>
                  {cls.status === 'live' ? (
                    <Link
                      href={`/live-classes/${cls.id}`}
                      className="bg-[#c0622f] text-white text-sm font-bold px-5 py-2 rounded-xl hover:bg-[#a14f24] active:scale-95 transition-all"
                    >
                      Join Now
                    </Link>
                  ) : cls.status === 'upcoming' ? (
                    <button className="text-on-primary-container text-sm font-bold border border-on-primary-container/20 px-5 py-2 rounded-xl hover:bg-on-primary-container/5 transition-colors">
                      Set Reminder
                    </button>
                  ) : (
                    <button className="text-slate-400 text-sm font-bold px-5 py-2 rounded-xl border border-slate-200/50 cursor-not-allowed opacity-60">
                      Locked
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Past Classes */}
      <section className="space-y-4">
        <h2 className="text-xl font-headline font-bold text-[#1a1a4e]">Past Recordings</h2>
        <div className="space-y-3">
          {classes.filter((c) => c.status === 'completed').map((cls) => (
            <div key={cls.id} className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-4 hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center flex-shrink-0">
                <Video className="w-5 h-5 text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-on-surface truncate">{cls.title}</p>
                <p className="text-xs text-slate-500">{cls.teacher} · {cls.time} · {cls.duration}</p>
              </div>
              <span className={cn('text-[10px] font-bold px-2 py-1 rounded flex-shrink-0', subjectColors[cls.subject])}>
                {cls.subject}
              </span>
              <Link href={`/live-classes/${cls.id}`} className="text-on-primary-container font-bold text-sm flex-shrink-0 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <Play className="w-4 h-4 fill-current" /> Replay
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
