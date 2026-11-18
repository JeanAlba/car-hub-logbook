import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
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
import { useCreateCar, useUpdateCar } from '@/hooks/useCars'
import { normalizePlateInput } from '@/lib/formatters'
import { requiredNumber } from '@/lib/validation'
import type { Car, CarFields } from '@/types'

const currentYear = new Date().getFullYear()
const maxYear = currentYear + 1

const carSchema = z.object({
  brand: z.string().trim().min(1, 'Informe a marca.'),
  model: z.string().trim().min(1, 'Informe o modelo.'),
  year: requiredNumber('Informe o ano.')
    .pipe(
      z
        .number()
        .int('Informe um ano inteiro.')
        .min(1900, 'Ano mínimo: 1900.')
        .max(maxYear, `Ano máximo: ${maxYear}.`),
    ),
  plate: z
    .string()
    .transform(normalizePlateInput)
    .refine((val) => /^[A-Z0-9]{7}$/.test(val), 'A placa deve ter 7 letras ou números.'),
  mileage: requiredNumber('Informe a quilometragem.').pipe(
    z.number().min(0, 'A quilometragem não pode ser negativa.'),
  ),
  nickname: z.string().optional(),
})

type CarFormInput = z.input<typeof carSchema>
type CarFormValues = z.output<typeof carSchema>

interface CarFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  car?: Car
}

export function CarFormDialog({ open, onOpenChange, car }: CarFormDialogProps) {
  const isEditing = Boolean(car)
  const createMutation = useCreateCar()
  const updateMutation = useUpdateCar(car?.id ?? '')
  const isPending = createMutation.isPending || updateMutation.isPending

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CarFormInput, unknown, CarFormValues>({
    resolver: zodResolver(carSchema),
    defaultValues: {
      brand: '',
      model: '',
      year: currentYear,
      plate: '',
      mileage: '',
      nickname: '',
    },
  })

  useEffect(() => {
    if (!open) {
      return
    }
    if (car) {
      reset({
        brand: car.brand,
        model: car.model,
        year: car.year,
        plate: car.plate,
        mileage: car.mileage,
        nickname: car.nickname ?? '',
      })
    } else {
      reset({
        brand: '',
        model: '',
        year: currentYear,
        plate: '',
        mileage: '',
        nickname: '',
      })
    }
  }, [open, car, reset])

  async function onSubmit(values: CarFormValues) {
    const nickname = values.nickname?.trim()
    const payload: CarFields = {
      brand: values.brand,
      model: values.model,
      year: values.year,
      plate: values.plate,
      mileage: values.mileage,
      ...(nickname ? { nickname } : {}),
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
          <DialogTitle>{isEditing ? 'Editar carro' : 'Novo carro'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Atualize os dados do veículo.'
              : 'Cadastre um veículo para acompanhar os serviços.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField id="car-brand" label="Marca" error={errors.brand?.message}>
              <Input id="car-brand" placeholder="Volkswagen" {...register('brand')} />
            </FormField>

            <FormField id="car-model" label="Modelo" error={errors.model?.message}>
              <Input id="car-model" placeholder="Golf GTI" {...register('model')} />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField id="car-year" label="Ano" error={errors.year?.message}>
              <Input
                id="car-year"
                type="number"
                inputMode="numeric"
                className="tabular placeholder:font-sans"
                placeholder="2018"
                {...register('year')}
              />
            </FormField>

            <FormField id="car-plate" label="Placa" error={errors.plate?.message}>
              <Input
                id="car-plate"
                placeholder="ABC1D23"
                className="tabular uppercase placeholder:font-sans"
                maxLength={8}
                {...register('plate')}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              id="car-mileage"
              label="Quilometragem (km)"
              error={errors.mileage?.message}
            >
              <Input
                id="car-mileage"
                type="number"
                inputMode="numeric"
                min={0}
                className="tabular placeholder:font-sans"
                placeholder="45000"
                {...register('mileage')}
              />
            </FormField>

            <FormField id="car-nickname" label="Apelido (opcional)">
              <Input id="car-nickname" placeholder="Daily" {...register('nickname')} />
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
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Adicionar carro'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
