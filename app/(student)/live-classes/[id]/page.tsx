'use client'
// Student Live Class Room — fetches real class data and group messages for chat
import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Users, Hand, MessageSquare, Maximize2, Play, Pause, Volume2, Settings, Send, Loader2, ArrowLeft } from 'lucide-react'
import { liveClassService, type LiveClass } from '@/services/liveClassService'
import { groupService, type GroupMessage } from '@/services/groupService'
import { cn } from '@/lib/utils/cn'
import { SecureVideoPlayer } from '@/components/media/SecureVideoPlayer'

export default function LiveClassRoomPage() {
  const params       = useParams<{ id: string }>()
  const router       = useRouter()
  const [cls,        setCls]       = useState<LiveClass | null>(null)
  const [messages,   setMessages]  = useState<GroupMessage[]>([])
  const [input,      setInput]     = useState('')
  const [isPlaying,  setIsPlaying] = useState(true)
  const [activeTab,  setActiveTab] = useState<'chat' | 'qa'>('chat')
  const [sending,    setSending]   = useState(false)
  const [loading,    setLoading]   = useState(true)
  const messagesEnd  = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!params.id) return
    liveClassService.getClass(Number(params.id)).then((res) => {
      const c = res.data
      setCls(c)
      // Load chat via the group linked to this class (group_id from class data)
      if (c.group_id) {
        groupService.getGroupMessages(c.group_id, 30).then((msgRes) => {
          setMessages(msgRes.data?.items ?? [])
        })
      }
    }).finally(() => setLoading(false))
  }, [params.id])

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || !cls?.group_id) return
    setSending(true)
    try {
      await groupService.sendMessage(cls.group_id, input)
      const res = await groupService.getGroupMessages(cls.group_id, 30)
      setMessages(res.data?.items ?? [])
      setInput('')
    } catch {}
    setSending(false)
  }

  if (loading) return <div className="flex items-center justify-center h-screen bg-[#0d0d1a]"><Loader2 className="w-8 h-8 animate-spin text-white" /></div>

  return (
    <div className="h-screen flex flex-col md:flex-row bg-[#0d0d1a] overflow-hidden">
      {/* Video Side (left on desktop, top on mobile) */}
      <div className="flex flex-col w-full md:flex-1 min-w-0">
        <div className="h-16 md:h-18 px-4 flex items-center justify-between border-b border-surface-container/10 bg-[#0d0d2b] flex-shrink-0 z-20">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-white/70" onClick={() => router.back()}><ArrowLeft className="w-5 h-5"/></button>
            <span className="flex items-center gap-1.5 bg-error/90 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span className="text-white text-[10px] font-black tracking-widest uppercase">Live</span>
            </span>
            <div>
              <p className="font-headline font-bold text-white text-sm">{cls?.title ?? 'Live Session'}</p>
              <p className="text-white/50 text-[10px]">{cls?.teacher ?? '—'} · {cls?.subject ?? '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-white/60">
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium">{(cls?.watchers ?? 0).toLocaleString()} watching</span>
          </div>
        </div>

        <div className="w-full aspect-video md:flex-1 md:h-full bg-black flex items-center justify-center min-h-0 relative">
          <SecureVideoPlayer
            videoUrl={cls?.stream_url ?? 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'}
            title={cls?.title}
            className="w-full h-full rounded-none"
          />
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
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <p className="text-center text-outline text-xs py-6">No messages yet. Be first to chat!</p>
          ) : messages.map((msg) => (
            <div key={msg.id} className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-5 h-5 rounded-full bg-[#1a1a4e] flex items-center justify-center text-[8px] font-black text-white">
                  {(msg.sender_name ?? 'U')[0]}
                </div>
                <span className="text-[11px] font-bold text-[#1a1a4e]">{msg.sender_name ?? 'User'}</span>
                <span className="text-[10px] text-slate-300 ml-auto">{new Date(msg.created_at).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed pl-7">{msg.text}</p>
            </div>
          ))}
          <div ref={messagesEnd} />
        </div>

        <div className="p-3 border-t border-surface-container bg-surface-container-low flex-shrink-0">
          {cls?.group_id ? (
            <div className="flex items-center gap-2">
              <input value={input} onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message…" className="flex-1 text-xs bg-white rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-on-primary-container/20" />
              <button onClick={sendMessage} disabled={!input.trim() || sending}
                className="w-8 h-8 rounded-lg bg-on-primary-container text-white flex items-center justify-center hover:opacity-90 disabled:opacity-40">
                {sending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
              </button>
            </div>
          ) : (
            <p className="text-xs text-center text-outline font-medium">This is a read-only broadcast. Use Raise Hand to ask questions.</p>
          )}
        </div>
      </div>
    </div>
  )
}
