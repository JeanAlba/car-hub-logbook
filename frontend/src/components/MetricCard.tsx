import type { ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  label: string
  value?: ReactNode
  highlight?: boolean
  children?: ReactNode
}

export function MetricCard({ label, value, highlight = false, children }: MetricCardProps) {
  return (
    <Card className="h-full py-0">
      <CardContent className="flex h-full flex-col justify-between space-y-2 p-3.5">
        <p className="text-xs font-medium text-muted-foreground">
          {label}
        </p>
        <div className="lcd-well flex min-h-14 items-center rounded-sm px-3 py-2">
          {children ?? (
            <p
              className={cn(
                'tabular text-xl font-semibold',
                highlight ? 'glow text-brand' : 'text-foreground',
              )}
            >
              {value}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function MetricCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="py-0">
          <CardContent className="space-y-2 p-3.5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-14 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
