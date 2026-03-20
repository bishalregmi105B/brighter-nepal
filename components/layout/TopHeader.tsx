'use client'
// Component: TopHeader — Sticky top header for student and admin layouts
// Based exactly on student_dashboard, student_resources, and admin_panel designs
import { Bell, Settings, Search } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { currentUser } from '@/lib/data/mockUsers'

interface TopHeaderProps {
  role:         'student' | 'admin'
  pageTitle?:   string
  showSearch?:  boolean
}

export function TopHeader({ role, pageTitle, showSearch = true }: TopHeaderProps) {
  return (
    <header
      className={cn(
        'sticky top-0 w-full z-40',
        'bg-white/80 backdrop-blur-md',
        'shadow-[0_12px_32px_rgba(25,28,30,0.06)]',
        'border-b border-slate-200/15',
        'flex justify-between items-center px-8 py-4'
      )}
    >
      {/* Left: Title or Search */}
      <div className="flex items-center gap-6 flex-1 min-w-0">
        {pageTitle && (
          <h2 className="font-headline font-bold text-xl tracking-tight text-[#1a1a4e] flex-shrink-0">
            {pageTitle}
          </h2>
        )}
        {showSearch && (
          <div className={cn('relative', pageTitle ? 'hidden md:block w-80' : 'w-full max-w-md')}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder={role === 'admin' ? 'Search students, emails, or IDs...' : 'Search resources, classes...'}
              className="w-full pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-full text-sm focus:ring-2 focus:ring-on-primary-container/20 focus:bg-white transition-all font-body"
            />
          </div>
        )}
      </div>

      {/* Right: Actions + User */}
      <div className="flex items-center gap-4 flex-shrink-0">
        <button className="p-2 text-slate-500 hover:text-[#c0622f] transition-colors active:scale-95">
          <Bell className="w-5 h-5" />
        </button>
        <button className="p-2 text-slate-500 hover:text-[#c0622f] transition-colors active:scale-95">
          <Settings className="w-5 h-5" />
        </button>
        <div className="h-8 w-[1px] bg-slate-200 mx-1" />
        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-[#1a1a4e]">{currentUser.name}</p>
            <p className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">
              {role === 'admin' ? 'Super Admin' : 'NEB Grade 12'}
            </p>
          </div>
          <div className="w-9 h-9 rounded-full bg-on-primary-container flex items-center justify-center text-white text-sm font-bold ring-2 ring-white shadow-sm flex-shrink-0">
            {currentUser.initials}
          </div>
        </div>
      </div>
    </header>
  )
}
