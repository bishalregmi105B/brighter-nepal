import { api } from './api'

export interface User {
  id: number; name: string; email?: string; plan: string; status: string; role: string; group_id?: number; created_at: string
}

export interface PaginatedUsers {
  data: { items: User[]; total: number; page: number; pages: number }
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
  bulkCreate: (users: { name: string; email: string; password?: string; plan?: string }[]) =>
    api.post('/api/users/bulk', { users }),
}
