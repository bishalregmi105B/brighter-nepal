// Admin Model Sets Management — based on admin_model_sets_management/code.html
// 4 bento stat cards + inventory pipeline table (Published/Draft) + edit/preview/archive actions
import {
  Plus,
  Filter,
  ArrowUpDown,
  Eye,
  Edit,
  Archive,
  ChevronLeft,
  ChevronRight,
  Library,
  CheckCircle2,
  FileEdit,
  Users,
  Search,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

// ─── Data ────────────────────────────────────────────────────────────────────

type SetStatus = 'Published' | 'Draft'

interface ModelSet {
  id:        string
  title:     string
  modified:  string
  subjects:  string[]
  questions: string
  duration:  string
  status:    SetStatus
}

const modelSets: ModelSet[] = [
  { id: 'MS-0042', title: 'Grade 12 Physics: Quantum Mechanics Focus',    modified: '2 hours ago by Admin',       subjects: ['Physics', 'Science'],     questions: '50 Qs',  duration: '90 Mins',  status: 'Published' },
  { id: 'MS-0041', title: 'Advanced Calculus: Integral Applications',     modified: '5 hours ago by Content Team', subjects: ['Mathematics'],             questions: '40 Qs',  duration: '120 Mins', status: 'Draft'     },
  { id: 'MS-0040', title: 'Biology: Cellular Respiration & Genetics',     modified: '1 day ago by Admin',         subjects: ['Biology', 'Science'],      questions: '60 Qs',  duration: '60 Mins',  status: 'Published' },
  { id: 'MS-0039', title: 'Chemistry: Organic Compounds & Bonding',       modified: '3 days ago by Content Team', subjects: ['Chemistry'],               questions: '45 Qs',  duration: '90 Mins',  status: 'Published' },
  { id: 'MS-0038', title: 'Business Studies: Final Review Exam',          modified: '4 days ago by Admin',        subjects: ['Management'],              questions: '100 Qs', duration: '180 Mins', status: 'Draft'     },
]

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminModelSetsPage() {
  return (
    <div className="p-8">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex justify-between items-end mb-10">
        <div>
          <h2 className="text-4xl font-extrabold text-[#1a1a4e] tracking-tight mb-2 font-headline">
            Model Sets Management
          </h2>
          <p className="text-slate-500 font-medium">
            Create, publish, and manage academic mock examination sets for premium students.
          </p>
        </div>
        <button className="bg-[#c0622f] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-[#c0622f]/20">
          <Plus className="w-5 h-5" /> Create New Model Set
        </button>
      </div>

      {/* ── Stat Cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        {[
          {
            icon:        <Library className="w-5 h-5" />,
            value:       '124',
            label:       'Total Sets',
            borderColor: '',
            iconBg:      'bg-primary-fixed text-[#c0622f]',
          },
          {
            icon:        <CheckCircle2 className="w-5 h-5" />,
            value:       '98',
            label:       'Published',
            borderColor: 'border-b-4 border-tertiary-fixed',
            iconBg:      'bg-tertiary-fixed text-on-tertiary-fixed-variant',
          },
          {
            icon:        <FileEdit className="w-5 h-5" />,
            value:       '26',
            label:       'Drafts',
            borderColor: 'border-b-4 border-primary-fixed',
            iconBg:      'bg-primary-fixed-dim text-on-primary-fixed-variant',
          },
          {
            icon:        <Users className="w-5 h-5" />,
            value:       '1.4k',
            label:       'Active Attempts',
            borderColor: 'border-b-4 border-secondary-container',
            iconBg:      'bg-secondary-container text-on-secondary-container',
          },
        ].map((stat) => (
          <div key={stat.label} className={cn('bg-white p-6 rounded-2xl shadow-[0_12px_32px_rgba(25,28,30,0.04)]', stat.borderColor)}>
            <div className="flex justify-between items-start mb-4">
              <div className={cn('p-2 rounded-lg', stat.iconBg)}>{stat.icon}</div>
              <span className="text-[10px] font-bold text-slate-400 tracking-tighter uppercase">{stat.label}</span>
            </div>
            <p className="text-3xl font-black text-[#1a1a4e]">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* ── Table ────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-[0_12px_32px_rgba(25,28,30,0.06)]">

        {/* Table header bar */}
        <div className="p-4 md:p-6 bg-surface-container-low flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <h3 className="font-bold text-[#1a1a4e] text-lg">Inventory Pipeline</h3>
          </div>
          <div className="flex items-center gap-3">
            {/* inline search */}
            <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
              <input
                type="text"
                className="pl-9 pr-4 py-2 bg-white rounded-full border border-slate-200/50 focus:ring-2 focus:ring-[#c0622f]/20 text-sm w-56"
                placeholder="Search model sets..."
              />
            </div>
            <button className="px-4 py-2 bg-white rounded-lg text-sm font-bold text-slate-600 border border-slate-200/50 hover:bg-slate-50 transition-colors flex items-center gap-2">
              <Filter className="w-4 h-4" /> Filter
            </button>
            <button className="px-4 py-2 bg-white rounded-lg text-sm font-bold text-slate-600 border border-slate-200/50 hover:bg-slate-50 transition-colors flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4" /> Sort By
            </button>
          </div>
        </div>

        <table className="w-full text-left">
          <thead className="bg-surface-container-low/50">
            <tr>
              {['Set #', 'Model Set Title', 'Subjects', 'Questions', 'Duration', 'Status', 'Actions'].map((col) => (
                <th key={col} className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {modelSets.map((set) => (
              <tr key={set.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-5 font-headline font-bold text-[#1a1a4e]">{set.id}</td>
                <td className="px-6 py-5">
                  <p className="font-bold text-[#1a1a4e]">{set.title}</p>
                  <p className="text-xs text-slate-400">Modified {set.modified}</p>
                </td>
                <td className="px-6 py-5">
                  <div className="flex gap-1">
                    {set.subjects.map((s) => (
                      <span key={s} className="px-2 py-0.5 bg-slate-100 text-[10px] font-bold text-slate-600 rounded">
                        {s}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-5 font-bold text-on-surface-variant">{set.questions}</td>
                <td className="px-6 py-5 font-medium text-on-surface-variant">{set.duration}</td>
                <td className="px-6 py-5">
                  <span className={cn(
                    'px-3 py-1 text-[11px] font-black rounded-full uppercase tracking-tighter',
                    set.status === 'Published'
                      ? 'bg-tertiary-fixed text-on-tertiary-fixed-variant'
                      : 'bg-primary-fixed text-on-primary-fixed-variant'
                  )}>
                    {set.status}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                    <button className="hover:text-[#c0622f] transition-colors" title="Edit">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="hover:text-[#c0622f] transition-colors" title="Preview">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="hover:text-error transition-colors" title="Archive">
                      <Archive className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="px-6 py-6 bg-surface-container-low/30 border-t border-slate-100 flex items-center justify-between">
          <p className="text-sm font-medium text-slate-500">
            Showing <strong className="text-[#1a1a4e]">1-5</strong> of <strong className="text-[#1a1a4e]">124</strong> results
          </p>
          <div className="flex gap-2">
            <button className="p-2 bg-white rounded-lg border border-slate-200/50 hover:bg-slate-50 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            {[1, 2, 3].map((page) => (
              <button
                key={page}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-bold transition-colors',
                  page === 1 ? 'bg-white border border-slate-200/50 text-[#c0622f]' : 'text-slate-500 hover:text-[#1a1a4e]'
                )}
              >
                {page}
              </button>
            ))}
            <button className="p-2 bg-white rounded-lg border border-slate-200/50 hover:bg-slate-50 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-8 flex justify-end gap-12 text-[11px] font-black text-slate-400 uppercase tracking-widest">
        {[
          { color: 'bg-tertiary-fixed', label: 'Ready for publication' },
          { color: 'bg-primary-fixed',  label: 'Under Construction'   },
          { color: 'bg-slate-300',      label: 'Archived'             },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span className={cn('h-2 w-2 rounded-full', item.color)} />
            {item.label}
          </div>
        ))}
      </div>
    </div>
  )
}
