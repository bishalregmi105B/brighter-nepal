// Utility: examUtils — Question status helpers for exam interface
export type QuestionStatus = 'not-visited' | 'answered' | 'marked' | 'visited-only' | 'current'

export function getQuestionBubbleClass(status: QuestionStatus): string {
  const base = 'w-full aspect-square flex items-center justify-center rounded-lg font-bold text-sm transition-colors'
  switch (status) {
    case 'answered':
      return `${base} bg-on-primary-container text-white`
    case 'marked':
      return `${base} bg-secondary-fixed text-on-secondary-fixed`
    case 'visited-only':
      return `${base} bg-white border border-error text-error`
    case 'current':
      return `${base} bg-white border-4 border-on-primary-container text-on-primary-container shadow-sm ring-2 ring-white`
    default:
      return `${base} bg-white border border-outline-variant text-on-surface-variant hover:bg-white/80`
  }
}

export function getAnswerOptionClass(
  isSelected: boolean,
  isCorrect?: boolean,
  isReview = false
): string {
  const base = 'relative flex items-center p-5 rounded-xl border-2 cursor-pointer transition-all active:scale-[0.99]'
  if (isReview) {
    if (isCorrect) return `${base} bg-tertiary-fixed/30 border-on-tertiary-container/30`
    if (isSelected && !isCorrect) return `${base} bg-error-container/20 border-error/20`
    return `${base} bg-surface-container-low border-surface-container-high opacity-60`
  }
  if (isSelected) return `${base} border-on-primary-container bg-on-primary-container/5 hover:bg-on-primary-container/10`
  return `${base} border-surface-container-high hover:bg-surface-container-low`
}
