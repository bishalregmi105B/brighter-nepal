'use client'
/**
 * Recorded Lecture Video Player Page — /recorded-lectures/[id]
 * Has tabs: Video Player + Resources (fetches resources linked to this live class)
 */
import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, Calendar, Users, BookOpen, Play, FileText, Video, ExternalLink, Loader2, Film } from 'lucide-react'
import { liveClassService, type LiveClass } from '@/services/liveClassService'
import { resourceService, type Resource } from '@/services/resourceService'
import { cn } from '@/lib/utils/cn'
import { SecureVideoPlayer } from '@/components/media/SecureVideoPlayer'

type Tab = 'video' | 'resources'

const subjectColors: Record<string, string> = {
  Mathematics: 'bg-blue-100 text-blue-700',
  Physics:     'bg-teal-100 text-teal-700',
  Chemistry:   'bg-purple-100 text-purple-700',
  Biology:     'bg-green-100 text-green-700',
  English:     'bg-orange-100 text-orange-700',
}

const formatIcon = (fmt: string) => {
  if (fmt === 'video') return <Video className="w-4 h-4 text-on-primary-container" />
  return <FileText className="w-4 h-4 text-secondary" />
}

export default function RecordedLectureVideoPage() {
  const params      = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const [lecture,   setLecture]   = useState<LiveClass | null>(null)
  const [resources, setResources] = useState<Resource[]>([])
  const [loading,   setLoading]   = useState(true)
  const [resLoading, setResLoading] = useState(false)
  const [playing,   setPlaying]   = useState(false)
  const [tab,       setTab]       = useState<Tab>(() =>
    searchParams.get('tab') === 'resources' ? 'resources' : 'video'
  )

  useEffect(() => {
    if (!params.id) return
    liveClassService.getClass(Number(params.id))
      .then(res => setLecture(res.data))
      .catch(() => setLecture(null))
      .finally(() => setLoading(false))
  }, [params.id])

  useEffect(() => {
    if (!params.id) return
    setResLoading(true)
    resourceService.getResources({ live_class_id: Number(params.id) })
      .then(res => setResources(res.data?.items ?? []))
      .finally(() => setResLoading(false))
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
    <div className="h-screen bg-[#f8f9fb] overflow-y-auto custom-scrollbar flex flex-col">
      {/* Top Bar */}
      <div className="h-16 md:h-[72px] px-4 flex items-center justify-between border-b border-surface-container/10 bg-white flex-shrink-0 z-20 sticky top-0 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/recorded-lectures" className="text-slate-500 hover:text-[#1a1a4e] transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="flex items-center gap-1.5 bg-tertiary/10 px-2.5 py-1 rounded-full">
            <BookOpen className="w-3 h-3 text-tertiary" />
            <span className="text-tertiary text-[10px] font-black tracking-widest uppercase">Recorded</span>
          </span>
          <div>
            <p className="font-headline font-bold text-[#1a1a4e] text-sm truncate max-w-[200px] md:max-w-md">{lecture.title}</p>
            <p className="text-slate-500 text-[10px]">{lecture.teacher} · {lecture.subject}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-slate-500">
          <Users className="w-4 h-4" />
          <span className="text-sm font-medium hidden sm:inline">{(lecture.watchers ?? 0).toLocaleString()} views</span>
        </div>
      </div>

      {/* Video + tab container */}
      <div className="w-full max-w-6xl mx-auto flex flex-col flex-1 pb-12">
        {/* Video Player */}
        {playing ? (
          <div className="w-full aspect-video bg-black flex items-center justify-center relative flex-shrink-0 shadow-lg lg:rounded-b-2xl overflow-hidden">
            <SecureVideoPlayer
              videoUrl={lecture.stream_url ?? 'https://www.youtube.com/@BRIGHTERNEPAL1'}
              title={lecture.title}
              className="w-full h-full rounded-none"
            />
          </div>
        ) : (
          <div className="w-full aspect-video bg-black flex items-center justify-center relative flex-shrink-0 shadow-lg lg:rounded-b-2xl group cursor-pointer overflow-hidden" onClick={() => setPlaying(true)}>
            <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a4e]/80 to-[#0d0d2b]/95 z-0" />
            <div className="z-10 flex flex-col items-center justify-center text-white">
              <div className="mb-6 w-20 h-20 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md group-hover:scale-110 group-hover:bg-white/20 transition-all border border-white/20 shadow-xl">
                <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-white border-b-[10px] border-b-transparent ml-1" />
              </div>
              <h2 className="font-headline font-bold text-2xl text-center px-8 mb-2 drop-shadow-lg">{lecture.title}</h2>
              <p className="text-white/70 text-sm font-medium">Click anywhere to play</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-5 border-b border-surface-container">
          {([
            { key: 'video',     label: 'Details',   icon: <Film className="w-4 h-4" /> },
            { key: 'resources', label: `Resources${resources.length > 0 ? ` (${resources.length})` : ''}`, icon: <BookOpen className="w-4 h-4" /> },
          ] as { key: Tab; label: string; icon: React.ReactNode }[]).map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} className={cn(
              'flex items-center gap-2 px-4 py-2.5 -mb-px font-bold text-sm border-b-2 transition-all',
              tab === t.key
                ? 'border-on-primary-container text-on-primary-container'
                : 'border-transparent text-slate-500 hover:text-[#1a1a4e]'
            )}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6 md:p-8">
          {tab === 'video' && (
            <div className="space-y-6 text-[#1a1a4e]">
              <div className="flex flex-wrap items-center gap-3">
                <span className={cn('px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest', badgeClass)}>{lecture.subject}</span>
                <span className="text-slate-500 text-sm font-medium flex items-center gap-1.5"><Clock className="w-4 h-4"/> {lecture.duration_min} mins</span>
                <span className="text-slate-500 text-sm font-medium flex items-center gap-1.5"><Calendar className="w-4 h-4"/> Recorded on {scheduledDate}</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-headline font-bold leading-tight">{lecture.title}</h1>
              <div className="flex items-center gap-4 pt-2">
                <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-[#1a1a4e] text-lg shadow-sm">
                  {lecture.teacher?.[0] ?? 'T'}
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-700">Instructor</p>
                  <p className="text-[#1a1a4e] font-medium">{lecture.teacher}</p>
                </div>
              </div>
            </div>
          )}

          {tab === 'resources' && (
            <div>
              <h3 className="font-headline font-bold text-lg text-[#1a1a4e] mb-1">Lecture Resources</h3>
              <p className="text-sm text-slate-500 mb-6">Study materials linked to this recording.</p>

              {resLoading ? (
                <div className="flex items-center gap-3 text-slate-500 py-8">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm font-medium">Loading resources…</span>
                </div>
              ) : resources.length === 0 ? (
                <div className="text-center py-16">
                  <BookOpen className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-500 font-medium">No resources linked to this lecture yet.</p>
                  <p className="text-slate-400 text-sm mt-1">Check the main <Link href="/resources" className="underline text-on-primary-container">Resources</Link> library.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {resources.map(res => (
                    <div key={res.id} className="bg-white rounded-2xl border border-surface-container p-5 flex items-start gap-4 hover:shadow-md transition-all group">
                      <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center flex-shrink-0">
                        {formatIcon(res.format)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-[#1a1a4e] leading-snug line-clamp-2 mb-1">{res.title}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-black uppercase tracking-widest text-outline bg-surface-container-low px-2 py-0.5 rounded">{res.format}</span>
                          {res.size_label && <span className="text-[11px] text-outline">{res.size_label}</span>}
                          <span className="text-[11px] text-outline">{res.downloads} downloads</span>
                        </div>
                      </div>
                      <Link href={`/resources/${res.id}`}
                        className="flex-shrink-0 w-9 h-9 rounded-xl bg-[#c0622f] flex items-center justify-center hover:bg-[#a14f24] transition-all" title="View resource">
                        {res.format === 'video' ? <Play className="w-4 h-4 fill-white text-white" /> : <BookOpen className="w-4 h-4 text-white" />}
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
