'use client'
import { useEffect, useState } from 'react'
import { Plus, X, Save, Loader2, BookOpen, Trash2 } from 'lucide-react'
import { settingsService } from '@/services/settingsService'
import { cn } from '@/lib/utils/cn'

export default function AdminSubjectsPage() {
  const [subjects, setSubjects] = useState<string[]>([])
  const [newSubject, setNewSubject] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    settingsService.getSubjects()
      .then((res) => setSubjects(res.data ?? []))
      .catch(() => setError('Failed to load subjects.'))
      .finally(() => setLoading(false))
  }, [])

  const addSubject = () => {
    const val = newSubject.trim()
    if (!val) return
    if (subjects.some(s => s.toLowerCase() === val.toLowerCase())) {
      setError('Subject already exists.')
      return
    }
    setSubjects(prev => [...prev, val])
    setNewSubject('')
    setError('')
  }

  const removeSubject = (index: number) => {
    setSubjects(prev => prev.filter((_, i) => i !== index))
  }

  const saveSubjects = async () => {
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const res = await settingsService.updateSubjects(subjects)
      setSubjects(res.data ?? subjects)
      setMessage('Subjects saved successfully.')
    } catch {
      setError('Failed to save subjects.')
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
    <div className="p-4 md:p-6 lg:p-10 max-w-3xl mx-auto">
      <div className="mb-6 md:mb-10">
        <h2 className="font-headline font-black text-2xl md:text-4xl text-[#1a1a4e] tracking-tight mb-1">Manage Subjects</h2>
        <p className="text-on-surface-variant font-medium text-sm">Brighter Nepal — add or remove subjects available across the platform.</p>
      </div>

      {message && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-bold">{message}</div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-bold">{error}</div>
      )}

      {/* Add subject */}
      <div className="bg-white rounded-2xl shadow-[0_4px_16px_rgba(25,28,30,0.05)] p-6 mb-6">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Add New Subject</label>
        <div className="flex gap-3">
          <input
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addSubject()}
            placeholder="E.g., Science, Nepali, Computer..."
            className="flex-1 px-4 py-3 bg-surface-container-low rounded-xl border-none focus:ring-2 focus:ring-on-primary-container text-sm font-bold placeholder:font-medium placeholder:text-outline"
          />
          <button
            onClick={addSubject}
            className="bg-[#c0622f] text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-[#c0622f]/20"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </div>

      {/* Subjects list */}
      <div className="bg-white rounded-2xl shadow-[0_4px_16px_rgba(25,28,30,0.05)] p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-on-primary-container" />
          <h3 className="font-headline font-bold text-lg text-[#1a1a4e]">Subjects ({subjects.length})</h3>
        </div>

        {subjects.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-8">No subjects added yet. Add your first subject above.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {subjects.map((subject, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 bg-surface-container-low px-4 py-2.5 rounded-xl group"
              >
                <span className="text-sm font-bold text-[#1a1a4e]">{subject}</span>
                <button
                  onClick={() => removeSubject(idx)}
                  className="text-slate-300 hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save button */}
      <button
        onClick={saveSubjects}
        disabled={saving}
        className={cn(
          'w-full bg-[#1a1a4e] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2',
          'hover:opacity-90 active:scale-[0.98] transition-all shadow-lg',
          saving && 'opacity-70 cursor-not-allowed'
        )}
      >
        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
        {saving ? 'Saving…' : 'Save Subjects'}
      </button>
    </div>
  )
}
