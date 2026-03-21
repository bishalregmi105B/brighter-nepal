'use client'
/**
 * Recorded Lecture Video Player Page — /recorded-lectures/[id]
 * Fetches the completed live class by ID and renders a full video player UI.
 * Since live classes don't have actual video URLs in the DB, we show a
 * YouTube-style embedded player placeholder + lecture metadata.
 */
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, Calendar, Users, BookOpen } from 'lucide-react'
import { liveClassService, type LiveClass } from '@/services/liveClassService'
import { cn } from '@/lib/utils/cn'
import { SecureVideoPlayer } from '@/components/media/SecureVideoPlayer'

const subjectColors: Record<string, string> = {
  Mathematics: 'bg-blue-100 text-blue-700',
  Physics:     'bg-teal-100 text-teal-700',
  Chemistry:   'bg-purple-100 text-purple-700',
  Biology:     'bg-green-100 text-green-700',
  English:     'bg-orange-100 text-orange-700',
}

export default function RecordedLectureVideoPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [lecture, setLecture] = useState<LiveClass | null>(null)
  const [loading, setLoading] = useState(true)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    if (!params.id) return
    liveClassService.getClass(Number(params.id))
      .then((res) => setLecture(res.data))
      .catch(() => setLecture(null))
      .finally(() => setLoading(false))
  }, [params.id])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-4 border-on-primary-container border-t-transparent animate-spin" />
    </div>
  )

  if (!lecture) return (
    <div className="p-10 text-center">
      <p className="text-red-500 font-medium mb-4">Lecture not found.</p>
      <Link href="/recorded-lectures" className="text-on-primary-container font-bold hover:underline">← Back to Recorded Lectures</Link>
    </div>
  )

  const badgeClass = subjectColors[lecture.subject] ?? 'bg-slate-100 text-slate-600'
  const scheduledDate = lecture.scheduled_at
    ? new Date(lecture.scheduled_at).toLocaleDateString('en-NP', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—'

  return (
    <div className="h-screen bg-[#0d0d1a] overflow-y-auto custom-scrollbar flex flex-col">
      {/* Top Bar */}
      <div className="h-16 md:h-[72px] px-4 flex items-center justify-between border-b border-surface-container/10 bg-[#0d0d2b] flex-shrink-0 z-20 sticky top-0">
        <div className="flex items-center gap-4">
          <Link href="/recorded-lectures" className="text-white/70 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="flex items-center gap-1.5 bg-tertiary/20 px-2.5 py-1 rounded-full">
            <BookOpen className="w-3 h-3 text-tertiary" />
            <span className="text-tertiary text-[10px] font-black tracking-widest uppercase">Recorded</span>
          </span>
          <div>
            <p className="font-headline font-bold text-white text-sm truncate max-w-[200px] md:max-w-md">{lecture.title}</p>
            <p className="text-white/50 text-[10px]">{lecture.teacher} · {lecture.subject}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-white/60">
          <Users className="w-4 h-4" />
          <span className="text-sm font-medium hidden sm:inline">{(lecture.watchers ?? 0).toLocaleString()} views</span>
        </div>
      </div>

      {/* Video Content Area */}
      <div className="w-full max-w-6xl mx-auto flex flex-col flex-1">
        {playing ? (
          <div className="w-full aspect-video bg-black flex items-center justify-center relative flex-shrink-0 border-b border-white/5 shadow-2xl">
            <SecureVideoPlayer 
              videoUrl={lecture.stream_url ?? 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'} 
              title={lecture.title}
              className="w-full h-full rounded-none" 
            />
          </div>
        ) : (
          <div className="w-full aspect-video bg-black flex items-center justify-center relative flex-shrink-0 border-b border-white/5 shadow-2xl group cursor-pointer" onClick={() => setPlaying(true)}>
            <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a4e]/80 to-[#0d0d2b]/95 z-0" />
            <div className="z-10 flex flex-col items-center justify-center text-white">
              <div className="mb-6 w-20 h-20 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md group-hover:scale-110 group-hover:bg-white/20 transition-all border border-white/20">
                <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-white border-b-[10px] border-b-transparent ml-1" />
              </div>
              <h2 className="font-headline font-bold text-2xl text-center px-8 mb-2 drop-shadow-lg">{lecture.title}</h2>
              <p className="text-white/50 text-sm font-medium">Click anywhere to play</p>
            </div>
          </div>
        )}

        {/* Details Area below Video */}
        <div className="p-6 md:p-8 text-white space-y-6">
          <div className="flex flex-wrap items-center gap-3">
             <span className="bg-white/10 border border-white/10 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">{lecture.subject}</span>
             <span className="text-white/50 text-sm font-medium flex items-center gap-1.5"><Clock className="w-4 h-4"/> {lecture.duration_min} mins</span>
             <span className="text-white/50 text-sm font-medium flex items-center gap-1.5"><Calendar className="w-4 h-4"/> Recorded on {scheduledDate}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-headline font-bold leading-tight">{lecture.title}</h1>
          <div className="flex items-center gap-4 pt-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#c0622f] to-[#1a1a4e] flex items-center justify-center font-bold text-lg shadow-lg">
              {lecture.teacher?.[0] ?? 'T'}
            </div>
            <div>
              <p className="font-bold text-sm text-white/80">Instructor</p>
              <p className="text-white font-medium">{lecture.teacher}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
