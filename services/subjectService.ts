import { api } from './api'

export const subjectService = {
  getSubjects: () =>
    api.get<{ data: string[] }>('/api/subjects'),
}
