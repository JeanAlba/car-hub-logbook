import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { dashboardKeys } from '@/hooks/useDashboard'
import { getErrorMessage } from '@/services/api'
import * as carService from '@/services/carService'
import type { CarFields } from '@/types'

export const carKeys = {
  all: ['cars'] as const,
  detail: (id: string) => ['cars', id] as const,
  summary: (id: string) => ['cars', id, 'summary'] as const,
}

export function useCars() {
  return useQuery({
    queryKey: carKeys.all,
    queryFn: carService.listCars,
  })
}

export function useCar(id: string) {
  return useQuery({
    queryKey: carKeys.detail(id),
    queryFn: () => carService.getCar(id),
    enabled: Boolean(id),
  })
}

export function useCarSummary(id: string) {
  return useQuery({
    queryKey: carKeys.summary(id),
    queryFn: () => carService.getCarSummary(id),
    enabled: Boolean(id),
  })
}

export function useCreateCar() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CarFields) => carService.createCar(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: carKeys.all })
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
      toast.success('Carro adicionado.')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export function useUpdateCar(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CarFields) => carService.updateCar(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: carKeys.all })
      queryClient.invalidateQueries({ queryKey: carKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: carKeys.summary(id) })
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
      toast.success('Carro atualizado.')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export function useDeleteCar() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => carService.deleteCar(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: carKeys.all })
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
      queryClient.removeQueries({ queryKey: carKeys.detail(id) })
      queryClient.removeQueries({ queryKey: carKeys.summary(id) })
      toast.success('Carro excluído.')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}
