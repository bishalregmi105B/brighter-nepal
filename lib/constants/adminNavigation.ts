// Constants: adminNavigation — Admin nav items with sub-items
import {
  LayoutDashboard,
  Users,
  CreditCard,
  BookOpen,
  FileText,
  ClipboardList,
  Bell,
  Video,
  MessageSquare,
  Settings,
  type LucideIcon,
} from 'lucide-react'

export interface AdminSubItem {
  href:  string
  label: string
}

export interface AdminNavItem {
  href:      string
  label:     string
  icon:      LucideIcon
  subItems?: AdminSubItem[]
}

export const adminNavItems: AdminNavItem[] = [
  { href: '/admin/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  {
    href:  '/admin/users',
    label: 'Users',
    icon:  Users,
    subItems: [
      { href: '/admin/users',               label: 'All Users' },
      { href: '/admin/users?tab=trial',     label: 'Trial' },
      { href: '/admin/users?tab=paid',      label: 'Paid' },
      { href: '/admin/users/bulk-generate', label: 'Bulk Generate' },
    ],
  },
  { href: '/admin/payments',      label: 'Payments',      icon: CreditCard },
  { href: '/admin/resources',     label: 'Resources',     icon: BookOpen },
  { href: '/admin/model-sets',    label: 'Model Sets',    icon: FileText },
  { href: '/admin/weekly-tests',  label: 'Weekly Tests',  icon: ClipboardList },
  { href: '/admin/notices',       label: 'Notices',       icon: Bell },
  { href: '/admin/live-classes',  label: 'Live Classes',  icon: Video },
  { href: '/admin/groups',        label: 'Groups',        icon: MessageSquare },
  { href: '/admin/settings',      label: 'Settings',      icon: Settings },
]
