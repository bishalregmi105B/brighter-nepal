import { api } from './api'
import { decryptApiUrl } from '@/lib/utils/urlCipher'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'

export interface Resource {
  id: number; title: string; subject: string; format: string; section: string
  file_url: string; size_label: string; downloads: number; tags: string[]; created_at: string
  live_class_id?: number | null
  description?: string
  thumbnail_url?: string
}

function normalizeResource(resource: Resource): Resource {
  return {
    ...resource,
    file_url: decryptApiUrl(resource.file_url),
  }
}

export const resourceService = {
  getResources: async (params: { subject?: string; format?: string; section?: string; search?: string; page?: number; per_page?: number; live_class_id?: number } = {}) => {
    const filtered = Object.fromEntries(
      Object.entries(params)
        .filter(([, v]) => v !== '' && v != null)
        .map(([key, value]) => [key, String(value)])
    )
    const q = new URLSearchParams(filtered as Record<string, string>).toString()
    const res = await api.get<{ data: { items: Resource[] } | Resource[] }>(`/api/resources${q ? '?' + q : ''}`)
    const payload = res.data
    if (Array.isArray(payload)) {
      return {
        ...res,
        data: payload.map(normalizeResource),
      }
    }
    return {
      ...res,
      data: {
        ...payload,
        items: (payload.items ?? []).map(normalizeResource),
      },
    }
  },
  getResource: async (id: number) => {
    const res = await api.get<{ data: Resource }>(`/api/resources/${id}`)
    return {
      ...res,
      data: normalizeResource(res.data),
    }
  },
  getSubjects: () =>
    api.get<{ data: string[] }>('/api/resources/subjects'),
  createResource: async (payload: Partial<Resource>) => {
    const res = await api.post<{ data: Resource }>('/api/resources', payload)
    return {
      ...res,
      data: normalizeResource(res.data),
    }
  },
  updateResource: async (id: number, payload: Partial<Resource>) => {
    const res = await api.patch<{ data: Resource }>(`/api/resources/${id}`, payload)
    return {
      ...res,
      data: normalizeResource(res.data),
    }
  },
  deleteResource: (id: number) =>
    api.delete(`/api/resources/${id}`),
  logDownload: async (id: number) => {
    const res = await api.post<{ data: { file_url: string; downloads: number } }>(`/api/resources/${id}/download`, {})
    return {
      ...res,
      data: {
        ...res.data,
        file_url: decryptApiUrl(res.data?.file_url),
      },
    }
  },
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
      data?: {
        file_url: string
        filename: string
        original_name: string
        size_bytes: number
        thumbnail_url?: string
      }
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
