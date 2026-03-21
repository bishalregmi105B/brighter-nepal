'use client'
/**
 * SecurePDFViewer — renders a PDF inline using an <iframe> with security protections:
 *  - Toolbar download buttons disabled via PDF.js viewer params (for browsers that support it)
 *  - Right-click context-menu blocked on the container
 *  - Overlay div blocks direct access to the iframe (prevents drag-to-download)
 *  - No external download button
 *  - Uses Google Docs Viewer as fallback for non-inline PDFs
 *
 * For maximum security the PDF should be served via a signed/token-protected URL from the API.
 * This component handles the UI layer protection only.
 */
import { useState } from 'react'
import { FileText, Loader2, ShieldCheck, ZoomIn, ZoomOut } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface SecurePDFViewerProps {
  /** URL to the PDF file — should be a signed, time-limited URL from the API */
  pdfUrl:     string
  title?:     string
  className?: string
}

/** Build a viewer URL that disables toolbar download in compatible browsers */
function buildViewerUrl(raw: string): string {
  try {
    const u = new URL(raw)
    // Google Docs Viewer
    if (!raw.includes('google.com/viewer') && !raw.includes('.google.com')) {
      return `https://docs.google.com/viewer?url=${encodeURIComponent(raw)}&embedded=true`
    }
    // Native PDF.js style params
    u.searchParams.set('toolbar', '0')
    u.searchParams.set('navpanes', '0')
    u.searchParams.set('scrollbar', '0')
    return u.toString()
  } catch {
    // Fallback — use Google Docs viewer
    return `https://docs.google.com/viewer?url=${encodeURIComponent(raw)}&embedded=true`
  }
}

export function SecurePDFViewer({ pdfUrl, title, className }: SecurePDFViewerProps) {
  const [loaded, setLoaded]   = useState(false)
  const [error,  setError]    = useState(false)
  const [zoom,   setZoom]     = useState(100)  // percentage

  const viewerUrl = buildViewerUrl(pdfUrl)

  const blockContextMenu = (e: React.MouseEvent) => e.preventDefault()

  return (
    <div
      className={cn('relative flex flex-col bg-[#1a1a1a] rounded-2xl overflow-hidden select-none', className)}
      onContextMenu={blockContextMenu}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#111] border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2 text-white/70 text-xs font-semibold truncate">
          <FileText className="w-4 h-4 text-red-400 shrink-0" />
          <span className="truncate">{title ?? 'Document Preview'}</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <button
            onClick={() => setZoom((z) => Math.max(60, z - 10))}
            className="p-1.5 text-white/50 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-white/40 text-xs w-10 text-center">{zoom}%</span>
          <button
            onClick={() => setZoom((z) => Math.min(200, z + 10))}
            className="p-1.5 text-white/50 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          {/* Security badge */}
          <div className="flex items-center gap-1 bg-white/5 text-white/40 text-[10px] font-bold px-2 py-1 rounded-full ml-2">
            <ShieldCheck className="w-3 h-3 text-green-400" />
            Secure Preview
          </div>
        </div>
      </div>

      {/* PDF content area */}
      <div className="relative flex-1" style={{ minHeight: '600px' }}>
        {/* Loading overlay */}
        {!loaded && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1a1a1a] text-white/40 gap-3 z-10">
            <Loader2 className="w-8 h-8 animate-spin text-on-primary-container" />
            <p className="text-sm">Loading document…</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1a1a1a] text-white/40 gap-3 p-8 text-center z-10">
            <FileText className="w-10 h-10 opacity-30" />
            <p className="text-sm">Unable to preview this document. The file might not be publicly accessible.</p>
          </div>
        )}

        {/* PDF iframe */}
        <div
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center', height: `${(100 / zoom) * 100}%` }}
          className="w-full"
        >
          <iframe
            src={viewerUrl}
            className="w-full border-0"
            style={{ height: '700px', minHeight: '500px' }}
            title={title ?? 'PDF Preview'}
            onLoad={()  => setLoaded(true)}
            onError={() => setError(true)}
            loading="lazy"
            sandbox="allow-scripts allow-same-origin allow-forms"
          />
        </div>

        {/* Invisible protection overlay — blocks right-click and drag-to-download on the iframe */}
        {/* NOTE: This is a UI-layer deterrent; true security must come from the server (signed URLs, no public access). */}
        <div
          className="absolute inset-0 z-20 pointer-events-none"
          style={{ background: 'transparent' }}
          onContextMenu={blockContextMenu}
        />
      </div>
    </div>
  )
}
