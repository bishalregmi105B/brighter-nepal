'use client'
/**
 * SecureVideoPlayer — YouTube-based video player with security protections:
 *  - No download button
 *  - Right-click context menu disabled
 *  - fullscreen support
 *  - Branded watermark overlay
 *  - Mobile inline playback
 *
 * Usage:
 *   <SecureVideoPlayer videoUrl="https://youtube.com/watch?v=XXX" title="Lecture Title" />
 *   <SecureVideoPlayer videoUrl="https://youtu.be/XXX" />
 */
import { useEffect, useRef, useState, useCallback } from 'react'
import { Loader2, Maximize2, ShieldCheck, PlayCircle } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

// Extend window for YouTube API
declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void
    YT?: {
      Player: new (el: HTMLElement | string, opts: object) => YTPlayer
      PlayerState: { PLAYING: number; PAUSED: number; ENDED: number }
    }
  }
}

interface YTPlayer {
  destroy: () => void
  playVideo: () => void
  pauseVideo: () => void
}

interface SecureVideoPlayerProps {
  videoUrl:   string        // YouTube URL or direct mp4 URL
  title?:     string
  className?: string
  onPlay?:    () => void
  onPause?:   () => void
  onEnd?:     () => void
}

/** Extract YouTube video ID from any YT URL format */
function extractYouTubeId(url: string): string | null {
  if (!url) return null;

  const regexps = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/live\/([^&\n?#]+)/
  ];

  for (const regex of regexps) {
      const match = url.match(regex);
      if (match && match[1]) {
          return match[1];
      }
  }
  
  // Try raw 11 chars
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
  
  return null;
}

export function SecureVideoPlayer({
  videoUrl, title, className, onPlay, onPause, onEnd
}: SecureVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef    = useRef<YTPlayer | null>(null)
  const playerDivRef = useRef<HTMLDivElement>(null)
  const [ready,    setReady]   = useState(false)
  const [playing,  setPlaying] = useState(false)
  const [error,    setError]   = useState('')

  const ytId = extractYouTubeId(videoUrl)

  // Load YT IFrame API once
  useEffect(() => {
    if (window.YT?.Player) { setReady(true); return }

    window.onYouTubeIframeAPIReady = () => setReady(true)

    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const s = document.createElement('script')
      s.src   = 'https://www.youtube.com/iframe_api'
      s.async = true
      document.head.appendChild(s)
    }

    return () => { window.onYouTubeIframeAPIReady = undefined }
  }, [])

  // Init / destroy player when YT ready and ytId available
  useEffect(() => {
    if (!ready || !ytId || !playerDivRef.current) return

    // Destroy any previous instance
    playerRef.current?.destroy()
    playerRef.current = null

    const div = playerDivRef.current
    // Give the div a fresh unique ID each time
    div.id = `yt-player-${ytId}-${Date.now()}`

    playerRef.current = new window.YT!.Player(div, {
      videoId:     ytId,
      width:       '100%',
      height:      '100%',
      playerVars: {
        playsinline:    1,      // iOS inline
        fs:             1,      // fullscreen allowed
        controls:       1,
        rel:            0,      // no related videos
        modestbranding: 1,
        iv_load_policy: 3,      // no annotations
        disablekb:      0,
        origin:         typeof window !== 'undefined' ? window.location.origin : '',
      },
      events: {
        onStateChange: (e: { data: number }) => {
          const S = window.YT?.PlayerState
          if (!S) return
          if (e.data === S.PLAYING) { setPlaying(true);  onPlay?.()  }
          if (e.data === S.PAUSED)  { setPlaying(false); onPause?.() }
          if (e.data === S.ENDED)   { setPlaying(false); onEnd?.()   }
        },
        onError: () => setError('Video is unavailable or restricted.'),
      },
    })

    return () => {
      try { playerRef.current?.destroy() } catch {}
      playerRef.current = null
    }
  }, [ready, ytId])

  // Block right-click on the player container
  const blockContextMenu = (e: React.MouseEvent) => e.preventDefault()

  if (!ytId) return (
    <div className={cn('aspect-video bg-[#0d0d2b] flex flex-col items-center justify-center text-white/40 rounded-2xl', className)}>
      <PlayCircle className="w-12 h-12 mb-2 opacity-30" />
      <p className="text-sm">No video available</p>
    </div>
  )

  return (
    <div
      ref={containerRef}
      className={cn('relative aspect-video bg-black rounded-2xl overflow-hidden group select-none', className)}
      onContextMenu={blockContextMenu}
    >
      {/* The actual YouTube player lives in this div */}
      <div ref={playerDivRef} className="w-full h-full" />

      {/* Loading overlay — shown until YT API ready */}
      {!ready && (
        <div className="absolute inset-0 bg-[#0d0d2b] flex flex-col items-center justify-center text-white gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-on-primary-container" />
          <p className="text-sm text-white/50">Loading player…</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 bg-[#0d0d2b] flex flex-col items-center justify-center text-white/60 gap-2 p-8 text-center">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Security watermark — always visible */}
      <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 text-white/70 text-[10px] font-bold px-2 py-1 rounded-full pointer-events-none select-none z-10">
        <ShieldCheck className="w-3 h-3 text-green-400" />
        Brighter Nepal
      </div>

      {/* Fullscreen button */}
      <button
        onClick={() => containerRef.current?.requestFullscreen?.()}
        title="Fullscreen"
        className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white p-1.5 rounded-lg z-10 hover:bg-black/80"
      >
        <Maximize2 className="w-4 h-4" />
      </button>
    </div>
  )
}
