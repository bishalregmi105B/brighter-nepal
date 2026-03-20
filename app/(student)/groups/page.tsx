'use client'
// Student Groups Feed — based exactly on student_groups_feed/code.html
// Two-panel layout: left channel list + right channel feed with admin messages & emoji reactions
import { useState } from 'react'
import { Search, BadgeCheck, MoreVertical, Plus, Smile, Play } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

// ─── Data ────────────────────────────────────────────────────────────────────

interface Channel {
  id:        string
  name:      string
  preview:   string
  badge?:    number
  active?:   boolean
  archived?: boolean
}

interface Message {
  id:         string
  sender:     string
  time:       string
  body:       string
  hasImage?:  boolean
  reactions:  { emoji: string; count: number; active?: boolean }[]
}

const channels: Channel[] = [
  { id: 'physics',  name: 'Physics Grade 12 - Elite',  preview: "Admin: Today's mock test results are out...", badge: 12, active: true },
  { id: 'medical',  name: 'Medical Entrance Prep',      preview: 'Last update: 2 hours ago',                 badge: 4 },
  { id: 'math',     name: 'Mathematics Olympiad',       preview: 'Dr. Sharma posted a new challenge' },
  { id: 'chem',     name: 'Chemistry Lab Forum',        preview: 'Organic Chemistry quiz starts at 5PM',     badge: 2 },
  { id: 'archive',  name: 'Archives: Grade 11 Recap',  preview: 'Archived 2 weeks ago', archived: true },
]

const messages: Message[] = [
  {
    id:      'm1',
    sender:  'Academic Admin',
    time:    '09:15 AM',
    body:    "Good morning Scholars! 🎓 The Model Exam Set for Mechanics is now live in the Resources section. Please ensure you attempt it before Thursday's live review session.",
    reactions: [
      { emoji: '👍', count: 142 },
      { emoji: '🚀', count: 56  },
      { emoji: '🔥', count: 89  },
    ],
  },
  {
    id:        'm2',
    sender:    'Dr. Hemant (Physics Lead)',
    time:      '02:30 PM',
    body:      "Visualizing Electromagnetic Induction. Watch this 2-minute animation before our session starts. It clarifies the Faraday's Law paradox we discussed.",
    hasImage:  true,
    reactions: [
      { emoji: '❤️', count: 215             },
      { emoji: '🤯', count: 42, active: true },
    ],
  },
]

const quickReacts = ['👏', '💡', '✅', '⭐', '💯', '🙋‍♂️', '📚']

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function GroupsPage() {
  const [activeChannel, setActiveChannel] = useState('physics')

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-surface-container-low">

      {/* ── Left Panel: Channel List ─────────────────────────────────────── */}
      <section className="w-72 md:w-80 flex-shrink-0 flex flex-col bg-white border-r border-slate-200/30">

        {/* Channel list header */}
        <div className="p-5 border-b border-surface-container">
          <h2 className="text-xl font-extrabold text-[#1a1a4e] tracking-tight mb-4">Study Channels</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
            <input
              type="text"
              className="w-full pl-9 pr-4 py-2 bg-surface-container border-none rounded-lg text-sm focus:ring-1 focus:ring-on-primary-container/30"
              placeholder="Filter channels..."
            />
          </div>
        </div>

        {/* Channel items */}
        <div className="flex-1 overflow-y-auto py-2 space-y-1">
          {channels.map((ch) => (
            <div
              key={ch.id}
              onClick={() => setActiveChannel(ch.id)}
              className={cn(
                'mx-3 p-4 rounded-xl cursor-pointer transition-all',
                ch.archived && 'opacity-60',
                activeChannel === ch.id
                  ? 'bg-primary-container/5 border-l-4 border-[#c0622f]'
                  : 'hover:bg-surface-container/50 border-l-4 border-transparent'
              )}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <h3 className={cn(
                    'font-bold text-sm truncate',
                    activeChannel === ch.id ? 'text-[#1a1a4e]' : 'text-on-surface-variant'
                  )}>
                    {ch.name}
                  </h3>
                  <p className={cn(
                    'text-xs mt-1 line-clamp-1',
                    activeChannel === ch.id ? 'text-slate-500 italic' : 'text-slate-400'
                  )}>
                    {ch.preview}
                  </p>
                </div>
                {ch.badge && (
                  <span className={cn(
                    'text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-2 flex-shrink-0',
                    activeChannel === ch.id ? 'bg-[#c0622f]' : 'bg-surface-container-highest text-on-surface-variant'
                  )}>
                    {ch.badge}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Right Panel: Feed ────────────────────────────────────────────── */}
      <section className="flex-1 flex flex-col bg-white overflow-hidden">

        {/* Feed header */}
        <header className="p-5 bg-white border-b border-surface-container flex justify-between items-center flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-[#1a1a4e]">Physics Grade 12 - Elite</h2>
              <BadgeCheck className="w-5 h-5 text-[#2d6a6a]" />
            </div>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-[#2d6a6a] font-semibold bg-tertiary-fixed/30 px-2 py-0.5 rounded-full">
                1,248 Members
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                Official channel for premium curriculum updates and announcements.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-slate-400 hover:text-on-surface-variant rounded-lg hover:bg-surface-container transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <button className="p-2 text-slate-400 hover:text-on-surface-variant rounded-lg hover:bg-surface-container transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Messages feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-[#f8f9fb]">
          {messages.map((msg, idx) => (
            <div key={msg.id}>
              {/* Date separator before second message */}
              {idx === 1 && (
                <div className="relative flex py-5 items-center mb-8">
                  <div className="flex-grow border-t border-slate-200/50" />
                  <span className="flex-shrink mx-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Yesterday</span>
                  <div className="flex-grow border-t border-slate-200/50" />
                </div>
              )}

              <div className="flex flex-col items-start max-w-2xl">
                {/* Sender */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-[#1a1a4e] flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-bold text-white">BN</span>
                  </div>
                  <span className="text-xs font-bold text-[#1a1a4e]">
                    {msg.sender} • {msg.time}
                  </span>
                </div>

                {/* Bubble */}
                <div className="bg-[#1a1a4e] text-white p-4 rounded-2xl rounded-tl-none shadow-sm space-y-3 max-w-xl">
                  <p className="text-sm leading-relaxed">{msg.body}</p>

                  {/* Image attachment */}
                  {msg.hasImage && (
                    <div className="rounded-xl overflow-hidden border border-white/10 group cursor-pointer relative">
                      <div className="w-full h-40 bg-gradient-to-br from-[#074f4f] to-[#1a1a4e] flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                          <Play className="w-7 h-7 text-white fill-white" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Reactions */}
                <div className="flex gap-2 mt-2">
                  {msg.reactions.map((r) => (
                    <button
                      key={r.emoji}
                      className={cn(
                        'flex items-center gap-1.5 px-2 py-1 rounded-full text-xs transition-all shadow-sm',
                        r.active
                          ? 'bg-on-primary-container/10 border border-on-primary-container/20'
                          : 'bg-white border border-slate-100 hover:border-[#c0622f]'
                      )}
                    >
                      <span>{r.emoji}</span>
                      <span className={cn('font-bold', r.active ? 'text-[#c0622f]' : 'text-slate-500')}>
                        {r.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* Read-only notice */}
          <div className="bg-surface-container rounded-xl p-4 flex items-center gap-3 border-l-4 border-slate-400 max-w-lg mx-auto">
            <span className="text-slate-500 text-lg">🔒</span>
            <p className="text-xs font-medium text-slate-600">
              Only administrators can send messages to this group. Reactions are enabled for all members.
            </p>
          </div>
        </div>

        {/* Reaction bar (footer) */}
        <footer className="p-4 bg-white border-t border-surface-container flex-shrink-0">
          <div className="flex items-center gap-4 bg-surface-container-low p-2 rounded-2xl">
            <div className="flex items-center gap-1 px-3 py-2 border-r border-slate-200">
              <Smile className="w-5 h-5 text-slate-400" />
              <span className="text-xs font-bold text-slate-400 uppercase ml-1">React</span>
            </div>
            <div className="flex flex-1 gap-4 overflow-x-auto py-1">
              {quickReacts.map((emoji) => (
                <button
                  key={emoji}
                  className="hover:scale-125 transition-transform text-xl grayscale hover:grayscale-0 flex-shrink-0"
                >
                  {emoji}
                </button>
              ))}
            </div>
            <button className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-colors flex-shrink-0">
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </footer>
      </section>
    </div>
  )
}
