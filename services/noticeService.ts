import { api } from './api'

export interface Notice {
  id: number; title: string; body: string; category: string; department: string
  link_url: string; pinned: boolean; is_pinned: boolean; created_at: string
}

export const noticeService = {
  getNotices: (params: { category?: string; search?: string } | string = '') => {
    const category = typeof params === 'string' ? params : params.category ?? ''
    const search   = typeof params === 'object'  ? params.search ?? '' : ''
    const q        = new URLSearchParams({ ...(category ? { category } : {}), ...(search ? { search } : {}) }).toString()
    return api.get<{ data: Notice[] | { items: Notice[] } }>(`/api/notices${q ? '?' + q : ''}`)
  },
  getNotice: (id: number) =>
    api.get<{ data: Notice }>(`/api/notices/${id}`),
  createNotice: (payload: Partial<Notice>) =>
    api.post<{ data: Notice }>('/api/notices', payload),
  updateNotice: (id: number, payload: Partial<Notice>) =>
    api.patch<{ data: Notice }>(`/api/notices/${id}`, payload),
  deleteNotice: (id: number) =>
    api.delete(`/api/notices/${id}`),
}
