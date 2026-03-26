import { api } from './api'
import { forceLogout } from './api'

export interface AuthUser {
  id: number; name: string; email: string; plan: string; status: string; role: string
  group_id?: number; device_count?: number; created_at?: string
  student_id?: string
  onboarding_completed?: boolean
  onboarding_data?: {
    previous_school?: string
    location?: string
    stream?: string
    heard_from?: string
    target_exams?: string[]
  }
}
export interface AuthResponse {
  data: { token: string; user: AuthUser }
}

export interface CompleteOnboardingPayload {
  previous_school?: string
  location?: string
  stream?: string
  heard_from?: string
  target_exams?: string[]
}

export const authService = {
  async login(identifier: string, password: string): Promise<AuthResponse['data']> {
    const res = await api.post<AuthResponse>('/api/auth/login', { identifier, password })
    if (res.data?.token) {
      localStorage.setItem('bn_token', res.data.token)
      localStorage.setItem('bn_user', JSON.stringify(res.data.user))
    }
    return res.data
  },

  async signup(name: string, email: string, password: string): Promise<AuthResponse['data']> {
    const res = await api.post<AuthResponse>('/api/auth/signup', { name, email, password })
    if (res.data?.token) {
      localStorage.setItem('bn_token', res.data.token)
      localStorage.setItem('bn_user', JSON.stringify(res.data.user))
    }
    return res.data
  },

  async getMe(): Promise<AuthUser> {
    const res = await api.get<{ data: AuthUser }>('/api/auth/me')
    if (res.data) localStorage.setItem('bn_user', JSON.stringify(res.data))
    return res.data
  },

  async completeOnboarding(payload: CompleteOnboardingPayload): Promise<AuthUser> {
    const res = await api.post<{ data: AuthUser }>('/api/auth/complete-onboarding', payload)
    if (res.data) localStorage.setItem('bn_user', JSON.stringify(res.data))
    return res.data
  },

  async logout(): Promise<void> {
    try { await api.post('/api/auth/logout', {}) } catch {}
    localStorage.removeItem('bn_token')
    localStorage.removeItem('bn_user')
  },
}
