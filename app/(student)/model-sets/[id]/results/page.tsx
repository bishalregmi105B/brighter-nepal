// Exam Results Page — based exactly on exam_results_model_set/code.html
// Circular progress + subject breakdown + detailed answer review
import Link from 'next/link'
import { CheckCircle, XCircle, Lightbulb, RotateCcw, Stars } from 'lucide-react'

const mockResult = {
  score:      78,
  totalMarks: 100,
  percentage: 78,
  rank:       12,
  outperformed: 88,
  subjects: [
    { name: 'Physics',     icon: '🚀', color: 'bg-[#1a1a4e] text-white', score: '18/25', correct: 18, wrong: 5,  skipped: 2, total: 25, pct: 72 },
    { name: 'Chemistry',   icon: '⚗️', color: 'bg-[#2d6a6a] text-white', score: '22/25', correct: 22, wrong: 2,  skipped: 1, total: 25, pct: 88 },
    { name: 'Mathematics', icon: '∑',  color: 'bg-on-primary-container text-white', score: '30/40', correct: 30, wrong: 8, skipped: 2, total: 40, pct: 75 },
    { name: 'English',     icon: 'E',  color: 'bg-[#c0622f] text-white', score: '8/10', correct: 8, wrong: 2, skipped: 0, total: 10, pct: 80 },
  ],
}

export default function ExamResultsPage() {
  const circumference = 2 * Math.PI * 42
  const offset = circumference - (mockResult.percentage / 100) * circumference

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-12">
      {/* Hero Result Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white rounded-2xl shadow-card p-8 lg:p-12">
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant font-bold text-sm">
            <Stars className="w-4 h-4" /> Excellent Performance
          </div>
          <h1 className="font-headline font-black text-5xl text-[#1a1a4e] tracking-tight leading-tight">
            IOE Mock Entrance <br/>
            <span className="text-on-primary-container">Set #04 Result</span>
          </h1>
          <p className="text-on-surface-variant text-lg max-w-xl leading-relaxed">
            Great job! You&apos;ve outperformed {mockResult.outperformed}% of the students who took this set today.
            Focus on your Physics conceptual errors to reach the top 5%.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              href="/model-sets/ioe-model-04"
              className="inline-flex items-center gap-2 px-8 py-3 bg-surface-container-high text-[#1a1a4e] font-bold rounded-full hover:bg-surface-container-highest active:scale-95 transition-all"
            >
              <RotateCcw className="w-4 h-4" /> Retake Practice
            </Link>
          </div>
        </div>

        {/* Circular Progress */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end">
          <div className="relative w-64 h-64 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="transparent" stroke="#e7e8ea" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="42" fill="transparent"
                stroke="#cf6e3a" strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-headline font-black text-6xl text-[#1a1a4e]">{mockResult.score}</span>
              <span className="text-on-surface-variant font-bold text-sm uppercase tracking-widest">Out of 100</span>
              <span className="text-on-primary-container font-bold text-sm mt-1">Rank #{mockResult.rank}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Subject Breakdown */}
      <section>
        <h2 className="font-headline font-bold text-2xl text-[#1a1a4e] mb-6">Subject-wise Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mockResult.subjects.map((s) => (
            <div key={s.name} className="bg-surface-container-low p-6 rounded-xl hover:bg-white hover:shadow-xl transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-lg ${s.color} flex items-center justify-center font-bold text-lg`}>
                  {s.icon}
                </div>
                <span className="font-bold text-lg text-[#1a1a4e]">{s.score}</span>
              </div>
              <h3 className="font-bold text-lg mb-4">{s.name}</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-on-tertiary-container">Correct: {s.correct}</span>
                  <span className="text-error">Wrong: {s.wrong}</span>
                </div>
                <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden flex">
                  <div className="h-full bg-on-tertiary-container" style={{ width: `${(s.correct/s.total)*100}%` }} />
                  <div className="h-full bg-error" style={{ width: `${(s.wrong/s.total)*100}%` }} />
                </div>
                <p className="text-xs text-on-surface-variant">Skipped: {s.skipped}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Detailed Review */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="font-headline font-bold text-2xl text-[#1a1a4e]">Detailed Answer Review</h2>
          <div className="flex flex-wrap gap-2">
            <button className="px-4 py-2 rounded-lg bg-white border border-outline-variant text-sm font-semibold active:scale-95 transition-transform">All Questions</button>
            <button className="px-4 py-2 rounded-lg bg-error-container text-error text-sm font-semibold active:scale-95 transition-transform">Incorrect Only</button>
            <button className="px-4 py-2 rounded-lg bg-tertiary-fixed text-on-tertiary-fixed-variant text-sm font-semibold active:scale-95 transition-transform">Marked for Review</button>
          </div>
        </div>

        {/* Wrong answer example */}
        <div className="bg-white rounded-xl p-8 shadow-sm border-l-4 border-error">
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant block mb-2">Question 14 • Physics</span>
              <h4 className="text-xl font-semibold leading-relaxed text-[#1a1a4e] max-w-2xl">
                A projectile is fired at an angle of 45° with the horizontal. If the air resistance is negligible, the horizontal range is maximum. What happens to the range if the firing angle is increased to 60°?
              </h4>
            </div>
            <span className="flex-shrink-0 ml-4 px-3 py-1 bg-error-container text-error rounded-full text-xs font-bold uppercase tracking-wide">WRONG</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-lg bg-error-container/20 border-2 border-error/20 flex items-center justify-between">
              <span className="text-on-surface font-medium">A) The range increases</span>
              <div className="flex items-center gap-2 ml-4">
                <span className="text-xs font-bold text-error flex-shrink-0">Your Choice</span>
                <XCircle className="w-5 h-5 text-error flex-shrink-0" />
              </div>
            </div>
            <div className="p-4 rounded-lg bg-tertiary-fixed/30 border-2 border-on-tertiary-container/30 flex items-center justify-between">
              <span className="text-on-surface font-medium">B) The range decreases</span>
              <div className="flex items-center gap-2 ml-4">
                <span className="text-xs font-bold text-on-tertiary-container flex-shrink-0">Correct</span>
                <CheckCircle className="w-5 h-5 text-on-tertiary-container flex-shrink-0" />
              </div>
            </div>
            <div className="p-4 rounded-lg bg-surface-container-low flex items-center opacity-60">
              <span className="text-on-surface font-medium text-sm">C) The range remains same</span>
            </div>
            <div className="p-4 rounded-lg bg-surface-container-low flex items-center opacity-60">
              <span className="text-on-surface font-medium text-sm">D) Range becomes zero</span>
            </div>
          </div>
          <div className="bg-surface-container-low rounded-lg p-6">
            <div className="flex items-center gap-2 text-[#1a1a4e] font-bold mb-3">
              <Lightbulb className="w-5 h-5" /> Explanation
            </div>
            <p className="text-on-surface-variant leading-relaxed">
              The horizontal range R = (u² sin 2θ) / g is maximum at 45°. At 60°, R = (u² sin 120°) / g = (u² × 0.866) / g, which is less than the maximum range.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
