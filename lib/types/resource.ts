// Types: resource — Resource types
export type ResourceFormat = 'pdf' | 'video' | 'notes' | 'quiz'

export interface Resource {
  id:        string
  title:     string
  subject:   string
  topic?:    string
  format:    ResourceFormat
  size?:     string
  duration?: string
  thumbnail?: string
  views?:    number
  downloads?: number
  createdAt: string
  tags:      string[]
}
