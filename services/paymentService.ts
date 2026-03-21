import { api } from './api'

export interface Payment {
  id: number; user_id: number; user_name: string; amount: number; method: string; status: string; created_at: string
}
export interface PaginatedPayments {
  data: { items: Payment[]; total: number; page: number; pages: number }
}

export const paymentService = {
  getPayments: (params: { status?: string; search?: string; page?: number } = {}) => {
    const q = new URLSearchParams(params as Record<string, string>).toString()
    return api.get<PaginatedPayments>(`/api/payments?${q}`)
  },
  getPayment: (id: number) =>
    api.get<{ data: Payment }>(`/api/payments/${id}`),
}
