// Utility: formatDate — date-fns formatting helpers
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns'

export function formatDate(date: Date | string, pattern = 'MMM dd, yyyy'): string {
  return format(new Date(date), pattern)
}

export function formatRelativeDate(date: Date | string): string {
  const d = new Date(date)
  if (isToday(d)) return `Today, ${format(d, 'hh:mm a')}`
  if (isYesterday(d)) return `Yesterday, ${format(d, 'hh:mm a')}`
  return format(d, 'MMM dd, yyyy')
}

export function formatTimeAgo(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function formatTime(date: Date | string): string {
  return format(new Date(date), 'hh:mm a')
}

export function formatCountdown(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
