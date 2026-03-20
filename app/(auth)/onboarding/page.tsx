'use client'
// Student Onboarding — based exactly on student_onboarding/code.html
// 3-step wizard: split layout (navy left panel + form right), academic info form step (step 2 active)
import { useState } from 'react'
import { ArrowLeft, MapPin, ShieldCheck, BookOpen, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import Link from 'next/link'

// ─── Data ─────────────────────────────────────────────────────────────────────

const steps = [
  { number: 1, label: 'Personal'  },
  { number: 2, label: 'Academic'  },
  { number: 3, label: 'Finish'    },
]

const examOptions = ['IOE Entrance', 'CEE (Medical)', 'IOM Entrance', 'CSIT', 'BCA/BIT', 'Other']
const streamOptions = ['Science', 'Management', 'Humanities', 'Education', 'Law']
const sourceOptions = ['Social Media', 'Friend / Recommendation', 'Search Engine', 'Campus Ambassador', 'Advertisement']

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const [activeStep] = useState(2)
  const [selectedExams, setSelectedExams] = useState<string[]>(['IOE Entrance', 'IOM Entrance'])

  const toggleExam = (exam: string) => {
    setSelectedExams((prev) =>
      prev.includes(exam) ? prev.filter((e) => e !== exam) : [...prev, exam]
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 md:p-12 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-tertiary-fixed/20 via-surface to-surface">
      <div className="w-full max-w-4xl bg-white rounded-[24px] shadow-[0_12px_32px_rgba(25,28,30,0.06)] overflow-hidden flex flex-col md:flex-row min-h-[600px]">

        {/* ── Left: Navy Info Panel ────────────────────────── */}
        <div className="hidden md:flex md:w-1/3 bg-[#1a1a4e] p-10 flex-col justify-between text-white relative overflow-hidden">
          <div className="z-10">
            <h1 className="font-headline font-black text-3xl tracking-tighter mb-4">Brighter Nepal</h1>
            <p className="text-white/70 text-sm leading-relaxed">
              Your journey towards academic excellence starts here. Let&apos;s personalize your learning dashboard.
            </p>
          </div>

          {/* Feature list */}
          <div className="z-10 mt-12 space-y-8">
            {[
              { Icon: ShieldCheck, title: 'Secure Profile',       sub: 'Your data is protected by industry standards.' },
              { Icon: BookOpen,    title: 'Tailored Content',     sub: 'Get resources based on your target exams.' },
            ].map(({ Icon, title, sub }) => (
              <div key={title} className="flex items-start gap-4">
                <Icon className="w-5 h-5 text-on-primary-container flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm">{title}</p>
                  <p className="text-xs text-white/50">{sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Decorative glows */}
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#c0622f]/20 rounded-full blur-3xl" />
          <div className="absolute top-20 -right-20 w-48 h-48 bg-tertiary-fixed/10 rounded-full blur-2xl" />
        </div>

        {/* ── Right: Form ──────────────────────────────────── */}
        <div className="flex-grow p-8 md:p-12 overflow-y-auto">

          {/* Step indicator */}
          <div className="flex items-center justify-center mb-12 select-none">
            {steps.map((step, i) => (
              <div key={step.number} className="flex items-center">
                {i > 0 && (
                  <div className={cn(
                    'h-0.5 w-10 mx-3',
                    step.number <= activeStep ? 'bg-on-primary-container' : 'bg-surface-container-high'
                  )} />
                )}
                <div className="flex flex-col items-center">
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-2',
                    step.number === activeStep ? 'bg-[#1a1a4e] text-white'
                    : step.number < activeStep  ? 'bg-on-primary-container text-white'
                    : 'bg-surface-container-high text-on-surface-variant opacity-40'
                  )}>
                    {step.number < activeStep ? <CheckCircle2 className="w-4 h-4" /> : step.number}
                  </div>
                  <span className={cn(
                    'text-[10px] uppercase tracking-widest font-bold',
                    step.number === activeStep ? 'text-[#1a1a4e]'
                    : step.number < activeStep  ? 'text-on-primary-container'
                    : 'text-on-surface-variant opacity-40'
                  )}>
                    {step.label}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Step 2: Academic Info */}
          <div className="space-y-8">
            <div className="mb-10 text-center md:text-left">
              <h2 className="font-headline font-extrabold text-2xl text-on-surface tracking-tight">
                Academic Foundations
              </h2>
              <p className="text-on-surface-variant text-sm mt-2">
                Help us curate the right study materials for you.
              </p>
            </div>

            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Previous School */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant ml-1">
                    Previous School / College
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. St. Xavier's College"
                    className="w-full px-4 py-3 bg-surface-container-high border-none rounded-lg focus:ring-2 focus:ring-on-primary-container/20 text-on-surface placeholder:text-outline text-sm"
                  />
                </div>

                {/* Location */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant ml-1">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Kathmandu, Nepal"
                      className="w-full pl-10 pr-4 py-3 bg-surface-container-high border-none rounded-lg focus:ring-2 focus:ring-on-primary-container/20 text-on-surface placeholder:text-outline text-sm"
                    />
                  </div>
                </div>

                {/* Stream */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant ml-1">
                    Stream (+2 / Equivalent)
                  </label>
                  <select className="w-full px-4 py-3 bg-surface-container-high border-none rounded-lg focus:ring-2 focus:ring-on-primary-container/20 text-on-surface text-sm">
                    {streamOptions.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>

                {/* Heard from */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant ml-1">
                    How did you hear about us?
                  </label>
                  <select className="w-full px-4 py-3 bg-surface-container-high border-none rounded-lg focus:ring-2 focus:ring-on-primary-container/20 text-on-surface text-sm">
                    {sourceOptions.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Target Exams */}
              <div className="flex flex-col gap-4">
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant ml-1">
                  Target Entrance Exams (Select all that apply)
                </label>
                <div className="flex flex-wrap gap-2">
                  {examOptions.map((exam) => {
                    const isSelected = selectedExams.includes(exam)
                    return (
                      <button
                        key={exam}
                        type="button"
                        onClick={() => toggleExam(exam)}
                        className={cn(
                          'px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 transition-all active:scale-95',
                          isSelected
                            ? 'bg-[#1a1a4e] text-white'
                            : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
                        )}
                      >
                        {exam}
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-10 mt-8 border-t border-surface-container-high">
                <button
                  type="button"
                  className="text-on-surface-variant font-bold text-sm flex items-center gap-2 hover:text-on-surface transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Previous Step
                </button>
                <Link
                  href="/dashboard"
                  className="bg-on-primary-container text-white px-10 py-4 rounded-xl font-bold text-sm shadow-[0_8px_20px_rgba(207,110,58,0.25)] hover:scale-105 active:scale-95 transition-all"
                >
                  Continue to Summary
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>

      <footer className="absolute bottom-6 text-center w-full">
        <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant opacity-40">
          © 2024 Brighter Nepal. Secure Onboarding Portal V2.0.4
        </p>
      </footer>
    </main>
  )
}
