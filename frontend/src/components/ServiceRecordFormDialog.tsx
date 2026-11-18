import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { DateInput } from '@/components/DateInput'
import { FormField } from '@/components/FormField'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useCreateServiceRecord, useUpdateServiceRecord } from '@/hooks/useServiceRecords'
import { brDateToIso, formatDate, formatPlate, getTodayIso } from '@/lib/formatters'
import { SERVICE_TYPE_META } from '@/lib/serviceTypes'
import { optionalInteger, requiredNumber } from '@/lib/validation'
import { previewWarrantyExpiration } from '@/lib/warranty'
import {
  SERVICE_RECORD_TYPES,
  type Car,
  type ServiceRecord,
  type ServiceRecordFields,
} from '@/types'

const serviceRecordSchema = z.object({
  type: z.enum(SERVICE_RECORD_TYPES, { error: 'Selecione a categoria.' }),
  description: z.string().trim().min(1, 'Descreva o serviço realizado.'),
  cost: requiredNumber('Informe o valor.').pipe(
    z.number().min(0, 'O valor não pode ser negativo.'),
  ),
  date: z
    .string()
    .refine((value) => brDateToIso(value) !== null, 'Informe uma data válida (dd/mm/aaaa).'),
  mileage: requiredNumber('Informe a quilometragem.').pipe(
    z.number().min(0, 'A quilometragem não pode ser negativa.'),
  ),
  warrantyMonths: optionalInteger('Informe meses inteiros.').pipe(
    z.number().min(1, 'Mínimo de 1 mês.').max(120, 'Máximo de 120 meses.').optional(),
  ),
})

type ServiceFormInput = z.input<typeof serviceRecordSchema>
type ServiceFormValues = z.output<typeof serviceRecordSchema>

interface ServiceRecordFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  carId?: string
  cars?: Car[]
  defaultMileage?: number
  record?: ServiceRecord
}

export function ServiceRecordFormDialog({
  open,
  onOpenChange,
  carId,
  cars,
  defaultMileage,
  record,
}: ServiceRecordFormDialogProps) {
  const isEditing = Boolean(record)
  const [selectedCarId, setSelectedCarId] = useState('')
  const activeCarId =
    carId ??
    (selectedCarId && cars?.some((item) => item.id === selectedCarId)
      ? selectedCarId
      : (cars?.[0]?.id ?? ''))

  const createMutation = useCreateServiceRecord(activeCarId)
  const updateMutation = useUpdateServiceRecord(activeCarId, record?.id ?? '')
  const isPending = createMutation.isPending || updateMutation.isPending

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ServiceFormInput, unknown, ServiceFormValues>({
    resolver: zodResolver(serviceRecordSchema),
    defaultValues: {
      type: 'MAINTENANCE',
      description: '',
      cost: '',
      date: '',
      mileage: defaultMileage ?? '',
      warrantyMonths: '',
    },
  })

  const watchedDate = useWatch({ control, name: 'date' })
  const watchedIsoDate = brDateToIso(watchedDate ?? '') ?? ''
  const watchedWarranty = useWatch({ control, name: 'warrantyMonths' })
  const parsedMonths =
    watchedWarranty === '' || watchedWarranty === undefined ? undefined : Number(watchedWarranty)
  const warrantyPreview = previewWarrantyExpiration(watchedIsoDate, parsedMonths)

  useEffect(() => {
    if (!open) {
      return
    }
    const initialCarId = carId ?? cars?.[0]?.id ?? ''
    const initialMileage =
      defaultMileage ?? cars?.find((item) => item.id === initialCarId)?.mileage ?? ''

    if (record) {
      reset({
        type: record.type,
        description: record.description,
        cost: record.cost,
        date: formatDate(record.date),
        mileage: record.mileage,
        warrantyMonths: record.warrantyMonths ?? '',
      })
    } else {
      reset({
        type: 'MAINTENANCE',
        description: '',
        cost: '',
        date: formatDate(getTodayIso()),
        mileage: initialMileage,
        warrantyMonths: '',
      })
    }
  }, [open, carId, cars, record, defaultMileage, reset])

  function handleCarSelect(nextCarId: string) {
    setSelectedCarId(nextCarId)
    const car = cars?.find((item) => item.id === nextCarId)
    if (car) {
      setValue('mileage', car.mileage)
    }
  }

  async function onSubmit(values: ServiceFormValues) {
    const isoDate = brDateToIso(values.date)
    if (!activeCarId || !isoDate) {
      return
    }
    const payload: ServiceRecordFields = {
      type: values.type,
      description: values.description,
      cost: values.cost,
      date: isoDate,
      mileage: values.mileage,
      ...(values.warrantyMonths !== undefined ? { warrantyMonths: values.warrantyMonths } : {}),
    }

    try {
      if (isEditing) {
        await updateMutation.mutateAsync(payload)
      } else {
        await createMutation.mutateAsync(payload)
      }
      onOpenChange(false)
    } catch {
      // erro exibido pelo onError da mutação
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar serviço' : 'Novo serviço'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Atualize os dados do registro. Deixe a garantia em branco para removê-la.'
              : 'Registre uma manutenção, reparo ou preparação realizada.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {!carId && cars && cars.length > 0 && (
            <FormField id="service-car" label="Veículo">
              <Select value={activeCarId} onValueChange={handleCarSelect}>
                <SelectTrigger id="service-car" className="w-full">
                  <SelectValue placeholder="Selecione o carro" />
                </SelectTrigger>
                <SelectContent>
                  {cars.map((car) => (
                    <SelectItem key={car.id} value={car.id}>
                      {car.brand} {car.model} ({formatPlate(car.plate)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField id="service-type" label="Categoria" error={errors.type?.message}>
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="service-type" className="w-full">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {SERVICE_RECORD_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {SERVICE_TYPE_META[type].label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>

            <FormField id="service-date" label="Data" error={errors.date?.message}>
              <Controller
                control={control}
                name="date"
                render={({ field }) => (
                  <DateInput
                    id="service-date"
                    value={field.value}
                    onBlur={field.onBlur}
                    onChange={field.onChange}
                  />
                )}
              />
            </FormField>
          </div>

          <FormField
            id="service-description"
            label="Descrição"
            error={errors.description?.message}
          >
            <Textarea
              id="service-description"
              rows={2}
              placeholder="Troca de óleo 5W40 e filtro original"
              {...register('description')}
            />
          </FormField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FormField id="service-cost" label="Valor (R$)" error={errors.cost?.message}>
              <Input
                id="service-cost"
                type="number"
                inputMode="decimal"
                step="0.01"
                min={0}
                className="tabular placeholder:font-sans"
                placeholder="350.00"
                {...register('cost')}
              />
            </FormField>

            <FormField
              id="service-mileage"
              label="Odômetro (km)"
              error={errors.mileage?.message}
            >
              <Input
                id="service-mileage"
                type="number"
                inputMode="numeric"
                min={0}
                className="tabular placeholder:font-sans"
                placeholder="45000"
                {...register('mileage')}
              />
            </FormField>

            <FormField
              id="service-warranty"
              label="Garantia (meses)"
              error={errors.warrantyMonths?.message}
              hint={
                warrantyPreview
                  ? `Válida até ${formatDate(warrantyPreview)}`
                  : 'Opcional (1–120)'
              }
            >
              <Input
                id="service-warranty"
                type="number"
                inputMode="numeric"
                min={1}
                max={120}
                className="tabular placeholder:font-sans"
                placeholder="Sem garantia"
                {...register('warrantyMonths')}
              />
            </FormField>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="ghost"
              disabled={isPending}
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending || !activeCarId}>
              {isPending ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Registrar serviço'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
