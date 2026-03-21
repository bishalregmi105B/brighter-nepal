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
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Back */}
      <Link href="/resources" className="flex items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-on-primary-container transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Resources
      </Link>

      {/* Hero card */}
      <div className="bg-white rounded-2xl shadow-[0_12px_32px_rgba(25,28,30,0.06)] overflow-hidden">
        {/* Cover / thumbnail */}
        {resource.thumbnail_url ? (
          <div className="h-48 md:h-64 overflow-hidden relative">
            <img src={resource.thumbnail_url} alt={resource.title}
              className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <span className={cn(
              'absolute bottom-4 left-6 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest',
              cfg.badge
            )}>{cfg.label}</span>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-[#1a1a4e] to-[#2d2d6e] h-40 md:h-52 flex flex-col items-center justify-center text-white relative">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-3">
              <Icon className="w-7 h-7 text-on-primary-container" />
            </div>
            <span className={cn('px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest', cfg.badge)}>
              {cfg.label}
            </span>
          </div>
        )}

        {/* Metadata */}
        <div className="p-6 md:p-8 space-y-4">
          <div>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">{resource.subject}</p>
            <h1 className="font-headline font-black text-xl md:text-2xl text-[#1a1a4e] leading-tight">{resource.title}</h1>
            {resource.section && (
              <p className="text-sm text-on-surface-variant mt-1">{resource.section}</p>
            )}
          </div>

          {/* Description */}
          {resource.description && (
            <p className="text-sm text-on-surface-variant leading-relaxed border-t border-slate-100 pt-4">
              {resource.description}
            </p>
          )}

          {/* Stats */}
          <div className="flex flex-wrap gap-4 pt-1">
            {resource.size_label && (
              <div className="flex items-center gap-1.5 text-sm text-on-surface-variant">
                <HardDrive className="w-4 h-4" />
                <span>{resource.size_label}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-sm text-on-surface-variant">
              <Eye className="w-4 h-4" />
              <span>{(resource.downloads ?? 0).toLocaleString()} views</span>
            </div>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {tags.map((tag) => (
                <span key={tag} className="flex items-center gap-1 bg-surface-container-low px-3 py-1 rounded-full text-xs font-semibold text-on-surface-variant">
                  <Tag className="w-3 h-3" />{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content viewer — smart by type */}
      <ResourceViewer resource={resource} />
    </div>
  )
}
