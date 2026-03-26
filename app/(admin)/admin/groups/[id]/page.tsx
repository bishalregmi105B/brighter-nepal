'use client'
// Admin Group Chat — real-time via SocketIO
import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { BadgeCheck, ArrowLeft, MoreVertical, Search, Smile, Image, Send, Loader2, Wifi, WifiOff, Users } from 'lucide-react'
import { groupService, type Group } from '@/services/groupService'
import { authService, type AuthUser } from '@/services/authService'
import { useGroupChat } from '@/hooks/useGroupChat'
import { cn } from '@/lib/utils/cn'

const quickReacts = ['👏', '💡', '✅', '⭐', '💯', '🙋‍♂️', '📚']

export default function AdminGroupChatPage() {
  const params = useParams<{ id: string }>()
  const [group,    setGroup]    = useState<Group | null>(null)
  const [user,     setUser]     = useState<AuthUser | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [input,    setInput]    = useState('')
  const [preview,  setPreview]  = useState<string | null>(null)
  const [sending,  setSending]  = useState(false)
  const fileRef       = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const routeGroupId = Number(params.id)
  const socketGroupId = Number.isFinite(routeGroupId) && routeGroupId > 0 ? routeGroupId : null
  const { messages, sendMessage, setTyping, typingUsers, onlineCount, connected } = useGroupChat(socketGroupId)

  useEffect(() => {
    const gid = Number(params.id)
    if (!gid) { setLoading(false); return }
    authService.getMe().then(u => setUser(u)).catch(() => {})
    groupService.getGroup(gid).then(res => {
      setGroup(res.data ?? null)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [params.id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => setPreview(event.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleSend = async () => {
    if (!input.trim() && !preview) return
    if (!socketGroupId) return
    setSending(true)
    try {
      sendMessage(input, preview ?? undefined)
      setInput('')
      setPreview(null)
      setTyping(false)
    } catch {}
    setSending(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
    setTyping(e.target.value.length > 0)
  }

  if (loading) return <div className="flex items-center justify-center h-screen"><Loader2 className="w-8 h-8 animate-spin text-on-primary-container" /></div>

  if (!group) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <h2 className="font-headline font-bold text-xl text-[#1a1a4e]">Group Not Found</h2>
      <Link href="/admin/groups" className="text-on-primary-container font-medium hover:underline">← Back to Groups</Link>
    </div>
  )

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-surface-container-low max-w-6xl mx-auto border-x border-surface-container">
      <section className="flex-1 flex flex-col bg-white overflow-hidden">
        {/* Header */}
        <header className="p-4 bg-white border-b border-surface-container flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-4">
            <Link href="/admin/groups" className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-[#1a1a4e]">{group.name}</h2>
                <BadgeCheck className="w-4 h-4 text-[#2d6a6a]" />
                <span className="text-[9px] uppercase tracking-widest font-bold bg-[#c0622f] text-white py-0.5 rounded px-2">Admin View</span>
              </div>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <span className="text-xs text-[#2d6a6a] font-semibold bg-tertiary-fixed/30 px-2 py-0.5 rounded-full">{group.member_count} Members</span>
                {onlineCount > 0 && (
                  <span className="flex items-center gap-1 text-xs text-green-600 font-semibold">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    {onlineCount} online now
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span title={connected ? 'Real-time connected' : 'Disconnected'}>
              {connected ? <Wifi className="w-4 h-4 text-green-500" /> : <WifiOff className="w-4 h-4 text-slate-400 animate-pulse" />}
            </span>
            <button className="p-2 text-slate-400 hover:text-on-surface-variant rounded-lg hover:bg-surface-container transition-colors"><Search className="w-5 h-5" /></button>
            <button className="p-2 text-slate-400 hover:text-on-surface-variant rounded-lg hover:bg-surface-container transition-colors"><MoreVertical className="w-5 h-5" /></button>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-[#f8f9fb]">
          {messages.length === 0 ? (
            <div className="text-center py-16 text-slate-400 font-medium">No messages yet. Be the first to post!</div>
          ) : messages.map((msg, idx) => {
            const isMe = msg.user_id === user?.id
            return (
              <div key={msg.id}>
                {idx === 0 && (
                  <div className="relative flex py-5 items-center mb-8">
                    <div className="flex-grow border-t border-slate-200/50" />
                    <span className="flex-shrink mx-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Messages</span>
                    <div className="flex-grow border-t border-slate-200/50" />
                  </div>
                )}
                <div className={cn("flex flex-col max-w-2xl", isMe ? "items-end ml-auto" : "items-start")}>
                  <div className={cn("flex items-center gap-2 mb-2", isMe && "flex-row-reverse")}>
                    <div className="w-6 h-6 rounded-full bg-[#1a1a4e] flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] font-bold text-white">{(msg.sender_name ?? 'BC').split(' ').map(n=>n[0]).join('').slice(0,2)}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-500">
                      {isMe ? 'You (Admin)' : msg.sender_name ?? 'Student'} • {new Date(msg.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  <div className={cn("p-4 rounded-2xl shadow-sm max-w-xl",
                    isMe ? "bg-[#c0622f] text-white rounded-tr-none" : "bg-white border border-slate-100 text-[#1a1a4e] rounded-tl-none",
                    msg.pending && "opacity-60")}>
                    {msg.text && <p className="text-sm leading-relaxed">{msg.text}</p>}
                    {msg.image_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={msg.image_url} alt="img" className="max-w-xs rounded-xl mt-2" />
                    )}
                  </div>
                  {!isMe && (
                    <div className="flex gap-2 mt-1 flex-wrap">
                      {quickReacts.map((emoji) => (
                        <button key={emoji} className="hover:scale-125 transition-transform text-base grayscale hover:grayscale-0">{emoji}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {/* Typing indicator */}
          {typingUsers.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium pl-2">
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </span>
              {typingUsers.length === 1
                ? `${typingUsers[0].name} is typing…`
                : `${typingUsers.map(u => u.name).join(', ')} are typing…`}
            </div>
          )}
          <div ref={messagesEndRef} />
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
            <button onClick={() => fileRef.current?.click()} className="p-2 text-slate-400 hover:text-on-primary-container transition-colors"><Image className="w-5 h-5" /></button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImagePick} />
            <input
              value={input}
              onChange={handleInputChange}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              onBlur={() => setTyping(false)}
              placeholder="Post an announcement or message…"
              className="flex-1 bg-transparent text-sm placeholder:text-outline focus:outline-none"
            />
            <button
              onClick={handleSend}
              disabled={(!input.trim() && !preview) || sending || !connected}
              className={cn('w-9 h-9 rounded-xl flex items-center justify-center transition-colors',
                (input.trim() || preview) && connected ? 'bg-[#c0622f] text-white hover:bg-[#a14f24]' : 'bg-surface-container-high text-outline cursor-not-allowed')}>
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
          {!connected && (
            <p className="text-[10px] text-center text-orange-500 font-semibold mt-1">Reconnecting to chat server…</p>
          )}
        </footer>
      </section>
    </div>
  )
}
