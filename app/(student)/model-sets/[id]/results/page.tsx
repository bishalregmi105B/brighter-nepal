'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, CheckCircle2, Loader2, RefreshCw, XCircle } from 'lucide-react'
import { modelSetService, type ExamResult, type ModelSet, type ReviewQuestion } from '@/services/modelSetService'
import { toStudentGoogleFormUrl } from '@/lib/utils/googleForms'

interface SubjectStats {
  name: string
  total: number
  correct: number
  wrong: number
  skipped: number
}

export default function ExamResultsPage() {
  const params = useParams<{ id: string }>()
  const [modelSet, setModelSet] = useState<ModelSet | null>(null)
  const [result, setResult] = useState<ExamResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!params.id) return
    Promise.all([
      modelSetService.getModelSet(Number(params.id)),
      modelSetService.getMyResult(Number(params.id)),
    ]).then(([setRes, resultRes]) => {
      setModelSet(setRes.data)
      setResult(resultRes.data)
    }).catch((err) => {
      setError(err instanceof Error ? err.message : 'Failed to load result.')
    }).finally(() => setLoading(false))
  }, [params.id])

  const reviewQuestions = result?.review_questions ?? []
  const subjectStats = useMemo<SubjectStats[]>(() => {
    const map = new Map<string, SubjectStats>()
    reviewQuestions.forEach((question) => {
      const name = question.subject || 'General'
      const row = map.get(name) ?? { name, total: 0, correct: 0, wrong: 0, skipped: 0 }
      row.total += 1
      if (question.chosen === 'Not answered') row.skipped += 1
      else if (question.isCorrect) row.correct += 1
      else row.wrong += 1
      map.set(name, row)
    })
    return Array.from(map.values())
  }, [reviewQuestions])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-on-primary-container" />
      </div>
    )
  }

  if (error || !modelSet || !result) {
    return (
      <div className="p-10 text-center space-y-4">
        <p className="text-red-500 font-medium">{error || 'Result not found.'}</p>
        <Link href="/model-sets" className="text-on-primary-container font-bold hover:underline">Back to Model Sets</Link>
      </div>
    )
  }
  const studentFormsUrl = toStudentGoogleFormUrl(modelSet.forms_view_url, modelSet.forms_url)

  if (!result.has_result) {
    return (
      <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8">
        <Link href={`/model-sets/${params.id}`} className="flex items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-on-primary-container transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Model Set
        </Link>
        <div className="bg-white rounded-3xl p-10 text-center shadow-[0_12px_32px_rgba(25,28,30,0.06)] space-y-4">
          <h1 className="font-headline font-black text-3xl text-[#1a1a4e]">Result Not Synced Yet</h1>
          <p className="text-slate-500 max-w-xl mx-auto">Your latest Google Form result has not been imported into Brighter Nepal yet. Use the original form or wait for admin sync.</p>
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
            <Link href="/model-sets" className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors">
              Back to Model Sets
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const percentage = result.percentage ?? 0
  const circumference = 2 * Math.PI * 42
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10">
      <Link href={`/model-sets/${params.id}`} className="flex items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-on-primary-container transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Model Set
      </Link>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white rounded-3xl shadow-card p-8 lg:p-12">
        <div className="lg:col-span-7 space-y-5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant font-bold text-sm">
            Latest Attempt • {result.source === 'google_forms' ? 'Google Forms' : 'Internal Exam'}
          </div>
          <h1 className="font-headline font-black text-4xl md:text-5xl text-[#1a1a4e] tracking-tight leading-tight">
            {modelSet.title}
          </h1>
          <p className="text-on-surface-variant text-lg max-w-xl leading-relaxed">
            Submitted {result.submitted_at ? new Date(result.submitted_at).toLocaleString() : 'recently'}.
            Review your strengths and missed questions below.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            {studentFormsUrl ? (
              <a
                href={studentFormsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-3 bg-on-primary-container text-white font-bold rounded-full hover:opacity-90 active:scale-95 transition-all"
              >
                <RefreshCw className="w-4 h-4" /> Open Google Form
              </a>
            ) : (
              <Link
                href={`/model-sets/${params.id}`}
                className="inline-flex items-center gap-2 px-8 py-3 bg-on-primary-container text-white font-bold rounded-full hover:opacity-90 active:scale-95 transition-all"
              >
                <RefreshCw className="w-4 h-4" /> Retake Practice
              </Link>
            )}
          </div>
        </div>

        <div className="lg:col-span-5 flex justify-center lg:justify-end">
          <div className="relative w-64 h-64 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="transparent" stroke="#e7e8ea" strokeWidth="8" />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="transparent"
                stroke="#cf6e3a"
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-headline font-black text-6xl text-[#1a1a4e]">{result.score ?? 0}</span>
              <span className="text-on-surface-variant font-bold text-sm uppercase tracking-widest">Out of {result.total ?? 0}</span>
              <span className="text-on-primary-container font-bold text-sm mt-1">{percentage}%</span>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-headline font-bold text-2xl text-[#1a1a4e]">Subject-wise Performance</h2>
        {subjectStats.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-slate-400 shadow-sm">Detailed subject breakdown is not available for this attempt.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {subjectStats.map((subject) => (
              <div key={subject.name} className="bg-surface-container-low p-6 rounded-2xl hover:bg-white hover:shadow-xl transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-lg bg-[#1a1a4e] text-white flex items-center justify-center font-black text-lg">
                    {subject.name.slice(0, 1).toUpperCase()}
                  </div>
                  <span className="font-bold text-lg text-[#1a1a4e]">{subject.correct}/{subject.total}</span>
                </div>
                <h3 className="font-bold text-lg mb-4">{subject.name}</h3>
                <div className="space-y-3 text-xs font-semibold">
                  <div className="flex justify-between">
                    <span className="text-on-tertiary-container">Correct: {subject.correct}</span>
                    <span className="text-error">Wrong: {subject.wrong}</span>
                  </div>
                  <p className="text-on-surface-variant">Skipped: {subject.skipped}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="font-headline font-bold text-2xl text-[#1a1a4e]">Detailed Answer Review</h2>
        {reviewQuestions.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-slate-400 shadow-sm">Detailed review not available.</div>
        ) : (
          <div className="space-y-4">
            {reviewQuestions.map((question: ReviewQuestion) => (
              <div key={question.number} className={`bg-white rounded-2xl p-6 shadow-sm border-l-4 ${question.isCorrect ? 'border-on-tertiary-container' : 'border-error'}`}>
                <div className="flex justify-between items-start gap-4 mb-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant block mb-2">
                      {(question.subject || 'General').toUpperCase()} • Question {question.number}
                    </span>
                    <h4 className="text-lg font-semibold leading-relaxed text-[#1a1a4e]">{question.text}</h4>
                  </div>
                  {question.isCorrect ? <CheckCircle2 className="w-5 h-5 text-on-tertiary-container flex-shrink-0" /> : <XCircle className="w-5 h-5 text-error flex-shrink-0" />}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-medium">
                  <div className="p-4 rounded-xl bg-surface-container-low">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Your Answer</p>
                    <p className="text-on-surface">{question.chosen}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-surface-container-low">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Correct Answer</p>
                    <p className="text-on-surface">{question.correct}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
