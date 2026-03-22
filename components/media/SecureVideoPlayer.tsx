'use client'
/**
 * SecureVideoPlayer — Video player wrapper using external csPlayer framework:
 *  - Hides YouTube watermarks cleanly
 *  - Disables right click
 */
import { useEffect, useRef, useState } from 'react'
import { Maximize2, ShieldCheck, PlayCircle } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

// Extend window for csPlayer
declare global {
  interface Window {
    csPlayer?: {
      init: (id: string, options: any) => Promise<void>
      destroy: (id: string) => void
    }
    onYouTubeIframeAPIReady?: () => void
    YT?: any
  }
}

interface SecureVideoPlayerProps {
  videoUrl:   string
  title?:     string
  className?: string
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
      if (match && match[1]) return match[1];
  }
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
  return null;
}

export function SecureVideoPlayer({
  videoUrl, title, className
}: SecureVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const playerDivRef = useRef<HTMLDivElement>(null)
  
  const [areScriptsReady, setAreScriptsReady] = useState(false)
  const [playerError,     setPlayerError]     = useState('')
  const currentPlayerIdRef = useRef<string | null>(null)

  const ytId = extractYouTubeId(videoUrl)

  // Load CSS, YT API, and csPlayer.js
  useEffect(() => {
    let isMounted = true;

    // Load CSS
      const cssLink = document.createElement('link')
      cssLink.rel = 'stylesheet'
      cssLink.href = '/csPlayer.css?v=' + Date.now()
      document.head.appendChild(cssLink)

    const onReady = () => {
      if (isMounted && window.YT && window.YT.Player && window.csPlayer) {
        setAreScriptsReady(true);
      }
    };

    if (window.YT && window.YT.Player) {
      if (window.csPlayer) { onReady(); }
      else {
        const csScript = document.createElement('script')
        csScript.src = '/csPlayer.js'
        csScript.async = true
        csScript.onload = onReady
        csScript.onerror = () => { if (isMounted) setPlayerError('Failed to load player script'); }
        document.head.appendChild(csScript)
      }
    } else {
      window.onYouTubeIframeAPIReady = () => {
        if (window.csPlayer) { onReady(); }
        else {
          const csScript = document.createElement('script')
          csScript.src = '/csPlayer.js'
          csScript.async = true
          csScript.onload = onReady
          csScript.onerror = () => { if (isMounted) setPlayerError('Failed to load player script'); }
          document.head.appendChild(csScript)
        }
      };
      if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
        const ytScript = document.createElement('script')
        ytScript.src = 'https://www.youtube.com/iframe_api'
        ytScript.async = true
        document.head.appendChild(ytScript)
      }
    }

    return () => { isMounted = false; }
  }, []);

  useEffect(() => {
    let localPlayerId: string | null = null;

    if (areScriptsReady && ytId && playerDivRef.current) {
      const div = playerDivRef.current;
      div.innerHTML = ''; // reset

      const newId = `cs-player-${ytId}-${Date.now()}`
      div.id = newId;
      currentPlayerIdRef.current = newId;
      localPlayerId = newId;

      if (window.csPlayer) {
        // Add loading spinner inside div natively so it's handled by csPlayer UI logic
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'video-loading-indicator';
        loadingIndicator.innerHTML = '<div class="spinner"></div><p>Loading video...</p>';
        div.appendChild(loadingIndicator);

        window.csPlayer.init(newId, {
          defaultId: ytId,
          thumbnail: true,
          theme: "default",
          loop: false,
          playerVars: {
            playsinline: 1,
            fs: 1,
            controls: 1,
            modestbranding: 1,
            disablekb: 0,
            rel: 0,
            showinfo: 0,
            iv_load_policy: 3
          }
        }).then(() => {
          const indicator = div.querySelector('.video-loading-indicator');
          if (indicator) div.removeChild(indicator);
        }).catch(() => {
          setPlayerError('Failed to load video via csPlayer.')
          const indicator = div.querySelector('.video-loading-indicator');
          if (indicator) {
            indicator.innerHTML = '<p>Error loading video.</p>';
            setTimeout(() => { if (indicator.parentNode) div.removeChild(indicator); }, 3000)
          }
        });
      }
    }

    return () => {
       const idToClean = localPlayerId || currentPlayerIdRef.current;
       if (idToClean && window.csPlayer && document.getElementById(idToClean)) {
         try { window.csPlayer.destroy(idToClean); } catch {}
       }
       if (currentPlayerIdRef.current === idToClean) {
         currentPlayerIdRef.current = null;
       }
    };
  }, [areScriptsReady, ytId]);

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
      <div ref={playerDivRef} className="w-full h-full cs-player" />

      {playerError && (
        <div className="absolute inset-0 bg-[#0d0d2b] flex flex-col items-center justify-center text-white/60 gap-2 p-8 text-center">
          <p className="text-sm">{playerError}</p>
        </div>
      )}

      {/* Security watermark */}
      <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 text-white/70 text-[10px] font-bold px-2 py-1 rounded-full pointer-events-none select-none z-10">
        <ShieldCheck className="w-3 h-3 text-green-400" />
        Brighter Nepal
      </div>

      <style jsx global>{`
        .cs-player { width: 100%; height: 100%; }
        .video-loading-indicator {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          display: flex; flex-direction: column; justify-content: center; align-items: center;
          background: rgba(0, 0, 0, 0.7); color: white; z-index: 20;
        }
        .video-loading-indicator .spinner {
          width: 50px; height: 50px; border: 3px solid rgba(255, 255, 255, 0.3); border-radius: 50%;
          border-top-color: white; animation: spin 1s ease-in-out infinite; margin-bottom: 15px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
