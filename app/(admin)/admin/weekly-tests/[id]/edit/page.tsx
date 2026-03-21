'use client'
// Admin — Edit Weekly Test
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Plus, Trash2, Clock, BookOpen, CalendarDays, Loader2, Link2, Save, Radio } from 'lucide-react'
import Link from 'next/link'
import { weeklyTestService } from '@/services/weeklyTestService'
import { cn } from '@/lib/utils/cn'

const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Accountancy', 'Economics', 'GK', 'General']
const STATUSES = [
  { value: 'draft',     label: 'Draft',     color: 'bg-slate-100 text-slate-600' },
  { value: 'scheduled', label: 'Scheduled', color: 'bg-sky-100 text-sky-700' },
  { value: 'live',      label: 'Live Now',  color: 'bg-red-100 text-red-600' },
  { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-700' },
]

interface Question { id: string; text: string; options: string[]; answer: number }

export default function EditWeeklyTestPage() {
  const router   = useRouter()
  const { id }   = useParams<{ id: string }>()

  const [title,     setTitle]     = useState('')
  const [subject,   setSubject]   = useState(SUBJECTS[0])
  const [duration,  setDuration]  = useState('60')
  const [status,    setStatus]    = useState('scheduled')
  const [formsUrl,  setFormsUrl]  = useState('')
  const [schedDate, setSchedDate] = useState('')
  const [schedTime, setSchedTime] = useState('')
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading,   setLoading]   = useState(true)
  const [saving,    setSaving]    = useState(false)
  const [error,     setError]     = useState('')

  useEffect(() => {
    weeklyTestService.getTest(id).then((res) => {
      const t = res.data
      setTitle(t.title)
      setSubject(t.subject)
      setDuration(String(t.duration_min))
      setStatus(t.status)
      setFormsUrl(t.forms_url || '')
      if (t.scheduled_at) {
        const d = new Date(t.scheduled_at)
        setSchedDate(d.toISOString().split('T')[0])
        setSchedTime(d.toTimeString().slice(0, 5))
      }
      setQuestions(
        (t.questions || []).map((q) => ({
          id: String(q.id),
          text: q.text,
          options: q.options,
          answer: q.answer_index,
        }))
      )
    }).catch((e) => setError(e.message)).finally(() => setLoading(false))
  }, [id])

  const addQuestion = () =>
    setQuestions((prev) => [...prev, { id: `q${Date.now()}`, text: '', options: ['', '', '', ''], answer: 0 }])

  const removeQuestion = (qid: string) =>
    setQuestions((prev) => prev.filter((q) => q.id !== qid))

  const updateQuestion = (qid: string, text: string) =>
    setQuestions((prev) => prev.map((q) => q.id === qid ? { ...q, text } : q))

  const updateOption = (qid: string, oIdx: number, val: string) =>
    setQuestions((prev) => prev.map((q) => q.id === qid ? { ...q, options: q.options.map((o, i) => i === oIdx ? val : o) } : q))

  const setAnswer = (qid: string, idx: number) =>
    setQuestions((prev) => prev.map((q) => q.id === qid ? { ...q, answer: idx } : q))

  const save = async () => {
    setSaving(true)
    try {
      await weeklyTestService.updateTest(Number(id), {
        title,
        subject,
        duration_min: Number(duration),
        status,
        forms_url: formsUrl || undefined,
        scheduled_at: schedDate && schedTime ? `${schedDate}T${schedTime}:00` : null,
        questions: questions.map((q) => ({ text: q.text, options: q.options, answer_index: q.answer })) as unknown as import('@/services/weeklyTestService').Question[],
      })
      router.push('/admin/weekly-tests')
    } catch {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-on-primary-container" /></div>
  if (error)   return <div className="p-10 text-center text-red-500 font-medium">{error}</div>

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/weekly-tests" className="p-2 rounded-xl hover:bg-surface-container text-on-surface-variant transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="font-headline font-black text-3xl text-[#1a1a4e]">Edit Weekly Test</h2>
          <p className="text-slate-500 text-sm font-medium">Update test details, questions, and forms link.</p>
        </div>
      </div>

      {/* Test Info */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_8px_20px_rgba(25,28,30,0.04)] space-y-5">
        <h3 className="font-bold text-on-surface text-lg border-b border-surface-container pb-3">Test Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-outline uppercase tracking-wider block mb-2">Test Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Advanced Mathematics: Calculus II"
              className="w-full px-4 py-3 bg-surface-container rounded-xl border-none focus:ring-2 focus:ring-on-primary-container/20 text-sm font-medium" />
          </div>
          <div>
            <label className="text-xs font-bold text-outline uppercase tracking-wider block mb-2 flex items-center gap-1.5"><BookOpen className="w-3 h-3" /> Subject</label>
            <select value={subject} onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-3 bg-surface-container rounded-xl border-none focus:ring-2 focus:ring-on-primary-container/20 text-sm font-medium">
              {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-outline uppercase tracking-wider block mb-2 flex items-center gap-1.5"><Clock className="w-3 h-3" /> Duration (minutes)</label>
            <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} min={15} max={180}
              className="w-full px-4 py-3 bg-surface-container rounded-xl border-none focus:ring-2 focus:ring-on-primary-container/20 text-sm font-medium" />
          </div>

          {/* Status */}
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-outline uppercase tracking-wider block mb-2 flex items-center gap-1.5"><Radio className="w-3 h-3" /> Status</label>
            <div className="flex gap-2 flex-wrap">
              {STATUSES.map((s) => (
                <button key={s.value} onClick={() => setStatus(s.value)}
                  className={cn('px-4 py-2 rounded-xl text-sm font-bold transition-all border-2',
                    status === s.value ? 'border-on-primary-container bg-on-primary-container/10 text-on-primary-container' : 'border-transparent bg-surface-container text-slate-600 hover:border-outline'
                  )}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Google Forms URL */}
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-outline uppercase tracking-wider block mb-2 flex items-center gap-1.5"><Link2 className="w-3 h-3" /> Google Forms URL (for live test)</label>
            <input value={formsUrl} onChange={(e) => setFormsUrl(e.target.value)}
              placeholder="https://docs.google.com/forms/d/..."
              className="w-full px-4 py-3 bg-surface-container rounded-xl border-none focus:ring-2 focus:ring-on-primary-container/20 text-sm font-medium" />
            <p className="text-[11px] text-slate-400 mt-1.5">When the test is live, students will be redirected to this Google Form instead of the internal exam.</p>
          </div>

          <div>
            <label className="text-xs font-bold text-outline uppercase tracking-wider block mb-2 flex items-center gap-1.5"><CalendarDays className="w-3 h-3" /> Schedule Date</label>
            <input type="date" value={schedDate} onChange={(e) => setSchedDate(e.target.value)}
              className="w-full px-4 py-3 bg-surface-container rounded-xl border-none focus:ring-2 focus:ring-on-primary-container/20 text-sm font-medium" />
          </div>
          <div>
            <label className="text-xs font-bold text-outline uppercase tracking-wider block mb-2">Start Time</label>
            <input type="time" value={schedTime} onChange={(e) => setSchedTime(e.target.value)}
              className="w-full px-4 py-3 bg-surface-container rounded-xl border-none focus:ring-2 focus:ring-on-primary-container/20 text-sm font-medium" />
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
              <input value={q.text} onChange={(e) => updateQuestion(q.id, e.target.value)}
                placeholder="Enter question text..."
                className="flex-1 px-3 py-2 bg-surface-container rounded-xl border-none focus:ring-2 focus:ring-on-primary-container/20 text-sm font-medium" />
              {questions.length > 1 && (
                <button onClick={() => removeQuestion(q.id)} className="p-2 rounded-lg text-error hover:bg-error-container transition-colors flex-shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 ml-11">
              {q.options.map((opt, oIdx) => (
                <div key={oIdx} className="flex items-center gap-2">
                  <button onClick={() => setAnswer(q.id, oIdx)}
                    className={cn('w-5 h-5 rounded-full border-2 flex-shrink-0 transition-colors',
                      q.answer === oIdx ? 'border-on-primary-container bg-on-primary-container' : 'border-outline-variant hover:border-on-primary-container')} />
                  <input value={opt} onChange={(e) => updateOption(q.id, oIdx, e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                    className="flex-1 px-3 py-2 bg-surface-container rounded-lg border-none focus:ring-2 focus:ring-on-primary-container/20 text-sm" />
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
        <button disabled={saving} onClick={save}
          className="flex-1 py-3.5 bg-[#c0622f] text-white font-bold text-sm rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-[#c0622f]/20 disabled:opacity-50 flex items-center justify-center gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save Changes</>}
        </button>
      </div>
    </div>
  )
}
