// Student Weekly Test Detail — individual test session / result page
// Shows test instructions if not yet started, result summary if completed
import Link from 'next/link'
import { ArrowLeft, Clock, Users, BookCheck, Trophy, BarChart2, Eye, CheckCircle2, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

// ─── Data ─────────────────────────────────────────────────────────────────────

interface MockQuestion {
  number:    number
  subject:   string
  text:      string
  chosen:    string
  correct:   string
  isCorrect: boolean
}

const testData = {
  id:          'wt-calculus',
  title:       'Advanced Mathematics: Calculus II',
  subject:     'Mathematics',
  duration:    '60 Mins',
  questions:   40,
  enrolled:    940,
  status:      'completed' as const,    // change to 'open' to show instructions view
  score:       34,
  total:       40,
  rank:        12,
  percentile:  98.7,
}

const reviewQuestions: MockQuestion[] = [
  { number: 1, subject: 'Calculus', text: 'Evaluate ∫(3x² + 2x) dx',                      chosen : 'x³ + x²',         correct: 'x³ + x² + C',   isCorrect: false },
  { number: 2, subject: 'Calculus', text: 'Find dy/dx if y = ln(5x + 3)',                  chosen : '1/(5x+3)',         correct: '5/(5x+3)',       isCorrect: false },
  { number: 3, subject: 'Calculus', text: 'What is the derivative of sin²(x)?',            chosen : '2sin(x)cos(x)',    correct: '2sin(x)cos(x)', isCorrect: true  },
  { number: 4, subject: 'Calculus', text: 'Evaluate ∫₀¹ x³ dx',                           chosen : '1/4',             correct: '1/4',            isCorrect: true  },
  { number: 5, subject: 'Calculus', text: 'The limit of (sin x / x) as x → 0 equals',     chosen : '0',               correct: '1',              isCorrect: false },
]

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function WeeklyTestDetailPage() {
  const isCompleted = testData.status === 'completed'
  const percentage  = Math.round((testData.score / testData.total) * 100)

  if (!isCompleted) {
    // ── Instructions / Start view ──────────────────────────────────────────
    return (
      <div className="p-6 md:p-10 max-w-3xl mx-auto space-y-8">
        <Link href="/weekly-tests" className="flex items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-on-primary-container transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Weekly Tests
        </Link>

        <div className="bg-white rounded-2xl shadow-[0_12px_32px_rgba(25,28,30,0.06)] overflow-hidden">
          <div className="bg-[#1a1a4e] p-8 text-white">
            <h1 className="font-headline font-black text-3xl mb-2">{testData.title}</h1>
            <p className="text-white/60">{testData.subject}</p>
          </div>
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-3 gap-4">
              {[
                { Icon: BookCheck, label: 'Questions', value: `${testData.questions}` },
                { Icon: Clock,     label: 'Duration',  value: testData.duration        },
                { Icon: Users,     label: 'Enrolled',  value: testData.enrolled.toLocaleString() },
              ].map(({ Icon, label, value }) => (
                <div key={label} className="bg-surface-container-low p-4 rounded-xl text-center">
                  <Icon className="w-6 h-6 mx-auto mb-2 text-on-primary-container" />
                  <p className="text-xl font-black text-[#1a1a4e]">{value}</p>
                  <p className="text-[10px] font-bold text-outline uppercase tracking-widest mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            <div className="bg-surface-container-low rounded-xl p-6 space-y-3">
              <h3 className="font-bold text-on-surface mb-3">Instructions</h3>
              {[
                'Each question carries 1 mark. There is no negative marking.',
                'You must complete the test in the allotted time — it will auto-submit.',
                'Do not switch browser tabs during the exam.',
                'Results will be published within 24 hours of the session closing.',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-on-primary-container/10 text-on-primary-container text-[10px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                  <p className="text-sm text-slate-600">{item}</p>
                </div>
              ))}
            </div>

            <Link
              href={`/weekly-tests/${testData.id}/exam`}
              className="block w-full text-center bg-on-primary-container text-white py-4 rounded-xl font-bold text-base hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-on-primary-container/20"
            >
              Start Test Now
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ── Result view ─────────────────────────────────────────────────────────────
  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8">
      <Link href="/weekly-tests" className="flex items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-on-primary-container transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Weekly Tests
      </Link>

      {/* Score hero */}
      <div className="bg-[#1a1a4e] rounded-3xl p-8 md:p-12 text-white flex flex-col md:flex-row items-center gap-10">
        <div className="flex-1">
          <h1 className="font-headline font-black text-3xl md:text-4xl mb-2">{testData.title}</h1>
          <p className="text-white/60 mb-8">{testData.subject} · Completed</p>
          <div className="grid grid-cols-2 gap-6">
            {[
              { Icon: Trophy,  label: 'National Rank',  value: `#${testData.rank}` },
              { Icon: BarChart2, label: 'Percentile',   value: `${testData.percentile}%ile` },
            ].map(({ Icon, label, value }) => (
              <div key={label} className="bg-white/10 rounded-xl p-4">
                <Icon className="w-5 h-5 text-on-primary-container mb-2" />
                <p className="font-headline font-black text-2xl">{value}</p>
                <p className="text-white/50 text-xs font-bold uppercase tracking-wider mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="text-center">
          <div className="w-36 h-36 rounded-full bg-white/10 border-4 border-on-primary-container flex flex-col items-center justify-center mx-auto">
            <span className="font-headline font-black text-5xl">{testData.score}</span>
            <span className="text-white/50 text-sm">/ {testData.total}</span>
          </div>
          <p className="text-on-primary-container font-black text-xl mt-4">{percentage}%</p>
        </div>
      </div>

      {/* Subject breakdown */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_8px_20px_rgba(25,28,30,0.04)]">
        <div className="flex items-center gap-3 mb-6">
          <Eye className="w-5 h-5 text-on-primary-container" />
          <h3 className="font-headline font-bold text-[#1a1a4e] text-lg">Answer Review</h3>
        </div>
        <div className="space-y-4">
          {reviewQuestions.map((q) => (
            <div key={q.number} className={cn(
              'p-4 rounded-xl border',
              q.isCorrect ? 'border-tertiary-fixed bg-tertiary-fixed/10' : 'border-error/20 bg-error-container/20'
            )}>
              <div className="flex justify-between items-start mb-2">
                <p className="text-sm font-semibold text-on-surface">{q.number}. {q.text}</p>
                {q.isCorrect
                  ? <CheckCircle2 className="w-5 h-5 text-on-tertiary-container flex-shrink-0 ml-3" />
                  : <XCircle      className="w-5 h-5 text-error flex-shrink-0 ml-3" />
                }
              </div>
              {!q.isCorrect && (
                <div className="flex flex-col gap-1 mt-2 text-[11px] font-bold">
                  <span className="text-error">Your answer: {q.chosen}</span>
                  <span className="text-on-tertiary-container">Correct: {q.correct}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
