import { api } from './api'

export interface ReviewQuestion {
  number: number; subject?: string; text: string; chosen: string; correct: string; isCorrect: boolean
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

export interface WeeklyTest {
  id: number; title: string; subject: string; duration_min: number; status: string
  scheduled_at: string | null; question_count: number; total_questions: number
  questions?: Question[]; created_at: string; my_score?: number; my_rank?: number
  review_questions?: ReviewQuestion[]
  forms_edit_url?: string
  forms_view_url?: string
  forms_url?: string
  google_match_mode?: string
  google_student_id_question_id?: string | null
  google_questions_last_imported_at?: string | null
  google_results_last_synced_at?: string | null
  google_last_sync_summary?: GoogleSyncSummary
  google_questions?: GoogleQuestionInventory[]
}
export interface Question {
  id: number; text: string; options: string[]; answer_index: number
}
export interface WeeklyTestAttempt {
  id: number; user_id: number; test_id: number; score: number; total: number; submitted_at: string
  source?: string
  matched_by?: string | null
  user_name?: string
  student_id?: string | null
  email?: string
}

export const weeklyTestService = {
  getTests: (subject = '', page = 1) =>
    api.get<{ data: { items: WeeklyTest[]; total: number } }>(`/api/weekly-tests?subject=${subject}&page=${page}`),
  /** Accepts string or number ID */
  getTest: (id: number | string) =>
    api.get<{ data: WeeklyTest }>(`/api/weekly-tests/${id}`),
  createTest: (payload: Partial<WeeklyTest> & { questions?: Partial<Question>[] }) =>
    api.post<{ data: WeeklyTest }>('/api/weekly-tests', payload),
  updateTest: (id: number, payload: Partial<WeeklyTest>) =>
    api.patch<{ data: WeeklyTest }>(`/api/weekly-tests/${id}`, payload),
  importGoogleQuestions: (id: number) =>
    api.post<{ data: { item: WeeklyTest; summary: GoogleSyncSummary } }>(`/api/weekly-tests/${id}/google/import-questions`, {}),
  syncGoogleResults: (id: number) =>
    api.post<{ data: { item: WeeklyTest; summary: GoogleSyncSummary } }>(`/api/weekly-tests/${id}/google/sync-results`, {}),
  getMyResult: (id: number | string) =>
    api.get<{ data: ExamResult }>(`/api/weekly-tests/${id}/results/me`),
  getParticipants: (id: number) =>
    api.get<{ data: WeeklyTestAttempt[] }>(`/api/weekly-tests/${id}/participants`),
  submitAttempt: (id: number, score: number, total: number, answers: number[]) =>
    api.post<{ data: WeeklyTestAttempt }>(`/api/weekly-tests/${id}/attempts`, { score, total, answers }),
  myAttempt: (id: number) =>
    api.get<{ data: WeeklyTestAttempt }>(`/api/weekly-tests/${id}/attempts/me`),
}
