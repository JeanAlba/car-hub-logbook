import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CarFormDialog } from '@/components/CarFormDialog'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { EmptyState } from '@/components/EmptyState'
import { LicensePlate } from '@/components/LicensePlate'
import { OdometerDisplay } from '@/components/OdometerDisplay'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useCars, useDeleteCar } from '@/hooks/useCars'
import { useDashboard } from '@/hooks/useDashboard'
import { formatCurrency } from '@/lib/formatters'
import { cn } from '@/lib/utils'
import type { Car } from '@/types'

function CarsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {Array.from({ length: 2 }).map((_, index) => (
        <Card key={index}>
          <CardHeader className="space-y-2">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-7 w-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

export function CarsPage() {
  const { data: cars, isLoading, isError, refetch } = useCars()
  const dashboardQuery = useDashboard()
  const deleteMutation = useDeleteCar()

  const [formOpen, setFormOpen] = useState(false)
  const [editingCar, setEditingCar] = useState<Car | undefined>(undefined)
  const [deletingCar, setDeletingCar] = useState<Car | null>(null)

  const spendByCarId = useMemo(() => {
    const map = new Map<string, { totalSpent: number; recordsCount: number }>()
    for (const item of dashboardQuery.data?.spentByCar ?? []) {
      map.set(item.carId, { totalSpent: item.totalSpent, recordsCount: item.recordsCount })
    }
    return map
  }, [dashboardQuery.data])

  function openCreate() {
    setEditingCar(undefined)
    setFormOpen(true)
  }

  function openEdit(car: Car) {
    setEditingCar(car)
    setFormOpen(true)
  }

  async function confirmDelete() {
    if (!deletingCar) {
      return
    }
    try {
      await deleteMutation.mutateAsync(deletingCar.id)
      setDeletingCar(null)
    } catch {
      // erro exibido pelo onError da mutação
    }
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title="Garagem"
        description="Clique em um veículo para abrir o diário de serviços."
        actions={
          <Button size="sm" onClick={openCreate}>
            <Plus /> Novo carro
          </Button>
        }
      />

      {isLoading && <CarsSkeleton />}

      {isError && (
        <EmptyState
          title="Não foi possível carregar os carros"
          description="Verifique sua conexão e tente novamente."
          action={
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Tentar novamente
            </Button>
          }
        />
      )}

      {!isLoading && !isError && cars && cars.length === 0 && (
        <EmptyState
          title="Nenhum carro cadastrado"
          description="Adicione seu primeiro veículo para registrar manutenções, reparos e upgrades."
          action={
            <Button size="sm" onClick={openCreate}>
              <Plus /> Adicionar carro
            </Button>
          }
        />
      )}

      {!isLoading && !isError && cars && cars.length > 0 && (
        <div className={cn('grid gap-4 sm:grid-cols-2', cars.length >= 3 && 'lg:grid-cols-3')}>
          {cars.map((car) => {
            const stats = spendByCarId.get(car.id)

            return (
              <Card
                key={car.id}
                className="relative flex flex-col justify-between overflow-hidden pb-0 transition-colors hover:border-brand/60 hover:bg-accent/20"
              >
                <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">
                      {car.brand} · <span className="tabular">{car.year}</span>
                    </p>
                    <h2 className="mt-0.5 truncate text-base font-semibold">
                      <Link
                        to={`/carros/${car.id}`}
                        className="after:absolute after:inset-0 focus:outline-none"
                      >
                        {car.model}
                      </Link>
                    </h2>
                    {car.nickname && (
                      <p className="mt-0.5 truncate text-xs text-brand">{car.nickname}</p>
                    )}
                  </div>
                  <LicensePlate plate={car.plate} className="shrink-0" />
                </CardHeader>

                <CardContent className="space-y-3">
                  <OdometerDisplay value={car.mileage} size="sm" />
                  {stats && (
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {stats.recordsCount}{' '}
                        {stats.recordsCount === 1 ? 'serviço' : 'serviços'}
                      </span>
                      <span className="tabular font-medium text-foreground">
                        {formatCurrency(stats.totalSpent)}
                      </span>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="relative z-10 flex items-center justify-end gap-1 border-t bg-muted/40 py-1.5 [.border-t]:pt-1.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={() => openEdit(car)}
                  >
                    <Pencil className="size-3" /> Editar
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeletingCar(car)}
                  >
                    <Trash2 className="size-3" /> Excluir
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}

      <CarFormDialog open={formOpen} onOpenChange={setFormOpen} car={editingCar} />

      <ConfirmDialog
        open={Boolean(deletingCar)}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingCar(null)
          }
        }}
        title="Excluir carro"
        description={
          deletingCar
            ? `Tem certeza que deseja excluir ${deletingCar.brand} ${deletingCar.model} (${deletingCar.plate})? Todos os serviços registrados para este veículo também serão removidos.`
            : ''
        }
        isPending={deleteMutation.isPending}
        onConfirm={confirmDelete}
      />
    </section>
  )
}
