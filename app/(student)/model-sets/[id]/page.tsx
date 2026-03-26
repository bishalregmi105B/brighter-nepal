'use client'
// Model Set Exam Interface — fetch real set & questions from API, same full-screen UX
import { useState, useCallback, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useExamTimer } from '@/hooks/useExamTimer'
import { useTabVisibility } from '@/hooks/useTabVisibility'
import { useExamStore } from '@/lib/store/examStore'
import { modelSetService } from '@/services/modelSetService'
import { formatCountdown } from '@/lib/utils/formatDate'
import { getAnswerOptionClass, getQuestionBubbleClass } from '@/lib/utils/examUtils'
import { cn } from '@/lib/utils/cn'
import { ChevronLeft, ChevronRight, Flag, CheckSquare, Clock, Loader2, ExternalLink } from 'lucide-react'
import type { Exam } from '@/lib/types/exam'
import ReactMarkdown from 'react-markdown'
import { toStudentGoogleFormUrl } from '@/lib/utils/googleForms'

function buildExamFromModelSet(raw: ReturnType<typeof modelSetService.getModelSet> extends Promise<{ data: infer T }> ? T : never): Exam {
  // Transform API questions into the Exam type expected by examStore
  const apiQuestions: { id: number; text: string; options: string[]; answer_index: number; subject: string }[] =
    (raw as unknown as { questions?: { id: number; text: string; options: string[]; answer_index: number; subject: string }[] }).questions ?? []

  return {
    id:          String(raw.id),
    title:       raw.title,
    type:        'model-set',
    subjects:    raw.targets ?? ['Physics', 'Chemistry', 'Mathematics'],
    duration:    (raw.duration_min ?? 180) * 60,
    totalMarks:  raw.total_questions ?? 100,
    isActive:    true,
    questions:   apiQuestions.map((q, i) => ({
      id:        String(q.id),
      number:    i + 1,
      subject:   q.subject ?? 'General',
      text:      q.text,
      options:   q.options.map((opt, j) => ({ id: String.fromCharCode(65 + j), label: String.fromCharCode(65 + j), text: opt })),
      correctId: String.fromCharCode(65 + (q.answer_index ?? 0)),
      marks:     4,
    })),
  }
}

export default function ExamPage() {
  const params  = useParams<{ id: string }>()
  const router  = useRouter()
  const store   = useExamStore()
  const [exam,          setExam]         = useState<Exam | null>(null)
  const [loading,       setLoading]      = useState(true)
  const [activeSubject, setActiveSubject] = useState<string>('General')   // MUST be above all early returns
  const [formsUrl,      setFormsUrl]     = useState('')
  const [hasResult,     setHasResult]    = useState(false)
  const [submitting,    setSubmitting]   = useState(false)

  useEffect(() => {
    if (!params.id) return
    if (store.exam?.id === params.id) { setExam(store.exam); setLoading(false); return }
    modelSetService.getModelSet(Number(params.id)).then((res) => {
      const raw = res.data as Parameters<typeof buildExamFromModelSet>[0] & { forms_url?: string }
      const externalForm = toStudentGoogleFormUrl(raw.forms_url)
      setFormsUrl(externalForm)
      if (externalForm) {
        modelSetService.getMyResult(Number(params.id))
          .then((resultRes) => setHasResult(Boolean(resultRes.data.has_result)))
          .catch(() => setHasResult(false))
      }

      const built = buildExamFromModelSet(raw)
      if (!externalForm && built.questions.length > 0) {
        store.startExam(built, built.duration)
        setActiveSubject(built.questions[0]?.subject ?? 'General')
      } else {
        store.clearExam()
      }
      setExam(built)
    }).finally(() => setLoading(false))
  }, [params.id])

  const handleSubmit = useCallback(async () => {
    if (!exam || submitting) return
    setSubmitting(true)
    const answerIndexes = exam.questions.map((question) => {
      const selectedId = store.sessions[question.id]?.selectedId
      if (!selectedId) return -1
      return question.options.findIndex((option) => option.id === selectedId)
    })
    const score = exam.questions.reduce((sum, question, index) => {
      return sum + (answerIndexes[index] >= 0 && question.options[answerIndexes[index]]?.id === question.correctId ? 1 : 0)
    }, 0)

    try {
      await modelSetService.submitAttempt(Number(params.id), score, exam.questions.length, answerIndexes)
      store.submitExam()
      store.clearExam()
      router.push(`/model-sets/${params.id}/results`)
    } finally {
      setSubmitting(false)
    }
  }, [exam, params.id, router, store, submitting])

  const { timeRemaining, isWarning } = useExamTimer(handleSubmit)
  useTabVisibility(handleSubmit)

  if (loading || !exam) return (
    <div className="h-screen flex items-center justify-center bg-[#f8f9fb]">
      <Loader2 className="w-10 h-10 animate-spin text-on-primary-container" />
    </div>
  )

  if (formsUrl) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#f8f9fb] p-8 text-center">
        <h2 className="text-2xl font-bold text-[#1a1a4e] mb-2">This Model Set Uses Google Form</h2>
        <p className="text-slate-500 mb-6 max-w-md">The exam for this model set is hosted in Google Forms. Open it in a new tab to continue.</p>
        <div className="flex gap-3">
          <a
            href={formsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2.5 bg-[#c0622f] text-white rounded-xl font-bold hover:bg-[#a14f24] transition-colors inline-flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" /> Open Google Form
          </a>
          {hasResult && (
            <button onClick={() => router.push(`/model-sets/${params.id}/results`)} className="px-6 py-2.5 bg-[#1a1a4e] text-white rounded-xl font-bold hover:bg-[#141432] transition-colors">
              View Latest Result
            </button>
          )}
          <button onClick={() => router.push('/model-sets')} className="px-6 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors">
            Back to Model Sets
          </button>
        </div>
      </div>
    )
  }

  if (exam.questions.length === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#f8f9fb]">
        <h2 className="text-2xl font-bold text-[#1a1a4e] mb-2">No Questions Available</h2>
        <p className="text-slate-500 mb-6 text-center max-w-md">This model set is currently being prepared and has no questions yet. Please check back later.</p>
        <button onClick={() => router.push('/model-sets')} className="px-6 py-2 bg-[#c0622f] text-white rounded-xl font-bold hover:bg-[#a14f24] transition-colors">
          Back to Model Sets
        </button>
      </div>
    )
  }

  const currentQuestion = exam.questions[store.currentIndex]
  const currentSession  = store.sessions[currentQuestion?.id]
  const totalAnswered   = Object.values(store.sessions).filter(s => s.selectedId).length
  const subjects        = Array.from(new Set(exam.questions.map(q => q.subject)))

  if (!currentQuestion) return null

  return (
    <div className="h-screen flex flex-col bg-[#f8f9fb] overflow-hidden">
      {/* Sticky Top Bar */}
      <header className="sticky top-0 z-50 bg-[#1a1a4e] text-white flex items-center justify-between px-6 py-3 shadow-lg">
        <div className="flex items-center gap-4">
          <h1 className="font-headline font-black text-lg tracking-tight">{exam.title}</h1>
          <div className="hidden md:flex items-center gap-1 bg-white/10 rounded-lg p-1">
            {subjects.map((sub) => {
              const count    = exam.questions.filter(q => q.subject === sub).length
              const answered = Object.values(store.sessions).filter(s => s.selectedId && exam.questions.find(q => q.id === s.questionId)?.subject === sub).length
              return (
                <button key={sub} onClick={() => { setActiveSubject(sub); const idx = exam.questions.findIndex(q => q.subject === sub); if (idx >= 0) store.navigateTo(idx) }}
                  className={cn('px-4 py-1.5 text-xs font-bold rounded-lg transition-colors', activeSubject === sub ? 'bg-on-primary-container text-white' : 'text-white/60 hover:text-white')}>
                  {sub} ({answered}/{count})
                </button>
              )
            })}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className={cn('flex items-center gap-2 px-4 py-2 rounded-xl', isWarning ? 'bg-error/20 text-error animate-pulse' : 'bg-white/10 text-white')}>
            <Clock className="w-4 h-4" />
            <span className="font-headline font-black text-lg tabular-nums">{formatCountdown(timeRemaining)}</span>
          </div>
          <div className="text-center hidden sm:block">
            <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Answered</p>
            <p className="font-headline font-black text-base">{totalAnswered}/{exam.questions.length}</p>
          </div>
          <button onClick={handleSubmit} disabled={submitting} className="bg-on-primary-container hover:bg-[#a14f24] text-white font-bold text-sm px-5 py-2 rounded-xl active:scale-95 transition-all shadow-md disabled:opacity-60">
            {submitting ? 'Submitting…' : 'Submit Exam'}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Question Panel */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-card p-8 md:p-10">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Q{currentQuestion.number} • {currentQuestion.subject}</span>
                <div className="text-xl font-semibold text-[#1a1a4e] leading-relaxed prose prose-slate max-w-none">
                  <ReactMarkdown>{currentQuestion.text}</ReactMarkdown>
                </div>
              </div>
              <button onClick={() => store.markForReview(currentQuestion.id)} className="flex-shrink-0 ml-4 p-2 hover:bg-secondary-fixed/20 rounded-lg transition-colors">
                <Flag className={cn('w-5 h-5', currentSession?.status === 'marked' ? 'text-secondary fill-secondary' : 'text-slate-400')} />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3 mb-10">
              {currentQuestion.options.map((opt) => {
                const isSelected = currentSession?.selectedId === opt.id
                return (
                  <label key={opt.id} className={cn(getAnswerOptionClass(isSelected), 'cursor-pointer')} onClick={() => store.selectAnswer(currentQuestion.id, opt.id)}>
                    <span className={cn('w-9 h-9 rounded-lg border-2 flex items-center justify-center font-bold text-sm mr-4 flex-shrink-0 transition-colors',
                      isSelected ? 'bg-on-primary-container border-on-primary-container text-white' : 'border-surface-container-high text-on-surface-variant')}>
                      {opt.label}
                    </span>
                    <span className="text-base text-on-surface prose prose-sm max-w-none">
                      <ReactMarkdown>{opt.text}</ReactMarkdown>
                    </span>
                    {isSelected && <CheckSquare className="w-5 h-5 text-on-primary-container ml-auto" />}
                  </label>
                )
              })}
            </div>
            <div className="flex items-center justify-between border-t border-surface-container pt-6">
              <button onClick={() => store.navigatePrev()} disabled={store.currentIndex === 0}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-slate-600 hover:bg-surface-container-low disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <span className="text-xs font-bold text-slate-400">{store.currentIndex + 1} / {exam.questions.length}</span>
              <button onClick={() => store.navigateNext()} disabled={store.currentIndex === exam.questions.length - 1}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-[#1a1a4e] text-white hover:bg-[#141432] disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all">
                Save &amp; Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </main>

        {/* Question Navigator */}
        <aside className="hidden lg:flex w-72 flex-col bg-white border-l border-surface-container overflow-y-auto p-5">
          <h3 className="font-headline font-bold text-[#1a1a4e] text-sm mb-3">Question Navigator</h3>
          <div className="grid grid-cols-2 gap-2 text-[10px] font-bold uppercase text-slate-500 mb-4">
            {[
              { color: 'bg-on-primary-container', label: 'Answered'    },
              { color: 'bg-secondary-fixed border border-secondary', label: 'Marked' },
              { color: 'bg-white border border-error',              label: 'Not Answered' },
              { color: 'bg-surface-container-high',                 label: 'Not Visited'  },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-1.5"><div className={`w-4 h-4 rounded ${item.color} flex-shrink-0`} /><span>{item.label}</span></div>
            ))}
          </div>
          {subjects.map((subject) => {
            const subQuestions = exam.questions.filter(q => q.subject === subject)
            return (
              <div key={subject} className="mb-5">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{subject}</h4>
                <div className="grid grid-cols-5 gap-1.5">
                  {subQuestions.map((q) => {
                    const session  = store.sessions[q.id]
                    const isCur    = store.currentIndex === exam.questions.indexOf(q)
                    const status   = isCur ? 'current' : (session?.status || 'not-visited')
                    return (
                      <button key={q.id} onClick={() => store.navigateTo(exam.questions.indexOf(q))}
                        className={getQuestionBubbleClass(status)} title={`Q${q.number}`}>{q.number}</button>
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
