'use client'
// MobileBottomNav — Fixed bottom navigation for mobile (<md) screens
// Shows 5 key links for both student and admin roles
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, BookOpen, Video, ClipboardList, User, Users, CreditCard, Megaphone, PlayCircle } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const STUDENT_ITEMS = [
  { href: '/dashboard',        label: 'Home',     Icon: LayoutDashboard },
  { href: '/recorded-lectures', label: 'Lectures',  Icon: PlayCircle },
  { href: '/live-classes',     label: 'Live',     Icon: Video },
  { href: '/weekly-tests',     label: 'Tests',    Icon: ClipboardList },
  { href: '/profile',          label: 'Profile',  Icon: User },
]

const ADMIN_ITEMS = [
  { href: '/admin/dashboard',  label: 'Home',     Icon: LayoutDashboard },
  { href: '/admin/users',      label: 'Users',    Icon: Users },
  { href: '/admin/payments',   label: 'Payments', Icon: CreditCard },
  { href: '/admin/notices',    label: 'Notices',  Icon: Megaphone },
  { href: '/admin/model-sets', label: 'Sets',     Icon: BookOpen },
]

interface MobileBottomNavProps { role: 'student' | 'admin' }

export function MobileBottomNav({ role }: MobileBottomNavProps) {
  const pathname = usePathname()
  const items = role === 'admin' ? ADMIN_ITEMS : STUDENT_ITEMS

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200/60 shadow-[0_-4px_20px_rgba(25,28,30,0.08)]">
      <div className="flex items-center justify-around px-2 py-2 safe-area-bottom">
        {items.map(({ href, label, Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-0.5 min-w-0 flex-1 py-1.5 px-1 rounded-xl transition-all',
                active ? 'text-[#c0622f]' : 'text-slate-400'
              )}
            >
              <div className={cn(
                'w-8 h-8 rounded-xl flex items-center justify-center transition-all',
                active ? 'bg-[#c0622f]/10' : ''
              )}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={cn('text-[10px] font-bold tracking-wide', active ? 'text-[#c0622f]' : 'text-slate-400')}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
