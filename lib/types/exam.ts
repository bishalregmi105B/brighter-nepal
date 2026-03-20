// Types: exam — Exam, Question, Answer types
import type { QuestionStatus } from '@/lib/utils/examUtils'

export type QuestionType = 'mcq' | 'multi-select'

export interface Option {
  id:    string
  label: string
  text:  string
}

export interface Question {
  id:          string
  number:      number
  subject:     string
  text:        string
  options:     Option[]
  correctId:   string
  marks:       number
  explanation?: string
}

export interface ExamSession {
  examId:       string
  questionId:   string
  selectedId?:  string
  status:       QuestionStatus
  timeSpent?:   number
}

export interface Exam {
  id:          string
  title:       string
  type:        'model-set' | 'weekly-test'
  subjects:    string[]
  duration:    number
  totalMarks:  number
  questions:   Question[]
  startTime?:  string
  endTime?:    string
  isActive:    boolean
}

export interface ExamResult {
  examId:      string
  userId:      string
  score:       number
  totalMarks:  number
  percentage:  number
  passed:      boolean
  rank?:       number
  timeSpent:   number
  submittedAt: string
  answers:     ExamSession[]
  subjectScores: {
    subject:  string
    correct:  number
    wrong:    number
    skipped:  number
    total:    number
  }[]
}
