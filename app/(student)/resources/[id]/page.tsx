'use client'
/**
 * Resource Detail / Preview Page — /resources/[id]
 * Uses ResourceViewer to intelligently render all 5 resource types inline.
 */
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, FileText, Video, BookOpen, Globe, FileArchive,
  Eye, Tag, HardDrive, Loader2
} from 'lucide-react'
import { resourceService, type Resource } from '@/services/resourceService'
import { ResourceViewer } from '@/components/media/ResourceViewer'
import { cn } from '@/lib/utils/cn'

// ── Visual config per format ────────────────────────────────────────────────
const FORMAT_CONFIG: Record<string, {
  badge: string
  Icon: React.ComponentType<{ className?: string }>
  label: string
}> = {
  pdf:   { badge: 'bg-red-100 text-red-600',     Icon: FileText,    label: 'PDF Document' },
  video: { badge: 'bg-blue-100 text-blue-600',   Icon: Video,       label: 'Video Lesson'  },
  notes: { badge: 'bg-green-100 text-green-600', Icon: BookOpen,    label: 'Notes / Docs'  },
  link:  { badge: 'bg-sky-100 text-sky-600',     Icon: Globe,       label: 'Website Link'  },
  file:  { badge: 'bg-orange-100 text-orange-600', Icon: FileArchive, label: 'File'         },
}
const DEFAULT_CFG = { badge: 'bg-slate-100 text-slate-600', Icon: FileText, label: 'Resource' }

export default function ResourceDetailPage() {
  const params = useParams<{ id: string }>()
  const [resource, setResource] = useState<Resource | null>(null)
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    if (!params.id) return
    resourceService.getResource(Number(params.id))
      .then((res) => setResource(res.data))
      .catch(() => setResource(null))
      .finally(() => setLoading(false))
  }, [params.id])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-on-primary-container" />
    </div>
  )

  if (!resource) return (
    <div className="p-10 text-center">
      <p className="text-red-500 font-medium mb-4">Resource not found.</p>
      <Link href="/resources" className="text-on-primary-container font-bold hover:underline">← Back to Resources</Link>
    </div>
  )

  const cfg  = FORMAT_CONFIG[resource.format] ?? DEFAULT_CFG
  const Icon = cfg.Icon
  const tags: string[] = Array.isArray(resource.tags)
    ? resource.tags
    : typeof resource.tags === 'string'
    ? JSON.parse(resource.tags)
    : []

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Back */}
      <Link href="/resources" className="inline-flex items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-on-primary-container transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Resources
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
        {/* Left Side: Viewer */}
        <div className="lg:col-span-2 space-y-6">
          <ResourceViewer resource={resource} />
        </div>

        {/* Right Side: Details Card (Sticky) */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-[0_12px_32px_rgba(25,28,30,0.06)] overflow-hidden sticky top-8">
          {/* Cover / thumbnail */}
          {resource.thumbnail_url ? (
            <div className="h-40 md:h-48 overflow-hidden relative">
              <img src={resource.thumbnail_url} alt={resource.title}
                className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <span className={cn(
                'absolute bottom-4 left-6 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest',
                cfg.badge
              )}>{cfg.label}</span>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-[#1a1a4e] to-[#2d2d6e] h-32 md:h-40 flex flex-col items-center justify-center text-white relative">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-2">
                <Icon className="w-6 h-6 text-on-primary-container" />
              </div>
              <span className={cn('px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest', cfg.badge)}>
                {cfg.label}
              </span>
            </div>
          )}

          {/* Metadata */}
          <div className="p-5 md:p-6 space-y-4">
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">{resource.subject}</p>
              <h1 className="font-headline font-black text-lg md:text-xl text-[#1a1a4e] leading-tight">{resource.title}</h1>
              {resource.section && (
                <p className="text-xs text-on-surface-variant mt-1">{resource.section}</p>
              )}
            </div>

            {/* Description */}
            {resource.description && (
              <p className="text-xs text-on-surface-variant leading-relaxed border-t border-slate-100 pt-4">
                {resource.description}
              </p>
            )}

            {/* Stats */}
            <div className="flex flex-wrap gap-4 pt-1">
              {resource.size_label && (
                <div className="flex items-center gap-1.5 text-xs text-on-surface-variant border border-slate-200 px-2 py-1 rounded-lg">
                  <HardDrive className="w-3.5 h-3.5" />
                  <span className="font-medium">{resource.size_label}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-xs text-on-surface-variant border border-slate-200 px-2 py-1 rounded-lg">
                <Eye className="w-3.5 h-3.5" />
                <span className="font-medium">{(resource.downloads ?? 0).toLocaleString()} views</span>
              </div>
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
                {tags.map((tag) => (
                  <span key={tag} className="flex items-center gap-1 bg-surface-container-low px-2 py-1 rounded-md text-[10px] font-bold uppercase text-on-surface-variant">
                    <Tag className="w-2.5 h-2.5" />{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
