'use client'
// Admin Model Set Edit — loads real data from API and allows full editing
import { useState, useEffect } from 'react'
import { ArrowLeft, Plus, Trash2, BookOpen, Clock, BarChart2, Save, Loader2, AlertCircle, Link2 } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import { api } from '@/services/api'
import { modelSetService } from '@/services/modelSetService'

const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'General']
const LEVELS   = ['Easy', 'Medium', 'Hard']

interface Section { id: string; subject: string; questions: number }
interface Question {
  id: string;           // local temp ID for UI key
  question_id?: number; // real DB id (set when loaded from API)
  subject: string;
  text: string;
  options: string[];
  answer_index: number;
}

export default function EditModelSetPage({ params }: { params: { id: string } }) {
  const [loading,      setLoading]      = useState(true)
  const [saving,       setSaving]       = useState(false)
  const [saved,        setSaved]        = useState(false)
  const [error,        setError]        = useState('')

  const [title,        setTitle]        = useState('')
  const [duration,     setDuration]     = useState('120')
  const [level,        setLevel]        = useState('Medium')
  const [formsUrl,     setFormsUrl]     = useState('')
  const [exams,        setExams]        = useState<string[]>([])
  const [availableExams, setAvailableExams] = useState<string[]>([])
  const [customExam,   setCustomExam]   = useState('')
  const [sections,     setSections]     = useState<Section[]>([])
  const [questions,    setQuestions]    = useState<Question[]>([])
  const [published,    setPublished]    = useState(false)

  // Load the real model set data by ID
  useEffect(() => {
    const id = parseInt(params.id, 10)
    Promise.all([
      modelSetService.getModelSet(id),
      api.get<{ data: string[] }>('/api/model-sets/targets'),
    ]).then(([msRes, targetsRes]) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ms = (msRes as any)?.data?.data ?? (msRes as any)?.data ?? msRes
      setTitle(ms.title ?? '')
      setDuration(String(ms.duration_min ?? 120))
      setLevel(ms.difficulty ?? 'Medium')
      setFormsUrl(ms.forms_url ?? '')
      setPublished(ms.status === 'published')
      const targets = Array.isArray(ms.targets) ? ms.targets : []
      setExams(targets)

      // Build sections from real question data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rawQs: any[] = ms.questions ?? []
      const secMap: Record<string, number> = {}
      const loadedQs: Question[] = rawQs.map((q, i) => {
        const subj = q.subject ?? 'General'
        secMap[subj] = (secMap[subj] ?? 0) + 1
        return {
          id: `q_${i}`,
          question_id: q.id,
          subject: subj,
          text: q.text ?? '',
          options: Array.isArray(q.options) ? q.options : (typeof q.options === 'string' ? JSON.parse(q.options) : ['', '', '', '']),
          answer_index: q.answer_index ?? 0,
        }
      })
      setQuestions(loadedQs)
      const builtSections: Section[] = Object.entries(secMap).map(([subject, count], i) => ({
        id: `s${i}`,
        subject,
        questions: count,
      }))
      setSections(builtSections.length > 0 ? builtSections : [{ id: 's1', subject: 'Mathematics', questions: 0 }])

      // Targets list
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const td = (targetsRes as any)?.data?.data ?? (targetsRes as any)?.data ?? []
      const tArr = Array.isArray(td) ? td : []
      // Merge so all current targets are visible even if not in the global list
      const merged = Array.from(new Set([...tArr, ...targets]))
      setAvailableExams(merged)
    }).catch(() => {
      setError('Failed to load model set. Please try again.')
    }).finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id])

  const addCustomExam = () => {
    const e = customExam.trim().toUpperCase()
    if (!e) return
    if (!availableExams.includes(e)) setAvailableExams(prev => [...prev, e])
    if (!exams.includes(e)) setExams(prev => [...prev, e])
    setCustomExam('')
  }
  const toggleExam = (exam: string) =>
    setExams(prev => prev.includes(exam) ? prev.filter(e => e !== exam) : [...prev, exam])

  const addSection = () =>
    setSections(prev => [...prev, { id: `s${Date.now()}`, subject: SUBJECTS[0], questions: 0 }])
  const removeSection = (id: string) =>
    setSections(prev => prev.filter(s => s.id !== id))
  const updateSection = (id: string, field: keyof Section, value: string | number) =>
    setSections(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s))

  // Question helpers
  const addQuestion = () => {
    setQuestions(prev => [...prev, {
      id: `q_new_${Date.now()}`, subject: SUBJECTS[0],
      text: '', options: ['', '', '', ''], answer_index: 0
    }])
  }
  const removeQuestion = (id: string) => setQuestions(prev => prev.filter(q => q.id !== id))
  const updateQuestion = (id: string, field: keyof Question, value: unknown) =>
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, [field]: value } : q))
  const updateOption = (qid: string, idx: number, value: string) =>
    setQuestions(prev => prev.map(q => q.id === qid
      ? { ...q, options: q.options.map((o, i) => i === idx ? value : o) }
      : q
    ))

  const totalQuestions = questions.length

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      await modelSetService.updateModelSet(parseInt(params.id, 10), {
        title,
        duration_min: parseInt(duration),
        difficulty: level,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        targets: exams as any,
        forms_url: formsUrl.trim(),
        status: published ? 'published' : 'draft',
        total_questions: totalQuestions,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      setError('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-on-primary-container" />
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/model-sets" className="p-2 rounded-xl hover:bg-surface-container text-on-surface-variant transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="font-headline font-black text-3xl text-[#1a1a4e]">Edit Model Set</h2>
          <p className="text-slate-500 text-sm font-medium">ID: {params.id}</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-sm font-bold text-on-surface-variant">{published ? 'Published' : 'Draft'}</span>
          <button
            onClick={() => setPublished(!published)}
            className={cn('w-12 h-6 rounded-full relative shadow-inner transition-colors', published ? 'bg-teal-500' : 'bg-surface-container-highest')}
          >
            <div className={cn('w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-all', published ? 'right-0.5' : 'left-0.5')} />
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 text-sm font-medium">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* General info */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_8px_20px_rgba(25,28,30,0.04)] space-y-5">
        <h3 className="font-bold text-on-surface border-b border-surface-container pb-3">General Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-outline uppercase tracking-wider block mb-2">Set Title</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-surface-container rounded-xl border-none focus:ring-2 focus:ring-on-primary-container/20 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-outline uppercase tracking-wider block mb-2 flex items-center gap-1.5"><Clock className="w-3 h-3" /> Duration (minutes)</label>
            <input
              type="number" value={duration} onChange={e => setDuration(e.target.value)} min={30}
              className="w-full px-4 py-3 bg-surface-container rounded-xl border-none focus:ring-2 focus:ring-on-primary-container/20 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-outline uppercase tracking-wider block mb-2 flex items-center gap-1.5"><BarChart2 className="w-3 h-3" /> Difficulty</label>
            <div className="flex gap-2">
              {LEVELS.map(l => (
                <button key={l} onClick={() => setLevel(l)}
                  className={cn('flex-1 py-3 rounded-xl text-sm font-bold transition-all', level === l ? 'bg-[#1a1a4e] text-white' : 'bg-surface-container text-slate-600 hover:bg-surface-container-high')}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-outline uppercase tracking-wider block mb-2">Target Exams</label>
            <div className="flex gap-2 flex-wrap items-center">
              {availableExams.map(e => (
                <button key={e} onClick={() => toggleExam(e)}
                  className={cn('px-4 py-2 rounded-xl text-sm font-bold transition-all border', exams.includes(e) ? 'border-on-primary-container bg-on-primary-container/10 text-on-primary-container' : 'border-surface-container text-slate-500 hover:border-outline')}>
                  {e}
                </button>
              ))}
              <div className="flex items-center gap-1">
                <input value={customExam} onChange={e => setCustomExam(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addCustomExam()} placeholder="+ New exam"
                  className="px-3 py-2 text-sm rounded-xl border border-dashed border-outline-variant text-slate-500 w-24 focus:outline-none focus:border-on-primary-container" />
                {customExam.trim() && (
                  <button onClick={addCustomExam} className="px-2 py-2 text-xs font-bold bg-on-primary-container/10 text-on-primary-container rounded-xl hover:bg-on-primary-container/20">Add</button>
                )}
              </div>
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-outline uppercase tracking-wider block mb-2 flex items-center gap-1.5"><Link2 className="w-3 h-3" /> Google Forms URL (optional)</label>
            <input
              value={formsUrl}
              onChange={e => setFormsUrl(e.target.value)}
              placeholder="https://docs.google.com/forms/d/..."
              className="w-full px-4 py-3 bg-surface-container rounded-xl border-none focus:ring-2 focus:ring-on-primary-container/20 text-sm"
            />
            <p className="text-[11px] text-slate-400 mt-1.5">If provided, students can open this Google Form directly from the model set.</p>
          </div>
        </div>
      </div>

      {/* Sections (visual summary only) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-on-surface">Sections</h3>
            <p className="text-xs text-outline font-medium">{sections.reduce((s, x) => s + x.questions, 0)} configured questions</p>
          </div>
          <button onClick={addSection} className="flex items-center gap-2 px-4 py-2 bg-on-primary-container/10 text-on-primary-container font-bold text-sm rounded-xl hover:bg-on-primary-container/20 transition-colors">
            <Plus className="w-4 h-4" /> Add Section
          </button>
        </div>
        {sections.map((s, i) => (
          <div key={s.id} className="bg-white rounded-xl p-5 shadow-[0_8px_20px_rgba(25,28,30,0.04)] flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-[#1a1a4e] text-white text-xs font-black flex items-center justify-center flex-shrink-0">{i + 1}</div>
            <BookOpen className="w-4 h-4 text-outline flex-shrink-0" />
            <select value={s.subject} onChange={e => updateSection(s.id, 'subject', e.target.value)}
              className="flex-1 px-3 py-2 bg-surface-container rounded-lg border-none text-sm font-medium focus:ring-2 focus:ring-on-primary-container/20">
              {SUBJECTS.map(sub => <option key={sub}>{sub}</option>)}
            </select>
            <div className="flex items-center gap-2 flex-shrink-0">
              <label className="text-xs font-bold text-outline">Questions:</label>
              <input type="number" value={s.questions} min={0}
                onChange={e => updateSection(s.id, 'questions', parseInt(e.target.value) || 0)}
                className="w-20 px-3 py-2 bg-surface-container rounded-lg border-none text-sm font-bold text-center focus:ring-2 focus:ring-on-primary-container/20" />
            </div>
            {sections.length > 1 && (
              <button onClick={() => removeSection(s.id)} className="p-1.5 rounded-lg text-error hover:bg-error-container transition-colors flex-shrink-0">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Questions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-on-surface">Questions</h3>
            <p className="text-xs text-outline font-medium">{totalQuestions} question(s) in this set</p>
          </div>
          <button onClick={addQuestion}
            className="flex items-center gap-2 px-4 py-2 bg-on-primary-container/10 text-on-primary-container font-bold text-sm rounded-xl hover:bg-on-primary-container/20 transition-colors">
            <Plus className="w-4 h-4" /> Add Question
          </button>
        </div>

        {questions.length === 0 && (
          <div className="text-center py-10 text-slate-400 text-sm font-medium bg-white rounded-xl border border-dashed border-outline-variant/30">
            No questions yet. Click &quot;Add Question&quot; to begin.
          </div>
        )}

        {questions.map((q, qi) => (
          <div key={q.id} className="bg-white rounded-xl p-5 shadow-[0_8px_20px_rgba(25,28,30,0.04)] space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="w-7 h-7 rounded-full bg-[#1a1a4e] text-white text-xs font-black flex items-center justify-center">{qi + 1}</div>
                <select value={q.subject} onChange={e => updateQuestion(q.id, 'subject', e.target.value)}
                  className="px-2 py-1 bg-surface-container rounded-lg border-none text-xs font-bold text-slate-600 focus:ring-2 focus:ring-on-primary-container/20">
                  {SUBJECTS.map(sub => <option key={sub}>{sub}</option>)}
                </select>
              </div>
              <button onClick={() => removeQuestion(q.id)} className="p-1.5 text-error hover:bg-error-container rounded-lg transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <textarea value={q.text} onChange={e => updateQuestion(q.id, 'text', e.target.value)}
              placeholder="Enter question text…"
              rows={2}
              className="w-full px-4 py-3 bg-surface-container rounded-xl border-none focus:ring-2 focus:ring-on-primary-container/20 text-sm resize-none" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {q.options.map((opt, oi) => (
                <div key={oi} className="flex items-center gap-2">
                  <button onClick={() => updateQuestion(q.id, 'answer_index', oi)}
                    className={cn('w-6 h-6 rounded-full border-2 flex-shrink-0 transition-colors',
                      q.answer_index === oi ? 'bg-teal-500 border-teal-500' : 'border-outline-variant hover:border-on-primary-container')}>
                    {q.answer_index === oi && <span className="block w-2 h-2 bg-white rounded-full mx-auto" />}
                  </button>
                  <input value={opt} onChange={e => updateOption(q.id, oi, e.target.value)}
                    placeholder={`Option ${oi + 1}`}
                    className="flex-1 px-3 py-2 bg-surface-container rounded-lg border-none text-sm focus:ring-2 focus:ring-on-primary-container/20" />
                </div>
              ))}
            </div>
            {q.question_id && <p className="text-[10px] text-outline">DB Question ID: {q.question_id}</p>}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pb-8">
        <Link href="/admin/model-sets" className="flex-1 py-3.5 rounded-xl border border-outline-variant/20 font-bold text-sm text-on-surface hover:bg-surface-container transition-colors text-center">Cancel</Link>
        <button onClick={handleSave} disabled={saving}
          className={cn('flex-1 py-3.5 font-bold text-sm rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2',
            saved ? 'bg-tertiary-fixed text-on-tertiary-fixed-variant' : 'bg-[#c0622f] text-white shadow-lg shadow-[#c0622f]/20 hover:opacity-90',
            saving && 'opacity-60 cursor-not-allowed')}>
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><Save className="w-4 h-4" />{saved ? 'Saved!' : 'Save Changes'}</>}
        </button>
      </div>
    </div>
  )
}
