'use client'
// Admin Live Class Monitor — fetches real class data + group chat via API
import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, Users, MessageSquare, Hand, Send, StopCircle, Mic, MicOff, Video, VideoOff, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { liveClassService, type LiveClass } from '@/services/liveClassService'
import { groupService, type GroupMessage } from '@/services/groupService'
import { SecureVideoPlayer } from '@/components/media/SecureVideoPlayer'
import { cn } from '@/lib/utils/cn'

export default function LiveClassMonitorPage() {
  const params      = useParams<{ id: string }>()
  const [cls,       setCls]      = useState<LiveClass | null>(null)
  const [chat,      setChat]     = useState<GroupMessage[]>([])
  const [loading,   setLoading]  = useState(true)
  const [msgInput,  setMsgInput] = useState('')
  const [micOn,     setMicOn]    = useState(true)
  const [camOn,     setCamOn]    = useState(true)
  const [activeTab, setActiveTab] = useState<'chat' | 'hands'>('chat')
  const [sending,   setSending]  = useState(false)
  const messagesEnd = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!params.id) return
    liveClassService.getClass(Number(params.id)).then((res) => {
      const c = res.data
      setCls(c)
      if (c.group_id) {
        groupService.getGroupMessages(c.group_id, 50).then((r) => setChat(r.data?.items ?? []))
      }
    }).finally(() => setLoading(false))
  }, [params.id])

  useEffect(() => { messagesEnd.current?.scrollIntoView({ behavior: 'smooth' }) }, [chat])

  const sendMsg = async () => {
    if (!msgInput.trim() || !cls?.group_id) return
    setSending(true)
    try {
      await groupService.sendMessage(cls.group_id, msgInput.trim())
      const res = await groupService.getGroupMessages(cls.group_id, 50)
      setChat(res.data?.items ?? [])
      setMsgInput('')
    } catch {}
    setSending(false)
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
            <Users className="w-4 h-4" /> <span className="font-bold text-white">{(cls?.watchers ?? 0).toLocaleString()}</span> watching
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

      <div className="flex-1 flex min-h-0">
        <div className="flex-1 bg-black flex items-center justify-center relative">
          <SecureVideoPlayer
            videoUrl={cls?.stream_url ?? ''}
            title={cls?.title}
            className="w-full h-full rounded-none aspect-auto"
          />
          <div className="absolute bottom-6 left-6 right-6 grid grid-cols-3 gap-4 pointer-events-none">
            {[
              { label: 'Watching',      value: (cls?.watchers ?? 0).toLocaleString() },
              { label: 'Chat Messages', value: chat.length.toString()                },
              { label: 'Group',         value: cls?.group_id ? `#${cls.group_id}` : 'None' },
            ].map((s) => (
              <div key={s.label} className="bg-black/50 backdrop-blur-sm rounded-xl px-4 py-3 text-center">
                <p className="text-white font-black text-xl">{s.value}</p>
                <p className="text-white/50 text-xs font-medium mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="w-80 bg-white flex flex-col flex-shrink-0 border-l border-white/10">
          <div className="flex border-b border-surface-container flex-shrink-0">
            <button onClick={() => setActiveTab('chat')} className={cn('flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-bold transition-colors', activeTab === 'chat' ? 'text-[#c0622f] border-b-2 border-[#c0622f]' : 'text-slate-400')}>
              <MessageSquare className="w-4 h-4" /> Chat ({chat.length})
            </button>
            <button onClick={() => setActiveTab('hands')} className={cn('flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-bold transition-colors', activeTab === 'hands' ? 'text-[#c0622f] border-b-2 border-[#c0622f]' : 'text-slate-400')}>
              <Hand className="w-4 h-4" /> Hands
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'chat' ? (
              <div className="space-y-4">
                {chat.length === 0 && <p className="text-center text-outline text-xs py-6">No messages yet.</p>}
                {chat.map((msg) => (
                  <div key={msg.id} className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-5 h-5 rounded-full bg-[#1a1a4e] flex items-center justify-center text-[8px] font-black text-white">{(msg.sender_name ?? 'U')[0]}</div>
                      <span className="text-[11px] font-bold text-[#1a1a4e]">{msg.sender_name ?? 'User'}</span>
                      <span className="text-[10px] text-slate-300 ml-auto">{new Date(msg.created_at).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed pl-7">{msg.text}</p>
                  </div>
                ))}
                <div ref={messagesEnd} />
              </div>
            ) : (
              <div className="text-center py-10 text-outline text-xs">No hands raised yet.</div>
            )}
          </div>

          {activeTab === 'chat' && cls?.group_id && (
            <div className="p-3 border-t border-surface-container flex-shrink-0">
              <div className="flex items-center gap-2">
                <input value={msgInput} onChange={(e) => setMsgInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMsg()}
                  placeholder="Send announcement..." className="flex-1 px-3 py-2 bg-surface-container rounded-lg text-sm border-none focus:ring-2 focus:ring-on-primary-container/20" />
                <button onClick={sendMsg} disabled={!msgInput.trim() || sending}
                  className="p-2.5 bg-on-primary-container text-white rounded-lg hover:opacity-90 disabled:opacity-30 transition-all">
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
