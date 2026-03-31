/**
 * useLiveChat — WebSocket-based live-class chat hook
 *
 * Connects to the brighter-nepal-chat SocketIO server.
 * Manages: message history, real-time messages, typing indicators, online presence.
 * Supports optimistic UI — sender sees their message immediately.
 *
 * Room format: "live:<classId>"
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'

export interface LiveChatMessage {
  id: number
  class_id?: number
  user_id: number
  sender_name: string
  text: string
  image_url?: string
  created_at: string
  /** true = optimistic, not yet confirmed by server */
  pending?: boolean
}

export interface TypingUser {
  user_id: number
  name: string
}

export interface RoomUser {
  user_id: number
  name: string
  is_admin: boolean
}

const CHAT_URL = process.env.NEXT_PUBLIC_CHAT_URL ?? 'http://localhost:5001'

const DEBUG = true
const log = (...args: unknown[]) => DEBUG && console.log('[useLiveChat]', ...args)
const warn = (...args: unknown[]) => DEBUG && console.warn('[useLiveChat]', ...args)

export function useLiveChat(classId: number | null) {
  const [messages,    setMessages]    = useState<LiveChatMessage[]>([])
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])
  const [onlineCount, setOnlineCount] = useState(0)
  const [connected,   setConnected]   = useState(false)
  const [userList,    setUserList]    = useState<RoomUser[]>([])
  const [mutedUsers,  setMutedUsers]  = useState<Set<number>>(new Set())
  const [rateLimited, setRateLimited] = useState(false)
  const [blockedWord, setBlockedWord] = useState(false)
  const rateLimitTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const socketRef   = useRef<Socket | null>(null)
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tempIdRef   = useRef(-1)

  useEffect(() => {
    log('effect fired — classId:', classId)
    if (!classId) { log('⏭ skipping: no classId'); return }

    const token = typeof window !== 'undefined' ? localStorage.getItem('bn_token') : null
    log('token present:', !!token, 'length:', token?.length)
    if (!token) { warn('⏭ skipping: no token in localStorage'); return }

    const room = `live:${classId}`
    log('connecting to CHAT_URL:', CHAT_URL, 'room:', room)

    const socket = io(CHAT_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: Infinity,
    })

    socketRef.current = socket

    socket.on('connect', () => {
      log('✅ connected — socket.id:', socket.id)
      setConnected(true)
      log('emitting join — room:', room)
      socket.emit('join', { token, room })
    })

    socket.on('connect_error', (err) => {
      warn('❌ connect_error:', err.message, err)
    })

    socket.on('disconnect', (reason) => {
      warn('🔌 disconnected — reason:', reason)
      setConnected(false)
    })

    socket.on('error', (data: { msg: string; code?: string }) => {
      warn('⚠️ server error event:', data.msg)
      if (data.code === 'rate_limited') {
        setRateLimited(true)
        if (rateLimitTimer.current) clearTimeout(rateLimitTimer.current)
        rateLimitTimer.current = setTimeout(() => setRateLimited(false), 5000)
      }
      if (data.code === 'blocked_word') {
        setBlockedWord(true)
        setTimeout(() => setBlockedWord(false), 4000)
      }
    })

    socket.on('history', (history: LiveChatMessage[]) => {
      log('📜 history received — count:', history?.length, 'sample:', history?.[0])
      setMessages(history)
    })

    socket.on('message', (msg: LiveChatMessage) => {
      log('💬 message received:', { id: msg.id, user_id: msg.user_id, sender: msg.sender_name, text: msg.text?.slice(0, 50), pending: msg.pending })
      setMessages(prev => {
        // Skip duplicate check when id is null (server sends null before DB write)
        const hasReal = msg.id != null && prev.some(m => !m.pending && m.id === msg.id)
        if (hasReal) { log('↩️ duplicate real msg, skipping'); return prev }

        // Replace optimistic message from same user with same text
        const withoutOptimistic = prev.filter(m =>
          !(m.pending && m.user_id === msg.user_id && m.text === msg.text)
        )
        log('messages after merge:', withoutOptimistic.length + 1)
        return [...withoutOptimistic, msg]
      })
    })

    socket.on('typing', (data: TypingUser & { is_typing: boolean }) => {
      log('⌨️ typing:', data)
      setTypingUsers(prev => {
        const rest = prev.filter(u => u.user_id !== data.user_id)
        return data.is_typing ? [...rest, { user_id: data.user_id, name: data.name }] : rest
      })
    })

    socket.on('presence', (data: { room: string; online_count: number }) => {
      log('👥 presence:', data)
      if (data.room === room) setOnlineCount(data.online_count)
    })

    // ── Participants & mute ───────────────────────────────────────────────────
    socket.on('user_list', (data: { users: RoomUser[]; muted_user_ids: number[] }) => {
      log('👤 user_list:', data)
      setUserList(data.users ?? [])
      setMutedUsers(new Set(data.muted_user_ids ?? []))
    })

    socket.on('muted_list', (mutedIds: number[]) => {
      log('🔇 muted_list:', mutedIds)
      setMutedUsers(new Set(mutedIds ?? []))
    })

    socket.on('user_muted', (data: { user_id: number; muted: boolean }) => {
      log('🔇 user_muted:', data)
      setMutedUsers(prev => {
        const next = new Set(prev)
        if (data.muted) next.add(data.user_id)
        else next.delete(data.user_id)
        return next
      })
    })

    // ── Catch-all for debugging ───────────────────────────────────────────────
    socket.onAny((event, ...args) => {
      log('📡 [ANY]', event, args)
    })

    return () => {
      log('🧹 cleanup — leaving room:', room)
      if (rateLimitTimer.current) clearTimeout(rateLimitTimer.current)
      socket.emit('leave', { room })
      socket.disconnect()
      socketRef.current = null
      setConnected(false)
    }
  }, [classId])

  // ── Send message — optimistic UI ──────────────────────────────────────────
  const sendMessage = useCallback((text: string, image_url?: string) => {
    log('sendMessage called — classId:', classId, 'socketRef:', !!socketRef.current, 'text:', text?.slice(0, 50))
    if (!classId || !socketRef.current) { warn('sendMessage: bailing — no classId or socket'); return }

    const stored = typeof window !== 'undefined' ? localStorage.getItem('bn_user') : null
    const me = stored ? JSON.parse(stored) : null

    const tempId = tempIdRef.current--
    const optimistic: LiveChatMessage = {
      id:          tempId,
      class_id:    classId,
      user_id:     me?.id ?? -1,
      sender_name: me?.name ?? 'You',
      text,
      image_url,
      created_at:  new Date().toISOString(),
      pending:     true,
    }
    setMessages(prev => [...prev, optimistic])

    socketRef.current.emit('message', {
      room: `live:${classId}`,
      text,
      image_url,
    })
  }, [classId])

  // ── Typing indicator (auto-clears after 3s) ────────────────────────────────
  const setTyping = useCallback((isTyping: boolean) => {
    if (!classId || !socketRef.current) return
    socketRef.current.emit('typing', { room: `live:${classId}`, is_typing: isTyping })

    if (isTyping) {
      if (typingTimer.current) clearTimeout(typingTimer.current)
      typingTimer.current = setTimeout(() => {
        socketRef.current?.emit('typing', { room: `live:${classId}`, is_typing: false })
      }, 3000)
    }
  }, [classId])

  // ── Admin mute/unmute ─────────────────────────────────────────────────────
  const adminMute = useCallback((userId: number, muted: boolean) => {
    if (!classId || !socketRef.current) return
    socketRef.current.emit('admin_mute', { room: `live:${classId}`, user_id: userId, muted })
  }, [classId])

  return { messages, sendMessage, setTyping, typingUsers, onlineCount, connected, userList, mutedUsers, adminMute, rateLimited, blockedWord }
}
