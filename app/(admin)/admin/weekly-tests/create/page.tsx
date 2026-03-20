'use client'
// Admin Weekly Test Create — full form to schedule a new weekly test
import { useState } from 'react'
import { ArrowLeft, Plus, Trash2, Clock, BookOpen, CalendarDays } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'

const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'General']

interface Question { id: string; text: string; options: string[]; answer: number }

export default function CreateWeeklyTestPage() {
  const [title,     setTitle]     = useState('')
  const [subject,   setSubject]   = useState(SUBJECTS[0])
  const [duration,  setDuration]  = useState('60')
  const [schedDate, setSchedDate] = useState('')
  const [schedTime, setSchedTime] = useState('')
  const [questions, setQuestions] = useState<Question[]>([
    { id: 'q1', text: '', options: ['', '', '', ''], answer: 0 },
  ])

  const addQuestion = () =>
    setQuestions((prev) => [...prev, { id: `q${Date.now()}`, text: '', options: ['', '', '', ''], answer: 0 }])

  const removeQuestion = (id: string) =>
    setQuestions((prev) => prev.filter((q) => q.id !== id))

  const updateQuestion = (id: string, text: string) =>
    setQuestions((prev) => prev.map((q) => q.id === id ? { ...q, text } : q))

  const updateOption = (qid: string, oIdx: number, val: string) =>
    setQuestions((prev) => prev.map((q) => q.id === qid ? { ...q, options: q.options.map((o, i) => i === oIdx ? val : o) } : q))

  const setAnswer = (qid: string, idx: number) =>
    setQuestions((prev) => prev.map((q) => q.id === qid ? { ...q, answer: idx } : q))

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/weekly-tests" className="p-2 rounded-xl hover:bg-surface-container text-on-surface-variant transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="font-headline font-black text-3xl text-[#1a1a4e]">Create Weekly Test</h2>
          <p className="text-slate-500 text-sm font-medium">Schedule a new test session for your students.</p>
        </div>
      </div>

      {/* Test Info */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_8px_20px_rgba(25,28,30,0.04)] space-y-5">
        <h3 className="font-bold text-on-surface text-lg border-b border-surface-container pb-3">Test Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-outline uppercase tracking-wider block mb-2">Test Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Advanced Mathematics: Calculus II"
              className="w-full px-4 py-3 bg-surface-container rounded-xl border-none focus:ring-2 focus:ring-on-primary-container/20 text-sm font-medium"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-outline uppercase tracking-wider block mb-2 flex items-center gap-1.5"><BookOpen className="w-3 h-3" /> Subject</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-3 bg-surface-container rounded-xl border-none focus:ring-2 focus:ring-on-primary-container/20 text-sm font-medium"
            >
              {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-outline uppercase tracking-wider block mb-2 flex items-center gap-1.5"><Clock className="w-3 h-3" /> Duration (minutes)</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              min={15}
              max={180}
              className="w-full px-4 py-3 bg-surface-container rounded-xl border-none focus:ring-2 focus:ring-on-primary-container/20 text-sm font-medium"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-outline uppercase tracking-wider block mb-2 flex items-center gap-1.5"><CalendarDays className="w-3 h-3" /> Schedule Date</label>
            <input
              type="date"
              value={schedDate}
              onChange={(e) => setSchedDate(e.target.value)}
              className="w-full px-4 py-3 bg-surface-container rounded-xl border-none focus:ring-2 focus:ring-on-primary-container/20 text-sm font-medium"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-outline uppercase tracking-wider block mb-2">Start Time</label>
            <input
              type="time"
              value={schedTime}
              onChange={(e) => setSchedTime(e.target.value)}
              className="w-full px-4 py-3 bg-surface-container rounded-xl border-none focus:ring-2 focus:ring-on-primary-container/20 text-sm font-medium"
            />
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-on-surface text-lg">{questions.length} Question{questions.length !== 1 ? 's' : ''}</h3>
          <button onClick={addQuestion} className="flex items-center gap-2 px-4 py-2 bg-on-primary-container/10 text-on-primary-container font-bold text-sm rounded-xl hover:bg-on-primary-container/20 transition-colors">
            <Plus className="w-4 h-4" /> Add Question
          </button>
        </div>

        {questions.map((q, qIdx) => (
          <div key={q.id} className="bg-white rounded-2xl p-6 shadow-[0_8px_20px_rgba(25,28,30,0.04)]">
            <div className="flex items-start gap-4 mb-4">
              <span className="w-7 h-7 rounded-full bg-[#1a1a4e] text-white text-xs font-black flex items-center justify-center flex-shrink-0">{qIdx + 1}</span>
              <input
                value={q.text}
                onChange={(e) => updateQuestion(q.id, e.target.value)}
                placeholder="Enter question text..."
                className="flex-1 px-3 py-2 bg-surface-container rounded-xl border-none focus:ring-2 focus:ring-on-primary-container/20 text-sm font-medium"
              />
              {questions.length > 1 && (
                <button onClick={() => removeQuestion(q.id)} className="p-2 rounded-lg text-error hover:bg-error-container transition-colors flex-shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 ml-11">
              {q.options.map((opt, oIdx) => (
                <div key={oIdx} className="flex items-center gap-2">
                  <button
                    onClick={() => setAnswer(q.id, oIdx)}
                    className={cn(
                      'w-5 h-5 rounded-full border-2 flex-shrink-0 transition-colors',
                      q.answer === oIdx ? 'border-on-primary-container bg-on-primary-container' : 'border-outline-variant hover:border-on-primary-container'
                    )}
                  />
                  <input
                    value={opt}
                    onChange={(e) => updateOption(q.id, oIdx, e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                    className="flex-1 px-3 py-2 bg-surface-container rounded-lg border-none focus:ring-2 focus:ring-on-primary-container/20 text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Submit */}
      <div className="flex gap-3 pb-8">
        <Link href="/admin/weekly-tests" className="flex-1 py-3.5 rounded-xl border border-outline-variant/20 font-bold text-sm text-on-surface hover:bg-surface-container transition-colors text-center">
          Cancel
        </Link>
        <button className="flex-1 py-3.5 bg-surface-container text-[#1a1a4e] font-bold text-sm rounded-xl hover:bg-surface-container-high transition-colors">
          Save as Draft
        </button>
        <button className="flex-1 py-3.5 bg-[#c0622f] text-white font-bold text-sm rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-[#c0622f]/20">
          Schedule Test
        </button>
      </div>
    </div>
  )
}
