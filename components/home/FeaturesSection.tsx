// Component: FeaturesSection — from public_homepage/code.html
import { BookOpen, Video, FileText, Users, Bell, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const features = [
  {
    icon:    BookOpen,
    color:   'bg-on-primary-container/10 text-on-primary-container',
    title:   '2,500+ Study Resources',
    desc:    'Hand-picked PDFs, video lectures, and notes curated by Nepal\'s top educators across all entrance exams.',
  },
  {
    icon:    Video,
    color:   'bg-[#2d6a6a]/10 text-[#2d6a6a]',
    title:   'Live Interactive Classes',
    desc:    'Attend live sessions, ask questions privately, and get real-time feedback from subject experts.',
  },
  {
    icon:    FileText,
    color:   'bg-[#1a1a4e]/10 text-[#1a1a4e]',
    title:   'Comprehensive Model Sets',
    desc:    '100-question IOE, CEE, IOM model sets with auto-scoring, detailed explanations, and performance analytics.',
  },
  {
    icon:    Users,
    color:   'bg-secondary/10 text-secondary',
    title:   'Study Groups',
    desc:    'Connect with peers in subject-specific channels. Admin-moderated content with emoji reactions.',
  },
  {
    icon:    Bell,
    color:   'bg-orange-100 text-[#c0622f]',
    title:   'Smart Notifications',
    desc:    'Never miss an exam deadline, result release, or live class. Pinned urgent notices delivered instantly.',
  },
  {
    icon:    Trophy,
    color:   'bg-tertiary-fixed/30 text-on-tertiary-fixed-variant',
    title:   'Rank & Analytics',
    desc:    'See your rank among all students. Track accuracy per subject, study streaks, and performance trends.',
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-[#f8f9fb]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-3 py-1 bg-on-primary-container text-white text-[10px] font-black tracking-widest uppercase rounded-full mb-4">
            Why Brighter Nepal
          </span>
          <h2 className="font-headline font-black text-4xl md:text-5xl text-[#1a1a4e] tracking-tight mb-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-on-surface-variant text-lg max-w-2xl mx-auto leading-relaxed">
            A complete academic ecosystem built specifically for Nepal&apos;s entrance exam landscape.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat, i) => {
            const Icon = feat.icon
            return (
              <div
                key={i}
                className="bg-white rounded-2xl p-8 shadow-[0_12px_32px_rgba(25,28,30,0.04)] hover:shadow-[0_20px_48px_rgba(25,28,30,0.08)] transition-all duration-300 group"
              >
                <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center mb-6', feat.color)}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="font-headline font-bold text-xl text-[#1a1a4e] mb-3 group-hover:text-on-primary-container transition-colors">
                  {feat.title}
                </h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
