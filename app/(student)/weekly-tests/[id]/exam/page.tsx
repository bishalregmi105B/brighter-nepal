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
import Link from 'next/link'
import { Clock, ChevronLeft, ChevronRight, CheckSquare, Loader2, AlertCircle, ExternalLink } from 'lucide-react'
import { weeklyTestService, type WeeklyTest, type Question } from '@/services/weeklyTestService'
import { cn } from '@/lib/utils/cn'
import ReactMarkdown from 'react-markdown'
import { toStudentGoogleFormUrl } from '@/lib/utils/googleForms'

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
  const [formsUrl,   setFormsUrl]  = useState('')
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const submitRef = useRef<() => void>(() => {})

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
        const externalForm = toStudentGoogleFormUrl(t.forms_url)
        setFormsUrl(externalForm)
        if (!externalForm) {
          setQuestions(t.questions ?? [])
          setTimeLeft((t.duration_min ?? 60) * 60)
        }
      })
      .catch(() => setError('Failed to load test.'))
      .finally(() => setLoading(false))
  }, [params.id, router])

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

  useEffect(() => {
    submitRef.current = () => {
      void handleSubmit()
    }
  }, [handleSubmit])

  // Countdown timer
  useEffect(() => {
    if (!test || submitted || formsUrl || questions.length === 0) return
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { submitRef.current(); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [test, submitted, formsUrl, questions.length])

  const answered  = Object.keys(answers).length
  const timeWarn  = timeLeft < 120

  if (loading) return (
    <div className="fixed inset-0 bg-[#f8f9fb] flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-on-primary-container animate-spin" />
    </div>
  )

  if (formsUrl && test) {
    return (
      <div className="fixed inset-0 bg-[#f8f9fb] flex flex-col items-center justify-center gap-6 p-8 text-center">
        <div className="max-w-xl space-y-4">
          <h1 className="text-3xl font-headline font-black text-[#1a1a4e]">{test.title}</h1>
          <p className="text-slate-500">This weekly test is hosted in Google Forms. The internal exam screen is disabled for this test, so open the linked form to continue.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <a
            href={formsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-on-primary-container text-white rounded-xl font-bold hover:opacity-90 transition-colors inline-flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Open Google Form
          </a>
          <Link href={`/weekly-tests/${params.id}`} className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors">
            Back to Weekly Test
          </Link>
        </div>
      </div>
    )
  }

  if (error || !test || questions.length === 0) return (
    <div className="fixed inset-0 bg-[#f8f9fb] flex flex-col items-center justify-center gap-4 text-slate-800 p-8 text-center">
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
    <div className="fixed inset-0 bg-[#f8f9fb] text-slate-800 flex flex-col overflow-hidden">
      {/* ── Top bar ── */}
      <header className="flex items-center justify-between px-4 md:px-8 py-3 bg-[#1a1a4e] text-white border-b border-white/10 shrink-0 shadow-lg">
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
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>Question {current + 1} of {questions.length}</span>
            <span>{answered} answered</span>
          </div>
          <div className="h-1.5 bg-slate-200 rounded-full">
            <div
              className="h-full bg-on-primary-container rounded-full transition-all"
              style={{ width: `${(answered / questions.length) * 100}%` }}
            />
          </div>

          {/* Question */}
          <div className="bg-white border border-surface-container rounded-2xl p-6 md:p-8 shadow-sm">
            <p className="text-xs font-bold text-on-primary-container uppercase tracking-widest mb-4">
              {test.subject} · Q{current + 1}
            </p>
            <div className="text-base md:text-lg font-semibold text-[#1a1a4e] leading-relaxed prose prose-slate max-w-none">
              <ReactMarkdown>{q.text}</ReactMarkdown>
            </div>
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
                      ? 'border-on-primary-container bg-primary-container/20 text-[#1a1a4e]'
                      : 'border-surface-container bg-white hover:border-[#1a1a4e]/30 text-slate-600'
                  )}
                >
                  <span className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0',
                    chosen ? 'bg-on-primary-container text-white' : 'bg-slate-100 text-slate-500'
                  )}>
                    {OPTS[idx]}
                  </span>
                  <span className="text-sm md:text-base prose prose-sm max-w-none">
                    <ReactMarkdown>{opt}</ReactMarkdown>
                  </span>
                </button>
              )
            })}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setCurrent((p) => Math.max(0, p - 1))}
              disabled={current === 0}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-surface-container text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            {current < questions.length - 1 ? (
              <button
                onClick={() => setCurrent((p) => p + 1)}
                className="flex items-center gap-2 px-5 py-2.5 bg-on-primary-container text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-sm transition-all disabled:opacity-60"
              >
                <CheckSquare className="w-4 h-4" />
                {submitting ? 'Submitting…' : 'Submit Test'}
              </button>
            )}
          </div>
        </main>

        {/* ── Sidebar: question grid ── */}
        <aside className="hidden md:flex flex-col w-64 bg-white border-l border-surface-container p-4 gap-4 overflow-y-auto shrink-0 shadow-sm">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Questions</h3>
          <div className="grid grid-cols-5 gap-1.5">
            {questions.map((q_, i) => {
              const isAnswered = q_.id in answers
              const isCurrent  = i === current
              return (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={cn(
                    'w-full aspect-square rounded-lg text-xs font-black transition-all border',
                    isCurrent  
                      ? 'border-on-primary-container bg-on-primary-container text-white' 
                      : isAnswered 
                        ? 'border-on-primary-container/30 bg-primary-container/20 text-on-primary-container' 
                        : 'border-transparent bg-slate-100 text-slate-400 hover:bg-slate-200'
                  )}
                >
                  {i + 1}
                </button>
              )
            })}
          </div>
          <div className="mt-auto space-y-2 text-xs">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-primary-container/40 border border-on-primary-container/30" /><span className="text-slate-500 font-medium">Answered ({answered})</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-slate-100" /><span className="text-slate-500 font-medium">Unanswered ({questions.length - answered})</span></div>
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
