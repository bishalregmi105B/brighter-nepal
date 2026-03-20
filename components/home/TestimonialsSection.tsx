// Component: TestimonialsSection — from public_homepage/code.html
const testimonials = [
  {
    name:    'Aayush Shrestha',
    exam:    'IOE Entrance — Cleared',
    college: 'Pulchowk Campus',
    score:   '94%',
    text:    'Brighter Nepal\'s model sets were exactly like the real IOE exam. The detailed explanations helped me understand where I went wrong. Cleared with merit on the first attempt!',
    initials:'AS',
    color:   'bg-[#1a1a4e]',
  },
  {
    name:    'Kritika Tamang',
    exam:    'CEE Medical — Cleared',
    college: 'MBBS, BPKIHS',
    score:   '91%',
    text:    'The live classes with Dr. Hemant helped me ace organic chemistry. The private Q&A during the session was incredibly helpful. I would recommend Brighter Nepal to every aspiring medical student.',
    initials:'KT',
    color:   'bg-[#2d6a6a]',
  },
  {
    name:    'Roshan Karmacharya',
    exam:    'IOM Entrance — Cleared',
    college: 'KIST Medical College',
    score:   '89%',
    text:    'The resource library is unmatched. 2,500+ materials all categorized by subject and exam type. I completed 12 full model sets in the last month and my accuracy jumped from 65% to 89%.',
    initials:'RK',
    color:   'bg-on-primary-container',
  },
]

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <span className="inline-block px-3 py-1 bg-on-primary-container text-white text-[10px] font-black tracking-widest uppercase rounded-full mb-4">
            Student Success
          </span>
          <h2 className="font-headline font-black text-4xl md:text-5xl text-[#1a1a4e] tracking-tight">
            Scholars Who Made It
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-[#f8f9fb] rounded-2xl p-8 flex flex-col gap-6 relative">
              <div className="text-4xl text-slate-200 font-serif absolute top-6 right-8">&ldquo;</div>
              <p className="text-on-surface text-sm leading-relaxed relative z-10">{t.text}</p>
              <div className="flex items-center gap-4 mt-auto">
                <div className={`w-12 h-12 rounded-xl ${t.color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                  {t.initials}
                </div>
                <div>
                  <p className="font-bold text-[#1a1a4e] text-sm">{t.name}</p>
                  <p className="text-on-surface-variant text-xs">{t.exam}</p>
                  <p className="text-on-primary-container text-xs font-bold">{t.college} — {t.score}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
