'use client'
// Admin Groups — fetches real data from groupService
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Users, Pin, Archive, Settings, MessageSquare, BadgeCheck, Loader2 } from 'lucide-react'
import { groupService, type Group } from '@/services/groupService'
import { cn } from '@/lib/utils/cn'

export default function AdminGroupsPage() {
  const [groups,  setGroups]  = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  const fetchGroups = () => {
    setLoading(true)
    fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'}/api/groups`, {
      headers: { Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('bn_token') ?? '' : ''}` }
    }).then(r => r.json()).then(d => {
      setGroups(d.data?.items ?? d.data ?? [])
    }).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchGroups()
  }, [])

  const totalMembers  = groups.reduce((s, g) => s + (g.member_count ?? 0), 0)

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-extrabold text-[#1a1a4e] tracking-tight font-headline mb-1">Study Groups</h2>
          <p className="text-slate-500 font-medium">Brighter Nepal — manage batch groups and broadcast channels.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-[#c0622f] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-[#c0622f]/20">
          <Plus className="w-5 h-5" /> Create Group
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-5">
        {[
          { label: 'Total Groups',   value: groups.length.toString(),    color: 'text-[#1a1a4e]'            },
          { label: 'Total Members',  value: totalMembers.toLocaleString(), color: 'text-on-tertiary-container' },
          { label: 'Active Groups',  value: groups.length.toString(),    color: 'text-on-primary-container'  },
        ].map((s) => (
          <div key={s.label} className="bg-white p-5 rounded-xl shadow-[0_8px_20px_rgba(25,28,30,0.04)] text-center">
            <p className={cn('text-3xl font-black', s.color)}>{loading ? '…' : s.value}</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48"><Loader2 className="w-6 h-6 animate-spin text-on-primary-container" /></div>
      ) : (
        <div className="space-y-4">
          {groups.length === 0 && (
            <div className="text-center py-16 text-outline font-medium bg-white rounded-2xl">No groups created yet.</div>
          )}
          {groups.map((group) => (
            <div key={group.id} className="bg-white rounded-2xl p-6 shadow-[0_8px_20px_rgba(25,28,30,0.04)] flex items-center gap-5 group hover:shadow-xl transition-all border border-transparent hover:border-outline-variant/10">
              <div className="w-12 h-12 rounded-xl bg-[#1a1a4e] flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-6 h-6 text-on-primary-container" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-headline font-bold text-on-surface">{group.name}</h3>
                  <BadgeCheck className="w-4 h-4 text-[#2d6a6a] flex-shrink-0" />
                </div>
                <div className="flex items-center gap-4 text-xs font-medium text-outline">
                  <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />{(group.member_count ?? 0).toLocaleString()} members</span>
                  <span className="text-[10px]">{group.description}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <Link href={`/admin/groups/${group.id}`} className="p-2 rounded-lg hover:bg-surface-container-low text-on-surface-variant hover:text-[#c0622f] transition-colors" title="Enter Chat">
                  <MessageSquare className="w-4 h-4" />
                </Link>
                <button className="p-2 rounded-lg hover:bg-surface-container-low text-on-surface-variant hover:text-on-primary-container transition-colors"><Settings className="w-4 h-4" /></button>
                <button className="p-2 rounded-lg hover:bg-surface-container-low text-on-surface-variant hover:text-error transition-colors"><Archive className="w-4 h-4" /></button>
                <button className="p-2 rounded-lg hover:bg-surface-container-low text-on-surface-variant hover:text-on-primary-container transition-colors"><Pin className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <CreateGroupModal onClose={() => setShowModal(false)} onSaved={fetchGroups} />
      )}
    </div>
  )
}

function CreateGroupModal({ onClose, onSaved }: { onClose: () => void, onSaved: () => void }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [memberCount, setMemberCount] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    if (!name.trim()) { setError('Group name is required.'); return }
    setSaving(true)
    setError('')
    try {
      await groupService.createGroup({ name: name.trim(), description: description.trim(), member_count: memberCount })
      onSaved()
      onClose()
    } catch {
      setError('Failed to create group.')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full md:max-w-md bg-white md:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col">
        <div className="px-6 py-4 border-b border-surface-container flex items-center justify-between">
          <h2 className="font-headline font-bold text-xl text-[#1a1a4e]">Create Study Group</h2>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="p-6 space-y-5">
          {error && <div className="p-3 bg-error-container text-error rounded-xl text-sm font-bold">{error}</div>}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Group Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="E.g., SEE Preparation Group"
              className="w-full px-4 py-3 bg-surface-container-low rounded-xl border-none focus:ring-2 focus:ring-on-primary-container text-sm font-bold placeholder:font-medium placeholder:text-outline" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Description (Optional)</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="Short description..."
              className="w-full px-4 py-3 bg-surface-container-low rounded-xl border-none focus:ring-2 focus:ring-on-primary-container text-sm font-medium placeholder:text-outline resize-none" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Initial Member Count</label>
            <input type="number" value={memberCount} onChange={e => setMemberCount(Number(e.target.value) || 0)} min={0}
              className="w-full px-4 py-3 bg-surface-container-low rounded-xl border-none focus:ring-2 focus:ring-on-primary-container text-sm font-bold" />
          </div>
        </div>
        <div className="p-6 border-t border-surface-container bg-surface-container-low flex justify-end gap-3 rounded-b-2xl">
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="bg-[#1a1a4e] text-white px-8 py-2.5 rounded-xl font-bold hover:opacity-90 active:scale-95 transition-all text-sm shadow-lg shadow-[#1a1a4e]/20 disabled:opacity-50 flex items-center gap-2">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating</> : 'Create Group'}
          </button>
        </div>
      </div>
    </div>
  )
}
