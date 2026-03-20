'use client'
// Hook: useExamTimer — manages countdown timer with localStorage persistence
import { useEffect, useRef, useCallback } from 'react'
import { useExamStore } from '@/lib/store/examStore'
import { EXAM_CONFIG } from '@/lib/constants/examConfig'

export function useExamTimer(onExpired: () => void) {
  const { timeRemaining, setTimeRemaining, isSubmitted } = useExamStore()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => {
    if (isSubmitted) { clearTimer(); return }

    intervalRef.current = setInterval(() => {
      setTimeRemaining(Math.max(0, useExamStore.getState().timeRemaining - 1))

      if (useExamStore.getState().timeRemaining <= 0) {
        clearTimer()
        onExpired()
      }
    }, 1000)

    return clearTimer
  }, [isSubmitted, setTimeRemaining, onExpired, clearTimer])

  const isWarning = timeRemaining <= EXAM_CONFIG.WARNING_THRESHOLD && timeRemaining > 0

  return { timeRemaining, isWarning }
}
