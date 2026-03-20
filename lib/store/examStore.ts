// Store: examStore — manages active exam session state
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Exam, ExamSession } from '@/lib/types/exam'

interface ExamState {
  exam:            Exam | null
  sessions:        Record<string, ExamSession>  // questionId -> session
  currentIndex:    number
  timeRemaining:   number
  tabSwitches:     number
  isSubmitting:    boolean
  isSubmitted:     boolean

  // Actions
  startExam:       (exam: Exam, durationSeconds: number) => void
  selectAnswer:    (questionId: string, optionId: string) => void
  markForReview:   (questionId: string) => void
  navigateTo:      (index: number) => void
  navigateNext:    () => void
  navigatePrev:    () => void
  setTimeRemaining:(t: number) => void
  incrementTabSwitch: () => void
  setIsSubmitting: (v: boolean) => void
  submitExam:      () => void
  clearExam:       () => void
}

export const useExamStore = create<ExamState>()(
  persist(
    (set, get) => ({
      exam:          null,
      sessions:      {},
      currentIndex:  0,
      timeRemaining: 0,
      tabSwitches:   0,
      isSubmitting:  false,
      isSubmitted:   false,

      startExam: (exam, duration) => {
        const sessions: Record<string, ExamSession> = {}
        exam.questions.forEach((q) => {
          sessions[q.id] = {
            examId:    exam.id,
            questionId: q.id,
            status:    'not-visited',
          }
        })
        sessions[exam.questions[0].id].status = 'current'
        set({ exam, sessions, currentIndex: 0, timeRemaining: duration, tabSwitches: 0, isSubmitted: false })
      },

      selectAnswer: (questionId, optionId) =>
        set((s) => ({
          sessions: {
            ...s.sessions,
            [questionId]: {
              ...s.sessions[questionId],
              selectedId: optionId,
              status:     'answered',
            },
          },
        })),

      markForReview: (questionId) =>
        set((s) => ({
          sessions: {
            ...s.sessions,
            [questionId]: {
              ...s.sessions[questionId],
              status: s.sessions[questionId].selectedId ? 'marked' : 'marked',
            },
          },
        })),

      navigateTo: (index) => {
        const s = get()
        if (!s.exam) return
        const prevQ = s.exam.questions[s.currentIndex]
        const nextQ = s.exam.questions[index]
        if (!prevQ || !nextQ) return
        set((state) => {
          const prev = state.sessions[prevQ.id]
          const newStatus =
            prev.status === 'current'
              ? prev.selectedId
                ? 'answered'
                : 'visited-only'
              : prev.status
          return {
            currentIndex: index,
            sessions: {
              ...state.sessions,
              [prevQ.id]: { ...prev, status: newStatus },
              [nextQ.id]: { ...state.sessions[nextQ.id], status: 'current' },
            },
          }
        })
      },

      navigateNext: () => {
        const { currentIndex, exam } = get()
        if (exam && currentIndex < exam.questions.length - 1)
          get().navigateTo(currentIndex + 1)
      },

      navigatePrev: () => {
        const { currentIndex } = get()
        if (currentIndex > 0) get().navigateTo(currentIndex - 1)
      },

      setTimeRemaining: (t) => set({ timeRemaining: t }),
      incrementTabSwitch: () => set((s) => ({ tabSwitches: s.tabSwitches + 1 })),
      setIsSubmitting: (v) => set({ isSubmitting: v }),
      submitExam: () => set({ isSubmitted: true, isSubmitting: false }),
      clearExam:  () => set({ exam: null, sessions: {}, currentIndex: 0, timeRemaining: 0, tabSwitches: 0, isSubmitting: false, isSubmitted: false }),
    }),
    { name: 'brighter-nepal-exam', skipHydration: true }
  )
)
