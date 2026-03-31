'use client'
// Student Onboarding — full-screen onboarding flow with persisted payload.
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, ShieldCheck, BookOpen, CheckCircle2, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { authService } from '@/services/authService'

const steps = [
  { number: 1, label: 'Personal' },
  { number: 2, label: 'Academic' },
  { number: 3, label: 'Finish' },
]

const examOptions = ['SEE Preparation']
const streamOptions = ['Science', 'Management', 'Humanities', 'Education', 'Law']
const sourceOptions = ['Social Media', 'Friend / Recommendation', 'Search Engine', 'Campus Ambassador', 'Advertisement']

export default function OnboardingPage() {
  const router = useRouter()
  const [activeStep] = useState(2)
  const [previousSchool, setPreviousSchool] = useState('')
  const [location, setLocation] = useState('')
  const [stream, setStream] = useState(streamOptions[0])
  const [heardFrom, setHeardFrom] = useState(sourceOptions[0])
  const [selectedExams, setSelectedExams] = useState<string[]>(['SEE Preparation'])
  const [finishing, setFinishing] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const toggleExam = (exam: string) => {
    setSelectedExams(prev => (
      prev.includes(exam)
        ? (prev.length === 1 ? prev : prev.filter(e => e !== exam))
        : [...prev, exam]
    ))
  }

  const finishOnboarding = async () => {
    if (finishing) return
    setErrorMsg('')
    setFinishing(true)
    try {
      await authService.completeOnboarding({
        previous_school: previousSchool.trim(),
        location: location.trim(),
        stream,
        heard_from: heardFrom,
        target_exams: selectedExams,
      })
      router.replace('/dashboard')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save onboarding details.'
      setErrorMsg(msg)
      setFinishing(false)
    }
  }

  return (
    <main className="min-h-screen w-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-tertiary-fixed/20 via-surface to-surface">
      <div className="min-h-screen w-full flex flex-col md:flex-row">
        {/* Left branding panel */}
        <aside className="hidden md:flex md:w-[320px] lg:w-[360px] bg-[#1a1a4e] p-10 flex-col justify-between text-white relative overflow-hidden">
          <div className="z-10">
            <h1 className="font-headline font-black text-3xl tracking-tighter mb-4">Brighter Nepal</h1>
            <p className="text-white/70 text-sm leading-relaxed">
              Your journey towards academic excellence starts here. Let&apos;s personalize your learning dashboard.
            </p>
          </div>

          <div className="z-10 mt-12 space-y-8">
            {[
              { Icon: ShieldCheck, title: 'Secure Profile', sub: 'Your data is protected by industry standards.' },
              { Icon: BookOpen, title: 'Tailored Content', sub: 'Get resources based on your target exams.' },
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

          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#c0622f]/20 rounded-full blur-3xl" />
          <div className="absolute top-20 -right-20 w-48 h-48 bg-tertiary-fixed/10 rounded-full blur-2xl" />
        </aside>

        {/* Right form panel */}
        <section className="flex-1 min-h-screen overflow-y-auto bg-white/95 px-6 py-8 md:px-12 md:py-10">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-10 select-none">
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
                      : step.number < activeStep ? 'bg-on-primary-container text-white'
                      : 'bg-surface-container-high text-on-surface-variant opacity-40'
                    )}>
                      {step.number < activeStep ? <CheckCircle2 className="w-4 h-4" /> : step.number}
                    </div>
                    <span className={cn(
                      'text-[10px] uppercase tracking-widest font-bold',
                      step.number === activeStep ? 'text-[#1a1a4e]'
                      : step.number < activeStep ? 'text-on-primary-container'
                      : 'text-on-surface-variant opacity-40'
                    )}>
                      {step.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-8">
              <div className="text-center md:text-left">
                <h2 className="font-headline font-extrabold text-3xl text-on-surface tracking-tight">
                  Academic Foundations
                </h2>
                <p className="text-on-surface-variant text-sm mt-2">
                  Help us curate the right study materials for you.
                </p>
              </div>

              <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); finishOnboarding() }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant ml-1">
                      Previous School / College
                    </label>
                    <input
                      type="text"
                      value={previousSchool}
                      onChange={e => setPreviousSchool(e.target.value)}
                      placeholder="e.g. St. Xavier's College"
                      className="w-full px-4 py-3 bg-surface-container-high border-none rounded-lg focus:ring-2 focus:ring-on-primary-container/20 text-on-surface placeholder:text-outline text-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant ml-1">
                      Location
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
                      <input
                        type="text"
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                        placeholder="Kathmandu, Nepal"
                        className="w-full pl-10 pr-4 py-3 bg-surface-container-high border-none rounded-lg focus:ring-2 focus:ring-on-primary-container/20 text-on-surface placeholder:text-outline text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant ml-1">
                      Stream (+2 / Equivalent)
                    </label>
                    <select
                      value={stream}
                      onChange={e => setStream(e.target.value)}
                      className="w-full px-4 py-3 bg-surface-container-high border-none rounded-lg focus:ring-2 focus:ring-on-primary-container/20 text-on-surface text-sm"
                    >
                      {streamOptions.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant ml-1">
                      How did you hear about us?
                    </label>
                    <select
                      value={heardFrom}
                      onChange={e => setHeardFrom(e.target.value)}
                      className="w-full px-4 py-3 bg-surface-container-high border-none rounded-lg focus:ring-2 focus:ring-on-primary-container/20 text-on-surface text-sm"
                    >
                      {sourceOptions.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant ml-1">
                    Target Exams (Select all that apply)
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

                {errorMsg && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm font-medium">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {errorMsg}
                  </div>
                )}

                <div className="flex justify-end pt-8 mt-6 border-t border-surface-container-high">
                  <button
                    type="submit"
                    disabled={finishing}
                    className="bg-on-primary-container text-white px-10 py-4 rounded-xl font-bold text-sm shadow-[0_8px_20px_rgba(207,110,58,0.25)] hover:scale-105 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {finishing && <Loader2 className="w-4 h-4 animate-spin" />}
                    Save & Continue
                  </button>
                </div>
              </form>
            </div>

            <footer className="mt-10 text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant opacity-40">
                © 2024 Brighter Nepal. Secure Onboarding Portal
              </p>
            </footer>
          </div>
        </section>
      </div>
    </main>
  )
}
