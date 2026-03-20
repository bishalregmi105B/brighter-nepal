// Admin Groups Management
// Overview of study channels: member count, activity, pin, archive, create
import { Plus, Users, Pin, Archive, Settings, MessageSquare, BadgeCheck } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface Group {
  id:       string
  name:     string
  subject:  string
  members:  number
  messages: number
  status:   'active' | 'archived'
  pinned?:  boolean
  verified?:boolean
}

const groups: Group[] = [
  { id: 'g1', name: 'Physics Grade 12 - Elite',  subject: 'Physics',     members: 1248, messages: 3412, status: 'active',   verified: true, pinned: true },
  { id: 'g2', name: 'Medical Entrance Prep',       subject: 'Biology',     members: 892,  messages: 1821, status: 'active',   verified: true  },
  { id: 'g3', name: 'Mathematics Olympiad',        subject: 'Mathematics', members: 540,  messages: 982,  status: 'active'                   },
  { id: 'g4', name: 'Chemistry Lab Forum',         subject: 'Chemistry',   members: 410,  messages: 642,  status: 'active'                   },
  { id: 'g5', name: 'Archives: Grade 11 Recap',   subject: 'General',     members: 2100, messages: 5002, status: 'archived'                 },
]

export default function AdminGroupsPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-extrabold text-[#1a1a4e] tracking-tight font-headline mb-1">Study Groups</h2>
          <p className="text-slate-500 font-medium">Manage broadcast channels and student community spaces.</p>
        </div>
        <button className="bg-[#c0622f] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-[#c0622f]/20">
          <Plus className="w-5 h-5" /> Create Channel
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-5">
        {[
          { label: 'Total Channels',   value: `${groups.length}`,                            color: 'text-[#1a1a4e]'             },
          { label: 'Total Members',    value: groups.reduce((s, g) => s + g.members, 0).toLocaleString(), color: 'text-on-tertiary-container'  },
          { label: 'Total Messages',   value: groups.reduce((s, g) => s + g.messages, 0).toLocaleString(), color: 'text-on-primary-container'   },
        ].map((s) => (
          <div key={s.label} className="bg-white p-5 rounded-xl shadow-[0_8px_20px_rgba(25,28,30,0.04)] text-center">
            <p className={cn('text-3xl font-black', s.color)}>{s.value}</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Groups list */}
      <div className="space-y-4">
        {groups.map((group) => (
          <div
            key={group.id}
            className={cn(
              'bg-white rounded-2xl p-6 shadow-[0_8px_20px_rgba(25,28,30,0.04)] flex items-center gap-5 group hover:shadow-xl transition-all border border-transparent hover:border-outline-variant/10',
              group.status === 'archived' && 'opacity-60'
            )}
          >
            {/* Icon */}
            <div className="w-12 h-12 rounded-xl bg-[#1a1a4e] flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-6 h-6 text-on-primary-container" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="font-headline font-bold text-on-surface">{group.name}</h3>
                {group.verified && <BadgeCheck className="w-4 h-4 text-[#2d6a6a] flex-shrink-0" />}
                {group.pinned && (
                  <span className="flex items-center gap-1 text-[10px] font-black text-on-primary-container bg-primary-fixed px-2 py-0.5 rounded-full">
                    <Pin className="w-2.5 h-2.5" /> Pinned
                  </span>
                )}
                {group.status === 'archived' && (
                  <span className="text-[10px] font-black text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full uppercase">
                    Archived
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-xs font-medium text-outline">
                <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />{group.members.toLocaleString()} members</span>
                <span className="flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5" />{group.messages.toLocaleString()} messages</span>
                <span className="bg-surface-container-low px-2 py-0.5 rounded text-[10px] font-bold">{group.subject}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <button className="p-2 rounded-lg hover:bg-surface-container-low text-on-surface-variant hover:text-[#c0622f] transition-colors" title="Settings">
                <Settings className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-lg hover:bg-surface-container-low text-on-surface-variant hover:text-error transition-colors" title="Archive">
                <Archive className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
