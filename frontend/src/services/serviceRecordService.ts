import type { ServiceRecord, ServiceRecordFields } from '@/types'
import { api } from './api'

export async function listServiceRecords(carId: string): Promise<ServiceRecord[]> {
  return (await api.get<ServiceRecord[]>('/service-records', { params: { carId } })).data
}

export async function createServiceRecord(
  carId: string,
  data: ServiceRecordFields,
): Promise<ServiceRecord> {
  return (await api.post<ServiceRecord>('/service-records', { carId, ...data })).data
}

export async function updateServiceRecord(
  id: string,
  data: ServiceRecordFields,
): Promise<ServiceRecord> {
  return (await api.put<ServiceRecord>(`/service-records/${id}`, data)).data
}

export async function deleteServiceRecord(id: string): Promise<void> {
  await api.delete(`/service-records/${id}`)
}
