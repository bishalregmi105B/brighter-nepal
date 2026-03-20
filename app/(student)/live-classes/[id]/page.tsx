'use client'
// Student Live Class Room — full-screen video player with live chat / Q&A panel
// Based on live_class_student_view/code.html design
import { useState } from 'react'
import { Users, Hand, MessageSquare, Maximize2, Play, Pause, Volume2, Settings } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface ChatMessage {
  id:     string
  user:   string
  text:   string
  time:   string
  admin?: boolean
}

const chatMessages: ChatMessage[] = [
  { id: 'c1', user: 'Academic Admin',  text: "Welcome everyone! Today we're covering Integral Calculus from Chapter 8.",    time: '09:15', admin: true },
  { id: 'c2', user: 'Sita Magar',      text: 'Sir, can you explain the substitution method once more?',                   time: '09:17' },
  { id: 'c3', user: 'Rajesh Thapa',    text: 'The formula sheet shared yesterday was very helpful, thank you!',           time: '09:18' },
  { id: 'c4', user: 'Academic Admin',  text: 'Sure, Sita — pause at 14:30, I will explain it there step by step.',        time: '09:19', admin: true },
  { id: 'c5', user: 'Anish Koirala',   text: '🙏 Thank you, sir!',                                                        time: '09:20' },
]

export default function LiveClassRoomPage() {
  const [isPlaying, setIsPlaying] = useState(true)
  const [activeTab, setActiveTab] = useState<'chat' | 'qa'>('chat')

  return (
    <div className="h-screen flex flex-col md:flex-row bg-[#0d0d1a] overflow-hidden">

      {/* ── Video Panel ──────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col bg-black/90">

        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-3 bg-[#1a1a4e]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 bg-error/90 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span className="text-white text-[10px] font-black tracking-widest uppercase">Live</span>
            </span>
            <div>
              <p className="font-headline font-bold text-white text-sm">Advanced Calculus II: Integral Foundations</p>
              <p className="text-white/50 text-[10px]">Dr. Sameer Adhikari · Mathematics</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-white/60">
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium">2,412 watching</span>
          </div>
        </div>

        {/* Video placeholder */}
        <div className="flex-1 relative bg-gradient-to-br from-[#1a1a4e]/80 to-[#074f4f]/60 flex items-center justify-center min-h-0">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center hover:bg-on-primary-container/40 active:scale-95 transition-all"
          >
            {isPlaying
              ? <Pause className="w-9 h-9 text-white" />
              : <Play  className="w-9 h-9 text-white fill-white" />
            }
          </button>
          {/* Fake caption overlay */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-black/70 px-5 py-2 rounded-lg">
            <p className="text-white text-sm text-center">
              "The substitution rule: ∫ f(g(x)) · g&apos;(x) dx = F(g(x)) + C"
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#0d0d1a]">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsPlaying(!isPlaying)} className="text-white hover:text-on-primary-container transition-colors">
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-current" />}
            </button>
            <div className="flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-white/60" />
              <div className="w-24 h-1.5 bg-white/20 rounded-full">
                <div className="w-3/4 h-full bg-white rounded-full" />
              </div>
            </div>
            <span className="text-white/50 text-xs">LIVE</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm transition-colors">
              <Hand className="w-4 h-4" /> Raise Hand
            </button>
            <button className="text-white/60 hover:text-white transition-colors">
              <Settings className="w-5 h-5" />
            </button>
            <button className="text-white/60 hover:text-white transition-colors">
              <Maximize2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Chat Panel ───────────────────────────────────────────────────── */}
      <div className="w-full md:w-80 flex flex-col bg-white border-l border-slate-200/10 h-64 md:h-auto">

        {/* Tab selector */}
        <div className="flex border-b border-surface-container bg-surface-container-low flex-shrink-0">
          {[{ id: 'chat', label: 'Live Chat' }, { id: 'qa', label: 'Q&A' }].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'chat' | 'qa')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-bold transition-colors',
                activeTab === tab.id
                  ? 'text-[#c0622f] border-b-2 border-[#c0622f] bg-white'
                  : 'text-slate-400 hover:text-on-surface'
              )}
            >
              <MessageSquare className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatMessages.map((msg) => (
            <div key={msg.id} className={cn('flex flex-col', msg.admin && 'bg-[#1a1a4e]/5 rounded-xl p-3')}>
              <div className="flex items-center gap-2 mb-1">
                <div className={cn('w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black', msg.admin ? 'bg-[#1a1a4e] text-white' : 'bg-surface-container-high text-on-surface-variant')}>
                  {msg.user[0]}
                </div>
                <span className={cn('text-[11px] font-bold', msg.admin ? 'text-[#1a1a4e]' : 'text-slate-500')}>
                  {msg.user}
                </span>
                <span className="text-[10px] text-slate-300 ml-auto">{msg.time}</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed pl-7">{msg.text}</p>
            </div>
          ))}
        </div>

        {/* Read-only notice */}
        <div className="p-3 border-t border-surface-container bg-surface-container-low flex-shrink-0">
          <p className="text-xs text-center text-outline font-medium">
            This is a read-only broadcast. Use Raise Hand to ask questions.
          </p>
        </div>
      </div>
    </div>
  )
}
