'use client'
// Student Weekly Test Detail — loads real test by ID, shows result if completed
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, BookCheck, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { weeklyTestService, type WeeklyTest } from '@/services/weeklyTestService'
import { cn } from '@/lib/utils/cn'

export default function WeeklyTestDetailPage() {
  const params   = useParams<{ id: string }>()
  const [test,   setTest]    = useState<WeeklyTest | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!params.id) return
    weeklyTestService.getTest(params.id).then((res) => {
      setTest(res.data)
    }).finally(() => setLoading(false))
  }, [params.id])

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-on-primary-container" /></div>
  if (!test)   return (
    <div className="p-10 text-center">
      <p className="text-red-500 font-medium mb-4">Test not found.</p>
      <Link href="/weekly-tests" className="text-on-primary-container font-bold hover:underline">← Back to Weekly Tests</Link>
    </div>
  )

  const isCompleted = test.status === 'completed'
  const score       = test.my_score ?? 0
  const total       = test.total_questions ?? 0
  const percentage  = total > 0 ? Math.round((score / total) * 100) : 0

  if (!isCompleted) {
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
            <div className="grid grid-cols-3 gap-4">
              {[
                { Icon: BookCheck, label: 'Questions', value: `${test.total_questions ?? '—'}` },
                { Icon: Clock,     label: 'Duration',  value: `${test.duration_min ?? '—'} min` },
              ].map(({ Icon, label, value }) => (
                <div key={label} className="bg-surface-container-low p-4 rounded-xl text-center">
                  <Icon className="w-6 h-6 mx-auto mb-2 text-on-primary-container" />
                  <p className="text-xl font-black text-[#1a1a4e]">{value}</p>
                  <p className="text-[10px] font-bold text-outline uppercase tracking-widest mt-0.5">{label}</p>
                </div>
              ))}
            </div>
            <div className="bg-surface-container-low rounded-xl p-6 space-y-3">
              <h3 className="font-bold text-on-surface mb-3">Instructions</h3>
              {[
                'Each question carries 1 mark. There is no negative marking.',
                'You must complete the test in the allotted time — it will auto-submit.',
                'Do not switch browser tabs during the exam.',
                'Results will be published within 24 hours of the session closing.',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-on-primary-container/10 text-on-primary-container text-[10px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">{i+1}</span>
                  <p className="text-sm text-slate-600">{item}</p>
                </div>
              ))}
            </div>
            <Link href={`/weekly-tests/${test.id}/exam`}
              className="block w-full text-center bg-on-primary-container text-white py-4 rounded-xl font-bold text-base hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-on-primary-container/20">
              Start Test Now
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
          <h1 className="font-headline font-black text-3xl md:text-4xl mb-2">{test.title}</h1>
          <p className="text-white/60 mb-8">{test.subject} · Completed</p>
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
        <h3 className="font-headline font-bold text-[#1a1a4e] text-lg mb-4">Answer Review</h3>
        {(test.review_questions ?? []).length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-8">Detailed review not available.</p>
        ) : (test.review_questions ?? []).map((q: { number: number; text: string; chosen: string; correct: string; isCorrect: boolean }) => (
          <div key={q.number} className={cn('p-4 rounded-xl border mb-3', q.isCorrect ? 'border-tertiary-fixed bg-tertiary-fixed/10' : 'border-error/20 bg-error-container/20')}>
            <div className="flex justify-between items-start mb-2">
              <p className="text-sm font-semibold text-on-surface">{q.number}. {q.text}</p>
              {q.isCorrect ? <CheckCircle2 className="w-5 h-5 text-on-tertiary-container flex-shrink-0 ml-3" /> : <XCircle className="w-5 h-5 text-error flex-shrink-0 ml-3" />}
            </div>
            {!q.isCorrect && (
              <div className="flex flex-col gap-1 mt-2 text-[11px] font-bold">
                <span className="text-error">Your answer: {q.chosen}</span>
                <span className="text-on-tertiary-container">Correct: {q.correct}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
