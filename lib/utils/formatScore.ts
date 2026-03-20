// Utility: formatScore — score and percentage formatters
export function formatScore(score: number, total: number): string {
  return `${score}/${total}`
}

export function formatPercentage(value: number, total: number, decimals = 1): string {
  if (total === 0) return '0%'
  return `${((value / total) * 100).toFixed(decimals)}%`
}

export function formatRank(rank: number): string {
  if (rank === 1) return '1st'
  if (rank === 2) return '2nd'
  if (rank === 3) return '3rd'
  return `${rank}th`
}

export function formatCurrency(amount: number, symbol = 'रू'): string {
  return `${symbol} ${amount.toLocaleString('en-IN')}`
}
