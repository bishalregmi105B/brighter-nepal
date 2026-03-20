'use client'
// Admin Bulk Generate — create user accounts in bulk from CSV or manual input
import { useState, useRef } from 'react'
import { ArrowLeft, Upload, Plus, Trash2, Download, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'

interface BulkRow { id: string; name: string; email: string; plan: 'paid' | 'trial' }

export default function BulkGeneratePage() {
  const [rows, setRows] = useState<BulkRow[]>([
    { id: 'r1', name: '', email: '', plan: 'trial' },
  ])
  const [done, setDone] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const addRow = () =>
    setRows((prev) => [...prev, { id: `r${Date.now()}`, name: '', email: '', plan: 'trial' }])

  const removeRow = (id: string) =>
    setRows((prev) => prev.filter((r) => r.id !== id))

  const updateRow = (id: string, field: keyof BulkRow, value: string) =>
    setRows((prev) => prev.map((r) => r.id === id ? { ...r, [field]: value } : r))

  const handleGenerate = () => {
    setDone(true)
    setTimeout(() => setDone(false), 3000)
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
          <p className="text-slate-500 text-sm font-medium">Create multiple student accounts at once via CSV or manual entry.</p>
        </div>
      </div>

      {/* CSV upload zone */}
      <div
        onClick={() => fileRef.current?.click()}
        className="bg-white rounded-2xl p-10 shadow-[0_8px_20px_rgba(25,28,30,0.04)] border-2 border-dashed border-outline-variant/30 flex flex-col items-center justify-center cursor-pointer hover:border-on-primary-container/40 hover:bg-surface-container-low/20 transition-all"
      >
        <Upload className="w-10 h-10 text-outline mb-3" />
        <p className="font-bold text-on-surface text-base">Drop a CSV file or click to browse</p>
        <p className="text-sm text-outline mt-2">Format: Name, Email, Plan (paid/trial)</p>
        <button className="mt-4 flex items-center gap-2 text-xs font-bold text-on-primary-container hover:underline">
          <Download className="w-3 h-3" /> Download template
        </button>
        <input ref={fileRef} type="file" accept=".csv" className="hidden" />
      </div>

      {/* Manual entry table */}
      <div className="bg-white rounded-2xl shadow-[0_8px_20px_rgba(25,28,30,0.04)] overflow-hidden">
        <div className="p-5 border-b border-surface-container flex items-center justify-between">
          <h3 className="font-bold text-on-surface">Manual Entry ({rows.length} rows)</h3>
          <button onClick={addRow} className="flex items-center gap-2 px-4 py-2 bg-on-primary-container/10 text-on-primary-container font-bold text-sm rounded-xl hover:bg-on-primary-container/20 transition-colors">
            <Plus className="w-4 h-4" /> Add Row
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low/50">
              <tr>
                {['#', 'Full Name', 'Email Address', 'Plan', ''].map((col) => (
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
                      placeholder="email@example.com"
                      type="email"
                      className="w-full px-3 py-2 bg-surface-container rounded-lg border-none focus:ring-2 focus:ring-on-primary-container/20 text-sm"
                    />
                  </td>
                  <td className="px-5 py-3">
                    <select
                      value={row.plan}
                      onChange={(e) => updateRow(row.id, 'plan', e.target.value)}
                      className="px-3 py-2 bg-surface-container rounded-lg border-none focus:ring-2 focus:ring-on-primary-container/20 text-sm font-medium"
                    >
                      <option value="trial">7-Day Trial</option>
                      <option value="paid">Premium Plus</option>
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

      {/* Success flash */}
      {done && (
        <div className="flex items-center gap-3 p-4 bg-tertiary-fixed text-on-tertiary-fixed-variant rounded-xl font-bold">
          <CheckCircle2 className="w-5 h-5" />
          {rows.length} student account{rows.length !== 1 ? 's' : ''} created successfully! Welcome emails sent.
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pb-4">
        <Link href="/admin/users" className="flex-1 py-3.5 rounded-xl border border-outline-variant/20 font-bold text-sm text-on-surface hover:bg-surface-container transition-colors text-center">
          Cancel
        </Link>
        <button
          onClick={handleGenerate}
          disabled={rows.every((r) => !r.name && !r.email)}
          className={cn(
            'flex-1 py-3.5 font-bold text-sm rounded-xl transition-all active:scale-95',
            rows.some((r) => r.name && r.email)
              ? 'bg-[#c0622f] text-white shadow-lg shadow-[#c0622f]/20 hover:opacity-90'
              : 'bg-surface-container-high text-outline cursor-not-allowed'
          )}
        >
          Generate {rows.filter((r) => r.name && r.email).length || ''} Account{rows.filter((r) => r.name && r.email).length !== 1 ? 's' : ''}
        </button>
      </div>
    </div>
  )
}
