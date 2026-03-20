'use client'
// Hook: useTabVisibility — detects tab switches during exam
import { useEffect } from 'react'
import { useExamStore } from '@/lib/store/examStore'
import { useUiStore } from '@/lib/store/uiStore'
import { EXAM_CONFIG } from '@/lib/constants/examConfig'

export function useTabVisibility(autoSubmit?: () => void) {
  const { tabSwitches, incrementTabSwitch, isSubmitted } = useExamStore()
  const { openTabWarning } = useUiStore()

  useEffect(() => {
    if (isSubmitted) return

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') return

      // Tab came back into focus — user switched away
      const newCount = tabSwitches + 1
      incrementTabSwitch()
      openTabWarning(newCount)

      if (newCount >= EXAM_CONFIG.TAB_SWITCH_LIMIT && autoSubmit) {
        autoSubmit()
      }
    }

    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [tabSwitches, isSubmitted, incrementTabSwitch, openTabWarning, autoSubmit])

  return { tabSwitches }
}
