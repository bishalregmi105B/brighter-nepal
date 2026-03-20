// Help Center Page
// FAQ accordion + contact support options
import { HelpCircle, MessageSquare, Mail, Phone, BookOpen, ChevronDown } from 'lucide-react'

const faqs = [
  {
    q: 'How do I access model sets?',
    a: 'Navigate to Model Sets from the sidebar. Free users can access first 5 sets; Pro users get unlimited access to all 124+ sets.',
  },
  {
    q: 'What happens if my internet disconnects during an exam?',
    a: 'Your answers are saved locally every 30 seconds. When you reconnect, they sync automatically. The timer continues running, so rejoin quickly.',
  },
  {
    q: 'How do weekly test results work?',
    a: 'Results are published within 24 hours of the test window closing. You can view your score, national rank, and a full answer review.',
  },
  {
    q: 'Can I retake a model set?',
    a: 'Yes — Pro users can retake any model set unlimited times. Free users can retake up to 3 times per set. Each attempt creates a separate score record.',
  },
  {
    q: 'How do I upgrade to Pro?',
    a: 'Click "Upgrade Now" in the sidebar or visit your Profile page. Payment is processed via eSewa and Khalti. Plans start at NPR 999/month.',
  },
  {
    q: 'How do I join a Live Class?',
    a: 'Go to Live Classes from the sidebar. Active sessions show a "Join Now" button. Upcoming ones let you set a reminder. Pro access is required for most classes.',
  },
]

export default function HelpPage() {
  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-12">

      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-primary-fixed rounded-2xl flex items-center justify-center mx-auto mb-5">
          <HelpCircle className="w-8 h-8 text-on-primary-container" />
        </div>
        <h1 className="font-headline text-4xl font-extrabold text-[#1a1a4e] mb-3">Help Center</h1>
        <p className="text-slate-500 text-base max-w-lg mx-auto">
          Find answers to common questions or reach out to our academic support team.
        </p>
      </div>

      {/* FAQ Accordion */}
      <section className="space-y-3">
        <h2 className="text-xl font-headline font-bold text-[#1a1a4e] mb-5 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-on-primary-container" /> Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <details
              key={i}
              className="group bg-white rounded-xl shadow-[0_4px_16px_rgba(25,28,30,0.04)] open:shadow-md transition-all"
            >
              <summary className="flex items-center justify-between gap-4 p-5 cursor-pointer list-none select-none rounded-xl">
                <span className="font-bold text-[#1a1a4e]">{faq.q}</span>
                <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0 transition-transform group-open:rotate-180" />
              </summary>
              <div className="px-5 pb-5">
                <p className="text-sm text-slate-600 leading-relaxed">{faq.a}</p>
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section>
        <h2 className="text-xl font-headline font-bold text-[#1a1a4e] mb-5">Still need help?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { Icon: MessageSquare, title: 'Live Chat',   sub: 'Available 8 AM – 8 PM',     cta: 'Start Chat',     bg: 'bg-on-primary-container text-white' },
            { Icon: Mail,          title: 'Email Us',    sub: 'support@brighternepal.com',  cta: 'Send Email',     bg: 'bg-white border border-outline-variant/20 text-[#1a1a4e]' },
            { Icon: Phone,         title: 'Call Us',     sub: '+977-01-XXXXXXX',           cta: 'Call Now',       bg: 'bg-white border border-outline-variant/20 text-[#1a1a4e]' },
          ].map(({ Icon, title, sub, cta, bg }) => (
            <div key={title} className="bg-white rounded-2xl p-6 shadow-[0_8px_20px_rgba(25,28,30,0.04)] flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center">
                <Icon className="w-6 h-6 text-on-primary-container" />
              </div>
              <div>
                <p className="font-headline font-bold text-on-surface">{title}</p>
                <p className="text-xs text-outline mt-1">{sub}</p>
              </div>
              <button className={`mt-auto w-full py-2.5 rounded-xl font-bold text-sm ${bg} hover:opacity-90 active:scale-95 transition-all`}>
                {cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      <p className="text-center text-xs text-outline pb-4">
        Average response time: under 2 hours · We&apos;re here Mon–Sat, 8 AM – 8 PM NST
      </p>
    </div>
  )
}
