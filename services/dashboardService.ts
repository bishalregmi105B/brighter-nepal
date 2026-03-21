import { api } from './api'
import type { LiveClass } from './liveClassService'

export interface DashboardData {
  tests_appeared:      number
  homework_attempted:  number
  daily_hours:         { day: string; hours: number }[]
  live_class:          LiveClass | null
}

export const dashboardService = {
  getDashboard: () =>
    api.get<{ data: DashboardData }>('/api/dashboard/me'),
}
