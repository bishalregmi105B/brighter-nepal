'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2, Eye, EyeOff, Loader2, Save, ShieldAlert } from 'lucide-react'
import { settingsService } from '@/services/settingsService'

type SettingsForm = {
  client_id: string
  client_secret: string
  refresh_token: string
}

const EMPTY_FORM: SettingsForm = {
  client_id: '',
  client_secret: '',
  refresh_token: '',
}

export default function AdminSettingsPage() {
  const searchParams = useSearchParams()
  const [form, setForm] = useState<SettingsForm>(EMPTY_FORM)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [authenticating, setAuthenticating] = useState(false)
  const [showSecret, setShowSecret] = useState(false)
  const [showRefreshToken, setShowRefreshToken] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [configured, setConfigured] = useState(false)

  const setField = (key: keyof SettingsForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  useEffect(() => {
    settingsService.getGoogleFormsSettings()
      .then((res) => {
        const data = res.data ?? EMPTY_FORM
        setForm({
          client_id: data.client_id || '',
          client_secret: data.client_secret || '',
          refresh_token: data.refresh_token || '',
        })
        setConfigured(Boolean(data.configured))
      })
      .catch(() => {
        setError('Failed to load Google Forms settings.')
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const status = (searchParams.get('google_oauth') || '').trim()
    if (!status) return
    if (status === 'success') {
      setMessage('Google authorization succeeded and refresh token was saved.')
      setError('')
      settingsService.getGoogleFormsSettings()
        .then((res) => {
          const data = res.data ?? EMPTY_FORM
          setForm({
            client_id: data.client_id || '',
            client_secret: data.client_secret || '',
            refresh_token: data.refresh_token || '',
          })
          setConfigured(Boolean(data.configured))
        })
        .catch(() => {})
    } else {
      const reason = (searchParams.get('reason') || 'Google authorization failed').replace(/_/g, ' ')
      setError(`Google auth failed: ${reason}`)
      setMessage('')
    }
  }, [searchParams])

  async function saveSettings() {
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const res = await settingsService.updateGoogleFormsSettings({
        client_id: form.client_id,
        client_secret: form.client_secret,
        refresh_token: form.refresh_token,
      })
      const data = res.data ?? EMPTY_FORM
      setForm({
        client_id: data.client_id || '',
        client_secret: data.client_secret || '',
        refresh_token: data.refresh_token || '',
      })
      setConfigured(Boolean(data.configured))
      setMessage('Google Forms settings saved successfully.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings.')
    } finally {
      setSaving(false)
    }
  }

  async function authenticateWithGoogle() {
    setAuthenticating(true)
    setError('')
    setMessage('')
    try {
      await settingsService.updateGoogleFormsSettings({
        client_id: form.client_id,
        client_secret: form.client_secret,
      })
      const res = await settingsService.getGoogleFormsOAuthUrl()
      const authUrl = res.data?.auth_url || ''
      if (!authUrl) {
        throw new Error('Could not generate Google OAuth URL.')
      }
      window.location.href = authUrl
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start Google authentication.')
      setAuthenticating(false)
    }
  }

  return (
    <div className="p-4 md:p-6 lg:p-10 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-headline font-black text-[#1a1a4e] tracking-tight">Settings</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">Manage platform-level credentials used by admin features.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_12px_32px_rgba(25,28,30,0.06)] border border-slate-100 p-5 md:p-6">
        <div className="flex items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-lg font-headline font-black text-[#1a1a4e]">Google Forms Integration</h2>
            <p className="text-xs text-slate-500 mt-1">These values are saved in your database and used for import/sync APIs.</p>
          </div>
          <div className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${configured ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
            {configured ? 'Configured' : 'Not Configured'}
          </div>
        </div>

        {loading ? (
          <div className="h-40 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-[#1a1a4e]" />
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-1.5">Client ID</label>
              <input
                value={form.client_id}
                onChange={(e) => setField('client_id', e.target.value)}
                placeholder="6545...apps.googleusercontent.com"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#c0622f]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-1.5">Client Secret</label>
              <div className="relative">
                <input
                  type={showSecret ? 'text' : 'password'}
                  value={form.client_secret}
                  onChange={(e) => setField('client_secret', e.target.value)}
                  placeholder="GOCSPX-..."
                  className="w-full px-4 pr-11 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#c0622f]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#1a1a4e]"
                  title={showSecret ? 'Hide value' : 'Show value'}
                >
                  {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-1.5">Refresh Token</label>
              <div className="relative">
                <input
                  type={showRefreshToken ? 'text' : 'password'}
                  value={form.refresh_token}
                  onChange={(e) => setField('refresh_token', e.target.value)}
                  placeholder="1//0..."
                  className="w-full px-4 pr-11 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#c0622f]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowRefreshToken((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#1a1a4e]"
                  title={showRefreshToken ? 'Hide value' : 'Show value'}
                >
                  {showRefreshToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">You can paste token manually or generate it using Google authentication below.</p>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                <ShieldAlert className="w-4 h-4" />
                {error}
              </div>
            )}
            {message && (
              <div className="flex items-center gap-2 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                <CheckCircle2 className="w-4 h-4" />
                {message}
              </div>
            )}

            <div className="pt-2">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={saveSettings}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1a1a4e] text-white text-sm font-bold hover:bg-[#141432] disabled:opacity-70"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>
                <button
                  onClick={authenticateWithGoogle}
                  disabled={authenticating || !form.client_id.trim() || !form.client_secret.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-bold text-[#1a1a4e] hover:bg-slate-50 disabled:opacity-70"
                >
                  {authenticating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  {authenticating ? 'Redirecting...' : 'Authenticate & Generate Token'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
