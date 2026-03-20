// Constants: navigation — Student nav items array
import {
  LayoutDashboard,
  BookOpen,
  Video,
  FileText,
  ClipboardList,
  Bell,
  Users,
  User,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

export const studentNavItems: NavItem[] = [
  { href: '/dashboard',     label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/resources',     label: 'Resources',    icon: BookOpen },
  { href: '/live-classes',  label: 'Live Classes', icon: Video },
  { href: '/model-sets',    label: 'Model Sets',   icon: FileText },
  { href: '/weekly-tests',  label: 'Weekly Tests', icon: ClipboardList },
  { href: '/notices',       label: 'Notices',      icon: Bell },
  { href: '/groups',        label: 'Groups',       icon: Users },
  { href: '/profile',       label: 'My Profile',   icon: User },
]
