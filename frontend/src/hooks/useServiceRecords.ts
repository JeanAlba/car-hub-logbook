import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { carKeys } from '@/hooks/useCars'
import { dashboardKeys } from '@/hooks/useDashboard'
import { getErrorMessage } from '@/services/api'
import * as serviceRecordService from '@/services/serviceRecordService'
import type { ServiceRecordFields } from '@/types'

export const serviceRecordKeys = {
  byCar: (carId: string) => ['service-records', carId] as const,
}

export function useServiceRecords(carId: string) {
  return useQuery({
    queryKey: serviceRecordKeys.byCar(carId),
    queryFn: () => serviceRecordService.listServiceRecords(carId),
    enabled: Boolean(carId),
  })
}

export function useCreateServiceRecord(carId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ServiceRecordFields) =>
      serviceRecordService.createServiceRecord(carId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceRecordKeys.byCar(carId) })
      queryClient.invalidateQueries({ queryKey: carKeys.summary(carId) })
      queryClient.invalidateQueries({ queryKey: carKeys.detail(carId) })
      queryClient.invalidateQueries({ queryKey: carKeys.all })
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
      toast.success('Serviço registrado.')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export function useUpdateServiceRecord(carId: string, recordId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ServiceRecordFields) =>
      serviceRecordService.updateServiceRecord(recordId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceRecordKeys.byCar(carId) })
      queryClient.invalidateQueries({ queryKey: carKeys.summary(carId) })
      queryClient.invalidateQueries({ queryKey: carKeys.detail(carId) })
      queryClient.invalidateQueries({ queryKey: carKeys.all })
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
      toast.success('Serviço atualizado.')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export function useDeleteServiceRecord(carId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (recordId: string) => serviceRecordService.deleteServiceRecord(recordId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceRecordKeys.byCar(carId) })
      queryClient.invalidateQueries({ queryKey: carKeys.summary(carId) })
      queryClient.invalidateQueries({ queryKey: carKeys.detail(carId) })
      queryClient.invalidateQueries({ queryKey: carKeys.all })
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
      toast.success('Serviço excluído.')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}
