/**
 * useGroupChat — WebSocket-based group chat hook
 *
 * Connects to the brighter-nepal-chat SocketIO server.
 * Manages: message history, real-time messages, typing indicators, online presence.
 * Supports optimistic UI — sender sees their message immediately.
 *
 * Room format: "group:<groupId>"
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { authService } from '@/services/authService'

export interface ChatMessage {
  id: number
  group_id?: number
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

const CHAT_URL = process.env.NEXT_PUBLIC_CHAT_URL ?? 'http://localhost:5001'

const DEBUG = true
const log = (...args: unknown[]) => DEBUG && console.log('[useGroupChat]', ...args)
const warn = (...args: unknown[]) => DEBUG && console.warn('[useGroupChat]', ...args)

export function useGroupChat(groupId: number | null) {
  const [messages,    setMessages]    = useState<ChatMessage[]>([])
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])
  const [onlineCount, setOnlineCount] = useState(0)
  const [connected,   setConnected]   = useState(false)

  const socketRef   = useRef<Socket | null>(null)
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  // counter for generating unique temp IDs for optimistic messages
  const tempIdRef   = useRef(-1)

  useEffect(() => {
    log('effect fired — groupId:', groupId)
    if (!groupId) { log('⏭ skipping: no groupId'); return }

    const token = typeof window !== 'undefined' ? localStorage.getItem('bn_token') : null
    log('token present:', !!token, 'length:', token?.length)
    if (!token) { warn('⏭ skipping: no token in localStorage'); return }

    const room = `group:${groupId}`
    log('connecting to CHAT_URL:', CHAT_URL, 'room:', room)

    const socket = io(CHAT_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: Infinity,
    })

    socketRef.current = socket

    // ── Lifecycle ─────────────────────────────────────────────────────────────
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

    socket.on('error', (data: { msg: string }) => {
      warn('⚠️ server error event:', data.msg)
    })

    // ── History ───────────────────────────────────────────────────────────────
    socket.on('history', (history: ChatMessage[]) => {
      log('📜 history received — count:', history?.length, 'sample:', history?.[0])
      setMessages(history)
    })

    // ── New messages ──────────────────────────────────────────────────────────
    socket.on('message', (msg: ChatMessage) => {
      log('💬 message received:', { id: msg.id, user_id: msg.user_id, sender: msg.sender_name, text: msg.text?.slice(0, 50), pending: msg.pending })
      setMessages(prev => {
        // Replace any optimistic message with same text+user / exact id match
        // Skip duplicate check when id is null (server sends null before DB write)
        const hasReal = msg.id != null && prev.some(m => !m.pending && m.id === msg.id)
        if (hasReal) { log('↩️ duplicate real msg, skipping'); return prev }

        // Remove pending message from this user with same text (optimistic replace)
        const withoutOptimistic = prev.filter(m =>
          !(m.pending && m.user_id === msg.user_id && m.text === msg.text)
        )
        log('messages after merge:', withoutOptimistic.length + 1)
        return [...withoutOptimistic, msg]
      })
    })

    // ── Typing indicator ──────────────────────────────────────────────────────
    socket.on('typing', (data: TypingUser & { is_typing: boolean }) => {
      log('⌨️ typing:', data)
      setTypingUsers(prev => {
        const rest = prev.filter(u => u.user_id !== data.user_id)
        return data.is_typing ? [...rest, { user_id: data.user_id, name: data.name }] : rest
      })
    })

    // ── Online presence ───────────────────────────────────────────────────────
    socket.on('presence', (data: { room: string; online_count: number }) => {
      log('👥 presence:', data)
      if (data.room === room) setOnlineCount(data.online_count)
    })

    // ── Catch-all for debugging ───────────────────────────────────────────────
    socket.onAny((event, ...args) => {
      log('📡 [ANY]', event, args)
    })

    return () => {
      log('🧹 cleanup — leaving room:', room)
      socket.emit('leave', { room })
      socket.disconnect()
      socketRef.current = null
      setConnected(false)
    }
  }, [groupId])

  // ── Send message — optimistic UI ──────────────────────────────────────────
  const sendMessage = useCallback((text: string, image_url?: string) => {
    log('sendMessage called — groupId:', groupId, 'socketRef:', !!socketRef.current, 'text:', text?.slice(0, 50))
    if (!groupId || !socketRef.current) { warn('sendMessage: bailing — no groupId or socket'); return }

    // Read current user from localStorage for optimistic display
    const stored = typeof window !== 'undefined' ? localStorage.getItem('bn_user') : null
    const me = stored ? JSON.parse(stored) : null

    // 1. Add optimistic message immediately
    const tempId = tempIdRef.current--
    const optimistic: ChatMessage = {
      id:          tempId,
      group_id:    groupId,
      user_id:     me?.id ?? -1,
      sender_name: me?.name ?? 'You',
      text:        text,
      image_url:   image_url,
      created_at:  new Date().toISOString(),
      pending:     true,
    }
    setMessages(prev => [...prev, optimistic])

    // 2. Emit to server (server will broadcast real message back)
    socketRef.current.emit('message', {
      room: `group:${groupId}`,
      text,
      image_url,
    })
  }, [groupId])

  // ── Typing indicator (auto-clears after 3s) ────────────────────────────────
  const setTyping = useCallback((isTyping: boolean) => {
    if (!groupId || !socketRef.current) return
    socketRef.current.emit('typing', { room: `group:${groupId}`, is_typing: isTyping })

    if (isTyping) {
      if (typingTimer.current) clearTimeout(typingTimer.current)
      typingTimer.current = setTimeout(() => {
        socketRef.current?.emit('typing', { room: `group:${groupId}`, is_typing: false })
      }, 3000)
    }
  }, [groupId])

  return { messages, sendMessage, setTyping, typingUsers, onlineCount, connected }
}
