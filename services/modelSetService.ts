import { api } from './api'

export interface ReviewQuestion {
  number: number
  subject?: string
  text: string
  chosen: string
  correct: string
  isCorrect: boolean
}

export interface ModelSetQuestion {
  id: number
  text: string
  options: string[]
  answer_index: number
  subject: string
}

export interface GoogleQuestionInventory {
  id: number
  google_question_id: string
  title: string
  description: string
  question_type: string
  choice_type: string
  options: string[]
  correct_answer: string
  point_value: number
  order_index: number
  local_question_id?: number | null
  is_supported: boolean
  is_imported: boolean
}

export interface GoogleSyncSummary {
  imported?: number
  skipped_unsupported?: number
  total_detected?: number
  processed?: number
  matched?: number
  unmatched?: number
  created?: number
  updated?: number
  email_collection_type?: string
  is_quiz?: boolean
}

export interface ExamResult {
  has_result: boolean
  score?: number
  total?: number
  percentage?: number
  source?: string
  matched_by?: string | null
  submitted_at?: string | null
  review_questions?: ReviewQuestion[]
}

export interface ModelSet {
  id: number; title: string; difficulty: string; duration_min: number
  total_questions: number; status: string; targets: string[]; created_at: string
  question_count?: number
  forms_url?: string
  questions?: ModelSetQuestion[]
  google_match_mode?: string
  google_student_id_question_id?: string | null
  google_questions_last_imported_at?: string | null
  google_results_last_synced_at?: string | null
  google_last_sync_summary?: GoogleSyncSummary
  google_questions?: GoogleQuestionInventory[]
}
export interface PaginatedModelSets {
  data: { items: ModelSet[]; total: number; page: number }
}
export interface ModelSetAttempt {
  id: number; user_id: number; model_set_id: number; score: number; total: number; completed_at: string
  source?: string
  matched_by?: string | null
  user_name?: string
  student_id?: string | null
  email?: string
}

export const modelSetService = {
  /** Accepts string tab/sort OR an object with page/search/limit/status for admin pages */
  getModelSets: (tabOrParams: string | { page?: number; search?: string; limit?: number; tab?: string; sort?: string; status?: string } = 'all', sort = 'newest') => {
    if (typeof tabOrParams === 'string') {
      const tab = tabOrParams
      return api.get<{ data: ModelSet[] | { items: ModelSet[]; total: number } }>(`/api/model-sets?tab=${tab}&sort=${sort}`)
    }
    const { page = 1, search = '', limit = 10, tab = 'all', status = 'published' } = tabOrParams
    const q = new URLSearchParams({ page: String(page), search, limit: String(limit), tab, status }).toString()
    return api.get<{ data: ModelSet[] | { items: ModelSet[]; total: number } }>(`/api/model-sets?${q}`)
  },
  getTargets: () => api.get<{ data: string[] }>('/api/model-sets/targets'),
  getModelSet: (id: number) =>
    api.get<{ data: ModelSet }>(`/api/model-sets/${id}`),
  createModelSet: (payload: Partial<ModelSet>) =>
    api.post<{ data: ModelSet }>('/api/model-sets', payload),
  updateModelSet: (id: number, payload: Partial<ModelSet>) =>
    api.patch<{ data: ModelSet }>(`/api/model-sets/${id}`, payload),
  deleteModelSet: (id: number) =>
    api.delete(`/api/model-sets/${id}`),
  importGoogleQuestions: (id: number) =>
    api.post<{ data: { item: ModelSet; summary: GoogleSyncSummary } }>(`/api/model-sets/${id}/google/import-questions`, {}),
  syncGoogleResults: (id: number) =>
    api.post<{ data: { item: ModelSet; summary: GoogleSyncSummary } }>(`/api/model-sets/${id}/google/sync-results`, {}),
  getMyResult: (id: number) =>
    api.get<{ data: ExamResult }>(`/api/model-sets/${id}/results/me`),
  submitAttempt: (id: number, score: number, total: number, answers: number[]) =>
    api.post<{ data: ModelSetAttempt }>(`/api/model-sets/${id}/attempts`, { score, total, answers }),
  myAttempts: (id: number) =>
    api.get<{ data: ModelSetAttempt[] }>(`/api/model-sets/${id}/attempts/me`),
}
