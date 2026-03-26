'use client'
// Admin Joined Via Settings — manage contact methods stored in DB.
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2, Plus, Save, Trash2 } from 'lucide-react'
import { userService, type ContactMethod } from '@/services/userService'

const CHANNELS = [
  { value: 'other', label: 'Other' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'messenger', label: 'Messenger' },
  { value: 'facebook', label: 'Facebook' },
] as const

type EditableMethod = ContactMethod & { saving?: boolean; deleting?: boolean }

export default function JoinedViaSettingsPage() {
  const [methods, setMethods] = useState<EditableMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [newName, setNewName] = useState('')
  const [newChannel, setNewChannel] = useState<'other' | 'whatsapp' | 'messenger' | 'facebook'>('other')
  const [creating, setCreating] = useState(false)

  const loadMethods = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await userService.getContactMethods()
      const payload = res.data
      const items = Array.isArray(payload)
        ? payload
        : (payload as { data?: ContactMethod[] })?.data ?? []
      setMethods(items)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load joined-via methods')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMethods()
  }, [])

  const updateLocal = (id: number, field: 'name' | 'channel', value: string) => {
    setMethods(prev => prev.map(m => (m.id === id ? { ...m, [field]: value } : m)))
  }

  const saveMethod = async (method: EditableMethod) => {
    const name = (method.name || '').trim()
    if (!name) return
    setMethods(prev => prev.map(m => (m.id === method.id ? { ...m, saving: true } : m)))
    try {
      await userService.updateContactMethod(method.id, { name, channel: method.channel })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save method')
    } finally {
      setMethods(prev => prev.map(m => (m.id === method.id ? { ...m, saving: false } : m)))
    }
  }

  const deleteMethod = async (method: EditableMethod) => {
    setMethods(prev => prev.map(m => (m.id === method.id ? { ...m, deleting: true } : m)))
    try {
      await userService.deleteContactMethod(method.id)
      setMethods(prev => prev.filter(m => m.id !== method.id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete method')
      setMethods(prev => prev.map(m => (m.id === method.id ? { ...m, deleting: false } : m)))
    }
  }

  const createMethod = async () => {
    const name = newName.trim()
    if (!name) return
    setCreating(true)
    setError('')
    try {
      await userService.createContactMethod(name, newChannel)
      setNewName('')
      setNewChannel('other')
      await loadMethods()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add method')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="p-6 md:p-8 lg:p-10 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/users" className="p-2 rounded-xl hover:bg-surface-container text-on-surface-variant transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="font-headline font-black text-3xl text-[#1a1a4e]">Joined Via Settings</h2>
          <p className="text-sm text-slate-500 font-medium">Manage the dropdown list used in user enrollment and edit forms.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-[0_8px_20px_rgba(25,28,30,0.04)]">
        <h3 className="font-bold text-sm text-on-surface mb-4">Add New Method</h3>
        <div className="flex flex-col md:flex-row gap-3">
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="e.g. Campus Ambassador"
            className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a4e]/20"
          />
          <select
            value={newChannel}
            onChange={e => setNewChannel(e.target.value as 'other' | 'whatsapp' | 'messenger' | 'facebook')}
            className="w-full md:w-44 border border-slate-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a4e]/20"
          >
            {CHANNELS.map(ch => <option key={ch.value} value={ch.value}>{ch.label}</option>)}
          </select>
          <button
            onClick={createMethod}
            disabled={creating || !newName.trim()}
            className="px-4 py-3 bg-[#c0622f] text-white rounded-xl text-sm font-bold disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Add
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_8px_20px_rgba(25,28,30,0.04)] overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-bold text-sm text-on-surface">Current Methods ({methods.length})</h3>
        </div>

        {loading ? (
          <div className="h-40 flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-on-primary-container" />
          </div>
        ) : methods.length === 0 ? (
          <div className="h-40 flex items-center justify-center text-sm text-slate-400">No joined-via methods found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-container-low/50">
                <tr>
                  {['Method Name', 'Channel', 'Actions'].map(col => (
                    <th key={col} className="px-5 py-3 text-[11px] font-black text-slate-400 uppercase tracking-widest">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {methods.map(method => (
                  <tr key={method.id}>
                    <td className="px-5 py-3">
                      <input
                        value={method.name}
                        onChange={e => updateLocal(method.id, 'name', e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a4e]/20"
                      />
                    </td>
                    <td className="px-5 py-3">
                      <select
                        value={method.channel}
                        onChange={e => updateLocal(method.id, 'channel', e.target.value)}
                        className="w-full md:w-44 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a4e]/20"
                      >
                        {CHANNELS.map(ch => <option key={ch.value} value={ch.value}>{ch.label}</option>)}
                      </select>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => saveMethod(method)}
                          disabled={!!method.saving || !!method.deleting || !(method.name || '').trim()}
                          className="px-3 py-2 bg-[#1a1a4e] text-white rounded-lg text-xs font-bold disabled:opacity-60 flex items-center gap-1.5"
                        >
                          {method.saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                          Save
                        </button>
                        <button
                          onClick={() => deleteMethod(method)}
                          disabled={!!method.deleting || !!method.saving}
                          className="px-3 py-2 border border-red-200 text-red-600 rounded-lg text-xs font-bold disabled:opacity-60 flex items-center gap-1.5"
                        >
                          {method.deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 font-medium">
          {error}
        </div>
      )}
    </div>
  )
}
