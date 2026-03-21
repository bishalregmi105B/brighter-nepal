'use client'
/**
 * Weekly Test Exam Page — /weekly-tests/[id]/exam
 * Full-screen timed exam interface that:
 *  1. Fetches the test + questions from /api/weekly-tests/:id (with questions included)
 *  2. Runs a countdown timer
 *  3. Auto-submits when time runs out
 *  4. Submits score to /api/weekly-tests/:id/attempts
 *  5. Redirects back to /weekly-tests/:id to show results
 */
import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Clock, ChevronLeft, ChevronRight, Flag, CheckSquare, Loader2, AlertCircle } from 'lucide-react'
import { weeklyTestService, type WeeklyTest, type Question } from '@/services/weeklyTestService'
import { cn } from '@/lib/utils/cn'

type AnswerMap = Record<number, number>  // questionId → chosen option index

function formatTime(secs: number) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0')
  const s = (secs % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export default function WeeklyTestExamPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()

  const [test,      setTest]      = useState<WeeklyTest | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')
  const [current,   setCurrent]   = useState(0)
  const [answers,   setAnswers]   = useState<AnswerMap>({})
  const [timeLeft,  setTimeLeft]  = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [submitting,setSubmitting]= useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Load test
  useEffect(() => {
    if (!params.id) return
    weeklyTestService.getTest(params.id)
      .then((res) => {
        const t = res.data
        if (!t) { setError('Test not found.'); return }
        if (t.status === 'completed') {
          // Already closed — redirect back to detail page
          router.replace(`/weekly-tests/${params.id}`)
          return
        }
        setTest(t)
        setQuestions(t.questions ?? [])
        setTimeLeft((t.duration_min ?? 60) * 60)
      })
      .catch(() => setError('Failed to load test.'))
      .finally(() => setLoading(false))
  }, [params.id, router])

  // Countdown timer
  useEffect(() => {
    if (!test || submitted) return
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { handleSubmit(); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [test, submitted])

  const handleSubmit = useCallback(async () => {
    if (submitted || submitting) return
    if (timerRef.current) clearInterval(timerRef.current)
    setSubmitting(true)
    const answerArr = questions.map((q) => answers[q.id] ?? -1)
    const score = questions.reduce((s, q, i) =>
      answers[q.id] === q.answer_index ? s + 1 : s, 0)
    try {
      await weeklyTestService.submitAttempt(Number(params.id), score, questions.length, answerArr)
    } catch {}
    setSubmitted(true)
    setSubmitting(false)
    router.push(`/weekly-tests/${params.id}`)
  }, [submitted, submitting, questions, answers, params.id, router])

  const answered  = Object.keys(answers).length
  const flagged   = 0  // could track flagged questions; kept simple for now
  const timeWarn  = timeLeft < 120

  if (loading) return (
    <div className="fixed inset-0 bg-[#0d0d2b] flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-on-primary-container animate-spin" />
    </div>
  )

  if (error || !test || questions.length === 0) return (
    <div className="fixed inset-0 bg-[#0d0d2b] flex flex-col items-center justify-center gap-4 text-white p-8 text-center">
      <AlertCircle className="w-12 h-12 text-error" />
      <p className="text-lg font-bold">{error || 'No questions available for this test.'}</p>
      <button onClick={() => router.back()} className="mt-2 px-6 py-3 bg-on-primary-container rounded-xl font-bold text-white hover:opacity-90">
        Go Back
      </button>
    </div>
  )

  const q = questions[current]
  const OPTS = ['A', 'B', 'C', 'D']

  return (
    <div className="fixed inset-0 bg-[#0d0d2b] text-white flex flex-col overflow-hidden">
      {/* ── Top bar ── */}
      <header className="flex items-center justify-between px-4 md:px-8 py-3 bg-[#1a1a4e] border-b border-white/10 shrink-0">
        <div className="flex items-center gap-4 min-w-0">
          <button onClick={() => router.back()} className="text-white/50 hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="font-headline font-black text-sm md:text-base truncate">{test.title}</h1>
        </div>
        <div className={cn(
          'flex items-center gap-2 font-mono font-black text-xl px-4 py-1.5 rounded-xl',
          timeWarn ? 'bg-error/20 text-error animate-pulse' : 'bg-white/10 text-on-primary-container'
        )}>
          <Clock className="w-4 h-4" />
          {formatTime(timeLeft)}
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Question panel */}
        <main className="flex-1 flex flex-col overflow-y-auto p-4 md:p-8 gap-6">
          {/* Progress */}
          <div className="flex items-center justify-between text-xs text-white/50 font-bold">
            <span>Question {current + 1} of {questions.length}</span>
            <span>{answered} answered</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full">
            <div
              className="h-full bg-on-primary-container rounded-full transition-all"
              style={{ width: `${(answered / questions.length) * 100}%` }}
            />
          </div>

          {/* Question */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
            <p className="text-xs font-bold text-on-primary-container uppercase tracking-widest mb-4">
              {test.subject} · Q{current + 1}
            </p>
            <p className="text-base md:text-lg font-semibold leading-relaxed">{q.text}</p>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {q.options.map((opt, idx) => {
              const chosen = answers[q.id] === idx
              return (
                <button
                  key={idx}
                  onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: idx }))}
                  className={cn(
                    'w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all',
                    chosen
                      ? 'border-on-primary-container bg-on-primary-container/20 text-white'
                      : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10 text-white/80'
                  )}
                >
                  <span className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0',
                    chosen ? 'bg-on-primary-container text-white' : 'bg-white/10'
                  )}>
                    {OPTS[idx]}
                  </span>
                  <span className="text-sm md:text-base">{opt}</span>
                </button>
              )
            })}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setCurrent((p) => Math.max(0, p - 1))}
              disabled={current === 0}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/10 rounded-xl font-bold text-sm hover:bg-white/20 transition-all disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            {current < questions.length - 1 ? (
              <button
                onClick={() => setCurrent((p) => p + 1)}
                className="flex items-center gap-2 px-5 py-2.5 bg-on-primary-container rounded-xl font-bold text-sm hover:opacity-90 transition-all"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2.5 bg-green-500 hover:bg-green-600 rounded-xl font-bold text-sm transition-all disabled:opacity-60"
              >
                <CheckSquare className="w-4 h-4" />
                {submitting ? 'Submitting…' : 'Submit Test'}
              </button>
            )}
          </div>
        </main>

        {/* ── Sidebar: question grid ── */}
        <aside className="hidden md:flex flex-col w-64 bg-[#1a1a4e] border-l border-white/10 p-4 gap-4 overflow-y-auto shrink-0">
          <h3 className="text-xs font-black uppercase tracking-widest text-white/40">Questions</h3>
          <div className="grid grid-cols-5 gap-1.5">
            {questions.map((q_, i) => {
              const isAnswered = q_.id in answers
              const isCurrent  = i === current
              return (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={cn(
                    'w-full aspect-square rounded-lg text-xs font-black transition-all',
                    isCurrent  ? 'ring-2 ring-white bg-on-primary-container text-white' :
                    isAnswered ? 'bg-on-primary-container/30 text-on-primary-container' :
                                 'bg-white/5 text-white/30 hover:bg-white/10'
                  )}
                >
                  {i + 1}
                </button>
              )
            })}
          </div>
          <div className="mt-auto space-y-2 text-xs">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-on-primary-container/30" /><span className="text-white/50">Answered ({answered})</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-white/5" /><span className="text-white/50">Unanswered ({questions.length - answered})</span></div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-3 bg-green-500 hover:bg-green-600 rounded-xl font-bold text-sm transition-all disabled:opacity-60"
          >
            {submitting ? 'Submitting…' : 'Submit Test'}
          </button>
        </aside>
      </div>
    </div>
  )
}
