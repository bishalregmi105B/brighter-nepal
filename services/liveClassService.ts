import { api } from './api'
import { decryptApiUrl } from '@/lib/utils/urlCipher'

export interface LiveClass {
  id: number; title: string; teacher: string; subject: string; status: string
  watchers: number; duration_min: number; scheduled_at: string | null; created_at: string
  group_id?: number; stream_url?: string
}

function normalizeLiveClass(cls: LiveClass): LiveClass {
  return {
    ...cls,
    stream_url: decryptApiUrl(cls.stream_url),
  }
}

export const liveClassService = {
  /** Alias for consistent naming across pages */
  getLiveClasses: async (status = '', page = 1) => {
    const res = await api.get<{ data: { items: LiveClass[] } }>(`/api/live-classes?status=${status}&page=${page}`)
    return {
      ...res,
      data: {
        ...res.data,
        items: (res.data?.items ?? []).map(normalizeLiveClass),
      },
    }
  },
  getClasses: async (status = '', page = 1) => {
    const res = await api.get<{ data: { items: LiveClass[] } }>(`/api/live-classes?status=${status}&page=${page}`)
    return {
      ...res,
      data: {
        ...res.data,
        items: (res.data?.items ?? []).map(normalizeLiveClass),
      },
    }
  },
  getClass: async (id: number) => {
    const res = await api.get<{ data: LiveClass }>(`/api/live-classes/${id}`)
    return {
      ...res,
      data: normalizeLiveClass(res.data),
    }
  },
  createClass: async (payload: Partial<LiveClass>) => {
    const res = await api.post<{ data: LiveClass }>('/api/live-classes', payload)
    return {
      ...res,
      data: normalizeLiveClass(res.data),
    }
  },
  updateClass: async (id: number, payload: Partial<LiveClass>) => {
    const res = await api.patch<{ data: LiveClass }>(`/api/live-classes/${id}`, payload)
    return {
      ...res,
      data: normalizeLiveClass(res.data),
    }
  },
  joinClass: (id: number) =>
    api.post<{ data: { joined: boolean } }>(`/api/live-classes/${id}/join`, {}),
  myAttendance: () =>
    api.get<{ data: { class_id: number; joined_at: string }[] }>('/api/live-classes/attendance/me'),
}
