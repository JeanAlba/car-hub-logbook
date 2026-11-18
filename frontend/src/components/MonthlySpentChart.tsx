import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency, formatMonthShort } from '@/lib/formatters'
import { cn } from '@/lib/utils'
import type { MonthlySpend } from '@/types'

interface MonthlySpentChartProps {
  months?: MonthlySpend[]
  isLoading: boolean
}

const SEGMENTS = 10
const REDLINE_FROM_INDEX = 8

export function MonthlySpentChart({ months, isLoading }: MonthlySpentChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-4 w-44" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-36 w-full" />
        </CardContent>
      </Card>
    )
  }

  const items = months ?? []
  const maxTotal = items.reduce((max, item) => Math.max(max, item.total), 0)
  const peak = items.reduce<MonthlySpend | null>(
    (best, item) => (item.total > (best?.total ?? 0) ? item : best),
    null,
  )

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
        <CardTitle className="text-sm font-semibold text-foreground">
          Gastos nos últimos 12 meses
        </CardTitle>
        {peak && peak.total > 0 && (
          <span className="tabular text-xs text-muted-foreground">
            Pico: <span className="text-foreground">{formatCurrency(peak.total)}</span> (
            {formatMonthShort(peak.month)})
          </span>
        )}
      </CardHeader>

      <CardContent>
        <div className="lcd-well rounded-sm p-3">
          <div className="grid grid-cols-12 items-end gap-1.5 sm:gap-2">
            {items.map((item) => {
              const ratio = maxTotal > 0 ? item.total / maxTotal : 0
              const activeCount = item.total > 0 ? Math.max(1, Math.round(ratio * SEGMENTS)) : 0
              const label = formatMonthShort(item.month)

              return (
                <div
                  key={item.month}
                  title={`${label}: ${formatCurrency(item.total)}`}
                  className="flex flex-col items-center gap-1.5"
                >
                  <div className="flex h-28 w-full flex-col-reverse gap-[2px]">
                    {Array.from({ length: SEGMENTS }).map((_, index) => {
                      const isActive = index < activeCount
                      const isRedline = index >= REDLINE_FROM_INDEX

                      return (
                        <span
                          key={index}
                          className={cn(
                            'w-full flex-1 rounded-[1px]',
                            !isActive && 'bg-secondary/40',
                            isActive && (isRedline ? 'bg-redline' : 'bg-brand'),
                          )}
                        />
                      )
                    })}
                  </div>
                  <span className="tabular text-[10px] text-muted-foreground">
                    {label.split('/')[0]}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
