// Component: StatsBar — Stats bar from public_homepage/code.html  
// White background with 4 key stats
const stats = [
  { value: '10,000+', label: 'Active Students' },
  { value: '2,500+',  label: 'Study Materials' },
  { value: '98%',     label: 'Pass Rate' },
  { value: '50+',     label: 'Expert Educators' },
]

export function StatsBar() {
  return (
    <section className="bg-white border-b border-slate-100 py-12">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <p className="font-headline font-black text-4xl text-[#1a1a4e] mb-1">
                {stat.value}
              </p>
              <p className="text-slate-500 font-semibold text-sm uppercase tracking-wider">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
