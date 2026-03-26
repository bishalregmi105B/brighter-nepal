'use client'
// Admin Model Sets Create — build a new model/mock exam set with inline question editor
import { useState, useEffect, useMemo } from 'react'
import { ArrowLeft, Plus, Trash2, BookOpen, Clock, BarChart2, Save, Loader2, Link2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import { api } from '@/services/api'
import { subjectService } from '@/services/subjectService'
import { DEFAULT_SUBJECTS, getDefaultSubject, mergeSubjectOptions } from '@/lib/utils/subjects'
const LEVELS   = ['Easy', 'Medium', 'Hard']

interface Section { id: string; subject: string; questions: number }
interface Question { id: string; text: string; options: string[]; answer: number }

export default function CreateModelSetPage() {
  const router = useRouter()
  const [dbSubjects, setDbSubjects] = useState<string[]>([])

  const [title,     setTitle]     = useState('')
  const [duration,  setDuration]  = useState('120')
  const [level,     setLevel]     = useState('Medium')
  const [formsEditUrl, setFormsEditUrl] = useState('')
  const [formsViewUrl, setFormsViewUrl] = useState('')
  const [exams,     setExams]     = useState<string[]>([])
  const [availableExams, setAvailableExams] = useState<string[]>([])
  const [customExam, setCustomExam] = useState('')
  const [sections,  setSections]  = useState<Section[]>([{ id: 's1', subject: '', questions: 25 }])
  const [questions, setQuestions] = useState<Question[]>([
    { id: 'q1', text: '', options: ['', '', '', ''], answer: 0 },
  ])
  const [published, setPublished] = useState(false)
  const [saving,    setSaving]    = useState(false)
  useEffect(() => {
    api.get<{ data: string[] }>('/api/model-sets/targets')
      .then(r => { const d = r.data; setAvailableExams(Array.isArray(d) ? d : (d as { data?: string[] })?.data ?? []) })
      .catch(() => setAvailableExams(['IOE', 'IOM', 'CEE', 'CSIT', 'NEB']))
    subjectService.getSubjects()
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : (res.data as { data?: string[] })?.data ?? []
        setDbSubjects(list)
      })
      .catch(() => setDbSubjects([]))
  }, [])

  const subjectOptions = useMemo(
    () => mergeSubjectOptions(dbSubjects, sections.map((section) => section.subject), DEFAULT_SUBJECTS),
    [dbSubjects, sections]
  )
  const defaultSubject = getDefaultSubject(subjectOptions, DEFAULT_SUBJECTS)

  useEffect(() => {
    if (!defaultSubject) return
    setSections((prev) => prev.map((section) => section.subject ? section : { ...section, subject: defaultSubject }))
  }, [defaultSubject])

  const addCustomExam = () => {
    const e = customExam.trim().toUpperCase()
    if (!e) return
    if (!availableExams.includes(e)) setAvailableExams(prev => [...prev, e])
    if (!exams.includes(e)) setExams(prev => [...prev, e])
    setCustomExam('')
  }

  const toggleExam = (exam: string) =>
    setExams((prev) => prev.includes(exam) ? prev.filter((e) => e !== exam) : [...prev, exam])

  const addSection = () =>
    setSections((prev) => [...prev, { id: `s${Date.now()}`, subject: defaultSubject, questions: 10 }])

  const removeSection = (id: string) =>
    setSections((prev) => prev.filter((s) => s.id !== id))

  const updateSection = (id: string, field: keyof Section, value: string | number) =>
    setSections((prev) => prev.map((s) => s.id === id ? { ...s, [field]: value } : s))

  const totalQuestions = sections.reduce((sum, s) => sum + s.questions, 0)

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

  const save = async (asDraft: boolean) => {
    setSaving(true)
    try {
      await api.post('/api/model-sets', {
        title,
        duration_min: Number(duration),
        difficulty: level,
        targets: exams,
        forms_edit_url: formsEditUrl.trim(),
        forms_view_url: formsViewUrl.trim(),
        status: (asDraft || !published) ? 'draft' : 'published',
        sections: sections.map(s => ({ subject: s.subject, questions: s.questions })),
        questions: questions.map(q => ({ text: q.text, options: q.options, answer_index: q.answer })),
      })
      router.push('/admin/model-sets')
    } catch { setSaving(false) }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/model-sets" className="p-2 rounded-xl hover:bg-surface-container text-on-surface-variant transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="font-headline font-black text-3xl text-[#1a1a4e]">Create Model Set</h2>
          <p className="text-slate-500 text-sm font-medium">Build a new mock entrance exam set.</p>
        </div>
        {/* Publish toggle */}
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

      {/* General info */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_8px_20px_rgba(25,28,30,0.04)] space-y-5">
        <h3 className="font-bold text-on-surface border-b border-surface-container pb-3">General Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-outline uppercase tracking-wider block mb-2">Set Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. IOE Mock Set 047 — Full Syllabus"
              className="w-full px-4 py-3 bg-surface-container rounded-xl border-none focus:ring-2 focus:ring-on-primary-container/20 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-outline uppercase tracking-wider block mb-2 flex items-center gap-1.5"><Clock className="w-3 h-3" /> Duration (minutes)</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              min={30}
              className="w-full px-4 py-3 bg-surface-container rounded-xl border-none focus:ring-2 focus:ring-on-primary-container/20 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-outline uppercase tracking-wider block mb-2 flex items-center gap-1.5"><BarChart2 className="w-3 h-3" /> Difficulty</label>
            <div className="flex gap-2">
              {LEVELS.map((l) => (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  className={cn(
                    'flex-1 py-3 rounded-xl text-sm font-bold transition-all',
                    level === l ? 'bg-[#1a1a4e] text-white' : 'bg-surface-container text-slate-600 hover:bg-surface-container-high'
                  )}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-outline uppercase tracking-wider block mb-2">Target Exams</label>
            <div className="flex gap-2 flex-wrap items-center">
              {availableExams.map((e) => (
                <button
                  key={e}
                  onClick={() => toggleExam(e)}
                  className={cn(
                    'px-4 py-2 rounded-xl text-sm font-bold transition-all border',
                    exams.includes(e) ? 'border-on-primary-container bg-on-primary-container/10 text-on-primary-container' : 'border-surface-container text-slate-500 hover:border-outline'
                  )}
                >
                  {e}
                </button>
              ))}
              {/* Custom exam input */}
              <div className="flex items-center gap-1">
                <input
                  value={customExam}
                  onChange={e => setCustomExam(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addCustomExam()}
                  placeholder="+ New exam"
                  className="px-3 py-2 text-sm rounded-xl border border-dashed border-outline-variant text-slate-500 w-24 focus:outline-none focus:border-on-primary-container"
                />
                {customExam.trim() && (
                  <button onClick={addCustomExam} className="px-2 py-2 text-xs font-bold bg-on-primary-container/10 text-on-primary-container rounded-xl hover:bg-on-primary-container/20">
                    Add
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="md:col-span-2 space-y-4">
            <div>
              <label className="text-xs font-bold text-outline uppercase tracking-wider block mb-2 flex items-center gap-1.5"><Link2 className="w-3 h-3" /> Google Form Edit URL (admin import/sync, optional)</label>
              <input
                value={formsEditUrl}
                onChange={(e) => setFormsEditUrl(e.target.value)}
                placeholder="https://docs.google.com/forms/d/<FORM_ID>/edit"
                className="w-full px-4 py-3 bg-surface-container rounded-xl border-none focus:ring-2 focus:ring-on-primary-container/20 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-outline uppercase tracking-wider block mb-2 flex items-center gap-1.5"><Link2 className="w-3 h-3" /> Google Form View URL (student test link)</label>
              <input
                value={formsViewUrl}
                onChange={(e) => setFormsViewUrl(e.target.value)}
                placeholder="https://docs.google.com/forms/d/e/<FORM_ID>/viewform"
                className="w-full px-4 py-3 bg-surface-container rounded-xl border-none focus:ring-2 focus:ring-on-primary-container/20 text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-on-surface">Sections</h3>
            <p className="text-xs text-outline font-medium">{totalQuestions} total questions</p>
          </div>
          <button onClick={addSection} className="flex items-center gap-2 px-4 py-2 bg-on-primary-container/10 text-on-primary-container font-bold text-sm rounded-xl hover:bg-on-primary-container/20 transition-colors">
            <Plus className="w-4 h-4" /> Add Section
          </button>
        </div>

        {sections.map((s, i) => (
          <div key={s.id} className="bg-white rounded-xl p-5 shadow-[0_8px_20px_rgba(25,28,30,0.04)] flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-[#1a1a4e] text-white text-xs font-black flex items-center justify-center flex-shrink-0">{i + 1}</div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <BookOpen className="w-4 h-4 text-outline" />
            </div>
            <input
              list="model-set-create-subject-options"
              value={s.subject}
              onChange={(e) => updateSection(s.id, 'subject', e.target.value)}
              className="flex-1 px-3 py-2 bg-surface-container rounded-lg border-none text-sm font-medium focus:ring-2 focus:ring-on-primary-container/20"
              placeholder="e.g. Mathematics"
            />
            <div className="flex items-center gap-2 flex-shrink-0">
              <label className="text-xs font-bold text-outline">Questions:</label>
              <input
                type="number"
                value={s.questions}
                onChange={(e) => updateSection(s.id, 'questions', parseInt(e.target.value) || 0)}
                min={1}
                max={100}
                className="w-20 px-3 py-2 bg-surface-container rounded-lg border-none text-sm font-bold text-center focus:ring-2 focus:ring-on-primary-container/20"
              />
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

      {/* Actions */}
      <div className="flex gap-3 pb-8">
        <Link href="/admin/model-sets" className="flex-1 py-3.5 rounded-xl border border-outline-variant/20 font-bold text-sm text-on-surface hover:bg-surface-container transition-colors text-center">Cancel</Link>
        <button disabled={saving} onClick={() => save(true)}
          className="flex-1 py-3.5 bg-surface-container text-[#1a1a4e] font-bold text-sm rounded-xl hover:bg-surface-container-high transition-colors disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin inline" /> : <><Save className="w-4 h-4 inline mr-2" />Save Draft</>}
        </button>
        <button disabled={saving} onClick={() => save(false)}
          className="flex-1 py-3.5 bg-[#c0622f] text-white font-bold text-sm rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-[#c0622f]/20 disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin inline" /> : 'Publish Set'}
        </button>
      </div>
      <datalist id="model-set-create-subject-options">
        {subjectOptions.map((item) => <option key={item} value={item} />)}
      </datalist>
    </div>
  )
}
