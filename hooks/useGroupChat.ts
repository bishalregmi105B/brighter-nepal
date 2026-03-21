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
    if (!groupId) return

    const token = typeof window !== 'undefined' ? localStorage.getItem('bn_token') : null
    if (!token) return

    const room = `group:${groupId}`
    const socket = io(CHAT_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: Infinity,
    })

    socketRef.current = socket

    // ── Lifecycle ─────────────────────────────────────────────────────────────
    socket.on('connect', () => {
      setConnected(true)
      socket.emit('join', { token, room })
    })

    socket.on('disconnect', () => {
      setConnected(false)
    })

    socket.on('error', (data: { msg: string }) => {
      console.warn('[chat] error:', data.msg)
    })

    // ── History ───────────────────────────────────────────────────────────────
    socket.on('history', (history: ChatMessage[]) => {
      setMessages(history)
    })

    // ── New messages ──────────────────────────────────────────────────────────
    socket.on('message', (msg: ChatMessage) => {
      setMessages(prev => {
        // Replace any optimistic message with same text+user / exact id match
        const hasReal = prev.some(m => !m.pending && m.id === msg.id)
        if (hasReal) return prev

        // Remove pending message from this user with same text (optimistic replace)
        const withoutOptimistic = prev.filter(m =>
          !(m.pending && m.user_id === msg.user_id && m.text === msg.text)
        )
        return [...withoutOptimistic, msg]
      })
    })

    // ── Typing indicator ──────────────────────────────────────────────────────
    socket.on('typing', (data: TypingUser & { is_typing: boolean }) => {
      setTypingUsers(prev => {
        const rest = prev.filter(u => u.user_id !== data.user_id)
        return data.is_typing ? [...rest, { user_id: data.user_id, name: data.name }] : rest
      })
    })

    // ── Online presence ───────────────────────────────────────────────────────
    socket.on('presence', (data: { room: string; online_count: number }) => {
      if (data.room === room) setOnlineCount(data.online_count)
    })

    return () => {
      socket.emit('leave', { room })
      socket.disconnect()
      socketRef.current = null
      setConnected(false)
    }
  }, [groupId])

  // ── Send message — optimistic UI ──────────────────────────────────────────
  const sendMessage = useCallback((text: string, image_url?: string) => {
    if (!groupId || !socketRef.current) return

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
