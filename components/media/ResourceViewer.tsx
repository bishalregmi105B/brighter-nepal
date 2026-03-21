'use client'
/**
 * ResourceViewer — Smart component that renders the correct inline viewer
 * based on resource.format:
 *
 *  • pdf   → SecurePDFViewer (react-pdf, page-by-page, zoom)
 *  • video → SecureVideoPlayer (YouTube via csPlayer)
 *  • link  → Styled preview card with embedded iframe preview + open link
 *  • notes → Google Docs / Slides embedded iframe (public view URL)
 *  • file  → Info card (no inline view; shows file type + metadata)
 */
import dynamic from 'next/dynamic'
import { ExternalLink, FileArchive, File, Globe, BookOpen, Info, Loader2 } from 'lucide-react'
import type { Resource } from '@/services/resourceService'
import { cn } from '@/lib/utils/cn'

// Dynamically import heavy media components with ssr:false
// pdfjs-dist calls Object.defineProperty at module load which crashes in SSR
const SecurePDFViewer = dynamic(
  () => import('./SecurePDFViewer').then(m => ({ default: m.SecurePDFViewer })),
  { ssr: false, loading: () => <PdfLoading /> }
)
const SecureVideoPlayer = dynamic(
  () => import('./SecureVideoPlayer').then(m => ({ default: m.SecureVideoPlayer })),
  { ssr: false, loading: () => <PdfLoading /> }
)

function PdfLoading() {
  return (
    <div className="flex items-center justify-center h-64 bg-[#1a1a1a] rounded-2xl">
      <Loader2 className="w-8 h-8 animate-spin text-white/40" />
    </div>
  )
}

interface Props {
  resource: Resource
  className?: string
}

/** Convert a Google Docs / Slides share URL to embeddable format */
function toGoogleEmbedUrl(url: string): string {
  // Google Docs: https://docs.google.com/document/d/ID/edit  →  .../preview
  // Google Slides: https://docs.google.com/presentation/d/ID/edit  →  .../embed
  if (url.includes('docs.google.com/presentation')) {
    return url.replace(/\/edit.*$/, '/embed?start=false&loop=false&delayms=3000')
  }
  if (url.includes('docs.google.com/document')) {
    return url.replace(/\/edit.*$/, '/preview')
  }
  if (url.includes('docs.google.com/spreadsheets')) {
    return url.replace(/\/edit.*$/, '/preview')
  }
  // Already an embed URL — return as-is
  return url
}

/** File extension icon helper */
function FileIcon({ url }: { url: string }) {
  const ext = url?.split('.').pop()?.toLowerCase() ?? ''
  if (['zip', 'rar', '7z'].includes(ext)) return <FileArchive className="w-12 h-12 text-orange-400" />
  return <File className="w-12 h-12 text-slate-400" />
}

export function ResourceViewer({ resource, className }: Props) {
  const url = resource.file_url

  // ── Auto-detect: any URL ending in .pdf → always use SecurePDFViewer ────────
  const isPdfUrl = url && url !== '#' && /\.pdf(\?.*)?$/i.test(url)

  if (resource.format === 'pdf' || isPdfUrl) {
    if (!url || url === '#') {
      return <EmptyViewer message="No PDF URL provided." />
    }
    return (
      <SecurePDFViewer
        pdfUrl={url}
        title={resource.title}
        className={cn('shadow-[0_8px_20px_rgba(25,28,30,0.04)]', className)}
      />
    )
  }

  // ── VIDEO (YouTube) ──────────────────────────────────────────────────────────
  if (resource.format === 'video') {
    if (!url || url === '#') {
      return <EmptyViewer message="No video URL provided." />
    }
    return (
      <div className={cn('bg-white rounded-2xl shadow-[0_8px_20px_rgba(25,28,30,0.04)] overflow-hidden p-2 md:p-4', className)}>
        <SecureVideoPlayer videoUrl={url} title={resource.title} className="w-full shadow-lg" />
      </div>
    )
  }

  // ── NOTES (Google Docs / Slides) ─────────────────────────────────────────────
  if (resource.format === 'notes') {
    if (!url || url === '#') {
      return <EmptyViewer message="No notes URL provided." />
    }
    const embedUrl = toGoogleEmbedUrl(url)
    return (
      <div className={cn('bg-white rounded-2xl shadow-[0_8px_20px_rgba(25,28,30,0.04)] overflow-hidden', className)}>
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#111] border-b border-white/10">
          <div className="flex items-center gap-2 text-white/70 text-sm font-semibold">
            <BookOpen className="w-4 h-4 text-green-400" />
            <span className="truncate max-w-[240px]">{resource.title}</span>
          </div>
          <a href={url} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors">
            <ExternalLink className="w-3.5 h-3.5" /> Open original
          </a>
        </div>
        <iframe
          src={embedUrl}
          className="w-full"
          style={{ height: '80vh', minHeight: '500px', border: 'none' }}
          allowFullScreen
          title={resource.title}
        />
      </div>
    )
  }

  // ── LINK (Website) ──────────────────────────────────────────────────────────
  if (resource.format === 'link') {
    if (!url || url === '#') {
      return <EmptyViewer message="No link URL provided." />
    }
    return (
      <div className={cn('bg-white rounded-2xl shadow-[0_8px_20px_rgba(25,28,30,0.04)] overflow-hidden', className)}>
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#111] border-b border-white/10">
          <div className="flex items-center gap-2 text-white/70 text-sm font-semibold">
            <Globe className="w-4 h-4 text-sky-400" />
            <span className="truncate max-w-[240px]">{resource.title}</span>
          </div>
          <a href={url} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-white transition-colors">
            <ExternalLink className="w-3.5 h-3.5" /> Open full site
          </a>
        </div>
        {/* Embedded preview via iframe */}
        <div className="relative overflow-hidden bg-slate-50" style={{ height: '75vh', minHeight: '500px' }}>
          <iframe
            src={url}
            className="w-full h-full border-0"
            title={resource.title}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        </div>
      </div>
    )
  }

  // ── FILE (Any downloadable) ──────────────────────────────────────────────────
  if (resource.format === 'file') {
    return (
      <div className={cn('bg-white rounded-2xl shadow-[0_8px_20px_rgba(25,28,30,0.04)] p-8 flex flex-col items-center text-center gap-5', className)}>
        {url && url !== '#' ? <FileIcon url={url} /> : <File className="w-12 h-12 text-slate-300" />}
        <div>
          <p className="font-bold text-lg text-[#1a1a4e]">{resource.title}</p>
          {resource.size_label && <p className="text-sm text-slate-400 mt-1">{resource.size_label}</p>}
          {resource.description && <p className="text-sm text-slate-500 mt-2 max-w-md">{resource.description}</p>}
        </div>
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-4 py-2 rounded-xl">
          <Info className="w-4 h-4 shrink-0" />
          This file type cannot be previewed inline. Use the link below to access it.
        </div>
        {url && url !== '#' && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1a1a4e] text-white font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all"
          >
            <ExternalLink className="w-4 h-4" />
            Open File
          </a>
        )}
      </div>
    )
  }

  // Fallback
  return <EmptyViewer message={`Unknown resource type: "${resource.format}"`} />
}

function EmptyViewer({ message }: { message: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-10 flex flex-col items-center justify-center gap-3 text-center min-h-[200px]">
      <Info className="w-8 h-8 text-slate-300" />
      <p className="text-sm text-slate-400 font-medium">{message}</p>
    </div>
  )
}
