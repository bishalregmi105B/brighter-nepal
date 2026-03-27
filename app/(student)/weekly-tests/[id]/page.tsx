'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, BookCheck, CheckCircle2, Clock, ExternalLink, Loader2, RefreshCw, XCircle } from 'lucide-react'
import { weeklyTestService, type ExamResult, type ReviewQuestion, type WeeklyTest } from '@/services/weeklyTestService'
import { cn } from '@/lib/utils/cn'
import { toStudentGoogleFormUrl } from '@/lib/utils/googleForms'

export default function WeeklyTestDetailPage() {
  const params = useParams<{ id: string }>()
  const [test, setTest] = useState<WeeklyTest | null>(null)
  const [result, setResult] = useState<ExamResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!params.id) return

    Promise.all([
      weeklyTestService.getTest(params.id),
      weeklyTestService.getMyResult(params.id),
    ]).then(([testRes, resultRes]) => {
      setTest(testRes.data)
      setResult(resultRes.data)
    }).catch((err) => {
      setError(err instanceof Error ? err.message : 'Failed to load weekly test.')
    }).finally(() => setLoading(false))
  }, [params.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-on-primary-container" />
      </div>
    )
  }

  if (error || !test || !result) {
    return (
      <div className="p-10 text-center">
        <p className="text-red-500 font-medium mb-4">{error || 'Test not found.'}</p>
        <Link href="/weekly-tests" className="text-on-primary-container font-bold hover:underline">
          Back to Weekly Tests
        </Link>
      </div>
    )
  }

  const isCompleted = test.status === 'completed'
  const studentFormsUrl = toStudentGoogleFormUrl(test.forms_view_url, test.forms_url)
  const reviewQuestions = result.review_questions ?? []
  const score = result.score ?? 0
  const total = result.total ?? test.total_questions ?? 0
  const percentage = result.percentage ?? (total > 0 ? Math.round((score / total) * 100) : 0)

  if (!isCompleted && !result.has_result) {
    return (
      <div className="p-6 md:p-10 max-w-3xl mx-auto space-y-8">
        <Link href="/weekly-tests" className="flex items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-on-primary-container transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Weekly Tests
        </Link>
        <div className="bg-white rounded-2xl shadow-[0_12px_32px_rgba(25,28,30,0.06)] overflow-hidden">
          <div className="bg-[#1a1a4e] p-8 text-white">
            <h1 className="font-headline font-black text-3xl mb-2">{test.title}</h1>
            <p className="text-white/60">{test.subject}</p>
          </div>
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-surface-container-low p-4 rounded-xl text-center">
                <BookCheck className="w-6 h-6 mx-auto mb-2 text-on-primary-container" />
                <p className="text-xl font-black text-[#1a1a4e]">{test.total_questions || '—'}</p>
                <p className="text-[10px] font-bold text-outline uppercase tracking-widest mt-0.5">Questions</p>
              </div>
              <div className="bg-surface-container-low p-4 rounded-xl text-center">
                <Clock className="w-6 h-6 mx-auto mb-2 text-on-primary-container" />
                <p className="text-xl font-black text-[#1a1a4e]">{test.duration_min || '—'} min</p>
                <p className="text-[10px] font-bold text-outline uppercase tracking-widest mt-0.5">Duration</p>
              </div>
            </div>

            <div className="bg-surface-container-low rounded-xl p-6 space-y-3">
              <h3 className="font-bold text-on-surface mb-3">Instructions</h3>
              {studentFormsUrl ? (
                <>
                  <p className="text-sm text-slate-600">This weekly test is hosted in Google Forms. Opening the test will take you to the linked form in a new tab.</p>
                  <p className="text-sm text-slate-600">Results appear here after an admin sync. If your score is missing later, that means sync has not run yet.</p>
                </>
              ) : (
                <>
                  <p className="text-sm text-slate-600">Each question carries 1 mark. There is no negative marking.</p>
                  <p className="text-sm text-slate-600">You must complete the test within the allotted time. The test auto-submits when time runs out.</p>
                </>
              )}
            </div>

            {studentFormsUrl ? (
              <a
                href={studentFormsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center bg-on-primary-container text-white py-4 rounded-xl font-bold text-base hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-on-primary-container/20"
              >
                <span className="inline-flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Open Google Form
                </span>
              </a>
            ) : (
              <Link
                href={`/weekly-tests/${test.id}/exam`}
                className="block w-full text-center bg-on-primary-container text-white py-4 rounded-xl font-bold text-base hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-on-primary-container/20"
              >
                Start Test Now
              </Link>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (!result.has_result) {
    return (
      <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8">
        <Link href="/weekly-tests" className="flex items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-on-primary-container transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Weekly Tests
        </Link>
        <div className="bg-white rounded-3xl p-10 text-center shadow-[0_12px_32px_rgba(25,28,30,0.06)] space-y-4">
          <h1 className="font-headline font-black text-3xl text-[#1a1a4e]">Result Not Synced Yet</h1>
          <p className="text-slate-500 max-w-xl mx-auto">Your latest Google Form submission has not been imported into Brighter Nepal yet. The weekly test is completed, but admin sync still needs to run.</p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            {studentFormsUrl && (
              <a
                href={studentFormsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-on-primary-container text-white rounded-xl font-bold hover:opacity-90 transition-colors inline-flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Open Google Form
              </a>
            )}
            <Link href="/weekly-tests" className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors">
              Back to Weekly Tests
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8">
      <Link href="/weekly-tests" className="flex items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-on-primary-container transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Weekly Tests
      </Link>

      <div className="bg-[#1a1a4e] rounded-3xl p-8 md:p-12 text-white flex flex-col md:flex-row items-center gap-10">
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold uppercase tracking-widest mb-4">
            {result.source === 'google_forms' ? 'Google Forms Result' : 'Internal Result'}
          </div>
          <h1 className="font-headline font-black text-3xl md:text-4xl mb-2">{test.title}</h1>
          <p className="text-white/60 mb-6">{test.subject} · {isCompleted ? 'Completed' : 'Latest Synced Result'}</p>
          <p className="text-white/70 text-sm">
            Submitted {result.submitted_at ? new Date(result.submitted_at).toLocaleString() : 'recently'}.
          </p>
        </div>
        <div className="text-center">
          <div className="w-36 h-36 rounded-full bg-white/10 border-4 border-on-primary-container flex flex-col items-center justify-center mx-auto">
            <span className="font-headline font-black text-5xl">{score}</span>
            <span className="text-white/50 text-sm">/ {total}</span>
          </div>
          <p className="text-on-primary-container font-black text-xl mt-4">{percentage}%</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-[0_8px_20px_rgba(25,28,30,0.04)]">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h3 className="font-headline font-bold text-[#1a1a4e] text-lg">Answer Review</h3>
          {studentFormsUrl && (
            <a
              href={studentFormsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-on-primary-container font-bold text-sm inline-flex items-center gap-2 hover:underline"
            >
              <ExternalLink className="w-4 h-4" />
              Open Google Form
            </a>
          )}
        </div>

        {reviewQuestions.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-8">Detailed review not available.</p>
        ) : reviewQuestions.map((q: ReviewQuestion) => (
          <div
            key={q.number}
            className={cn(
              'p-4 rounded-xl border mb-3',
              q.isCorrect ? 'border-tertiary-fixed bg-tertiary-fixed/10' : 'border-error/20 bg-error-container/20',
            )}
          >
            <div className="flex justify-between items-start mb-2 gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                  {(q.subject || test.subject || 'General').toUpperCase()} • Question {q.number}
                </p>
                <p className="text-sm font-semibold text-on-surface">{q.text}</p>
              </div>
              {q.isCorrect ? (
                <CheckCircle2 className="w-5 h-5 text-on-tertiary-container flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-error flex-shrink-0" />
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 text-[13px] font-medium">
              <div className="rounded-xl bg-white/70 p-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Your Answer</p>
                <p className="text-on-surface">{q.chosen}</p>
              </div>
              <div className="rounded-xl bg-white/70 p-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Correct Answer</p>
                <p className="text-on-surface">{q.correct}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
