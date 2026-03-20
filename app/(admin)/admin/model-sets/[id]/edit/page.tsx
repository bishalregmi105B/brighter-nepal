'use client'
// Admin Model Set Edit — edit an existing model set
// Reuses the same form pattern as create, pre-filled with existing data
import { useState } from 'react'
import { ArrowLeft, Plus, Trash2, BookOpen, Clock, BarChart2, Save } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'

const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English']
const LEVELS   = ['Easy', 'Medium', 'Hard']
const EXAMS    = ['IOE', 'IOM', 'CEE', 'CSIT', 'NEB']

interface Section { id: string; subject: string; questions: number }

export default function EditModelSetPage({ params }: { params: { id: string } }) {
  // Pre-filled with mock data matching the set ID
  const [title,     setTitle]     = useState(`Mock Set ${params.id} — Full Syllabus`)
  const [duration,  setDuration]  = useState('120')
  const [level,     setLevel]     = useState('Hard')
  const [exams,     setExams]     = useState<string[]>(['IOE'])
  const [sections,  setSections]  = useState<Section[]>([
    { id: 's1', subject: 'Mathematics', questions: 40 },
    { id: 's2', subject: 'Physics',     questions: 35 },
    { id: 's3', subject: 'Chemistry',   questions: 25 },
  ])
  const [published, setPublished] = useState(true)
  const [saved,     setSaved]     = useState(false)

  const toggleExam = (exam: string) =>
    setExams((prev) => prev.includes(exam) ? prev.filter((e) => e !== exam) : [...prev, exam])

  const addSection = () =>
    setSections((prev) => [...prev, { id: `s${Date.now()}`, subject: SUBJECTS[0], questions: 10 }])

  const removeSection = (id: string) =>
    setSections((prev) => prev.filter((s) => s.id !== id))

  const updateSection = (id: string, field: keyof Section, value: string | number) =>
    setSections((prev) => prev.map((s) => s.id === id ? { ...s, [field]: value } : s))

  const totalQuestions = sections.reduce((sum, s) => sum + s.questions, 0)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
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

      {/* General info */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_8px_20px_rgba(25,28,30,0.04)] space-y-5">
        <h3 className="font-bold text-on-surface border-b border-surface-container pb-3">General Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-outline uppercase tracking-wider block mb-2">Set Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
                  className={cn('flex-1 py-3 rounded-xl text-sm font-bold transition-all', level === l ? 'bg-[#1a1a4e] text-white' : 'bg-surface-container text-slate-600 hover:bg-surface-container-high')}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-outline uppercase tracking-wider block mb-2">Target Exams</label>
            <div className="flex gap-2 flex-wrap">
              {EXAMS.map((e) => (
                <button
                  key={e}
                  onClick={() => toggleExam(e)}
                  className={cn('px-4 py-2 rounded-xl text-sm font-bold transition-all border', exams.includes(e) ? 'border-on-primary-container bg-on-primary-container/10 text-on-primary-container' : 'border-surface-container text-slate-500 hover:border-outline')}
                >
                  {e}
                </button>
              ))}
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
            <BookOpen className="w-4 h-4 text-outline flex-shrink-0" />
            <select
              value={s.subject}
              onChange={(e) => updateSection(s.id, 'subject', e.target.value)}
              className="flex-1 px-3 py-2 bg-surface-container rounded-lg border-none text-sm font-medium focus:ring-2 focus:ring-on-primary-container/20"
            >
              {SUBJECTS.map((sub) => <option key={sub}>{sub}</option>)}
            </select>
            <div className="flex items-center gap-2 flex-shrink-0">
              <label className="text-xs font-bold text-outline">Questions:</label>
              <input
                type="number"
                value={s.questions}
                onChange={(e) => updateSection(s.id, 'questions', parseInt(e.target.value) || 0)}
                min={1}
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

      {/* Actions */}
      <div className="flex gap-3 pb-8">
        <Link href="/admin/model-sets" className="flex-1 py-3.5 rounded-xl border border-outline-variant/20 font-bold text-sm text-on-surface hover:bg-surface-container transition-colors text-center">Cancel</Link>
        <button
          onClick={handleSave}
          className={cn(
            'flex-1 py-3.5 font-bold text-sm rounded-xl transition-all active:scale-95',
            saved ? 'bg-tertiary-fixed text-on-tertiary-fixed-variant' : 'bg-[#c0622f] text-white shadow-lg shadow-[#c0622f]/20 hover:opacity-90'
          )}
        >
          <Save className="w-4 h-4 inline mr-2" />{saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}
