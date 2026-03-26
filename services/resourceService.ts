import { api } from './api'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'

export interface Resource {
  id: number; title: string; subject: string; format: string; section: string
  file_url: string; size_label: string; downloads: number; tags: string[]; created_at: string
  live_class_id?: number
  description?: string
  thumbnail_url?: string
}

export const resourceService = {
  getResources: (params: { subject?: string; format?: string; section?: string; search?: string; page?: number; live_class_id?: number } = {}) => {
    const filtered = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null))
    const q = new URLSearchParams(filtered as Record<string, string>).toString()
    return api.get<{ data: { items: Resource[] } | Resource[] }>(`/api/resources${q ? '?' + q : ''}`)
  },
  getResource: (id: number) =>
    api.get<{ data: Resource }>(`/api/resources/${id}`),
  getSubjects: () =>
    api.get<{ data: string[] }>('/api/resources/subjects'),
  createResource: (payload: Partial<Resource>) =>
    api.post<{ data: Resource }>('/api/resources', payload),
  updateResource: (id: number, payload: Partial<Resource>) =>
    api.patch<{ data: Resource }>(`/api/resources/${id}`, payload),
  deleteResource: (id: number) =>
    api.delete(`/api/resources/${id}`),
  logDownload: (id: number) =>
    api.post<{ data: { file_url: string; downloads: number } }>(`/api/resources/${id}/download`, {}),
  uploadPdf: async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    const token = typeof window !== 'undefined' ? localStorage.getItem('bn_token') : null

    const res = await fetch(`${API_URL}/api/resources/upload-pdf`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    })

    let body: {
      success?: boolean
      message?: string
      data?: { file_url: string; filename: string; original_name: string; size_bytes: number }
    } = {}
    try {
      body = await res.json()
    } catch {}

    if (!res.ok || !body?.success || !body?.data?.file_url) {
      throw new Error(body?.message || 'Failed to upload PDF')
    }
    return body.data
  },
}
