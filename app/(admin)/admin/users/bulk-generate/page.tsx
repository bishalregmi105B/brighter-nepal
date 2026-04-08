'use client'
// Admin Bulk Generate — create student accounts (manual entry), email optional
import { useState, useRef } from 'react'
import { ArrowLeft, Upload, Plus, Trash2, Download, CheckCircle2, Copy, Loader2, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import { userService } from '@/services/userService'

interface BulkRow { id: string; name: string; email: string; plan: 'paid' | 'trial' }

interface CreatedUser { id: number; bc_id: string; name: string; email: string; password: string; plan: string }

export default function BulkGeneratePage() {
  const [rows, setRows] = useState<BulkRow[]>([
    { id: 'r1', name: '', email: '', plan: 'paid' },
  ])
  const [loading,      setLoading]      = useState(false)
  const [createdUsers, setCreatedUsers] = useState<CreatedUser[]>([])
  const [errorMsg,     setErrorMsg]     = useState('')
  const [showPw,       setShowPw]       = useState(false)
  const [copiedUserId, setCopiedUserId] = useState<number | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const addRow = () =>
    setRows((prev) => [...prev, { id: `r${Date.now()}`, name: '', email: '', plan: 'paid' }])

  const removeRow = (id: string) =>
    setRows((prev) => prev.filter((r) => r.id !== id))

  const updateRow = <K extends keyof BulkRow>(id: string, field: K, value: BulkRow[K]) =>
    setRows((prev) => prev.map((r) => r.id === id ? { ...r, [field]: value } : r))

  const validRows = rows.filter((r) => r.name.trim())

  const handleGenerate = async () => {
    if (!validRows.length) return
    setLoading(true)
    setErrorMsg('')
    setCreatedUsers([])
    try {
      const payload = validRows.map((r) => ({
        name:     r.name.trim(),
        email:    r.email.trim() || undefined,
        plan:     r.plan,
      }))
      const res = await userService.bulkCreate(payload)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = (res as any)?.data ?? res
      const users: CreatedUser[] = data?.users ?? []
      setCreatedUsers(users)
      // Reset rows
      setRows([{ id: 'r1', name: '', email: '', plan: 'paid' }])
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Failed to create accounts')
    } finally {
      setLoading(false)
    }
  }

  const buildLoginMessage = (u: CreatedUser) =>
    `Your user id is ${u.bc_id} and password is ${u.password} , Please go to https://brighternepal.com/login to login`

  const copySingle = async (u: CreatedUser) => {
    try {
      await navigator.clipboard.writeText(buildLoginMessage(u))
      setCopiedUserId(u.id)
      window.setTimeout(() => {
        setCopiedUserId((current) => (current === u.id ? null : current))
      }, 1500)
    } catch {
      setErrorMsg('Unable to copy credentials. Please copy manually.')
    }
  }

  const copyAll = async () => {
    try {
      const text = createdUsers.map(buildLoginMessage).join('\n')
      await navigator.clipboard.writeText(text)
    } catch {
      setErrorMsg('Unable to copy credentials. Please copy manually.')
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/users" className="p-2 rounded-xl hover:bg-surface-container text-on-surface-variant transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="font-headline font-black text-3xl text-[#1a1a4e]">Bulk Enrollment</h2>
          <p className="text-slate-500 text-sm font-medium">
            Create multiple student accounts. Email is optional — students can log in with their <strong>BCXXXXXX</strong> ID.
          </p>
        </div>
      </div>

      {/* CSV upload zone (UI only for now) */}
      <div
        onClick={() => fileRef.current?.click()}
        className="bg-white rounded-2xl p-8 shadow-[0_8px_20px_rgba(25,28,30,0.04)] border-2 border-dashed border-outline-variant/30 flex flex-col items-center justify-center cursor-pointer hover:border-on-primary-container/40 hover:bg-surface-container-low/20 transition-all"
      >
        <Upload className="w-8 h-8 text-outline mb-3" />
        <p className="font-bold text-on-surface text-sm">Drop a CSV file or click to browse</p>
        <p className="text-xs text-outline mt-1">Format: Name, Email (optional), Plan</p>
        <button className="mt-3 flex items-center gap-1.5 text-xs font-bold text-on-primary-container hover:underline">
          <Download className="w-3 h-3" /> Download template
        </button>
        <input ref={fileRef} type="file" accept=".csv" className="hidden" />
      </div>

      {/* Manual entry table */}
      <div className="bg-white rounded-2xl shadow-[0_8px_20px_rgba(25,28,30,0.04)] overflow-hidden">
        <div className="p-5 border-b border-surface-container flex items-center justify-between">
          <h3 className="font-bold text-on-surface">Manual Entry <span className="text-outline font-normal">({rows.length} rows)</span></h3>
          <button onClick={addRow} className="flex items-center gap-2 px-4 py-2 bg-on-primary-container/10 text-on-primary-container font-bold text-sm rounded-xl hover:bg-on-primary-container/20 transition-colors">
            <Plus className="w-4 h-4" /> Add Row
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low/50">
              <tr>
                {['#', 'Full Name *', 'Email Address (optional)', 'Plan', ''].map((col) => (
                  <th key={col} className="px-5 py-3 text-[11px] font-black text-slate-400 uppercase tracking-widest">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row, idx) => (
                <tr key={row.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 text-sm font-bold text-outline">{idx + 1}</td>
                  <td className="px-5 py-3">
                    <input
                      value={row.name}
                      onChange={(e) => updateRow(row.id, 'name', e.target.value)}
                      placeholder="Student Name"
                      className="w-full px-3 py-2 bg-surface-container rounded-lg border-none focus:ring-2 focus:ring-on-primary-container/20 text-sm"
                    />
                  </td>
                  <td className="px-5 py-3">
                    <input
                      value={row.email}
                      onChange={(e) => updateRow(row.id, 'email', e.target.value)}
                      placeholder="Optional — leave blank for BC login"
                      type="email"
                      className="w-full px-3 py-2 bg-surface-container rounded-lg border-none focus:ring-2 focus:ring-on-primary-container/20 text-sm"
                    />
                  </td>
                  <td className="px-5 py-3">
                    <select
                      value={row.plan}
                      onChange={(e) => updateRow(row.id, 'plan', e.target.value as BulkRow['plan'])}
                      className="px-3 py-2 bg-surface-container rounded-lg border-none focus:ring-2 focus:ring-on-primary-container/20 text-sm font-medium"
                    >
                      <option value="paid">Premium Plus</option>
                      <option value="trial">7-Day Trial</option>
                    </select>
                  </td>
                  <td className="px-5 py-3">
                    {rows.length > 1 && (
                      <button onClick={() => removeRow(row.id)} className="p-1.5 rounded-lg text-error hover:bg-error-container transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Error */}
      {errorMsg && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
          {errorMsg}
        </div>
      )}

      {/* Created users result card */}
      {createdUsers.length > 0 && (
        <div className="bg-white rounded-2xl shadow-[0_8px_20px_rgba(25,28,30,0.04)] overflow-hidden">
          <div className="p-5 border-b border-surface-container flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <h3 className="font-bold text-on-surface">
                {createdUsers.length} Account{createdUsers.length !== 1 ? 's' : ''} Created
              </h3>
              <span className="text-xs font-bold text-slate-500">Password = BC + Student ID</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPw(!showPw)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {showPw ? 'Hide' : 'Show'} Passwords
              </button>
              <button
                onClick={copyAll}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-on-primary-container bg-on-primary-container/10 rounded-lg hover:bg-on-primary-container/20"
              >
                <Copy className="w-3.5 h-3.5" /> Copy All
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-container-low/50">
                <tr>
                  {['Student ID', 'Name', 'Email', 'Plan', 'Password', 'Actions'].map(col => (
                    <th key={col} className="px-5 py-3 text-[11px] font-black text-slate-400 uppercase tracking-widest">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {createdUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <span className="font-mono text-xs font-black text-[#1a1a4e] bg-surface-container-low px-2 py-1 rounded-lg">{u.bc_id}</span>
                    </td>
                    <td className="px-5 py-3 font-medium text-sm">{u.name}</td>
                    <td className="px-5 py-3 text-sm text-slate-500">{u.email}</td>
                    <td className="px-5 py-3">
                      <span className={cn('px-2 py-0.5 rounded-full text-[11px] font-black uppercase', u.plan === 'paid' ? 'bg-orange-50 text-on-primary-container' : 'bg-secondary/10 text-secondary')}>
                        {u.plan === 'paid' ? 'Premium' : 'Trial'}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-mono text-sm">
                      {showPw ? u.password : '••••••••••'}
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => copySingle(u)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        {copiedUserId === u.id ? 'Copied' : 'Copy'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pb-4">
        <Link href="/admin/users" className="flex-1 py-3.5 rounded-xl border border-outline-variant/20 font-bold text-sm text-on-surface hover:bg-surface-container transition-colors text-center">
          Cancel
        </Link>
        <button
          onClick={handleGenerate}
          disabled={loading || !validRows.length}
          className={cn(
            'flex-1 py-3.5 font-bold text-sm rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2',
            validRows.length && !loading
              ? 'bg-[#c0622f] text-white shadow-lg shadow-[#c0622f]/20 hover:opacity-90'
              : 'bg-surface-container-high text-outline cursor-not-allowed'
          )}
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? 'Creating…' : `Generate ${validRows.length || ''} Account${validRows.length !== 1 ? 's' : ''}`}
        </button>
      </div>
    </div>
  )
}
