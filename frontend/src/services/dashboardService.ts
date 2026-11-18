import type { DashboardSummary } from '@/types'
import { api } from './api'

export async function getDashboard(): Promise<DashboardSummary> {
  return (await api.get<DashboardSummary>('/dashboard')).data
}
