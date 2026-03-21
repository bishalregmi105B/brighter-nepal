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

const CHAT_URL = process.env.NEXT_PUBLIC_CHAT_URL ?? 'http://localhost:5001'

export function useLiveChat(classId: number | null) {
  const [messages,    setMessages]    = useState<LiveChatMessage[]>([])
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])
  const [onlineCount, setOnlineCount] = useState(0)
  const [connected,   setConnected]   = useState(false)

  const socketRef   = useRef<Socket | null>(null)
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tempIdRef   = useRef(-1)

  useEffect(() => {
    if (!classId) return

    const token = typeof window !== 'undefined' ? localStorage.getItem('bn_token') : null
    if (!token) return

    const room = `live:${classId}`
    const socket = io(CHAT_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: Infinity,
    })

    socketRef.current = socket

    socket.on('connect', () => {
      setConnected(true)
      socket.emit('join', { token, room })
    })

    socket.on('disconnect', () => setConnected(false))

    socket.on('error', (data: { msg: string }) => {
      console.warn('[live-chat] error:', data.msg)
    })

    socket.on('history', (history: LiveChatMessage[]) => {
      setMessages(history)
    })

    socket.on('message', (msg: LiveChatMessage) => {
      setMessages(prev => {
        const hasReal = prev.some(m => !m.pending && m.id === msg.id)
        if (hasReal) return prev

        // Replace optimistic message from same user with same text
        const withoutOptimistic = prev.filter(m =>
          !(m.pending && m.user_id === msg.user_id && m.text === msg.text)
        )
        return [...withoutOptimistic, msg]
      })
    })

    socket.on('typing', (data: TypingUser & { is_typing: boolean }) => {
      setTypingUsers(prev => {
        const rest = prev.filter(u => u.user_id !== data.user_id)
        return data.is_typing ? [...rest, { user_id: data.user_id, name: data.name }] : rest
      })
    })

    socket.on('presence', (data: { room: string; online_count: number }) => {
      if (data.room === room) setOnlineCount(data.online_count)
    })

    return () => {
      socket.emit('leave', { room })
      socket.disconnect()
      socketRef.current = null
      setConnected(false)
    }
  }, [classId])

  // ── Send message — optimistic UI ──────────────────────────────────────────
  const sendMessage = useCallback((text: string, image_url?: string) => {
    if (!classId || !socketRef.current) return

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

  return { messages, sendMessage, setTyping, typingUsers, onlineCount, connected }
}
