'use client'
// Admin Live Class Monitor — real-time session dashboard while class is broadcasting
import { useState } from 'react'
import { ArrowLeft, Users, MessageSquare, Hand, Send, StopCircle, Mic, MicOff, Video, VideoOff } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'

interface ChatMsg { id: string; user: string; text: string; time: string; isAdmin?: boolean }

const CHAT: ChatMsg[] = [
  { id: 'm1', user: 'Academic Admin', text: 'Welcome everyone! Joining the session now.', time: '09:15', isAdmin: true },
  { id: 'm2', user: 'Sita Magar', text: 'Sir, can you explain the substitution method?', time: '09:17' },
  { id: 'm3', user: 'Rajesh Thapa', text: 'The formula sheet was very helpful, thank you!', time: '09:18' },
  { id: 'm4', user: 'Anish Koirala', text: "Can we get a PDF of today's notes?", time: '09:19' },
  { id: 'm5', user: 'Kripa Shrestha', text: '🙏 Thank you, sir!', time: '09:20' },
]

const HAND_RAISES = [
  { id: 'h1', name: 'Sita Magar', time: '09:17' },
  { id: 'h2', name: 'Anish Koirala', time: '09:19' },
  { id: 'h3', name: 'Mohan KC', time: '09:21' },
]

export default function LiveClassMonitorPage() {
  const [chat, setChat] = useState<ChatMsg[]>(CHAT)
  const [msgInput, setMsgInput] = useState('')
  const [micOn, setMicOn] = useState(true)
  const [camOn, setCamOn] = useState(true)
  const [activeTab, setActiveTab] = useState<'chat' | 'hands'>('chat')

  const sendMsg = () => {
    if (!msgInput.trim()) return
    const n: ChatMsg = { id: `m${Date.now()}`, user: 'Academic Admin', text: msgInput.trim(), time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }), isAdmin: true }
    setChat((prev) => [...prev, n])
    setMsgInput('')
  }

  return (
    <div className="h-screen flex flex-col bg-[#0d0d1a] overflow-hidden">

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-[#1a1a4e] flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/admin/live-classes" className="text-white/50 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 bg-error/90 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span className="text-white text-[10px] font-black tracking-widest uppercase">Live</span>
              </span>
              <p className="font-headline font-bold text-white">Advanced Calculus II: Integral Foundations</p>
            </div>
            <p className="text-white/50 text-[11px] mt-0.5">Dr. Sameer Adhikari · Mathematics · Started 09:15</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-white/70 text-sm font-medium">
            <Users className="w-4 h-4" /> <span className="font-bold text-white">2,412</span> watching
          </div>
          <button
            onClick={() => setMicOn(!micOn)}
            className={cn('p-2.5 rounded-xl transition-colors', micOn ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-error/30 text-error')}
          >
            {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setCamOn(!camOn)}
            className={cn('p-2.5 rounded-xl transition-colors', camOn ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-error/30 text-error')}
          >
            {camOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>
          <button className="flex items-center gap-2 bg-error/90 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-error active:scale-95 transition-all">
            <StopCircle className="w-4 h-4" /> End Session
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex min-h-0">

        {/* ── Video preview ── */}
        <div className="flex-1 bg-gradient-to-br from-[#1a1a4e]/80 to-[#074f4f]/60 flex items-center justify-center relative">
          <div className="text-center text-white/40">
            <Video className="w-20 h-20 mx-auto mb-4" />
            <p className="font-medium">Admin broadcast preview</p>
          </div>
          {/* Stats overlay */}
          <div className="absolute bottom-6 left-6 right-6 grid grid-cols-3 gap-4">
            {[
              { label: 'Watching', value: '2,412' },
              { label: 'Hands Raised', value: `${HAND_RAISES.length}` },
              { label: 'Chat Messages', value: `${chat.length}` },
            ].map((s) => (
              <div key={s.label} className="bg-black/50 backdrop-blur-sm rounded-xl px-4 py-3 text-center">
                <p className="text-white font-black text-xl">{s.value}</p>
                <p className="text-white/50 text-xs font-medium mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Sidebar panel ── */}
        <div className="w-80 bg-white flex flex-col flex-shrink-0 border-l border-white/10">

          {/* Tabs */}
          <div className="flex border-b border-surface-container flex-shrink-0">
            <button
              onClick={() => setActiveTab('chat')}
              className={cn('flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-bold transition-colors',
                activeTab === 'chat' ? 'text-[#c0622f] border-b-2 border-[#c0622f]' : 'text-slate-400'
              )}
            >
              <MessageSquare className="w-4 h-4" /> Chat ({chat.length})
            </button>
            <button
              onClick={() => setActiveTab('hands')}
              className={cn('flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-bold transition-colors',
                activeTab === 'hands' ? 'text-[#c0622f] border-b-2 border-[#c0622f]' : 'text-slate-400'
              )}
            >
              <Hand className="w-4 h-4" /> Hands ({HAND_RAISES.length})
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'chat' ? (
              <div className="space-y-4">
                {chat.map((msg) => (
                  <div key={msg.id} className={cn('flex flex-col', msg.isAdmin && 'bg-[#1a1a4e]/5 rounded-xl p-3')}>
                    <div className="flex items-center gap-2 mb-1">
                      <div className={cn('w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black', msg.isAdmin ? 'bg-[#1a1a4e] text-white' : 'bg-surface-container text-on-surface-variant')}>
                        {msg.user[0]}
                      </div>
                      <span className={cn('text-[11px] font-bold', msg.isAdmin ? 'text-[#1a1a4e]' : 'text-slate-500')}>{msg.user}</span>
                      <span className="text-[10px] text-slate-300 ml-auto">{msg.time}</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed pl-7">{msg.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {HAND_RAISES.map((h) => (
                  <div key={h.id} className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-on-primary-container text-white flex items-center justify-center text-xs font-bold">{h.name[0]}</div>
                      <div>
                        <p className="text-sm font-bold text-on-surface">{h.name}</p>
                        <p className="text-[10px] text-outline">Raised at {h.time}</p>
                      </div>
                    </div>
                    <button className="text-xs font-bold text-on-primary-container hover:underline">Ack</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Message input (chat only) */}
          {activeTab === 'chat' && (
            <div className="p-3 border-t border-surface-container flex-shrink-0">
              <div className="flex items-center gap-2">
                <input
                  value={msgInput}
                  onChange={(e) => setMsgInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMsg()}
                  placeholder="Send announcement..."
                  className="flex-1 px-3 py-2 bg-surface-container rounded-lg text-sm border-none focus:ring-2 focus:ring-on-primary-container/20"
                />
                <button
                  onClick={sendMsg}
                  disabled={!msgInput.trim()}
                  className="p-2.5 bg-on-primary-container text-white rounded-lg hover:opacity-90 disabled:opacity-30 transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
