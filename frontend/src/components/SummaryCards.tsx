import { MetricCard, MetricCardsSkeleton } from '@/components/MetricCard'
import { formatCurrency, formatDate } from '@/lib/formatters'
import type { CarSummary } from '@/types'

interface SummaryCardsProps {
  summary?: CarSummary
  isLoading: boolean
}

export function SummaryCards({ summary, isLoading }: SummaryCardsProps) {
  if (isLoading) {
    return <MetricCardsSkeleton count={4} />
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        label="Total gasto"
        value={formatCurrency(summary?.totalSpent ?? 0)}
        highlight
      />
      <MetricCard
        label="Custo por km"
        value={
          summary?.costPerKm !== null && summary?.costPerKm !== undefined
            ? `${formatCurrency(summary.costPerKm)}/km`
            : '—'
        }
      />
      <MetricCard label="Serviços registrados" value={summary?.recordsCount ?? 0} />
      <MetricCard
        label="Último serviço"
        value={summary?.lastServiceDate ? formatDate(summary.lastServiceDate) : '—'}
      />
    </div>
  )
}
