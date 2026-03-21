import { api } from './api'

export interface Group {
  id: number; name: string; description: string; member_count: number; created_at: string
}
export interface GroupMessage {
  id: number; group_id: number; user_id: number; sender_name: string; text: string; image_url: string; created_at: string
}

export const groupService = {
  /** Returns the group assigned to the currently-logged-in student (admin-controlled) */
  getMyGroup: () =>
    api.get<{ data: Group }>('/api/groups/mine'),
  getGroup: (id: number) =>
    api.get<{ data: Group }>(`/api/groups/${id}`),
  getGroupMessages: (groupId: number, limit = 30, before?: number) => {
    const q = new URLSearchParams({ limit: String(limit), ...(before ? { before: String(before) } : {}) }).toString()
    return api.get<{ data: { items: GroupMessage[] } }>(`/api/groups/${groupId}/messages?${q}`)
  },
  getMessages: (groupId: number, limit = 30, before?: number) => {
    const q = new URLSearchParams({ limit: String(limit), ...(before ? { before: String(before) } : {}) }).toString()
    return api.get<{ data: GroupMessage[] }>(`/api/groups/${groupId}/messages?${q}`)
  },
  sendMessage: (groupId: number, text: string, image_url?: string) =>
    api.post<{ data: GroupMessage }>(`/api/groups/${groupId}/messages`, { text, image_url }),
  sendImage: (groupId: number, image_url: string) =>
    api.post<{ data: GroupMessage }>(`/api/groups/${groupId}/messages/image`, { image_url }),
  createGroup: (payload: { name: string; description?: string; member_count?: number }) =>
    api.post<{ data: Group }>('/api/groups', payload),
}
