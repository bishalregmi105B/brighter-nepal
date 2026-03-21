'use client'
// Admin Groups — fetches real data from groupService
import { useEffect, useState } from 'react'
import { Plus, Users, Pin, Archive, Settings, MessageSquare, BadgeCheck, Loader2 } from 'lucide-react'
import { groupService, type Group } from '@/services/groupService'
import { cn } from '@/lib/utils/cn'

export default function AdminGroupsPage() {
  const [groups,  setGroups]  = useState<Group[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // API returns all groups for admin
    Promise.all([])  // placeholder: API may have /api/groups (admin list)
    fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'}/api/groups`, {
      headers: { Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('bn_token') ?? '' : ''}` }
    }).then(r => r.json()).then(d => {
      setGroups(d.data?.items ?? d.data ?? [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const totalMembers  = groups.reduce((s, g) => s + (g.member_count ?? 0), 0)

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-extrabold text-[#1a1a4e] tracking-tight font-headline mb-1">Study Groups</h2>
          <p className="text-slate-500 font-medium">BridgeCourse Nepal — manage batch groups and broadcast channels.</p>
        </div>
        <button className="bg-[#c0622f] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-[#c0622f]/20">
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
                <button className="p-2 rounded-lg hover:bg-surface-container-low text-on-surface-variant hover:text-[#c0622f] transition-colors"><Settings className="w-4 h-4" /></button>
                <button className="p-2 rounded-lg hover:bg-surface-container-low text-on-surface-variant hover:text-error transition-colors"><Archive className="w-4 h-4" /></button>
                <button className="p-2 rounded-lg hover:bg-surface-container-low text-on-surface-variant hover:text-on-primary-container transition-colors"><Pin className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
