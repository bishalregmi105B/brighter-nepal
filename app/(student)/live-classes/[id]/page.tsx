'use client'
// Student Live Class Room — real-time chat via SocketIO
import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Users, MessageSquare, Send, Loader2, ArrowLeft, Wifi, WifiOff } from 'lucide-react'
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
  const [activeTab, setActiveTab] = useState<'chat' | 'qa'>('chat')
  const [loading,   setLoading]   = useState(true)
  const messagesEnd = useRef<HTMLDivElement>(null)

  const classId = cls?.id ?? null
  const { messages, sendMessage, setTyping, typingUsers, onlineCount, connected } = useLiveChat(classId)

  useEffect(() => {
    if (!params.id) return
    authService.getMe().then(u => setUser(u)).catch(() => {})
    liveClassService.getClass(Number(params.id)).then((res) => {
      setCls(res.data)
    }).finally(() => setLoading(false))
  }, [params.id])

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

  if (loading) return <div className="flex items-center justify-center h-screen bg-[#f8f9fb]"><Loader2 className="w-8 h-8 animate-spin text-on-primary-container" /></div>

  return (
    <div className="h-screen flex flex-col md:flex-row bg-[#f8f9fb] overflow-hidden">
      {/* Video Side */}
      <div className="flex flex-col w-full md:flex-1 min-w-0 overflow-y-auto custom-scrollbar">
        <div className="h-16 md:h-[72px] px-4 flex items-center justify-between border-b border-surface-container/10 bg-white flex-shrink-0 z-20 sticky top-0 shadow-sm">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-slate-500 hover:text-[#1a1a4e]" onClick={() => router.back()}><ArrowLeft className="w-5 h-5"/></button>
            <span className="flex items-center gap-1.5 bg-error/10 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse" />
              <span className="text-error text-[10px] font-black tracking-widest uppercase">Live</span>
            </span>
            <div>
              <p className="font-headline font-bold text-[#1a1a4e] text-sm">{cls?.title ?? 'Live Session'}</p>
              <p className="text-slate-500 text-[10px]">{cls?.teacher ?? '—'} · {cls?.subject ?? '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-slate-500">
            {onlineCount > 0 && (
              <span className="flex items-center gap-1 text-xs text-green-600 font-semibold">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                {onlineCount} live
              </span>
            )}
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium">{(cls?.watchers ?? 0).toLocaleString()} watching</span>
          </div>
        </div>

        <div className="w-full aspect-video bg-black flex items-center justify-center relative flex-shrink-0 shadow-lg">
          <SecureVideoPlayer
            videoUrl={cls?.stream_url ?? 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'}
            title={cls?.title}
            className="w-full h-full rounded-none"
          />
        </div>

        {/* Class Details */}
        <div className="p-6 md:p-8 text-[#1a1a4e] space-y-4 max-w-4xl">
          <div className="flex flex-wrap items-center gap-3">
            <span className="bg-[#1a1a4e]/5 border border-[#1a1a4e]/10 text-[#1a1a4e] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">{cls?.subject}</span>
            <span className="text-slate-500 text-sm font-medium">{cls?.duration_min} minutes</span>
            {cls?.scheduled_at && <span className="text-slate-500 text-sm font-medium">· {new Date(cls.scheduled_at).toLocaleDateString()}</span>}
          </div>
          <h1 className="text-2xl md:text-3xl font-headline font-bold">{cls?.title}</h1>
          <div className="flex items-center gap-3 pt-2">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[#1a1a4e] border border-slate-200">{cls?.teacher?.[0] ?? 'T'}</div>
            <div>
              <p className="font-bold text-sm">Instructor</p>
              <p className="text-slate-600 text-xs">{cls?.teacher}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Panel */}
      <div className="w-full flex-1 md:flex-none md:w-80 flex flex-col bg-white border-l border-slate-200/10 min-h-0">
        <div className="flex border-b border-surface-container bg-surface-container-low flex-shrink-0">
          {[{ id: 'chat', label: 'Live Chat' }, { id: 'qa', label: 'Q&A' }].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as 'chat' | 'qa')} className={cn(
              'flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-bold transition-colors',
              activeTab === tab.id ? 'text-[#c0622f] border-b-2 border-[#c0622f] bg-white' : 'text-slate-400 hover:text-on-surface'
            )}>
              <MessageSquare className="w-4 h-4" /> {tab.label}
            </button>
          ))}
          {/* Live / offline status */}
          <div className="flex items-center px-3">
            {connected
              ? <Wifi className="w-3.5 h-3.5 text-green-500" title="Connected" />
              : <WifiOff className="w-3.5 h-3.5 text-slate-400 animate-pulse" title="Reconnecting…" />}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <p className="text-center text-outline text-xs py-6">No messages yet. Be first to chat!</p>
          ) : messages.map((msg) => {
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

          {/* Typing indicator */}
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

        <div className="p-3 border-t border-surface-container bg-surface-container-low flex-shrink-0">
          <div className="flex items-center gap-2">
            <input
              value={input}
              onChange={handleInputChange}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              onBlur={() => setTyping(false)}
              placeholder={connected ? 'Type a message…' : 'Reconnecting…'}
              disabled={!connected}
              className="flex-1 text-xs bg-white rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-on-primary-container/20 disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || !connected}
              className="w-8 h-8 rounded-lg bg-on-primary-container text-white flex items-center justify-center hover:opacity-90 disabled:opacity-40">
              <Send className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
