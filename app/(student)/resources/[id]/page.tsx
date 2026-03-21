'use client'
/**
 * Resource Detail / Preview Page — /resources/[id]
 * Fetches a single resource by ID and shows:
 * - File preview embed (PDF iframe, video player, or notes viewer)  
 * - Metadata: subject, format, size, downloads
 * - Download button
 */
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, FileText, Video, BookOpen,
  Download, Tag, HardDrive, Loader2, ExternalLink
} from 'lucide-react'
import { resourceService, type Resource } from '@/services/resourceService'
import { cn } from '@/lib/utils/cn'
import { SecurePDFViewer } from '@/components/media/SecurePDFViewer'
import { SecureVideoPlayer } from '@/components/media/SecureVideoPlayer'

const formatBadge: Record<string, string> = {
  pdf:   'bg-red-100 text-red-600',
  video: 'bg-blue-100 text-blue-600',
  notes: 'bg-green-100 text-green-600',
}
const FormatIcon: Record<string, React.ComponentType<{ className?: string }>> = {
  pdf:   FileText,
  video: Video,
  notes: BookOpen,
}

export default function ResourceDetailPage() {
  const params = useParams<{ id: string }>()
  const [resource, setResource] = useState<Resource | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [downloaded, setDownloaded] = useState(false)

  useEffect(() => {
    if (!params.id) return
    resourceService.getResource(Number(params.id))
      .then((res) => setResource(res.data))
      .catch(() => setResource(null))
      .finally(() => setLoading(false))
  }, [params.id])

  const handleDownload = async () => {
    if (!resource) return
    try {
      await resourceService.logDownload(Number(params.id))
    } catch {}
    setDownloaded(true)
    if (resource.file_url && resource.file_url !== '#') {
      window.open(resource.file_url, '_blank')
    }
  }

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

  const Icon = FormatIcon[resource.format] ?? FileText
  const tags: string[] = Array.isArray(resource.tags)
    ? resource.tags
    : typeof resource.tags === 'string'
    ? JSON.parse(resource.tags)
    : []

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      {/* Back */}
      <Link href="/resources" className="flex items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-on-primary-container transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Resources
      </Link>

      {/* Hero card */}
      <div className="bg-white rounded-2xl shadow-[0_12px_32px_rgba(25,28,30,0.06)] overflow-hidden">
        {/* Preview area */}
        <div className="bg-gradient-to-br from-[#1a1a4e] to-[#2d2d6e] h-48 md:h-64 flex flex-col items-center justify-center text-white relative">
          <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-4">
            <Icon className="w-8 h-8 text-on-primary-container" />
          </div>
          <span className={cn(
            'px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest',
            formatBadge[resource.format] ?? 'bg-slate-100 text-slate-600'
          )}>
            {resource.format.toUpperCase()}
          </span>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 space-y-5">
          <div>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">{resource.subject}</p>
            <h1 className="font-headline font-black text-xl md:text-2xl text-[#1a1a4e] leading-tight">{resource.title}</h1>
            {resource.section && (
              <p className="text-sm text-on-surface-variant mt-1">{resource.section}</p>
            )}
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap gap-4">
            {resource.size_label && (
              <div className="flex items-center gap-1.5 text-sm text-on-surface-variant">
                <HardDrive className="w-4 h-4" />
                <span>{resource.size_label}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-sm text-on-surface-variant">
              <Download className="w-4 h-4" />
              <span>{(resource.downloads ?? 0).toLocaleString()} downloads</span>
            </div>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span key={tag} className="flex items-center gap-1 bg-surface-container-low px-3 py-1 rounded-full text-xs font-semibold text-on-surface-variant">
                  <Tag className="w-3 h-3" />{tag}
                </span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-2">
            {/* Show download button only for 'notes' or other non-secured formats if needed */}
            {!['pdf', 'video'].includes(resource.format) && (
              <button
                onClick={handleDownload}
                className={cn(
                  'flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all',
                  downloaded
                    ? 'bg-green-100 text-green-700'
                    : 'bg-on-primary-container text-white hover:opacity-90 active:scale-95 shadow-lg shadow-on-primary-container/20'
                )}
              >
                <Download className="w-4 h-4" />
                {downloaded ? 'Downloaded!' : `Download ${resource.format.toUpperCase()}`}
              </button>
            )}
            
            {/* Open in new tab only for non-secure files */}
            {!['pdf', 'video'].includes(resource.format) && resource.file_url && resource.file_url !== '#' && (
              <a
                href={resource.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-3 bg-surface-container rounded-xl font-bold text-sm hover:bg-surface-container-high transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Open in New Tab
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Secure Video Player */}
      {resource.format === 'video' && resource.file_url && resource.file_url !== '#' && (
        <div className="bg-white rounded-2xl shadow-[0_8px_20px_rgba(25,28,30,0.04)] overflow-hidden p-2 md:p-4">
          <SecureVideoPlayer
            videoUrl={resource.file_url}
            title={resource.title}
            className="w-full shadow-lg"
          />
        </div>
      )}

      {/* Secure PDF Viewer */}
      {resource.format === 'pdf' && resource.file_url && resource.file_url !== '#' && (
        <SecurePDFViewer
          pdfUrl={resource.file_url}
          title={resource.title}
          className="shadow-[0_8px_20px_rgba(25,28,30,0.04)]"
        />
      )}
    </div>
  )
}
