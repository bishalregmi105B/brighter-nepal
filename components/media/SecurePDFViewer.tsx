'use client'
/**
 * SecurePDFViewer — renders a PDF natively using react-pdf.
 *  - No download or print buttons exist in the UI.
 *  - Right-click context-menu blocked on the container to prevent easy saving.
 *  - True security must be enforced by signed/expiring URLs from the backend.
 */
import { useState, useEffect, useRef } from 'react'
import { FileText, Loader2, ShieldCheck, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, AlertCircle, Maximize2, Minimize2 } from 'lucide-react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import { cn } from '@/lib/utils/cn'

// Configure PDF.js worker — only in browser (not SSR)
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`
}

interface SecurePDFViewerProps {
  pdfUrl:     string
  title?:     string
  className?: string
}

export function SecurePDFViewer({ pdfUrl, title, className }: SecurePDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0)
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [scale, setScale] = useState<number>(1.0)
  const [error, setError] = useState<boolean>(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const viewerRef = useRef<HTMLDivElement | null>(null)

  // Reset state when url changes
  useEffect(() => {
    setPageNumber(1)
    setError(false)
  }, [pdfUrl])

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement && viewerRef.current && document.fullscreenElement === viewerRef.current))
    }
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages)
    setError(false)
  }

  function onDocumentLoadError() {
    setError(true)
  }

  const blockContextMenu = (e: React.MouseEvent) => e.preventDefault()

  async function toggleFullscreen() {
    if (!viewerRef.current) return
    try {
      if (!document.fullscreenElement) {
        await viewerRef.current.requestFullscreen()
      } else if (document.fullscreenElement === viewerRef.current) {
        await document.exitFullscreen()
      }
    } catch {}
  }

  return (
    <div
      ref={viewerRef}
      className={cn('relative flex flex-col bg-[#1a1a1a] rounded-2xl overflow-hidden select-none', className)}
      onContextMenu={blockContextMenu}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-[#111] border-b border-white/10 shrink-0 gap-4">
        <div className="flex items-center gap-2 text-white/70 text-sm font-semibold truncate max-w-[40%]">
          <FileText className="w-4 h-4 text-red-400 shrink-0" />
          <span className="truncate">{title ?? 'Document Preview'}</span>
        </div>
        
        <div className="flex flex-1 items-center justify-end gap-4 min-w-[200px]">
          {/* Pagination */}
          <div className="flex items-center gap-2 bg-white/5 rounded-lg border border-white/10 p-1">
            <button
              onClick={() => setPageNumber(p => Math.max(1, p - 1))}
              disabled={pageNumber <= 1 || numPages === 0}
              className="p-1 text-white/70 hover:text-white disabled:opacity-30 disabled:hover:text-white/70 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-white/50 text-xs font-mono font-medium px-2">
              {numPages ? `${pageNumber} / ${numPages}` : '-- / --'}
            </span>
            <button
              onClick={() => setPageNumber(p => Math.min(numPages, p + 1))}
              disabled={pageNumber >= numPages || numPages === 0}
              className="p-1 text-white/70 hover:text-white disabled:opacity-30 disabled:hover:text-white/70 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="w-px h-5 bg-white/10" />

          {/* Zoom controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setScale((z) => Math.max(0.5, z - 0.25))}
              className="p-1.5 text-white/50 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-white/40 text-xs w-12 text-center font-mono">{Math.round(scale * 100)}%</span>
            <button
              onClick={() => setScale((z) => Math.min(3.0, z + 0.25))}
              className="p-1.5 text-white/50 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 text-white/50 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Security badge */}
          <div className="hidden sm:flex items-center gap-1 bg-white/5 text-white/40 text-[10px] font-bold px-2.5 py-1.5 rounded-full ml-2">
            <ShieldCheck className="w-3 h-3 text-green-400" />
            Secure
          </div>
        </div>
      </div>

      {/* PDF content area */}
      <div className="relative flex-1 bg-[#1a1a1a] overflow-auto flex justify-center py-6" style={{ minHeight: '600px', maxHeight: '80vh' }}>
        
        {/* Error state */}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1a1a1a] text-white/40 gap-3 p-8 text-center z-10">
            <AlertCircle className="w-10 h-10 text-error opacity-80" />
            <p className="text-sm">Unable to preview this document. The file might not be publicly accessible or the URL is invalid.</p>
          </div>
        )}

        <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={
            <div className="flex flex-col items-center justify-center text-white/40 gap-3 mt-20">
              <Loader2 className="w-8 h-8 animate-spin text-on-primary-container" />
              <p className="text-sm">Loading document...</p>
            </div>
          }
          className="flex flex-col items-center shadow-2xl"
        >
          {numPages > 0 && !error && (
            <div className="border border-white/10 bg-white">
              <Page
                pageNumber={pageNumber}
                scale={scale * 1.2} // Base scale to look sharp
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            </div>
          )}
        </Document>

        {/* Invisible protection overlay — blocks right-click and drag-to-download on the canvas */}
        <div
          className="absolute inset-0 z-20 pointer-events-none"
          style={{ background: 'transparent' }}
          onContextMenu={blockContextMenu}
        />
      </div>
    </div>
  )
}
