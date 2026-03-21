import { api } from './api'

export interface LiveClass {
  id: number; title: string; teacher: string; subject: string; status: string
  watchers: number; duration_min: number; scheduled_at: string | null; created_at: string
  group_id?: number; stream_url?: string
}

export const liveClassService = {
  /** Alias for consistent naming across pages */
  getLiveClasses: (status = '', page = 1) =>
    api.get<{ data: { items: LiveClass[] } }>(`/api/live-classes?status=${status}&page=${page}`),
  getClasses: (status = '', page = 1) =>
    api.get<{ data: { items: LiveClass[] } }>(`/api/live-classes?status=${status}&page=${page}`),
  getClass: (id: number) =>
    api.get<{ data: LiveClass }>(`/api/live-classes/${id}`),
  createClass: (payload: Partial<LiveClass>) =>
    api.post<{ data: LiveClass }>('/api/live-classes', payload),
  updateClass: (id: number, payload: Partial<LiveClass>) =>
    api.patch<{ data: LiveClass }>(`/api/live-classes/${id}`, payload),
  joinClass: (id: number) =>
    api.post<{ data: { joined: boolean } }>(`/api/live-classes/${id}/join`, {}),
  myAttendance: () =>
    api.get<{ data: { class_id: number; joined_at: string }[] }>('/api/live-classes/attendance/me'),
}
