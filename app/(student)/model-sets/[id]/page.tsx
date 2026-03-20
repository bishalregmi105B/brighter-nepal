'use client'
// Exam Interface Page — Full-screen, no sidebar/header
// Based exactly on exam_interface_model_set/code.html
// Sticky top bar + question panel + right navigator
import { useState, useCallback } from 'react'
import { useExamTimer } from '@/hooks/useExamTimer'
import { useTabVisibility } from '@/hooks/useTabVisibility'
import { useExamStore } from '@/lib/store/examStore'
import { useUiStore } from '@/lib/store/uiStore'
import { mockExam } from '@/lib/data/mockExam'
import { formatCountdown } from '@/lib/utils/formatDate'
import { getAnswerOptionClass, getQuestionBubbleClass } from '@/lib/utils/examUtils'
import { cn } from '@/lib/utils/cn'
import { ChevronLeft, ChevronRight, Flag, CheckSquare, Clock } from 'lucide-react'
import { useEffect } from 'react'

export default function ExamPage() {
  const store = useExamStore()
  const { openSubmitModal } = useUiStore()
  const exam = mockExam

  // Initialize exam if not started
  useEffect(() => {
    if (!store.exam) {
      store.startExam(exam, exam.duration)
    }
  }, [])

  const handleExpired = useCallback(() => {
    store.submitExam()
  }, [store])

  const handleAutoSubmit = useCallback(() => {
    openSubmitModal()
  }, [openSubmitModal])

  const { timeRemaining, isWarning } = useExamTimer(handleExpired)
  useTabVisibility(handleAutoSubmit)

  const currentQuestion = exam.questions[store.currentIndex]
  const currentSession  = store.sessions[currentQuestion?.id]
  const totalAnswered   = Object.values(store.sessions).filter((s) => s.selectedId).length

  // Group questions by subject
  const subjects = ['Physics', 'Chemistry', 'Mathematics', 'English']
  const [activeSubject, setActiveSubject] = useState(subjects[0])

  if (!currentQuestion) return null

  return (
    <div className="h-screen flex flex-col bg-[#f8f9fb] overflow-hidden">
      {/* Sticky Top Bar */}
      <header className="sticky top-0 z-50 bg-[#1a1a4e] text-white flex items-center justify-between px-6 py-3 shadow-lg">
        <div className="flex items-center gap-4">
          <h1 className="font-headline font-black text-lg tracking-tight">{exam.title}</h1>
          <div className="hidden md:flex items-center gap-1 bg-white/10 rounded-lg p-1">
            {subjects.map((sub) => {
              const count = exam.questions.filter((q) => q.subject === sub).length
              const answered = Object.values(store.sessions).filter((s) => s.selectedId && exam.questions.find((q) => q.id === s.questionId)?.subject === sub).length
              return (
                <button
                  key={sub}
                  onClick={() => {
                    setActiveSubject(sub)
                    const idx = exam.questions.findIndex((q) => q.subject === sub)
                    if (idx >= 0) store.navigateTo(idx)
                  }}
                  className={cn(
                    'px-4 py-1.5 text-xs font-bold rounded-lg transition-colors',
                    activeSubject === sub
                      ? 'bg-on-primary-container text-white'
                      : 'text-white/60 hover:text-white'
                  )}
                >
                  {sub} ({answered}/{count})
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Timer */}
          <div className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl',
            isWarning ? 'bg-error/20 text-error animate-pulse' : 'bg-white/10 text-white'
          )}>
            <Clock className="w-4 h-4" />
            <span className={cn('font-headline font-black text-lg tabular-nums')}>
              {formatCountdown(timeRemaining)}
            </span>
          </div>

          {/* Progress */}
          <div className="text-center hidden sm:block">
            <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Answered</p>
            <p className="font-headline font-black text-base">{totalAnswered}/{exam.questions.length}</p>
          </div>

          {/* Submit */}
          <button
            onClick={() => openSubmitModal()}
            className="bg-on-primary-container hover:bg-[#a14f24] text-white font-bold text-sm px-5 py-2 rounded-xl active:scale-95 transition-all shadow-md"
          >
            Submit Exam
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Question Panel */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-card p-8 md:p-10">
            {/* Question header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                  Q{currentQuestion.number} • {currentQuestion.subject}
                </span>
                <p className="text-xl font-semibold text-[#1a1a4e] leading-relaxed">
                  {currentQuestion.text}
                </p>
              </div>
              <button
                onClick={() => store.markForReview(currentQuestion.id)}
                className="flex-shrink-0 ml-4 p-2 hover:bg-secondary-fixed/20 rounded-lg transition-colors"
                title="Mark for review"
              >
                <Flag className={cn('w-5 h-5', currentSession?.status === 'marked' ? 'text-secondary fill-secondary' : 'text-slate-400')} />
              </button>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 gap-3 mb-10">
              {currentQuestion.options.map((opt) => {
                const isSelected = currentSession?.selectedId === opt.id
                return (
                  <label
                    key={opt.id}
                    className={cn(getAnswerOptionClass(isSelected), 'cursor-pointer')}
                    onClick={() => store.selectAnswer(currentQuestion.id, opt.id)}
                  >
                    <span className={cn(
                      'w-9 h-9 rounded-lg border-2 flex items-center justify-center font-bold text-sm mr-4 flex-shrink-0 transition-colors',
                      isSelected
                        ? 'bg-on-primary-container border-on-primary-container text-white'
                        : 'border-surface-container-high text-on-surface-variant'
                    )}>
                      {opt.label}
                    </span>
                    <span className="text-base text-on-surface">{opt.text}</span>
                    {isSelected && (
                      <CheckSquare className="w-5 h-5 text-on-primary-container ml-auto" />
                    )}
                  </label>
                )
              })}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between border-t border-surface-container pt-6">
              <button
                onClick={() => store.navigatePrev()}
                disabled={store.currentIndex === 0}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-slate-600 hover:bg-surface-container-low disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <span className="text-xs font-bold text-slate-400">
                {store.currentIndex + 1} / {exam.questions.length}
              </span>
              <button
                onClick={() => store.navigateNext()}
                disabled={store.currentIndex === exam.questions.length - 1}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-[#1a1a4e] text-white hover:bg-[#141432] disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all"
              >
                Save & Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </main>

        {/* Right: Question Navigator */}
        <aside className="hidden lg:flex w-72 flex-col bg-white border-l border-surface-container overflow-y-auto p-5">
          <div className="mb-4">
            <h3 className="font-headline font-bold text-[#1a1a4e] text-sm mb-3">Question Navigator</h3>
            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 text-[10px] font-bold uppercase text-slate-500">
              {[
                { color: 'bg-on-primary-container', label: 'Answered' },
                { color: 'bg-secondary-fixed border border-secondary', label: 'Marked' },
                { color: 'bg-white border border-error', label: 'Not Answered' },
                { color: 'bg-surface-container-high', label: 'Not Visited' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className={`w-4 h-4 rounded ${item.color} flex-shrink-0`} />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {subjects.map((subject) => {
            const subQuestions = exam.questions.filter((q) => q.subject === subject)
            return (
              <div key={subject} className="mb-5">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{subject}</h4>
                <div className="grid grid-cols-5 gap-1.5">
                  {subQuestions.map((q) => {
                    const session = store.sessions[q.id]
                    const isCurrent = store.currentIndex === exam.questions.indexOf(q)
                    const status = isCurrent ? 'current' : (session?.status || 'not-visited')
                    return (
                      <button
                        key={q.id}
                        onClick={() => store.navigateTo(exam.questions.indexOf(q))}
                        className={getQuestionBubbleClass(status)}
                        title={`Q${q.number}`}
                      >
                        {q.number}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </aside>
      </div>
    </div>
  )
}
