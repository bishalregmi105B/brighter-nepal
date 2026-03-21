'use client'
// Admin Resources — full CRUD with create/edit modal for all 5 resource types
import { useEffect, useState, useMemo } from 'react'
import {
  Plus, Search, Trash2, FileText, Video, Headphones, Globe, FileArchive,
  Link2, X, Loader2, Pencil, BookOpen, Eye
} from 'lucide-react'
import { resourceService, type Resource } from '@/services/resourceService'
import { cn } from '@/lib/utils/cn'

// ── Type config ──────────────────────────────────────────────────────────────
const TYPE_CONFIG: Record<string, {
  Icon: React.ElementType
  bg: string; text: string
  urlLabel: string
  urlPlaceholder: string
  description: string
}> = {
  pdf: {
    Icon: FileText, bg: 'bg-red-100', text: 'text-red-600',
    urlLabel: 'PDF URL',
    urlPlaceholder: 'https://drive.google.com/file/d/... or direct PDF URL',
    description: 'Google Drive PDF link or any publicly accessible PDF URL.'
  },
  video: {
    Icon: Video, bg: 'bg-blue-100', text: 'text-blue-600',
    urlLabel: 'YouTube Video URL',
    urlPlaceholder: 'https://youtube.com/watch?v=... or https://youtu.be/...',
    description: 'YouTube video link. The player will embed securely.'
  },
  link: {
    Icon: Globe, bg: 'bg-sky-100', text: 'text-sky-600',
    urlLabel: 'Website URL',
    urlPlaceholder: 'https://example.com/article',
    description: 'External website or article. Students can preview it inside the app.'
  },
  notes: {
    Icon: BookOpen, bg: 'bg-green-100', text: 'text-green-600',
    urlLabel: 'Google Docs / Slides URL',
    urlPlaceholder: 'https://docs.google.com/document/d/... or .../presentation/d/...',
    description: 'Google Docs, Slides, or Sheets link (set to "Anyone with link can view").'
  },
  file: {
    Icon: FileArchive, bg: 'bg-orange-100', text: 'text-orange-600',
    urlLabel: 'File URL',
    urlPlaceholder: 'https://example.com/file.zip',
    description: 'Any file URL (ZIP, DOCX, etc.). Students will see an info card and link.'
  },
  audio: {
    Icon: Headphones, bg: 'bg-purple-100', text: 'text-purple-600',
    urlLabel: 'Audio URL',
    urlPlaceholder: 'https://example.com/audio.mp3',
    description: 'MP3 or audio stream URL.'
  },
}

const SECTIONS     = ['', 'Model Questions', 'Extra Study Materials', 'Short Notes', 'Reference Materials']
const TYPE_FILTERS = ['All', 'pdf', 'video', 'link', 'notes', 'file', 'audio']

// ── Empty form state ─────────────────────────────────────────────────────────
const EMPTY_FORM = {
  title: '', subject: '', format: 'pdf', section: '',
  file_url: '', size_label: '', tags: '', description: '', thumbnail_url: '',
}

type FormState = typeof EMPTY_FORM

// ── Modal Component ──────────────────────────────────────────────────────────
function ResourceModal({
  initial, subjects, onClose, onSaved,
}: {
  initial?: Resource | null
  subjects: string[]
  onClose: () => void
  onSaved: (r: Resource) => void
}) {
  const isEdit = !!initial
  const [form, setForm] = useState<FormState>(() => initial ? {
    title: initial.title,
    subject: initial.subject,
    format: initial.format,
    section: initial.section ?? '',
    file_url: initial.file_url ?? '',
    size_label: initial.size_label ?? '',
    tags: Array.isArray(initial.tags) ? initial.tags.join(', ') : '',
    description: initial.description ?? '',
    thumbnail_url: initial.thumbnail_url ?? '',
  } : { ...EMPTY_FORM, subject: subjects[0] || '' })
  const [customSubject, setCustomSubject] = useState('')
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')

  const cfg = TYPE_CONFIG[form.format] ?? TYPE_CONFIG.pdf
  const effectiveSubject = form.subject === '__new__' ? customSubject : form.subject

  function set(key: keyof FormState, value: string) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    if (!form.title.trim()) { setError('Title is required.'); return }
    if (!form.file_url.trim()) { setError('URL is required.'); return }
    if (!effectiveSubject.trim()) { setError('Subject is required.'); return }
    setSaving(true); setError('')
    const payload = {
      ...form,
      subject: effectiveSubject,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
    }
    try {
      let res: Resource
      if (isEdit && initial) {
        const r = await resourceService.updateResource(initial.id, payload)
        res = r.data
      } else {
        const r = await resourceService.createResource(payload)
        res = r.data
      }
      onSaved(res)
      onClose()
    } catch {
      setError('Failed to save resource. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <div className="relative w-full md:max-w-2xl max-h-[92vh] bg-white md:rounded-2xl rounded-t-2xl shadow-2xl overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <h2 className="font-headline font-bold text-xl text-[#1a1a4e]">
            {isEdit ? 'Edit Resource' : 'Add New Resource'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 flex-1">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">{error}</div>
          )}

          {/* Resource Type Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Resource Type</label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {Object.entries(TYPE_CONFIG).map(([type, c]) => {
                const TIcon = c.Icon
                return (
                  <button key={type}
                    type="button"
                    onClick={() => set('format', type)}
                    className={cn(
                      'flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 font-bold text-xs uppercase tracking-wide transition-all',
                      form.format === type
                        ? `border-[#c0622f] bg-[#c0622f]/5 text-[#c0622f]`
                        : 'border-slate-200 text-slate-500 hover:border-slate-300'
                    )}
                  >
                    <TIcon className="w-5 h-5" />
                    {type}
                  </button>
                )
              })}
            </div>
            {/* Type description */}
            <p className="text-xs text-slate-400 mt-2 italic">{cfg.description}</p>
          </div>

          {/* URL field — dynamic label */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1.5">{cfg.urlLabel} *</label>
            <input
              value={form.file_url}
              onChange={e => set('file_url', e.target.value)}
              placeholder={cfg.urlPlaceholder}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#c0622f]/20 focus:border-[#c0622f]"
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1.5">Title *</label>
            <input
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="e.g. Differential Calculus – Full Notes"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#c0622f]/20 focus:border-[#c0622f]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Brief description of what this resource covers..."
              rows={3}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#c0622f]/20 focus:border-[#c0622f] resize-none"
            />
          </div>

          {/* Subject + Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1.5">Subject</label>
              <select
                value={form.subject}
                onChange={e => set('subject', e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#c0622f]/20"
              >
                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                <option value="__new__">+ New subject...</option>
              </select>
              {form.subject === '__new__' && (
                <input
                  value={customSubject}
                  onChange={e => setCustomSubject(e.target.value)}
                  placeholder="Enter new subject name"
                  className="mt-2 w-full px-4 py-2.5 bg-slate-50 border border-[#c0622f]/40 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#c0622f]/20"
                />
              )}
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1.5">Section</label>
              <select
                value={form.section}
                onChange={e => set('section', e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#c0622f]/20"
              >
                {SECTIONS.map(s => <option key={s} value={s}>{s || '(none)'}</option>)}
              </select>
            </div>
          </div>

          {/* Size + Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1.5">Size Label</label>
              <input
                value={form.size_label}
                onChange={e => set('size_label', e.target.value)}
                placeholder="e.g. 2.4 MB"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#c0622f]/20"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1.5">Tags (comma-separated)</label>
              <input
                value={form.tags}
                onChange={e => set('tags', e.target.value)}
                placeholder="e.g. calculus, derivatives, IOE"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#c0622f]/20"
              />
            </div>
          </div>

          {/* Thumbnail */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1.5">Thumbnail URL (optional)</label>
            <input
              value={form.thumbnail_url}
              onChange={e => set('thumbnail_url', e.target.value)}
              placeholder="https://example.com/cover.jpg"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#c0622f]/20"
            />
            {form.thumbnail_url && (
              <img src={form.thumbnail_url} alt="Thumbnail preview"
                className="mt-2 h-24 w-full object-cover rounded-xl border border-slate-200" />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-4 flex gap-3 justify-end">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-100 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl font-bold text-sm bg-[#c0622f] text-white hover:bg-[#a14f24] disabled:opacity-60 active:scale-95 transition-all flex items-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {isEdit ? 'Save Changes' : 'Add Resource'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function AdminResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([])
  const [subjects,  setSubjects]  = useState<string[]>([])
  const [loading,   setLoading]   = useState(true)
  const [query,     setQuery]     = useState('')
  const [subject,   setSubject]   = useState('All')
  const [typeF,     setTypeF]     = useState('All')
  const [modal,     setModal]     = useState<{ open: boolean; editing?: Resource | null }>({ open: false })

  // Load distinct subjects from API
  useEffect(() => {
    resourceService.getSubjects().then((res) => {
      const subs = Array.isArray(res.data) ? res.data as string[] : (res.data as { data?: string[] })?.data ?? []
      setSubjects(subs)
    }).catch(() => {})
  }, [])

  const fetchResources = () => {
    setLoading(true)
    resourceService.getResources({ section: subject === 'All' ? '' : subject, search: query })
      .then((res) => {
        const d = res.data
        setResources(Array.isArray(d) ? d : (d as { items?: Resource[] }).items ?? [])
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchResources() }, [subject, query])

  const filtered = useMemo(() => {
    if (typeF === 'All') return resources
    return resources.filter(r => r.format === typeF)
  }, [resources, typeF])

  const openCreate = () => setModal({ open: true, editing: null })
  const openEdit   = (r: Resource) => setModal({ open: true, editing: r })
  const closeModal = () => setModal({ open: false })

  function handleSaved(saved: Resource) {
    setResources(prev => {
      const idx = prev.findIndex(r => r.id === saved.id)
      if (idx >= 0) {
        const next = [...prev]; next[idx] = saved; return next
      }
      return [saved, ...prev]
    })
  }

  const deleteResource = async (id: number) => {
    await resourceService.deleteResource(id).catch(() => {})
    setResources(prev => prev.filter(r => r.id !== id))
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-extrabold text-[#1a1a4e] tracking-tight font-headline mb-1">Resources</h2>
          <p className="text-slate-500 font-medium">BrighterNepal — manage study materials across all types.</p>
        </div>
        <button onClick={openCreate}
          className="bg-[#c0622f] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-[#c0622f]/20">
          <Plus className="w-5 h-5" /> Add Resource
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {([
          { label: 'Total',  value: resources.length,                                    color: 'text-[#1a1a4e]' },
          { label: 'PDFs',   value: resources.filter(r => r.format === 'pdf').length,    color: 'text-red-500' },
          { label: 'Videos', value: resources.filter(r => r.format === 'video').length,  color: 'text-blue-500' },
          { label: 'Links',  value: resources.filter(r => r.format === 'link').length,   color: 'text-sky-500' },
          { label: 'Notes',  value: resources.filter(r => r.format === 'notes').length,  color: 'text-green-500' },
        ] as const).map((s) => (
          <div key={s.label} className="bg-white p-4 rounded-xl shadow-[0_8px_20px_rgba(25,28,30,0.04)] text-center">
            <p className={cn('text-3xl font-black', s.color)}>{loading ? '…' : s.value}</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-[0_12px_32px_rgba(25,28,30,0.04)]">
        {/* Filters */}
        <div className="p-5 border-b border-surface-container flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
              <input value={query} onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 bg-surface-container rounded-xl border-none focus:ring-2 focus:ring-on-primary-container/20 text-sm"
                placeholder="Search resources..." />
              {query && <button onClick={() => setQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-on-surface"><X className="w-4 h-4" /></button>}
            </div>
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            {['All', ...Object.keys(TYPE_CONFIG)].map((t) => (
              <button key={t} onClick={() => setTypeF(t)} className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border uppercase',
                typeF === t ? 'border-on-primary-container text-on-primary-container bg-on-primary-container/5' : 'border-surface-container-high text-slate-500 hover:border-outline'
              )}>{t}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48"><Loader2 className="w-6 h-6 animate-spin text-on-primary-container" /></div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-surface-container-low/50">
              <tr>{['Resource', 'Subject', 'Type', 'Views', 'Tags', ''].map((col) => (
                <th key={col} className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">{col}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-16 text-outline font-medium">No resources match your filters.</td></tr>
              ) : filtered.map((res) => {
                const cfg  = TYPE_CONFIG[res.format] ?? TYPE_CONFIG.pdf
                const Icon = cfg.Icon
                return (
                  <tr key={res.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', cfg.bg)}>
                          <Icon className={cn('w-4 h-4', cfg.text)} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-on-surface text-sm truncate max-w-[200px]">{res.title}</p>
                          {res.description && (
                            <p className="text-xs text-slate-400 truncate max-w-[200px]">{res.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">{res.subject}</td>
                    <td className="px-6 py-4">
                      <span className={cn('text-[10px] font-black px-2 py-1 rounded uppercase', cfg.bg, cfg.text)}>{res.format}</span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-[#1a1a4e]">{(res.downloads ?? 0).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(res.tags ?? []).slice(0, 2).map((t: string) => (
                          <span key={t} className="text-[10px] px-1.5 py-0.5 bg-surface-container rounded text-outline">{t}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <a href={`/resources/${res.id}`} target="_blank"
                          className="p-1.5 rounded-lg hover:bg-surface-container-low text-slate-400 hover:text-[#1a1a4e] transition-all" title="Preview">
                          <Eye className="w-4 h-4" />
                        </a>
                        <button onClick={() => openEdit(res)}
                          className="p-1.5 rounded-lg hover:bg-surface-container-low text-slate-400 hover:text-on-primary-container transition-all" title="Edit">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteResource(res.id)}
                          className="p-1.5 rounded-lg hover:bg-surface-container-low text-error transition-all" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Create / Edit Modal */}
      {modal.open && (
        <ResourceModal
          initial={modal.editing}
          subjects={subjects}
          onClose={closeModal}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}
