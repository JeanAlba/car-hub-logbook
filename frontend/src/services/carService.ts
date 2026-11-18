import type { Car, CarFields, CarSummary } from '@/types'
import { api } from './api'

export async function listCars(): Promise<Car[]> {
  return (await api.get<Car[]>('/cars')).data
}

export async function getCar(id: string): Promise<Car> {
  return (await api.get<Car>(`/cars/${id}`)).data
}

export async function createCar(data: CarFields): Promise<Car> {
  return (await api.post<Car>('/cars', data)).data
}

export async function updateCar(id: string, data: CarFields): Promise<Car> {
  return (await api.put<Car>(`/cars/${id}`, data)).data
}

export async function deleteCar(id: string): Promise<void> {
  await api.delete(`/cars/${id}`)
}

export async function getCarSummary(id: string): Promise<CarSummary> {
  return (await api.get<CarSummary>(`/cars/${id}/summary`)).data
}
