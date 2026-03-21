import { api } from './api'

export interface ModelSet {
  id: number; title: string; difficulty: string; duration_min: number
  total_questions: number; status: string; targets: string[]; created_at: string
}
export interface PaginatedModelSets {
  data: { items: ModelSet[]; total: number; page: number }
}
export interface ModelSetAttempt {
  id: number; user_id: number; model_set_id: number; score: number; total: number; completed_at: string
}

export const modelSetService = {
  /** Accepts string tab/sort OR an object with page/search/limit for admin pages */
  getModelSets: (tabOrParams: string | { page?: number; search?: string; limit?: number; tab?: string; sort?: string } = 'all', sort = 'newest') => {
    if (typeof tabOrParams === 'string') {
      const tab = tabOrParams
      return api.get<{ data: ModelSet[] | { items: ModelSet[]; total: number } }>(`/api/model-sets?tab=${tab}&sort=${sort}`)
    }
    const { page = 1, search = '', limit = 10, tab = 'all' } = tabOrParams
    const q = new URLSearchParams({ page: String(page), search, limit: String(limit), tab }).toString()
    return api.get<{ data: ModelSet[] | { items: ModelSet[]; total: number } }>(`/api/model-sets?${q}`)
  },
  getModelSet: (id: number) =>
    api.get<{ data: ModelSet }>(`/api/model-sets/${id}`),
  createModelSet: (payload: Partial<ModelSet>) =>
    api.post<{ data: ModelSet }>('/api/model-sets', payload),
  updateModelSet: (id: number, payload: Partial<ModelSet>) =>
    api.patch<{ data: ModelSet }>(`/api/model-sets/${id}`, payload),
  deleteModelSet: (id: number) =>
    api.delete(`/api/model-sets/${id}`),
  submitAttempt: (id: number, score: number, total: number, answers: number[]) =>
    api.post<{ data: ModelSetAttempt }>(`/api/model-sets/${id}/attempts`, { score, total, answers }),
  myAttempts: (id: number) =>
    api.get<{ data: ModelSetAttempt[] }>(`/api/model-sets/${id}/attempts/me`),
}
