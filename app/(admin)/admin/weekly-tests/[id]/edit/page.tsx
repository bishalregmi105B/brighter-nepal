'use client'
// Admin — Edit Weekly Test
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, Plus, Trash2, Clock, BookOpen, CalendarDays, Loader2, Link2, Save, Radio, RefreshCw, DownloadCloud, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { weeklyTestService, type GoogleQuestionInventory, type GoogleSyncSummary, type WeeklyTest } from '@/services/weeklyTestService'
import { subjectService } from '@/services/subjectService'
import { cn } from '@/lib/utils/cn'
import { DEFAULT_SUBJECTS, getDefaultSubject, mergeSubjectOptions } from '@/lib/utils/subjects'
const STATUSES = [
  { value: 'draft',     label: 'Draft',     color: 'bg-slate-100 text-slate-600' },
  { value: 'scheduled', label: 'Scheduled', color: 'bg-sky-100 text-sky-700' },
  { value: 'live',      label: 'Live Now',  color: 'bg-red-100 text-red-600' },
  { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-700' },
]

interface Question { id: string; text: string; options: string[]; answer: number }

export default function EditWeeklyTestPage() {
  const { id }   = useParams<{ id: string }>()
  const [dbSubjects, setDbSubjects] = useState<string[]>([])

  const [title,     setTitle]     = useState('')
  const [subject,   setSubject]   = useState('')
  const [duration,  setDuration]  = useState('60')
  const [status,    setStatus]    = useState('scheduled')
  const [formsEditUrl, setFormsEditUrl] = useState('')
  const [formsViewUrl, setFormsViewUrl] = useState('')
  const [persistedFormsEditUrl, setPersistedFormsEditUrl] = useState('')
  const [schedDate, setSchedDate] = useState('')
  const [schedTime, setSchedTime] = useState('')
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading,   setLoading]   = useState(true)
  const [saving,    setSaving]    = useState(false)
  const [saved,     setSaved]     = useState(false)
  const [error,     setError]     = useState('')
  const [googleStudentIdQuestionId, setGoogleStudentIdQuestionId] = useState('')
  const [googleQuestions, setGoogleQuestions] = useState<GoogleQuestionInventory[]>([])
  const [googleSummary, setGoogleSummary] = useState<GoogleSyncSummary>({})
  const [googleImportedAt, setGoogleImportedAt] = useState<string | null>(null)
  const [googleSyncedAt, setGoogleSyncedAt] = useState<string | null>(null)
  const [googleBusy, setGoogleBusy] = useState<'import' | 'sync' | ''>('')
  const [googleMessage, setGoogleMessage] = useState('')

  const applyTest = (t: WeeklyTest) => {
    setTitle(t.title)
    setSubject(t.subject)
    setDuration(String(t.duration_min))
    setStatus(t.status)
    setFormsEditUrl(t.forms_edit_url || t.forms_url || '')
    setFormsViewUrl(t.forms_view_url || '')
    setPersistedFormsEditUrl(t.forms_edit_url || t.forms_url || '')
    setGoogleStudentIdQuestionId(t.google_student_id_question_id || '')
    setGoogleQuestions(t.google_questions ?? [])
    setGoogleSummary(t.google_last_sync_summary ?? {})
    setGoogleImportedAt(t.google_questions_last_imported_at ?? null)
    setGoogleSyncedAt(t.google_results_last_synced_at ?? null)
    if (t.scheduled_at) {
      const d = new Date(t.scheduled_at)
      setSchedDate(d.toISOString().split('T')[0])
      setSchedTime(d.toTimeString().slice(0, 5))
    } else {
      setSchedDate('')
      setSchedTime('')
    }
    setQuestions(
      (t.questions || []).map((q) => ({
        id: String(q.id),
        text: q.text,
        options: q.options,
        answer: q.answer_index,
      }))
    )
  }

  useEffect(() => {
    weeklyTestService.getTest(id).then((res) => {
      applyTest(res.data)
    }).catch((e) => setError(e.message)).finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    subjectService.getSubjects()
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : (res.data as { data?: string[] })?.data ?? []
        setDbSubjects(list)
      })
      .catch(() => setDbSubjects([]))
  }, [])

  const subjectOptions = useMemo(
    () => mergeSubjectOptions(dbSubjects, DEFAULT_SUBJECTS, [subject]),
    [dbSubjects, subject]
  )
  const defaultSubject = getDefaultSubject(subjectOptions, DEFAULT_SUBJECTS)

  useEffect(() => {
    if (!subject && defaultSubject) {
      setSubject(defaultSubject)
    }
  }, [defaultSubject, subject])

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

  const importedCount = googleQuestions.filter((question) => question.is_imported).length
  const hasUnsavedFormsUrl = formsEditUrl.trim() !== persistedFormsEditUrl.trim()

  const save = async () => {
    setSaving(true)
    setSaved(false)
    setError('')
    try {
      const res = await weeklyTestService.updateTest(Number(id), {
        title,
        subject,
        duration_min: Number(duration),
        status,
        forms_edit_url: formsEditUrl.trim(),
        forms_view_url: formsViewUrl.trim(),
        google_match_mode: 'email_then_student_id',
        google_student_id_question_id: googleStudentIdQuestionId || null,
        scheduled_at: schedDate && schedTime ? `${schedDate}T${schedTime}:00` : null,
        questions: questions.map((q) => ({ text: q.text, options: q.options, answer_index: q.answer })) as unknown as import('@/services/weeklyTestService').Question[],
      })
      applyTest(res.data)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save weekly test.')
    } finally {
      setSaving(false)
    }
  }

  const handleImportQuestions = async () => {
    setGoogleBusy('import')
    setGoogleMessage('')
    setError('')
    try {
      const res = await weeklyTestService.importGoogleQuestions(Number(id))
      applyTest(res.data.item)
      setGoogleSummary(res.data.summary)
      setGoogleMessage(`Imported ${res.data.summary.imported ?? 0} question(s); skipped ${res.data.summary.skipped_unsupported ?? 0}.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import Google Form questions.')
    } finally {
      setGoogleBusy('')
    }
  }

  const handleSyncResults = async () => {
    setGoogleBusy('sync')
    setGoogleMessage('')
    setError('')
    try {
      const res = await weeklyTestService.syncGoogleResults(Number(id))
      applyTest(res.data.item)
      setGoogleSummary(res.data.summary)
      setGoogleMessage(`Processed ${res.data.summary.processed ?? 0} response(s). Matched ${res.data.summary.matched ?? 0}, unmatched ${res.data.summary.unmatched ?? 0}.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sync Google Form results.')
    } finally {
      setGoogleBusy('')
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-on-primary-container" /></div>

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

      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 text-sm font-medium">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

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
            <input
              required
              list="weekly-test-edit-subject-options"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-3 bg-surface-container rounded-xl border-none focus:ring-2 focus:ring-on-primary-container/20 text-sm font-medium"
              placeholder="e.g. Physics"
            />
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

          <div className="md:col-span-2 space-y-4">
            <div>
              <label className="text-xs font-bold text-outline uppercase tracking-wider block mb-2 flex items-center gap-1.5"><Link2 className="w-3 h-3" /> Google Form Edit URL (import/sync, optional)</label>
              <input value={formsEditUrl} onChange={(e) => setFormsEditUrl(e.target.value)}
                placeholder="https://docs.google.com/forms/d/<FORM_ID>/edit"
                className="w-full px-4 py-3 bg-surface-container rounded-xl border-none focus:ring-2 focus:ring-on-primary-container/20 text-sm font-medium" />
            </div>
            <div>
              <label className="text-xs font-bold text-outline uppercase tracking-wider block mb-2 flex items-center gap-1.5"><Link2 className="w-3 h-3" /> Google Form View URL (student test)</label>
              <input value={formsViewUrl} onChange={(e) => setFormsViewUrl(e.target.value)}
                placeholder="https://docs.google.com/forms/d/e/<FORM_ID>/viewform"
                className="w-full px-4 py-3 bg-surface-container rounded-xl border-none focus:ring-2 focus:ring-on-primary-container/20 text-sm font-medium" />
            </div>
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

      <div className="bg-white rounded-2xl p-6 shadow-[0_8px_20px_rgba(25,28,30,0.04)] space-y-5">
        <div className="flex items-start justify-between gap-4 border-b border-surface-container pb-3">
          <div>
            <h3 className="font-bold text-on-surface text-lg">Google Forms Import</h3>
            <p className="text-xs text-outline font-medium mt-1">The live test still opens in Google Forms while imported questions stay stored locally for fallback and result rendering.</p>
          </div>
          <div className="text-right text-xs text-slate-500 font-medium">
            <p>Imported: {importedCount}</p>
            <p>Imported at: {googleImportedAt ? new Date(googleImportedAt).toLocaleString() : '—'}</p>
            <p>Last sync: {googleSyncedAt ? new Date(googleSyncedAt).toLocaleString() : '—'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-outline uppercase tracking-wider block mb-2">Student ID Fallback Field</label>
            <select
              value={googleStudentIdQuestionId}
              onChange={(e) => setGoogleStudentIdQuestionId(e.target.value)}
              className="w-full px-4 py-3 bg-surface-container rounded-xl border-none focus:ring-2 focus:ring-on-primary-container/20 text-sm font-medium"
              disabled={googleQuestions.length === 0}
            >
              <option value="">Use email only</option>
              {googleQuestions.map((question) => (
                <option key={question.google_question_id} value={question.google_question_id}>
                  {question.title} • {question.question_type}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-1.5">Select the Google question that contains the student ID when responder email is not available.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-surface-container-low rounded-xl p-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Imported Questions</p>
            <p className="text-xl font-black text-[#1a1a4e] mt-2">{importedCount}</p>
          </div>
          <div className="bg-surface-container-low rounded-xl p-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Processed</p>
            <p className="text-xl font-black text-[#1a1a4e] mt-2">{googleSummary.processed ?? 0}</p>
          </div>
          <div className="bg-surface-container-low rounded-xl p-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Matched</p>
            <p className="text-xl font-black text-[#1a1a4e] mt-2">{googleSummary.matched ?? 0}</p>
          </div>
          <div className="bg-surface-container-low rounded-xl p-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unmatched</p>
            <p className="text-xl font-black text-[#1a1a4e] mt-2">{googleSummary.unmatched ?? 0}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleImportQuestions}
            disabled={googleBusy !== '' || !persistedFormsEditUrl.trim() || hasUnsavedFormsUrl}
            className="px-5 py-3 bg-[#1a1a4e] text-white rounded-xl font-bold text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {googleBusy === 'import' ? <Loader2 className="w-4 h-4 animate-spin" /> : <DownloadCloud className="w-4 h-4" />}
            Import Questions
          </button>
          <button
            onClick={handleSyncResults}
            disabled={googleBusy !== '' || !persistedFormsEditUrl.trim() || hasUnsavedFormsUrl || importedCount === 0}
            className="px-5 py-3 bg-on-primary-container text-white rounded-xl font-bold text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {googleBusy === 'sync' ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Sync Results
          </button>
          {hasUnsavedFormsUrl && (
            <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-2 rounded-xl">
              Save the updated Google Forms URL before importing or syncing.
            </span>
          )}
        </div>

        {googleMessage && (
          <div className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 text-sm font-medium text-blue-700">
            {googleMessage}
          </div>
        )}
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
          className={cn(
            'flex-1 py-3.5 font-bold text-sm rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50',
            saved ? 'bg-tertiary-fixed text-on-tertiary-fixed-variant' : 'bg-[#c0622f] text-white shadow-lg shadow-[#c0622f]/20 hover:opacity-90',
          )}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> {saved ? 'Saved!' : 'Save Changes'}</>}
        </button>
      </div>
      <datalist id="weekly-test-edit-subject-options">
        {subjectOptions.map((item) => <option key={item} value={item} />)}
      </datalist>
    </div>
  )
}
