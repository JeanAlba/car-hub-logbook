import { cn } from '@/lib/utils'

interface OdometerDisplayProps {
  value: number
  size?: 'sm' | 'lg'
  className?: string
}

const numberFormatter = new Intl.NumberFormat('pt-BR')

export function OdometerDisplay({ value, size = 'sm', className }: OdometerDisplayProps) {
  const formatted = numberFormatter.format(value)

  return (
    <div
      className={cn(
        'lcd-well inline-flex items-center justify-between gap-2.5 rounded-sm',
        size === 'sm' ? 'w-full px-3 py-2' : 'px-3.5 py-2',
        className,
      )}
    >
      <span className="border-r border-border pr-2 font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
        ODO
      </span>
      <span
        className={cn(
          'tabular glow font-semibold tracking-wider text-brand',
          size === 'sm' ? 'text-sm' : 'text-lg sm:text-xl',
        )}
      >
        {formatted}
      </span>
      <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        KM
      </span>
    </div>
  )
}
