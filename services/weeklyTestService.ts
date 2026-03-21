import { api } from './api'

export interface ReviewQuestion {
  number: number; text: string; chosen: string; correct: string; isCorrect: boolean
}

export interface WeeklyTest {
  id: number; title: string; subject: string; duration_min: number; status: string
  scheduled_at: string | null; question_count: number; total_questions: number
  questions?: Question[]; created_at: string; my_score?: number; my_rank?: number
  review_questions?: ReviewQuestion[]
  forms_url?: string
}
export interface Question {
  id: number; text: string; options: string[]; answer_index: number
}
export interface WeeklyTestAttempt {
  id: number; user_id: number; test_id: number; score: number; total: number; submitted_at: string
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
  getParticipants: (id: number) =>
    api.get<{ data: WeeklyTestAttempt[] }>(`/api/weekly-tests/${id}/participants`),
  submitAttempt: (id: number, score: number, total: number, answers: number[]) =>
    api.post<{ data: WeeklyTestAttempt }>(`/api/weekly-tests/${id}/attempts`, { score, total, answers }),
  myAttempt: (id: number) =>
    api.get<{ data: WeeklyTestAttempt }>(`/api/weekly-tests/${id}/attempts/me`),
}
