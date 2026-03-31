'use client'
// Student Live Class Room — real-time chat via SocketIO
import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { MessageSquare, Send, Loader2, ArrowLeft, Wifi, WifiOff, VolumeX, X } from 'lucide-react'
import { liveClassService, type LiveClass } from '@/services/liveClassService'
import { useLiveChat }  from '@/hooks/useLiveChat'
import { authService, type AuthUser }  from '@/services/authService'
import { cn } from '@/lib/utils/cn'
import { SecureVideoPlayer } from '@/components/media/SecureVideoPlayer'

export default function LiveClassRoomPage() {
  const params  = useParams<{ id: string }>()
  const router  = useRouter()
  const [cls,       setCls]       = useState<LiveClass | null>(null)
  const [user,      setUser]      = useState<AuthUser | null>(null)
  const [input,     setInput]     = useState('')
  const [chatOpen,  setChatOpen]  = useState(false)
  const [loading,   setLoading]   = useState(true)
  const messagesEnd = useRef<HTMLDivElement>(null)

  const classId = cls?.id ?? null
  const { messages, sendMessage, setTyping, typingUsers, onlineCount, connected, mutedUsers, rateLimited, blockedWord } = useLiveChat(classId)

  const isMuted = user ? mutedUsers.has(user.id) : false

  useEffect(() => {
    if (!params.id) return
    authService.getMe().then(u => setUser(u)).catch(() => {})

    const fetchClass = () => {
      liveClassService.getClass(Number(params.id)).then((res) => {
        setCls(res.data)
      }).finally(() => setLoading(false))
    }

    fetchClass()

    // Register attendance via API so watchers count is persisted
    liveClassService.joinClass(Number(params.id)).catch(() => {})

    // Poll every 20s so 'scheduled' pages auto-switch to the live player
    const interval = setInterval(fetchClass, 20_000)
    return () => clearInterval(interval)
  }, [params.id])

  // Keep cls.watchers in sync with live socket presence count
  useEffect(() => {
    if (onlineCount > 0) {
      setCls(prev => prev ? { ...prev, watchers: onlineCount } : prev)
    }
  }, [onlineCount])

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (!input.trim()) return
    sendMessage(input)
    setInput('')
    setTyping(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
    setTyping(e.target.value.length > 0)
  }

  const formatDuration = (minutes?: number | null) => minutes && minutes > 0 ? `${minutes} minutes` : 'Duration not set'

  if (loading) return <div className="flex items-center justify-center h-screen bg-[#f8f9fb]"><Loader2 className="w-8 h-8 animate-spin text-on-primary-container" /></div>

  // ── Status guards ──────────────────────────────────────────────────────────
  if (!cls) return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#f8f9fb] gap-4">
      <p className="text-2xl font-bold text-[#1a1a4e]">Class not found</p>
      <button onClick={() => router.back()} className="text-sm text-[#c0622f] font-bold underline">Go back</button>
    </div>
  )

  if (cls.status === 'completed') {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#f8f9fb] gap-4 p-8 text-center">
        <span className="text-5xl">🎬</span>
        <p className="text-2xl font-bold text-[#1a1a4e]">This session has ended</p>
        <p className="text-slate-500 max-w-sm">The recording will be available shortly in Recorded Lectures.</p>
        <div className="flex gap-3 mt-2">
          <button onClick={() => router.push('/recorded-lectures')} className="px-5 py-2.5 bg-[#c0622f] text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all">
            View Recorded Lectures
          </button>
          <button onClick={() => router.back()} className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all">
            Go Back
          </button>
        </div>
      </div>
    )
  }

  if (cls.status === 'scheduled' || cls.status === 'upcoming') {
    const scheduledTime = cls.scheduled_at ? new Date(cls.scheduled_at) : null
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#f8f9fb] gap-4 p-8 text-center">
        <span className="text-5xl">📅</span>
        <p className="text-2xl font-bold text-[#1a1a4e]">Class hasn&apos;t started yet</p>
        <p className="text-slate-500 font-medium">{cls.title}</p>
        {scheduledTime && (
          <div className="bg-white rounded-xl px-6 py-4 shadow-sm border border-slate-100 mt-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Scheduled for</p>
            <p className="text-lg font-bold text-[#1a1a4e]">{scheduledTime.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p className="text-[#c0622f] font-bold">{scheduledTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        )}
        <p className="text-xs text-slate-400 mt-2">This page will update automatically when the class goes live.</p>
        <button onClick={() => router.push('/live-classes')} className="mt-2 px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all">
          ← Back to Live Classes
        </button>
      </div>
    )
  }
  // ──────────────────────────────────────────────────────────────────────────

  const filteredMessages = messages.filter((msg) => {
    const isAdmin = user?.role === 'admin' || user?.role === 'super-admin' || user?.role === 'super_admin'
    if (isAdmin) return true
    return msg.user_id === user?.id
  })

  return (
    <div className="h-full min-h-0 flex flex-col bg-[#f8f9fb] overflow-hidden relative">
      {/* Compact top bar */}
      <div className="h-12 md:h-14 px-3 md:px-4 flex items-center justify-between bg-white border-b border-slate-200/60 flex-shrink-0 z-20">
        <div className="flex items-center gap-3">
          <button className="text-slate-500 hover:text-[#1a1a4e]" onClick={() => router.back()}><ArrowLeft className="w-5 h-5"/></button>
          <span className="flex items-center gap-2 bg-error/10 border border-error/20 px-2.5 py-1 rounded-full">
            <span className="relative inline-flex h-2.5 w-2.5 flex-shrink-0">
              <span className="absolute inline-flex h-full w-full rounded-full bg-error/70 animate-ping" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-error ring-2 ring-error/30" />
            </span>
            <span className="text-error text-[10px] font-black tracking-[0.15em] uppercase">LIVE</span>
          </span>
          <p className="font-headline font-bold text-[#1a1a4e] text-sm truncate max-w-[180px] md:max-w-none">{cls?.title}</p>
        </div>
        <div className="flex items-center gap-2">
          {connected
            ? <span title="Connected"><Wifi className="w-3.5 h-3.5 text-green-500" /></span>
            : <span title="Reconnecting…"><WifiOff className="w-3.5 h-3.5 text-slate-400 animate-pulse" /></span>}
        </div>
      </div>

      {/* Full-width video area */}
      <div className="flex-1 min-h-0 overflow-y-auto bg-white p-3 md:p-6">
        <div className="w-full max-w-6xl mx-auto space-y-4">
          {/* Class info — hidden on very small screens, compact on medium */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3 md:p-5 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="bg-[#1a1a4e]/5 text-[#1a1a4e] px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">{cls?.subject}</span>
                <span className="text-slate-500 text-xs font-medium">{formatDuration(cls?.duration_min)}</span>
              </div>
              <h1 className="text-base md:text-xl font-headline font-bold text-[#1a1a4e] truncate">{cls?.title}</h1>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-right flex-shrink-0">
              <div>
                <p className="font-bold text-xs text-[#1a1a4e]">Instructor</p>
                <p className="text-slate-500 text-[10px]">{cls?.teacher}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[#1a1a4e] text-xs border border-slate-200">
                {cls?.teacher?.[0] ?? 'T'}
              </div>
            </div>
          </div>

          {/* Video player — full width */}
          <SecureVideoPlayer
            videoUrl={cls?.stream_url ?? ''}
            title={cls?.title}
            preferLiveEdge
            className="w-full rounded-2xl md:rounded-[24px] shadow-[0_20px_80px_rgba(0,0,0,0.25)]"
          />
        </div>
      </div>

      {/* Floating chat toggle button */}
      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-30 w-14 h-14 bg-[#c0622f] text-white rounded-full flex items-center justify-center shadow-lg shadow-[#c0622f]/30 hover:scale-105 active:scale-95 transition-all"
        >
          <MessageSquare className="w-6 h-6" />
          {filteredMessages.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-error text-white text-[10px] font-black rounded-full flex items-center justify-center">
              {filteredMessages.length > 99 ? '99+' : filteredMessages.length}
            </span>
          )}
        </button>
      )}

      {/* Chat popup modal */}
      {chatOpen && (
        <>
          {/* Backdrop on mobile */}
          <div className="fixed inset-0 bg-black/30 z-30 md:hidden" onClick={() => setChatOpen(false)} />
          <div className="fixed bottom-0 left-0 right-0 md:bottom-6 md:right-6 md:left-auto md:w-96 z-40 flex flex-col bg-white rounded-t-2xl md:rounded-2xl shadow-2xl border border-slate-200 max-h-[70vh] md:max-h-[520px] overflow-hidden">
            {/* Chat header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 flex-shrink-0">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#c0622f]" />
                <span className="text-sm font-bold text-[#1a1a4e]">Live Chat</span>
                <span className="text-[10px] font-bold text-slate-400">({filteredMessages.length})</span>
              </div>
              <button onClick={() => setChatOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {filteredMessages.length === 0 ? (
                <p className="text-center text-outline text-xs py-6">No messages yet. Be first to chat!</p>
              ) : filteredMessages.map((msg) => {
                const isMe = msg.user_id === user?.id
                return (
                  <div key={msg.id} className={cn("flex flex-col", isMe && "items-end")}>
                    <div className={cn("flex items-center gap-2 mb-1", isMe && "flex-row-reverse")}>
                      <div className="w-5 h-5 rounded-full bg-[#1a1a4e] flex items-center justify-center text-[8px] font-black text-white">
                        {(msg.sender_name ?? 'U')[0]}
                      </div>
                      <span className="text-[11px] font-bold text-[#1a1a4e]">{isMe ? 'You' : msg.sender_name ?? 'User'}</span>
                      <span className="text-[10px] text-slate-300 ml-auto">{new Date(msg.created_at).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</span>
                    </div>
                    <div className={cn("px-3 py-2 rounded-xl text-xs leading-relaxed max-w-[85%]",
                      isMe ? "bg-[#c0622f] text-white rounded-tr-none" : "bg-slate-100 text-slate-700 rounded-tl-none")}>
                      {msg.text}
                    </div>
                  </div>
                )
              })}
              {typingUsers.length > 0 && (
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 pl-1">
                  <span className="flex gap-0.5">
                    <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]" />
                  </span>
                  {typingUsers[0].name} is typing…
                </div>
              )}
              <div ref={messagesEnd} />
            </div>

            {/* Chat input */}
            <div className="border-t border-slate-100 px-3 pt-3 pb-4 md:pb-3 flex-shrink-0">
              {isMuted && (
                <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  <VolumeX className="w-3.5 h-3.5 flex-shrink-0" />
                  You have been muted by the host.
                </div>
              )}
              {rateLimited && !isMuted && (
                <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  Slow down — rate limit reached. Please wait a moment.
                </div>
              )}
              {blockedWord && !isMuted && (
                <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  Your message contains restricted words. Please rephrase.
                </div>
              )}
              <div className="flex items-center gap-2">
                <input
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  onBlur={() => setTyping(false)}
                  placeholder={isMuted ? 'You are muted' : connected ? 'Type a message…' : 'Reconnecting…'}
                  disabled={!connected || isMuted || rateLimited}
                  className="flex-1 text-xs bg-slate-50 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-on-primary-container/20 disabled:opacity-50"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || !connected || isMuted || rateLimited}
                  className="w-8 h-8 rounded-lg bg-on-primary-container text-white flex items-center justify-center hover:opacity-90 disabled:opacity-40">
                  <Send className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
