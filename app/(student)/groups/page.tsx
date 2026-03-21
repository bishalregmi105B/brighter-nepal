'use client'
// Student Groups — fetches real group + messages from groupService
import { useEffect, useState, useRef } from 'react'
import { BadgeCheck, MoreVertical, Search, Smile, Image, Send, Loader2 } from 'lucide-react'
import { groupService, type Group, type GroupMessage } from '@/services/groupService'
import { authService, type AuthUser } from '@/services/authService'
import { cn } from '@/lib/utils/cn'

const quickReacts = ['👏', '💡', '✅', '⭐', '💯', '🙋‍♂️', '📚']

export default function GroupsPage() {
  const [group,    setGroup]    = useState<Group | null>(null)
  const [messages, setMessages] = useState<GroupMessage[]>([])
  const [user,     setUser]     = useState<AuthUser | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [input,    setInput]    = useState('')
  const [preview,  setPreview]  = useState<string | null>(null)
  const [sending,  setSending]  = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    authService.getMe().then((u) => setUser(u)).catch(() => {})
    groupService.getMyGroup().then((res) => {
      const g = res.data
      if (!g) { setLoading(false); return }
      setGroup(g)
      groupService.getGroupMessages(g.id).then((msgRes) => {
        setMessages(msgRes.data?.items ?? [])
      }).finally(() => setLoading(false))
    }).catch(() => setLoading(false))
  }, [])

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
  }

  const sendMessage = async () => {
    if (!input.trim() && !preview) return
    if (!group) return
    setSending(true)
    try {
      await groupService.sendMessage(group.id, input, preview ?? undefined)
      // Reload messages
      const res = await groupService.getGroupMessages(group.id)
      setMessages(res.data?.items ?? [])
      setInput('')
      setPreview(null)
    } catch {}
    setSending(false)
  }

  if (loading) return <div className="flex items-center justify-center h-screen"><Loader2 className="w-8 h-8 animate-spin text-on-primary-container" /></div>

  if (!group) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center">
        <BadgeCheck className="w-8 h-8 text-outline" />
      </div>
      <h2 className="font-headline font-bold text-xl text-[#1a1a4e]">No Group Assigned</h2>
      <p className="text-slate-500 text-sm text-center max-w-xs">You haven&apos;t been assigned to a BridgeCourse batch group yet. Contact admin.</p>
    </div>
  )

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-surface-container-low">
      <section className="flex-1 flex flex-col bg-white overflow-hidden">
        <header className="p-5 bg-white border-b border-surface-container flex justify-between items-center flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-[#1a1a4e]">{group.name}</h2>
              <BadgeCheck className="w-5 h-5 text-[#2d6a6a]" />
            </div>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-[#2d6a6a] font-semibold bg-tertiary-fixed/30 px-2 py-0.5 rounded-full">{group.member_count} Members</span>
              <span className="text-[10px] text-slate-400 font-medium">{group.description}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-slate-400 hover:text-on-surface-variant rounded-lg hover:bg-surface-container transition-colors"><Search className="w-5 h-5" /></button>
            <button className="p-2 text-slate-400 hover:text-on-surface-variant rounded-lg hover:bg-surface-container transition-colors"><MoreVertical className="w-5 h-5" /></button>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-[#f8f9fb]">
          {messages.length === 0 ? (
            <div className="text-center py-16 text-slate-400 font-medium">No messages yet. Be the first to post!</div>
          ) : messages.map((msg, idx) => (
            <div key={msg.id}>
              {idx === 0 && (
                <div className="relative flex py-5 items-center mb-8">
                  <div className="flex-grow border-t border-slate-200/50" />
                  <span className="flex-shrink mx-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Messages</span>
                  <div className="flex-grow border-t border-slate-200/50" />
                </div>
              )}
              <div className="flex flex-col items-start max-w-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-[#1a1a4e] flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-bold text-white">{(msg.sender_name ?? 'BC').split(' ').map(n=>n[0]).join('').slice(0,2)}</span>
                  </div>
                  <span className="text-xs font-bold text-[#1a1a4e]">{msg.sender_name ?? 'BridgeCourse'} • {new Date(msg.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                </div>
                <div className="bg-[#1a1a4e] text-white p-4 rounded-2xl rounded-tl-none shadow-sm max-w-xl">
                  {msg.text && <p className="text-sm leading-relaxed">{msg.text}</p>}
                </div>
                {/* Quick reacts */}
                <div className="flex gap-2 mt-1 flex-wrap">
                  {quickReacts.map((emoji) => (
                    <button key={emoji} className="hover:scale-125 transition-transform text-base grayscale hover:grayscale-0">{emoji}</button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Compose */}
        <footer className="p-4 bg-white border-t border-surface-container flex-shrink-0">
          {preview && (
            <div className="mb-3 relative w-24 h-24 rounded-xl overflow-hidden border border-outline-variant/20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="preview" className="w-full h-full object-cover" />
              <button onClick={() => setPreview(null)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">×</button>
            </div>
          )}
          <div className="flex items-center gap-3 bg-surface-container-low p-2 rounded-2xl">
            <button className="p-2 text-slate-400 hover:text-on-surface transition-colors"><Smile className="w-5 h-5" /></button>
            <button onClick={() => fileRef.current?.click()} className="p-2 text-slate-400 hover:text-on-primary-container transition-colors" title="Upload image">
              <Image className="w-5 h-5" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImagePick} />
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Write a message…" className="flex-1 bg-transparent text-sm placeholder:text-outline focus:outline-none" />
            <button onClick={sendMessage} disabled={(!input.trim() && !preview) || sending}
              className={cn('w-9 h-9 rounded-xl flex items-center justify-center transition-colors',
                input.trim() || preview ? 'bg-[#c0622f] text-white hover:bg-[#a14f24]' : 'bg-surface-container-high text-outline cursor-not-allowed')}>
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </footer>
      </section>
    </div>
  )
}
