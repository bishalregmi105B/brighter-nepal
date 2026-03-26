import { api, ApiError, forceLogout } from './api'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'

export interface User {
  id: number
  student_id?: string
  name: string
  email: string
  plan: string
  status: string
  role: string
  group_id?: number | null
  onboarding_completed?: boolean
  onboarding_data?: {
    previous_school?: string
    location?: string
    stream?: string
    heard_from?: string
    target_exams?: string[]
  }
  created_at: string
  // Admin-only fields (returned when admin=True on backend)
  whatsapp?: string
  paid_amount?: number
  plain_password?: string
  joined_method?: string
}

export interface ContactMethod {
  id: number
  name: string
  channel: string   // whatsapp | messenger | facebook | other
  is_active: boolean
}

export interface PaginatedUsers {
  data: { items: User[]; total: number; page: number; pages: number }
}

export interface UserStats {
  total_users: number
  paid_users: number
  trial_users: number
  total_payment: number
  today_payment: number
  today_enroll: number
}

export const userService = {
  getUsers: (params: { tab?: string; search?: string; page?: number; limit?: number } = {}) => {
    const q = new URLSearchParams(params as Record<string, string>).toString()
    return api.get<PaginatedUsers>(`/api/users?${q}`)
  },
  getUser: (id: number) => api.get<{ data: User }>(`/api/users/${id}`),
  updateUser: (id: number, payload: Partial<User> & { admin_note?: string; password?: string; paid_amount?: number }) =>
    api.patch<{ data: User }>(`/api/users/${id}`, payload),
  deleteUser: (id: number) => api.delete(`/api/users/${id}`),
  bulkCreate: (users: { name: string; email?: string; password?: string; plan?: string; whatsapp?: string }[]) =>
    api.post('/api/users/bulk', { users }),
  getStats: () =>
    api.get<{ data: UserStats }>('/api/users/stats'),
  shiftToPaid: (id: number, amount: number, method = 'cash') =>
    api.post<{ data: User }>(`/api/users/${id}/shift-to-paid`, { amount, method }),
  // Contact methods (admin-configurable joined_via dropdown)
  getContactMethods: () =>
    api.get<{ data: ContactMethod[] }>('/api/users/contact-methods'),
  createContactMethod: (name: string, channel: string) =>
    api.post<{ data: ContactMethod }>('/api/users/contact-methods', { name, channel }),
  updateContactMethod: (id: number, payload: { name?: string; channel?: string }) =>
    api.patch<{ data: ContactMethod }>(`/api/users/contact-methods/${id}`, payload),
  deleteContactMethod: (id: number) =>
    api.delete(`/api/users/contact-methods/${id}`),
  exportUsers: async (params: { tab?: string; search?: string } = {}) => {
    if (typeof window === 'undefined') {
      throw new Error('Export can only run in browser')
    }

    const filtered = Object.fromEntries(
      Object.entries(params)
        .filter(([, v]) => v !== '' && v != null)
        .map(([key, value]) => [key, String(value)])
    )
    const query = new URLSearchParams(filtered as Record<string, string>).toString()
    const token = localStorage.getItem('bn_token')
    const url = `${API_URL}/api/users/export${query ? `?${query}` : ''}`
    const res = await fetch(url, {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })

    if (res.status === 401) {
      forceLogout('session_expired')
      throw new ApiError('Session expired. Please log in again.', 401)
    }
    if (!res.ok) {
      let message = 'Failed to export users'
      try {
        const body = await res.json()
        message = body?.message || message
      } catch {}
      throw new ApiError(message, res.status)
    }

    const blob = await res.blob()
    const disposition = res.headers.get('content-disposition') || ''
    const filenameMatch = disposition.match(/filename="?([^"]+)"?/)
    const filename = filenameMatch?.[1] || `users_export_${new Date().toISOString().slice(0, 10)}.csv`

    const objectUrl = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = objectUrl
    anchor.download = filename
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(objectUrl)
  },
}
