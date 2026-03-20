// Types: notice — Notice and announcement types
export type NoticeCategory = 'urgent' | 'important' | 'general'
export type NoticeStatus  = 'read' | 'unread'

export interface Notice {
  id:         string
  title:      string
  body:       string
  category:   NoticeCategory
  status:     NoticeStatus
  icon?:      string
  pinned:     boolean
  department?: string
  createdAt:  string
}
