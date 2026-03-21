import { Info, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface DeveloperWatermarkProps {
  isCollapsed?: boolean;
  className?: string;
  variant?: 'sidebar' | 'page';
}

export function DeveloperWatermark({ isCollapsed = false, className, variant = 'sidebar' }: DeveloperWatermarkProps) {
  if (variant === 'page') {
    return (
      <a
        href="http://ashlya.com/"
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "flex items-center justify-between p-4 bg-white border border-outline-variant/20 rounded-xl shadow-sm hover:border-[#c0622f]/50 hover:shadow-md transition-all duration-300 group",
          className
        )}
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center group-hover:bg-[#c0622f]/10 transition-colors">
            <Info className="w-5 h-5 text-[#1a1a4e] group-hover:text-[#c0622f]" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#1a1a4e]">Platform by Ashlya for Brighter Nepal</p>
            <p className="text-xs text-slate-500 font-medium">Owned by Brighter Nepal • IT Development by Ashlya</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container text-xs font-bold text-[#1a1a4e] group-hover:bg-[#c0622f] group-hover:text-white transition-colors">
          See more <ExternalLink className="w-3 h-3" />
        </div>
      </a>
    )
  }

  return (
    <div className={cn("mt-4 px-4 pb-4", className)}>
      <a
        href="http://ashlya.com/"
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "flex items-center gap-2 text-[10px] text-slate-400 hover:text-[#c0622f] transition-colors",
          isCollapsed && "justify-center"
        )}
        title="Developed and maintained by Ashlya"
      >
        <div className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center flex-shrink-0 font-serif italic">i</div>
        {!isCollapsed && <span>IT Development by Ashlya</span>}
      </a>
    </div>
  )
}
