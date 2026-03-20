// Types: user — User, Student, Admin types
export type UserPlan = 'trial' | 'paid' | 'inactive'
export type UserRole = 'student' | 'admin' | 'super-admin'
export type UserStatus = 'active' | 'suspended' | 'pending'

export interface User {
  id:          string
  name:        string
  email:       string
  phone:       string
  avatar?:     string
  initials:    string
  plan:        UserPlan
  role:        UserRole
  status:      UserStatus
  joinedAt:    string
  rollNumber?: string
}

export interface Student extends User {
  role:        'student'
  stream?:     string
  school?:     string
  location?:   string
  targetExams: string[]
  rank?:       number
  streak?:     number
  studyHours?: number
}

export interface Admin extends User {
  role:  'admin' | 'super-admin'
  title: string
}

export interface OnboardingData {
  school:      string
  location:    string
  stream:      string
  heardFrom:   string
  targetExams: string[]
}
