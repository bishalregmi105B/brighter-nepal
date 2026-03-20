// Constants: subjects — subjects list with icons and colors
export interface Subject {
  id:    string
  label: string
  color: string
  short: string
}

export const subjects: Subject[] = [
  { id: 'physics',       label: 'Physics',       color: '#1a1a4e', short: 'PHY' },
  { id: 'chemistry',     label: 'Chemistry',     color: '#2d6a6a', short: 'CHE' },
  { id: 'mathematics',   label: 'Mathematics',   color: '#c0622f', short: 'MAT' },
  { id: 'english',       label: 'English',       color: '#585990', short: 'ENG' },
  { id: 'biology',       label: 'Biology',       color: '#074f4f', short: 'BIO' },
  { id: 'social-studies',label: 'Social Studies',color: '#7a3000', short: 'SOC' },
]

export const targetExams = [
  'IOE Entrance',
  'CEE (Medical)',
  'IOM Entrance',
  'CSIT',
  'BCA/BIT',
  'Other',
]

export const streams = [
  'Science',
  'Management',
  'Humanities',
  'Education',
  'Law',
]
