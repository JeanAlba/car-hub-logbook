import { Plus, ShieldAlert, ShieldCheck, ShieldOff } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CarFormDialog } from '@/components/CarFormDialog'
import { EmptyState } from '@/components/EmptyState'
import { MetricCard, MetricCardsSkeleton } from '@/components/MetricCard'
import { PageHeader } from '@/components/PageHeader'
import { SegmentedBar } from '@/components/SegmentedBar'
import { ServiceRecordFormDialog } from '@/components/ServiceRecordFormDialog'
import { WarrantyBadge } from '@/components/WarrantyBadge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useCars } from '@/hooks/useCars'
import { useDashboard } from '@/hooks/useDashboard'
import { formatCurrency, formatDate, formatPlate } from '@/lib/formatters'
import { SERVICE_TYPE_META } from '@/lib/serviceTypes'
import { cn } from '@/lib/utils'
import type { WarrantyAlert } from '@/types'

function formatAlertTiming(alert: WarrantyAlert): string {
  if (alert.daysRemaining === 0) {
    return 'Vence hoje'
  }
  if (alert.daysRemaining === 1) {
    return 'Vence em 1 dia'
  }
  if (alert.daysRemaining > 1) {
    return `Vence em ${alert.daysRemaining} dias`
  }
  const overdue = Math.abs(alert.daysRemaining)
  return overdue === 1 ? 'Expirou há 1 dia' : `Expirou há ${overdue} dias`
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <MetricCardsSkeleton count={4} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-56 w-full" />
        <Skeleton className="h-56 w-full" />
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  )
}

export function DashboardPage() {
  const { data, isLoading, isError, refetch } = useDashboard()
  const carsQuery = useCars()
  const [carFormOpen, setCarFormOpen] = useState(false)
  const [serviceFormOpen, setServiceFormOpen] = useState(false)

  const cars = carsQuery.data ?? []

  return (
    <section className="space-y-6">
      <PageHeader
        title="Geral"
        description="Gastos consolidados, alertas de garantia e atividades recentes."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => setCarFormOpen(true)}>
              <Plus className="size-3.5" /> Novo carro
            </Button>
            {cars.length > 0 && (
              <Button size="sm" onClick={() => setServiceFormOpen(true)}>
                <Plus className="size-3.5" /> Novo serviço
              </Button>
            )}
          </>
        }
      />

      {isLoading && <DashboardSkeleton />}

      {isError && (
        <EmptyState
          title="Não foi possível carregar a visão geral"
          description="Verifique sua conexão e tente novamente."
          action={
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Tentar novamente
            </Button>
          }
        />
      )}

      {!isLoading && !isError && data && data.carsCount === 0 && (
        <EmptyState
          title="Nenhum carro na garagem"
          description="Adicione seu primeiro veículo para acompanhar custos, histórico de serviços e prazos de garantia."
          action={
            <Button size="sm" onClick={() => setCarFormOpen(true)}>
              <Plus /> Adicionar carro
            </Button>
          }
        />
      )}

      {!isLoading && !isError && data && data.carsCount > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              label="Total investido"
              value={formatCurrency(data.totalSpent)}
              highlight
            />
            <MetricCard
              label="Últimos 30 dias"
              value={formatCurrency(data.spentLast30Days)}
            />
            <MetricCard label="Garagem ativa">
              <p className="tabular text-xl font-semibold text-foreground">
                {data.carsCount}{' '}
                <span className="font-sans text-xs font-normal text-muted-foreground">
                  {data.carsCount === 1 ? 'carro' : 'carros'} · {data.recordsCount}{' '}
                  {data.recordsCount === 1 ? 'serviço' : 'serviços'}
                </span>
              </p>
            </MetricCard>
            <MetricCard label="Garantias">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 py-0.5 text-xs">
                <span className="inline-flex items-center gap-1 text-success">
                  <ShieldCheck className="size-3.5" />
                  <span className="tabular font-semibold">{data.warranties.activeCount}</span>{' '}
                  vigentes
                </span>
                <span className="inline-flex items-center gap-1 text-warning">
                  <ShieldAlert className="size-3.5" />
                  <span className="tabular font-semibold">{data.warranties.expiringCount}</span>{' '}
                  vencendo
                </span>
                <span className="inline-flex items-center gap-1 text-destructive">
                  <ShieldOff className="size-3.5" />
                  <span className="tabular font-semibold">{data.warranties.expiredCount}</span>{' '}
                  {data.warranties.expiredCount === 1 ? 'expirada' : 'expiradas'}
                </span>
              </div>
            </MetricCard>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="cluster-bezel">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-foreground">
                  Gastos por veículo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="divide-y rounded-sm border bg-muted">
                  {data.spentByCar.map((item) => {
                    const percentage =
                      data.totalSpent > 0
                        ? Math.round((item.totalSpent / data.totalSpent) * 100)
                        : 0

                    return (
                      <Link
                        key={item.carId}
                        to={`/carros/${item.carId}`}
                        className="block space-y-2 p-3 transition-colors hover:bg-accent/50"
                      >
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <div className="flex min-w-0 items-center gap-2">
                            <span className="truncate font-medium text-foreground">
                              {item.carName}
                            </span>
                            <span className="tabular rounded-[2px] border bg-display px-1.5 py-0.5 text-[10px] text-muted-foreground">
                              {formatPlate(item.carPlate)}
                            </span>
                          </div>
                          <span className="shrink-0 text-foreground">
                            <span className="tabular font-medium">
                              {formatCurrency(item.totalSpent)}
                            </span>{' '}
                            <span className="text-muted-foreground">
                              · {item.recordsCount}{' '}
                              {item.recordsCount === 1 ? 'serviço' : 'serviços'}
                            </span>
                          </span>
                        </div>
                        <SegmentedBar percentage={percentage} activeClass="bg-brand" />
                      </Link>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="cluster-bezel">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-foreground">
                  Alertas de garantia
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.warranties.alerts.length === 0 ? (
                  <div className="lcd-well rounded-sm p-4 text-xs text-muted-foreground">
                    Nenhuma garantia expirada ou vencendo nos próximos 30 dias.
                  </div>
                ) : (
                  <div className="divide-y rounded-sm border bg-muted">
                    {data.warranties.alerts.map((alert) => {
                      const isExpiring = alert.status === 'EXPIRING'

                      return (
                        <Link
                          key={alert.id}
                          to={`/carros/${alert.carId}`}
                          className="flex items-start justify-between gap-3 p-3 transition-colors hover:bg-accent/50"
                        >
                          <div className="min-w-0 space-y-1">
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              <span className="font-medium text-foreground">{alert.carName}</span>
                              <span className="tabular rounded-[2px] border bg-display px-1.5 py-0.5 text-[10px] text-muted-foreground">
                                {formatPlate(alert.carPlate)}
                              </span>
                            </div>
                            <p className="truncate text-xs text-muted-foreground">
                              {alert.description}
                            </p>
                          </div>

                          <div className="shrink-0 text-right">
                            <Badge
                              variant="outline"
                              className={cn(
                                'tabular text-[11px] font-normal shadow-[inset_0_1px_0_rgb(255_255_255/0.04)]',
                                isExpiring
                                  ? 'border-warning/60 bg-display text-warning'
                                  : 'border-redline bg-display text-destructive',
                              )}
                            >
                              {formatAlertTiming(alert)}
                            </Badge>
                            <p className="tabular mt-1 text-[10px] text-muted-foreground">
                              {formatDate(alert.warrantyExpiresAt)}
                            </p>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">
                Últimos serviços na garagem
              </h2>
              <Link to="/carros" className="text-xs text-brand hover:underline">
                Ver todos os carros
              </Link>
            </div>

            {data.recentRecords.length === 0 ? (
              <div className="rounded-md border bg-card p-6 text-center text-sm text-muted-foreground">
                Nenhum serviço registrado ainda. Clique em <strong>Novo serviço</strong> acima para
                lançar o primeiro.
              </div>
            ) : (
              <div className="divide-y rounded-md border bg-card">
                {data.recentRecords.map((record) => {
                  const typeMeta = SERVICE_TYPE_META[record.type]

                  return (
                    <Link
                      key={record.id}
                      to={`/carros/${record.carId}`}
                      className="block space-y-1.5 p-4 transition-colors hover:bg-accent/40"
                    >
                      <div className="flex items-baseline justify-between gap-4">
                        <p className="truncate text-sm font-medium text-foreground">
                          {record.description}
                        </p>
                        <span className="tabular shrink-0 text-sm font-semibold text-foreground">
                          {formatCurrency(record.cost)}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-medium text-brand">{record.carName}</span>
                        <span className="text-muted-foreground">·</span>
                        <span className="tabular text-muted-foreground">
                          {formatDate(record.date)}
                        </span>
                        <Badge variant="outline" className={cn('text-[11px]', typeMeta.badgeClass)}>
                          {typeMeta.label}
                        </Badge>
                        <WarrantyBadge expiresAt={record.warrantyExpiresAt} />
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}

      <CarFormDialog open={carFormOpen} onOpenChange={setCarFormOpen} />
      <ServiceRecordFormDialog
        open={serviceFormOpen}
        onOpenChange={setServiceFormOpen}
        cars={cars}
      />
    </section>
  )
}
