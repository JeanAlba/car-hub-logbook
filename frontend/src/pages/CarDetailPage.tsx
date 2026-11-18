import { AxiosError } from 'axios'
import {
  ArrowLeft,
  Pencil,
  Plus,
  Search,
  ShieldAlert,
  ShieldCheck,
  ShieldOff,
  Trash2,
  X,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CarFormDialog } from '@/components/CarFormDialog'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { EmptyState } from '@/components/EmptyState'
import { LicensePlate } from '@/components/LicensePlate'
import { MonthlySpentChart } from '@/components/MonthlySpentChart'
import { OdometerDisplay } from '@/components/OdometerDisplay'
import { ServiceRecordFormDialog } from '@/components/ServiceRecordFormDialog'
import { SpentByTypeChart } from '@/components/SpentByTypeChart'
import { SummaryCards } from '@/components/SummaryCards'
import { WarrantyBadge } from '@/components/WarrantyBadge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useCar, useCarSummary } from '@/hooks/useCars'
import { useDeleteServiceRecord, useServiceRecords } from '@/hooks/useServiceRecords'
import { formatCurrency, formatDate, formatMileage } from '@/lib/formatters'
import { SERVICE_TYPE_META } from '@/lib/serviceTypes'
import { cn } from '@/lib/utils'
import { getWarrantyState } from '@/lib/warranty'
import { SERVICE_RECORD_TYPES, type ServiceRecord, type ServiceRecordType } from '@/types'

type TypeFilter = 'ALL' | ServiceRecordType

function LogbookSkeleton() {
  return (
    <div className="divide-y rounded-md border bg-card">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="flex items-center justify-between gap-4 p-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-5 w-24" />
        </div>
      ))}
    </div>
  )
}

export function CarDetailPage() {
  const { id = '' } = useParams<{ id: string }>()
  const carQuery = useCar(id)
  const summaryQuery = useCarSummary(id)
  const recordsQuery = useServiceRecords(id)
  const deleteRecordMutation = useDeleteServiceRecord(id)

  const [carEditOpen, setCarEditOpen] = useState(false)
  const [recordFormOpen, setRecordFormOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<ServiceRecord | undefined>(undefined)
  const [deletingRecord, setDeletingRecord] = useState<ServiceRecord | null>(null)
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('ALL')
  const [searchTerm, setSearchTerm] = useState('')

  const records = useMemo(() => recordsQuery.data ?? [], [recordsQuery.data])

  const warrantyStats = useMemo(() => {
    let active = 0
    let expiring = 0
    let expired = 0

    for (const record of records) {
      if (!record.warrantyExpiresAt) {
        continue
      }
      const state = getWarrantyState(record.warrantyExpiresAt)
      if (state === 'active') active += 1
      else if (state === 'expiring') expiring += 1
      else expired += 1
    }

    return { active, expiring, expired }
  }, [records])

  const countsByType = useMemo(() => {
    const counts: Record<ServiceRecordType, number> = {
      MAINTENANCE: 0,
      REPAIR: 0,
      MODIFICATION: 0,
      OTHER: 0,
    }
    for (const record of records) {
      counts[record.type] += 1
    }
    return counts
  }, [records])

  const filteredRecords = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    return records.filter((item) => {
      if (typeFilter !== 'ALL' && item.type !== typeFilter) {
        return false
      }
      if (query && !item.description.toLowerCase().includes(query)) {
        return false
      }
      return true
    })
  }, [records, typeFilter, searchTerm])

  if (carQuery.isLoading) {
    return (
      <section className="space-y-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-32 w-full" />
        <SummaryCards isLoading />
        <LogbookSkeleton />
      </section>
    )
  }

  if (carQuery.isError || !carQuery.data) {
    const status = carQuery.error instanceof AxiosError ? carQuery.error.response?.status : undefined
    const isNotFound = status === 404 || status === 400

    return (
      <section className="space-y-6">
        <Button asChild variant="ghost" size="sm">
          <Link to="/carros">
            <ArrowLeft className="size-4" /> Voltar para garagem
          </Link>
        </Button>
        <EmptyState
          title={isNotFound ? 'Carro não encontrado' : 'Não foi possível carregar o veículo'}
          description={
            isNotFound
              ? 'Este veículo não existe ou não pertence à sua conta.'
              : 'Verifique sua conexão e tente novamente.'
          }
          action={
            isNotFound ? (
              <Button asChild variant="outline" size="sm">
                <Link to="/carros">Ir para garagem</Link>
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={() => carQuery.refetch()}>
                Tentar novamente
              </Button>
            )
          }
        />
      </section>
    )
  }

  const car = carQuery.data
  const averageTicket =
    summaryQuery.data && summaryQuery.data.recordsCount > 0
      ? summaryQuery.data.totalSpent / summaryQuery.data.recordsCount
      : null
  const hasFilter = typeFilter !== 'ALL' || searchTerm.trim().length > 0

  function openCreateRecord() {
    setEditingRecord(undefined)
    setRecordFormOpen(true)
  }

  function openEditRecord(record: ServiceRecord) {
    setEditingRecord(record)
    setRecordFormOpen(true)
  }

  async function confirmDeleteRecord() {
    if (!deletingRecord) {
      return
    }
    try {
      await deleteRecordMutation.mutateAsync(deletingRecord.id)
      setDeletingRecord(null)
    } catch {
      // erro exibido pelo onError da mutação
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <nav
          aria-label="Navegação estrutural"
          className="mb-3 flex items-center gap-2 text-xs text-muted-foreground"
        >
          <Link to="/carros" className="inline-flex items-center gap-1 hover:text-foreground">
            <ArrowLeft className="size-3.5" /> Garagem
          </Link>
          <span>/</span>
          <span className="font-medium text-foreground">
            {car.brand} {car.model}
          </span>
        </nav>

        <div className="cluster-bezel flex flex-col justify-between gap-5 rounded-md border bg-card p-5 lg:flex-row lg:items-center">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              {car.brand} · <span className="tabular">{car.year}</span>
            </p>
            <div className="flex flex-wrap items-baseline gap-2.5">
              <h1 className="text-2xl font-semibold tracking-tight">{car.model}</h1>
              {car.nickname && (
                <span className="rounded-[3px] border border-brand/50 bg-display px-2 py-0.5 text-xs font-medium text-brand">
                  {car.nickname}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 text-xs text-muted-foreground">
              {averageTicket !== null && (
                <span>
                  Ticket médio:{' '}
                  <span className="tabular font-medium text-foreground">
                    {formatCurrency(averageTicket)}
                  </span>
                </span>
              )}
              <span className="inline-flex items-center gap-1 text-success">
                <ShieldCheck className="size-3.5" />
                <span className="tabular font-medium">{warrantyStats.active}</span> vigentes
              </span>
              {warrantyStats.expiring > 0 && (
                <span className="inline-flex items-center gap-1 text-warning">
                  <ShieldAlert className="size-3.5" />
                  <span className="tabular font-medium">{warrantyStats.expiring}</span> vencendo
                </span>
              )}
              {warrantyStats.expired > 0 && (
                <span className="inline-flex items-center gap-1 text-destructive">
                  <ShieldOff className="size-3.5" />
                  <span className="tabular font-medium">{warrantyStats.expired}</span>{' '}
                  {warrantyStats.expired === 1 ? 'expirada' : 'expiradas'}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <OdometerDisplay value={car.mileage} size="lg" />
            <LicensePlate plate={car.plate} />
            <Button variant="outline" size="sm" onClick={() => setCarEditOpen(true)}>
              <Pencil className="size-3.5" /> Editar
            </Button>
          </div>
        </div>
      </div>

      <SummaryCards summary={summaryQuery.data} isLoading={summaryQuery.isLoading} />

      <div className="grid gap-4 lg:grid-cols-2">
        <SpentByTypeChart summary={summaryQuery.data} isLoading={summaryQuery.isLoading} />
        <MonthlySpentChart
          months={summaryQuery.data?.spentByMonth}
          isLoading={summaryQuery.isLoading}
        />
      </div>

      <div className="space-y-4 pt-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Diário de serviços</h2>
            <p className="text-xs text-muted-foreground">
              Registros ordenados do mais recente para o mais antigo.
            </p>
          </div>

          <Button size="sm" onClick={openCreateRecord}>
            <Plus /> Novo serviço
          </Button>
        </div>

        {records.length > 0 && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-1.5">
              <Button
                type="button"
                size="xs"
                variant={typeFilter === 'ALL' ? 'default' : 'outline'}
                onClick={() => setTypeFilter('ALL')}
              >
                Todos ({records.length})
              </Button>
              {SERVICE_RECORD_TYPES.map((type) => (
                <Button
                  key={type}
                  type="button"
                  size="xs"
                  variant={typeFilter === type ? 'default' : 'outline'}
                  onClick={() => setTypeFilter(type)}
                >
                  {SERVICE_TYPE_META[type].label} ({countsByType[type]})
                </Button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar por descrição..."
                className="h-8 pl-8 pr-8 text-xs"
              />
              {searchTerm && (
                <button
                  type="button"
                  aria-label="Limpar busca"
                  onClick={() => setSearchTerm('')}
                  className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {recordsQuery.isLoading && <LogbookSkeleton />}

        {recordsQuery.isError && (
          <EmptyState
            title="Não foi possível carregar os serviços"
            description="Verifique sua conexão e tente novamente."
            action={
              <Button variant="outline" size="sm" onClick={() => recordsQuery.refetch()}>
                Tentar novamente
              </Button>
            }
          />
        )}

        {!recordsQuery.isLoading && !recordsQuery.isError && records.length === 0 && (
          <EmptyState
            title="Nenhum serviço registrado"
            description="Nenhum serviço ainda. Registre a primeira troca de óleo, revisão ou melhoria."
            action={
              <Button size="sm" onClick={openCreateRecord}>
                <Plus /> Registrar serviço
              </Button>
            }
          />
        )}

        {!recordsQuery.isLoading &&
          !recordsQuery.isError &&
          records.length > 0 &&
          filteredRecords.length === 0 && (
            <EmptyState
              title="Nenhum serviço encontrado"
              description="Nenhum registro corresponde aos filtros aplicados."
              action={
                hasFilter ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setTypeFilter('ALL')
                      setSearchTerm('')
                    }}
                  >
                    Limpar filtros
                  </Button>
                ) : undefined
              }
            />
          )}

        {!recordsQuery.isLoading && !recordsQuery.isError && filteredRecords.length > 0 && (
          <div className="divide-y rounded-md border bg-card">
            {filteredRecords.map((record) => {
              const typeMeta = SERVICE_TYPE_META[record.type]

              return (
                <div
                  key={record.id}
                  className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="tabular text-xs text-muted-foreground">
                        {formatDate(record.date)}
                      </span>
                      <Badge variant="outline" className={cn('text-[11px]', typeMeta.badgeClass)}>
                        {typeMeta.label}
                      </Badge>
                      <span className="tabular text-xs text-muted-foreground">
                        {formatMileage(record.mileage)}
                      </span>
                      <WarrantyBadge expiresAt={record.warrantyExpiresAt} />
                    </div>
                    <p className="text-sm font-medium text-foreground">{record.description}</p>
                  </div>

                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <span className="tabular text-sm font-semibold text-foreground">
                      {formatCurrency(record.cost)}
                    </span>

                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Editar serviço ${record.description}`}
                        onClick={() => openEditRecord(record)}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Excluir serviço ${record.description}`}
                        onClick={() => setDeletingRecord(record)}
                      >
                        <Trash2 className="size-3.5 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <CarFormDialog open={carEditOpen} onOpenChange={setCarEditOpen} car={car} />

      <ServiceRecordFormDialog
        open={recordFormOpen}
        onOpenChange={setRecordFormOpen}
        carId={car.id}
        defaultMileage={car.mileage}
        record={editingRecord}
      />

      <ConfirmDialog
        open={Boolean(deletingRecord)}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingRecord(null)
          }
        }}
        title="Excluir serviço"
        description={
          deletingRecord
            ? `Tem certeza que deseja excluir o registro "${deletingRecord.description}" (${formatDate(deletingRecord.date)})?`
            : ''
        }
        isPending={deleteRecordMutation.isPending}
        onConfirm={confirmDeleteRecord}
      />
    </section>
  )
}
