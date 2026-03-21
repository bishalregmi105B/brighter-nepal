import { api } from './api'

export interface User {
  id: number
  name: string
  email: string
  plan: string
  status: string
  role: string
  group_id?: number
  created_at: string
  // Admin-only fields (returned when admin=True on backend)
  whatsapp?: string
  paid_amount?: number
  plain_password?: string
  joined_method?: string
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
  updateUser: (id: number, payload: Partial<User> & { admin_note?: string; password?: string }) =>
    api.patch<{ data: User }>(`/api/users/${id}`, payload),
  deleteUser: (id: number) => api.delete(`/api/users/${id}`),
  bulkCreate: (users: { name: string; email: string; password?: string; plan?: string; whatsapp?: string }[]) =>
    api.post('/api/users/bulk', { users }),
  getStats: () =>
    api.get<{ data: UserStats }>('/api/users/stats'),
  shiftToPaid: (id: number, amount: number, method = 'cash') =>
    api.post<{ data: User }>(`/api/users/${id}/shift-to-paid`, { amount, method }),
}
