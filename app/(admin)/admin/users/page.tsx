'use client'
// Admin User Management — full admin view with inline editing, WhatsApp, joined_method, auto-password visibility
import { useEffect, useState, useCallback } from 'react'
import { Download, UserPlus, ChevronLeft, ChevronRight, Search, X, Loader2, Phone, ShieldCheck, Pencil, Check, MessageSquare, Eye } from 'lucide-react'
import Link from 'next/link'
import { userService, type User, type ContactMethod } from '@/services/userService'
import { groupService, type Group } from '@/services/groupService'
import { cn } from '@/lib/utils/cn'

type Tab = 'trial' | 'paid'
const ROWS_PER_PAGE = 10

// ─── Shift-to-Paid Modal ──────────────────────────────────────────────────────
function ShiftModal({ user, onClose, onSuccess }: { user: User; onClose: () => void; onSuccess: () => void }) {
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('cash')
  const [saving, setSaving] = useState(false)
  const [err,    setErr]    = useState('')

  const submit = async () => {
    const n = parseInt(amount, 10)
    if (!n || n <= 0) { setErr('Enter a valid amount'); return }
    setSaving(true)
    try {
      await userService.shiftToPaid(user.id, n, method)
      onSuccess()
      onClose()
    } catch { setErr('Failed — please try again') }
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <h3 className="font-headline font-black text-xl text-[#1a1a4e] mb-1">Shift to Paid</h3>
        <p className="text-sm text-slate-500 mb-6">Enter the amount paid by <strong>{user.name}</strong></p>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Amount (NPR)</label>
            <input type="number" placeholder="e.g. 8500" value={amount} onChange={e => setAmount(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c0622f]/30" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Payment Method</label>
            <select value={method} onChange={e => setMethod(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c0622f]/30">
              <option value="cash">Cash</option>
              <option value="esewa">eSewa</option>
              <option value="khalti">Khalti</option>
              <option value="bank">Bank Transfer</option>
            </select>
          </div>
          {err && <p className="text-xs text-red-500 font-medium">{err}</p>}
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
          <button onClick={submit} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-[#c0622f] text-white text-sm font-bold hover:bg-[#a14f24] disabled:opacity-60 flex items-center justify-center gap-2">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Confirm Payment
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Onboarding Data Modal ───────────────────────────────────────────────────
function OnboardingModal({ user, onClose }: { user: User; onClose: () => void }) {
  const onboarding = user.onboarding_data ?? {}
  const exams = onboarding.target_exams ?? []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h3 className="font-headline font-black text-xl text-[#1a1a4e]">Onboarding Details</h3>
            <p className="text-sm text-slate-500">{user.name} · BC{user.student_id ?? String(user.id).padStart(6, '0')}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Previous School / College</p>
            <p className="text-sm text-slate-700">{onboarding.previous_school || '—'}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Location</p>
            <p className="text-sm text-slate-700">{onboarding.location || '—'}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Stream</p>
            <p className="text-sm text-slate-700">{onboarding.stream || '—'}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Heard From</p>
            <p className="text-sm text-slate-700">{onboarding.heard_from || '—'}</p>
          </div>
        </div>

        <div className="mt-4 bg-slate-50 rounded-xl p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Target Exams</p>
          {exams.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {exams.map(exam => (
                <span key={exam} className="px-3 py-1 rounded-full text-xs font-bold bg-[#1a1a4e]/10 text-[#1a1a4e]">
                  {exam}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-700">—</p>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Inline Edit Row ──────────────────────────────────────────────────────────
function EditRow({
  user, contactMethods, groups, onSave, onCancel,
}: {
  user: User
  contactMethods: ContactMethod[]
  groups: Group[]
  onSave: (data: Partial<User> & { paid_amount?: number }) => Promise<void>
  onCancel: () => void
}) {
  const [whatsapp,     setWhatsapp]     = useState(user.whatsapp ?? '')
  const [joinedMethod, setJoinedMethod] = useState((user.joined_method ?? '').trim() || 'Legacy Account')
  const [groupId,      setGroupId]      = useState(user.group_id ? String(user.group_id) : '')
  const [paidAmount,   setPaidAmount]   = useState(String(user.paid_amount ?? ''))
  const [saving,       setSaving]       = useState(false)

  const save = async () => {
    setSaving(true)
    const payload: Partial<User> & { paid_amount?: number } = {
      whatsapp,
      joined_method: (joinedMethod || '').trim() || 'Legacy Account',
      group_id: groupId ? Number(groupId) : null,
    }
    if (paidAmount) payload.paid_amount = parseInt(paidAmount, 10)
    await onSave(payload)
    setSaving(false)
  }

  const CHANNEL_ICONS: Record<string, string> = {
    whatsapp: '📱', messenger: '💬', facebook: '👥', other: '🔗',
  }
  const hasCurrentMethod = contactMethods.some(m => m.name === joinedMethod)
  const methodOptions = hasCurrentMethod || !joinedMethod
    ? contactMethods
    : [{ id: -1, name: joinedMethod, channel: 'other', is_active: true }, ...contactMethods]

  return (
    <tr className="bg-blue-50/50">
      <td colSpan={9} className="px-4 py-4">
        <div className="flex flex-wrap gap-4 items-end">
          {/* WhatsApp */}
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">WhatsApp Number</label>
            <input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="98XXXXXXXX"
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm w-36 focus:outline-none focus:ring-2 focus:ring-[#1a1a4e]/20" />
          </div>

          {/* Joined Via — dropdown from ContactMethod table */}
          <div className="min-w-[180px]">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Joined Via</label>
            <select
              value={joinedMethod}
              onChange={e => setJoinedMethod(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#1a1a4e]/20"
            >
              <option value="">— not set —</option>
              {methodOptions.map(m => (
                <option key={m.id} value={m.name}>
                  {CHANNEL_ICONS[m.channel] ?? '🔗'} {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Chat Group */}
          <div className="min-w-[220px]">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Chat Group</label>
            <select
              value={groupId}
              onChange={e => setGroupId(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#1a1a4e]/20"
            >
              <option value="">— no group —</option>
              {groups.map(g => {
                const count = g.current_member_count ?? g.member_count ?? 0
                return (
                  <option key={g.id} value={String(g.id)}>
                    {g.name} ({count} members)
                  </option>
                )
              })}
            </select>
          </div>

          {/* Paid Amount */}
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Paid Amount (NPR)</label>
            <input
              type="number"
              value={paidAmount}
              onChange={e => setPaidAmount(e.target.value)}
              placeholder="e.g. 8500"
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm w-32 focus:outline-none focus:ring-2 focus:ring-[#1a1a4e]/20"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <button onClick={save} disabled={saving} className="px-4 py-2 bg-[#1a1a4e] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-[#141432]">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              Save
            </button>
            <button onClick={onCancel} className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50">
              Cancel
            </button>
          </div>
        </div>
      </td>
    </tr>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function UserManagementPage() {
  const [tab,      setTab]      = useState<Tab>('trial')
  const [query,    setQuery]    = useState('')
  const [page,     setPage]     = useState(1)
  const [users,    setUsers]    = useState<User[]>([])
  const [total,    setTotal]    = useState(0)
  const [loading,  setLoading]  = useState(true)
  const [exporting, setExporting] = useState(false)
  const [stats,    setStats]    = useState({ total_users: 0, paid_users: 0, trial_users: 0, total_payment: 0, today_payment: 0 })
  const [shifting, setShifting] = useState<User | null>(null)
  const [viewingOnboarding, setViewingOnboarding] = useState<User | null>(null)
  const [editing,  setEditing]  = useState<number | null>(null)
  const [contactMethods, setContactMethods] = useState<ContactMethod[]>([])
  const [groups, setGroups] = useState<Group[]>([])

  const loadStats = useCallback(() => {
    userService.getStats().then(r => setStats(r.data as typeof stats)).catch(() => {})
  }, [])

  const fetchUsers = useCallback((t: Tab, q: string, p: number) => {
    setLoading(true)
    userService.getUsers({ tab: t, search: q, page: p, limit: ROWS_PER_PAGE })
      .then(res => { setUsers(res.data?.items ?? []); setTotal(res.data?.total ?? 0) })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { loadStats() }, [loadStats])
  useEffect(() => { fetchUsers(tab, query, page) }, [tab, query, page, fetchUsers])
  useEffect(() => {
    userService.getContactMethods()
      .then(r => { const d = r.data; setContactMethods(Array.isArray(d) ? d : (d as { data?: ContactMethod[] })?.data ?? []) })
      .catch(() => {})
  }, [])
  useEffect(() => {
    groupService.getGroups()
      .then(r => setGroups(r.data?.items ?? []))
      .catch(() => setGroups([]))
  }, [])

  const totalPages = Math.max(1, Math.ceil(total / ROWS_PER_PAGE))
  const changeTab  = (t: Tab) => { setTab(t); setPage(1); setEditing(null) }

  const toggleStatus = async (u: User) => {
    await userService.updateUser(u.id, { status: u.status === 'active' ? 'suspended' : 'active' })
    fetchUsers(tab, query, page)
  }

  const saveEdit = async (u: User, data: Partial<User> & { paid_amount?: number }) => {
    await userService.updateUser(u.id, data)
    fetchUsers(tab, query, page)
    setEditing(null)
  }

  const exportUsers = async () => {
    setExporting(true)
    try {
      await userService.exportUsers({ tab, search: query })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to export users'
      window.alert(message)
    } finally {
      setExporting(false)
    }
  }

  const statCards = [
    { label: 'Total Users',     value: stats.total_users,                             badge: 'Brighter Nepal', badgeColor: 'text-teal-600 bg-teal-50' },
    { label: 'Paid Users',      value: stats.paid_users,                              badge: 'Paid Tier',    badgeColor: 'text-on-primary-container bg-orange-50' },
    { label: 'Trial Users',     value: stats.trial_users,                             badge: 'Trial Period', badgeColor: 'text-secondary bg-secondary/10' },
    { label: 'Total Payment',   value: `NPR ${stats.total_payment.toLocaleString()}`, badge: 'Revenue',      badgeColor: 'text-green-600 bg-green-50' },
    { label: "Today's Payment", value: `NPR ${stats.today_payment.toLocaleString()}`, badge: 'Today',        badgeColor: 'text-blue-600 bg-blue-50' },
  ]

  return (
    <div className="p-4 md:p-6 lg:p-10 max-w-screen-2xl mx-auto">
      {shifting && (
        <ShiftModal user={shifting} onClose={() => setShifting(null)}
          onSuccess={() => { loadStats(); fetchUsers(tab, query, page) }} />
      )}
      {viewingOnboarding && (
        <OnboardingModal user={viewingOnboarding} onClose={() => setViewingOnboarding(null)} />
      )}

      {/* Header */}
      <div className="mb-6 md:mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline font-black text-2xl md:text-4xl text-[#1a1a4e] tracking-tight mb-1">User Management</h2>
          <p className="text-on-surface-variant font-medium text-sm">Brighter Nepal — manage students and their academic tiers.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={exportUsers}
            disabled={exporting}
            className="bg-surface-container-highest text-[#1a1a4e] px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-surface-container-high transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span className="hidden sm:inline">{exporting ? 'Exporting...' : 'Export'}</span>
          </button>
          <Link href="/admin/users/bulk-generate" className="bg-[#c0622f] text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all">
            <UserPlus className="w-4 h-4" /> <span className="hidden sm:inline">Enroll Students</span>
          </Link>
        </div>
      </div>

      {/* Stats — 5 cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-10">
        {statCards.map(stat => (
          <div key={stat.label} className="bg-white p-5 rounded-2xl shadow-[0_8px_20px_rgba(25,28,30,0.04)]">
            <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-3">{stat.label}</p>
            <div className="flex items-end justify-between gap-1">
              <h3 className="font-headline font-extrabold text-2xl text-[#1a1a4e] truncate">{stat.value}</h3>
              <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-lg whitespace-nowrap', stat.badgeColor)}>{stat.badge}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[2rem] shadow-[0_12px_32px_rgba(25,28,30,0.06)] overflow-hidden">
        {/* Controls */}
        <div className="p-5 border-b border-surface-container flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex bg-surface-container-low p-1.5 rounded-2xl">
            {(['trial', 'paid'] as Tab[]).map(key => (
              <button key={key} onClick={() => changeTab(key)} className={cn(
                'px-6 py-2 rounded-xl text-sm font-bold transition-all',
                tab === key ? 'bg-white text-on-primary-container shadow-sm' : 'text-on-surface-variant hover:text-[#1a1a4e]'
              )}>
                {key === 'trial' ? 'Trial Only' : 'Paid Only'}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
            <input value={query} onChange={e => { setQuery(e.target.value); setPage(1) }}
              placeholder="Search users..." className="pl-9 pr-8 py-2 bg-surface-container rounded-xl text-sm border-none focus:ring-2 focus:ring-on-primary-container/20 w-48" />
            {query && <button onClick={() => setQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2"><X className="w-4 h-4 text-outline" /></button>}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center h-48"><Loader2 className="w-6 h-6 animate-spin text-on-primary-container" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low/50">
                  {['ID', 'Name / Password', 'Email', 'WhatsApp', 'Joined Via', 'Joined', 'Paid', 'Status', 'Actions'].map(col => (
                    <th key={col} className="px-4 py-4 text-[10px] font-black text-on-surface-variant uppercase tracking-widest border-b border-surface-container whitespace-nowrap">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan={9} className="text-center py-16 text-outline font-medium">No students match your filters.</td></tr>
                ) : users.map((u, i) => [
                  // Main row
                  <tr key={u.id} className={cn('hover:bg-surface-container-low/60 transition-colors', i % 2 === 1 ? 'bg-surface-container-low/20' : '')}>
                    {/* Student ID */}
                    <td className="px-4 py-4">
                      <span className="font-mono text-xs font-black text-[#1a1a4e] bg-surface-container-low px-2 py-1 rounded-lg">
                        BC{u.student_id ?? String(u.id).padStart(6, '0')}
                      </span>
                    </td>
                    {/* Name + password */}
                    <td className="px-4 py-4 min-w-[160px]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#1a1a4e] flex items-center justify-center text-white text-[10px] font-black flex-shrink-0">
                          {u.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-[#1a1a4e]">{u.name}</p>
                          {u.plain_password && (
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5 select-all">{u.plain_password}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    {/* Email */}
                    <td className="px-4 py-4 text-sm text-on-surface-variant">{u.email ?? '—'}</td>
                    {/* WhatsApp */}
                    <td className="px-4 py-4">
                      {u.whatsapp ? (
                        <a href={`https://wa.me/${u.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-green-600 hover:text-green-700 font-medium text-sm">
                          <Phone className="w-3.5 h-3.5" />
                          {u.whatsapp}
                        </a>
                      ) : <span className="text-slate-300 text-sm">—</span>}
                    </td>
                    {/* Joined method */}
                    <td className="px-4 py-4">
                      {(u.joined_method ?? '').trim() ? (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="max-w-[120px] truncate">{u.joined_method}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="max-w-[120px] truncate">Legacy Account</span>
                        </div>
                      )}
                    </td>
                    {/* Joined date */}
                    <td className="px-4 py-4 text-sm text-on-surface-variant whitespace-nowrap">{u.created_at?.slice(0, 10)}</td>
                    {/* Paid amount */}
                    <td className="px-4 py-4">
                      {u.paid_amount ? (
                        <div>
                          <p className="font-bold text-sm text-green-700">NPR {u.paid_amount.toLocaleString()}</p>
                          <span className="text-[10px] font-black text-on-primary-container bg-orange-50 px-2 py-0.5 rounded-full">PAID</span>
                        </div>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-secondary/10 text-secondary">
                          7-Day Trial
                        </span>
                      )}
                    </td>
                    {/* Status toggle */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => toggleStatus(u)} className={cn('w-10 h-5 rounded-full relative shadow-inner transition-colors', u.status === 'active' ? 'bg-teal-500' : 'bg-surface-container-highest')}>
                          <div className={cn('w-4 h-4 bg-white rounded-full absolute top-0.5 shadow-sm transition-all', u.status === 'active' ? 'right-0.5' : 'left-0.5')} />
                        </button>
                        <span className={cn('text-xs font-bold whitespace-nowrap', u.status === 'active' ? 'text-teal-600' : 'text-on-surface-variant')}>
                          {u.status === 'active' ? 'Active' : 'Suspended'}
                        </span>
                      </div>
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button onClick={() => setEditing(editing === u.id ? null : u.id)}
                          className="flex items-center gap-1 px-2.5 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50">
                          <Pencil className="w-3 h-3" /> Edit
                        </button>
                        <button
                          onClick={() => setViewingOnboarding(u)}
                          className="flex items-center gap-1 px-2.5 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50"
                        >
                          <Eye className="w-3 h-3" /> Onboarding
                        </button>
                        {u.plan === 'trial' && (
                          <button onClick={() => setShifting(u)}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-[#c0622f] text-white rounded-lg text-xs font-bold hover:bg-[#a14f24]">
                            <ShieldCheck className="w-3 h-3" /> Shift to Paid
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>,
                  // Inline edit row
                  editing === u.id && (
                    <EditRow key={`edit-${u.id}`} user={u}
                      contactMethods={contactMethods}
                      groups={groups}
                      onSave={data => saveEdit(u, data)}
                      onCancel={() => setEditing(null)} />
                  ),
                ].filter(Boolean))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="p-6 bg-surface-container-low/30 border-t border-surface-container flex items-center justify-between">
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
            Page {page} of {totalPages} · {total} total
          </p>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-9 h-9 rounded-xl flex items-center justify-center border border-surface-container hover:bg-white transition-all text-on-surface-variant disabled:opacity-30">
              <ChevronLeft className="w-5 h-5" />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} className={cn('w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-all', page === p ? 'bg-[#1a1a4e] text-white shadow-md' : 'hover:bg-white text-on-surface-variant')}>{p}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="w-9 h-9 rounded-xl flex items-center justify-center border border-surface-container hover:bg-white transition-all text-on-surface-variant disabled:opacity-30">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
