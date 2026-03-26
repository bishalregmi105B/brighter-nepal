'use client'
// Admin Live Class Monitor — real-time chat + live stream monitoring
import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, Users, MessageSquare, Send, StopCircle, Mic, MicOff, Video, VideoOff, Loader2, Wifi, WifiOff } from 'lucide-react'
import Link from 'next/link'
import { liveClassService, type LiveClass } from '@/services/liveClassService'
import { useLiveChat } from '@/hooks/useLiveChat'
import { authService, type AuthUser } from '@/services/authService'
import { SecureVideoPlayer } from '@/components/media/SecureVideoPlayer'
import { cn } from '@/lib/utils/cn'

export default function LiveClassMonitorPage() {
  const params      = useParams<{ id: string }>()
  const [cls,       setCls]      = useState<LiveClass | null>(null)
  const [user,      setUser]     = useState<AuthUser | null>(null)
  const [loading,   setLoading]  = useState(true)
  const [msgInput,  setMsgInput] = useState('')
  const [micOn,     setMicOn]    = useState(true)
  const [camOn,     setCamOn]    = useState(true)
  const [activeTab, setActiveTab] = useState<'chat' | 'qa'>('chat')
  const messagesEnd = useRef<HTMLDivElement>(null)

  const classId = cls?.id ?? null
  const { messages, sendMessage, setTyping, typingUsers, onlineCount, connected } = useLiveChat(classId)

  useEffect(() => {
    if (!params.id) return
    authService.getMe().then(u => setUser(u)).catch(() => {})

    const fetchClass = () => {
      liveClassService.getClass(Number(params.id)).then((res) => {
        setCls(res.data)
      }).finally(() => setLoading(false))
    }

    fetchClass()
    const interval = setInterval(fetchClass, 20_000)
    return () => clearInterval(interval)
  }, [params.id])

  useEffect(() => { messagesEnd.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const sendMsg = () => {
    if (!msgInput.trim()) return
    sendMessage(msgInput.trim())
    setMsgInput('')
    setTyping(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMsgInput(e.target.value)
    setTyping(e.target.value.length > 0)
  }

  const endSession = () => {
    if (!params.id) return
    liveClassService.updateClass(Number(params.id), { status: 'completed' })
  }

  if (loading) return <div className="flex items-center justify-center h-screen bg-[#0d0d1a]"><Loader2 className="w-8 h-8 animate-spin text-white" /></div>

  return (
    <div className="h-screen flex flex-col bg-[#0d0d1a] overflow-hidden">
      <div className="flex items-center justify-between px-6 py-3 bg-[#1a1a4e] flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/admin/live-classes" className="text-white/50 hover:text-white transition-colors"><ArrowLeft className="w-5 h-5" /></Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 bg-error/90 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span className="text-white text-[10px] font-black tracking-widest uppercase">Live</span>
              </span>
              <p className="font-headline font-bold text-white">{cls?.title ?? 'Live Session'}</p>
            </div>
            <p className="text-white/50 text-[11px] mt-0.5">{cls?.teacher ?? '—'} · {cls?.subject ?? '—'}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-white/70 text-sm font-medium">
            <Users className="w-4 h-4" /> <span className="font-bold text-white">{(onlineCount || cls?.watchers || 0).toLocaleString()}</span> watching
          </div>
          <button onClick={() => setMicOn(!micOn)} className={cn('p-2.5 rounded-xl transition-colors', micOn ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-error/30 text-error')}>
            {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>
          <button onClick={() => setCamOn(!camOn)} className={cn('p-2.5 rounded-xl transition-colors', camOn ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-error/30 text-error')}>
            {camOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>
          <button onClick={endSession} className="flex items-center gap-2 bg-error/90 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-error active:scale-95 transition-all">
            <StopCircle className="w-4 h-4" /> End Session
          </button>
        </div>
      </div>

      <div className="flex-1 flex min-h-0 flex-col xl:flex-row">
        <div className="flex-1 min-h-0 overflow-y-auto bg-[#0b0b18] p-4 md:p-6">
          <div className="w-full max-w-6xl mx-auto space-y-4">
            <SecureVideoPlayer
              videoUrl={cls?.stream_url ?? ''}
              title={cls?.title}
              preferLiveEdge
              className="w-full rounded-[24px] shadow-[0_20px_80px_rgba(0,0,0,0.35)]"
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
            {[
              { label: 'Watching',      value: (onlineCount || cls?.watchers || 0).toLocaleString() },
              { label: 'Chat Messages', value: messages.length.toString()                               },
              { label: 'Live Room',     value: cls?.id ? `#${cls.id}` : 'None'                          },
            ].map((s) => (
                <div key={s.label} className="bg-white/6 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-4 text-center">
                <p className="text-white font-black text-xl">{s.value}</p>
                <p className="text-white/50 text-xs font-medium mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
        </div>

        <div className="w-full xl:w-80 bg-white flex flex-col flex-shrink-0 border-t xl:border-t-0 xl:border-l border-white/10 min-h-[320px] xl:min-h-0">
          <div className="flex border-b border-surface-container flex-shrink-0">
            <button onClick={() => setActiveTab('chat')} className={cn('flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-bold transition-colors', activeTab === 'chat' ? 'text-[#c0622f] border-b-2 border-[#c0622f]' : 'text-slate-400')}>
              <MessageSquare className="w-4 h-4" /> Chat ({messages.length})
            </button>
            <button onClick={() => setActiveTab('qa')} className={cn('flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-bold transition-colors', activeTab === 'qa' ? 'text-[#c0622f] border-b-2 border-[#c0622f]' : 'text-slate-400')}>
              <MessageSquare className="w-4 h-4" /> Q&amp;A
            </button>
            <div className="flex items-center px-3">
              {connected
                ? <span title="Connected"><Wifi className="w-3.5 h-3.5 text-green-500" /></span>
                : <span title="Reconnecting…"><WifiOff className="w-3.5 h-3.5 text-slate-400 animate-pulse" /></span>}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {messages.length === 0 && <p className="text-center text-outline text-xs py-6">No messages yet. Be first to chat!</p>}
              {messages.map((msg) => {
                const isMe = msg.user_id === user?.id
                return (
                  <div key={msg.id} className={cn("flex flex-col", isMe && "items-end")}>
                    <div className={cn("flex items-center gap-2 mb-1", isMe && "flex-row-reverse")}>
                      <div className="w-5 h-5 rounded-full bg-[#1a1a4e] flex items-center justify-center text-[8px] font-black text-white">{(msg.sender_name ?? 'U')[0]}</div>
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
          </div>

          <div className="p-3 border-t border-surface-container flex-shrink-0">
            <div className="flex items-center gap-2">
              <input
                value={msgInput}
                onChange={handleInputChange}
                onKeyDown={(e) => e.key === 'Enter' && sendMsg()}
                onBlur={() => setTyping(false)}
                placeholder={connected ? 'Type a message…' : 'Reconnecting…'}
                disabled={!connected}
                className="flex-1 px-3 py-2 bg-surface-container rounded-lg text-sm border-none focus:ring-2 focus:ring-on-primary-container/20 disabled:opacity-50"
              />
              <button
                onClick={sendMsg}
                disabled={!msgInput.trim() || !connected}
                className="p-2.5 bg-on-primary-container text-white rounded-lg hover:opacity-90 disabled:opacity-30 transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
