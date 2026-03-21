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
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Back */}
      <Link href="/recorded-lectures" className="flex items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-on-primary-container transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Recorded Lectures
      </Link>

      {/* Video player area */}
      {playing ? (
        <SecureVideoPlayer 
          videoUrl={lecture.stream_url ?? 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'} // Fallback demo video if stream url missing 
          title={lecture.title}
          className="w-full shadow-2xl" 
        />
      ) : (
        <div className="bg-black rounded-2xl overflow-hidden aspect-video relative group">
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#1a1a4e] to-[#0d0d2b] text-white">
            <div className="mb-6 p-2 rounded-2xl bg-white/10">
              <BookOpen className="w-10 h-10 text-on-primary-container" />
            </div>
            <h2 className="font-headline font-bold text-xl md:text-2xl text-center px-8 mb-2">{lecture.title}</h2>
            <p className="text-white/50 text-sm mb-8">{lecture.teacher}</p>
            <button
              onClick={() => setPlaying(true)}
              className="w-16 h-16 rounded-full bg-on-primary-container flex items-center justify-center shadow-xl hover:scale-110 transition-transform active:scale-95"
            >
              <div className="w-0 h-0 border-t-8 border-t-transparent border-l-[14px] border-l-white border-b-8 border-b-transparent ml-1" />
            </button>
          </div>
        </div>
      )}

      {/* Meta */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_8px_20px_rgba(25,28,30,0.04)] space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-headline font-black text-xl md:text-2xl text-[#1a1a4e] mb-1">{lecture.title}</h1>
            <p className="text-on-surface-variant text-sm font-medium">{lecture.teacher}</p>
          </div>
          <span className={cn('px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest', badgeClass)}>
            {lecture.subject}
          </span>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-on-surface-variant">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>{lecture.duration_min} min</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            <span>Recorded on {scheduledDate}</span>
          </div>
          {(lecture.watchers ?? 0) > 0 && (
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              <span>{lecture.watchers?.toLocaleString()} watched live</span>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          {!playing && (
            <button
              onClick={() => setPlaying(true)}
              className="flex items-center gap-2 bg-on-primary-container text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 active:scale-95 transition-all"
            >
              <div className="w-0 h-0 border-t-5 border-t-transparent border-l-8 border-l-white border-b-5 border-b-transparent" /> Play Lecture
            </button>
          )}
        </div>
      </div>

      {/* Related lectures placeholder */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_8px_20px_rgba(25,28,30,0.04)]">
        <h3 className="font-headline font-bold text-[#1a1a4e] mb-4">More {lecture.subject} Lectures</h3>
        <Link
          href="/recorded-lectures"
          className="text-on-primary-container font-bold text-sm hover:underline flex items-center gap-1"
        >
          Browse all recorded lectures →
        </Link>
      </div>
    </div>
  )
}
