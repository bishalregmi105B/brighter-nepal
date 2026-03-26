'use client'
// Admin User Detail — loads real user from userService.getUser(params.id)
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, Mail, Calendar, CreditCard, BarChart2, Clock, BookCheck, Save, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { userService, type User } from '@/services/userService'
import { cn } from '@/lib/utils/cn'

export default function UserDetailPage() {
  const params   = useParams<{ id: string }>()
  const [user,   setUser]   = useState<User | null>(null)
  const [plan,   setPlan]   = useState<'paid' | 'trial'>('trial')
  const [status, setStatus] = useState<'active' | 'suspended'>('active')
  const [note,   setNote]   = useState('')
  const [saved,  setSaved]  = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!params.id) return
    userService.getUser(Number(params.id)).then((res) => {
      const u = res.data
      setUser(u)
      setPlan((u.plan as 'paid' | 'trial') ?? 'trial')
      setStatus((u.status as 'active' | 'suspended') ?? 'active')
    }).finally(() => setLoading(false))
  }, [params.id])

  const handleSave = async () => {
    if (!user) return
    await userService.updateUser(user.id, { plan, status, admin_note: note }).catch(() => {})
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() ?? '??'

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-on-primary-container" /></div>
  if (!user)   return <div className="p-10 text-center text-red-500">User not found.</div>

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/users" className="p-2 rounded-xl hover:bg-surface-container text-on-surface-variant transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="font-headline font-black text-3xl text-[#1a1a4e]">Student Profile</h2>
          <p className="text-slate-500 text-sm font-medium">ID: {user.id}</p>
        </div>
        <button onClick={handleSave} className={cn(
          'ml-auto flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95',
          saved ? 'bg-tertiary-fixed text-on-tertiary-fixed-variant' : 'bg-[#c0622f] text-white shadow-lg shadow-[#c0622f]/20 hover:opacity-90'
        )}>
          <Save className="w-4 h-4" /> {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-5">
          <div className="bg-white rounded-2xl p-6 shadow-[0_8px_20px_rgba(25,28,30,0.04)] text-center">
            <div className="w-20 h-20 rounded-full bg-on-primary-container text-white text-2xl font-black flex items-center justify-center mx-auto mb-3">{initials}</div>
            <h3 className="font-headline font-bold text-xl text-[#1a1a4e]">{user.name}</h3>
            <p className="text-xs text-outline font-medium">BC{user.student_id ?? String(user.id).padStart(6,'0')}</p>
            <div className="mt-5 space-y-3 text-left">
              <div className="flex items-center gap-2 text-sm text-slate-600"><Mail className="w-4 h-4 text-outline" />{user.email ?? '—'}</div>
              <div className="flex items-center gap-2 text-sm text-slate-600"><Calendar className="w-4 h-4 text-outline" />Joined {user.created_at?.slice(0,10)}</div>
              <div className="flex items-center gap-2 text-sm text-slate-600"><CreditCard className="w-4 h-4 text-outline" />{user.plan === 'paid' ? 'Premium Plan' : 'Trial'}</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-[0_8px_20px_rgba(25,28,30,0.04)] space-y-4">
            <h4 className="font-bold text-on-surface text-sm uppercase tracking-wider text-outline">Performance</h4>
            {[
              { Icon: BarChart2, label: 'Avg Score',   value: '—'  },
              { Icon: BookCheck, label: 'Tests Taken', value: '—'  },
              { Icon: Clock,     label: 'Study Hours', value: '—'  },
            ].map(({ Icon, label, value }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-600"><Icon className="w-4 h-4 text-outline" /> {label}</div>
                <span className="font-bold text-[#1a1a4e]">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl p-6 shadow-[0_8px_20px_rgba(25,28,30,0.04)] space-y-5">
            <h4 className="font-bold text-on-surface border-b border-surface-container pb-3">Account Settings</h4>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="text-xs font-bold text-outline uppercase tracking-wider block mb-2">Academic Plan</label>
                <select value={plan} onChange={(e) => setPlan(e.target.value as 'paid' | 'trial')}
                  className="w-full px-4 py-3 bg-surface-container rounded-xl border-none focus:ring-2 focus:ring-on-primary-container/20 text-sm font-medium">
                  <option value="paid">Premium Plus</option>
                  <option value="trial">7-Day Trial</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-outline uppercase tracking-wider block mb-2">Account Status</label>
                <div className="flex items-center gap-3 mt-1">
                  <button onClick={() => setStatus(status === 'active' ? 'suspended' : 'active')}
                    className={cn('w-12 h-6 rounded-full relative shadow-inner transition-colors', status === 'active' ? 'bg-teal-500' : 'bg-surface-container-highest')}>
                    <div className={cn('w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-all', status === 'active' ? 'right-0.5' : 'left-0.5')} />
                  </button>
                  <span className={cn('text-sm font-bold', status === 'active' ? 'text-teal-600' : 'text-on-surface-variant')}>
                    {status === 'active' ? 'Active' : 'Suspended'}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-outline uppercase tracking-wider block mb-2">Admin Note</label>
              <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)}
                placeholder="Internal note about this student (not shown to student)..."
                className="w-full px-4 py-3 bg-surface-container rounded-xl border-none focus:ring-2 focus:ring-on-primary-container/20 text-sm resize-none" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-[0_8px_20px_rgba(25,28,30,0.04)] border border-error/10">
            <h4 className="font-bold text-error mb-4">Danger Zone</h4>
            <div className="flex gap-3">
              <button onClick={() => userService.updateUser(user.id, { password: 'Reset123!' })}
                className="px-5 py-2.5 bg-error/10 text-error font-bold text-sm rounded-xl hover:bg-error/20 transition-colors">
                Reset Password
              </button>
              <button onClick={() => userService.deleteUser(user.id)}
                className="px-5 py-2.5 bg-error/10 text-error font-bold text-sm rounded-xl hover:bg-error/20 transition-colors">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
