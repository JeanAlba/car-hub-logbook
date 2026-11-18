import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SegmentedBar } from '@/components/SegmentedBar'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/formatters'
import { SERVICE_TYPE_META } from '@/lib/serviceTypes'
import { SERVICE_RECORD_TYPES, type CarSummary } from '@/types'

interface SpentByTypeChartProps {
  summary?: CarSummary
  isLoading: boolean
}

export function SpentByTypeChart({ summary, isLoading }: SpentByTypeChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-4 w-36" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-6 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  const total = summary?.totalSpent ?? 0

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-foreground">
          Gastos por categoria
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {SERVICE_RECORD_TYPES.map((type) => {
          const amount = summary?.spentByType[type] ?? 0
          const percentage = total > 0 ? Math.round((amount / total) * 100) : 0
          const meta = SERVICE_TYPE_META[type]

          return (
            <div key={type} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-foreground">{meta.label}</span>
                <span className="tabular font-medium text-foreground">
                  {formatCurrency(amount)}{' '}
                  <span className="text-muted-foreground">({percentage}%)</span>
                </span>
              </div>
              <SegmentedBar percentage={percentage} activeClass={meta.barClass} />
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
