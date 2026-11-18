import { formatPlate } from '@/lib/formatters'
import { cn } from '@/lib/utils'

interface LicensePlateProps {
  plate: string
  className?: string
}

export function LicensePlate({ plate, className }: LicensePlateProps) {
  return (
    <span
      className={cn(
        'inline-flex flex-col overflow-hidden rounded-[3px] border border-border bg-display',
        className,
      )}
    >
      <span className="flex items-center justify-between border-b border-redline/70 bg-brand px-1.5 py-0.5 text-[9px] font-bold leading-none tracking-widest text-primary-foreground">
        <span>BR</span>
        <span>MERCOSUL</span>
      </span>
      <span className="tabular px-2 py-1 text-xs font-semibold tracking-wider text-foreground">
        {formatPlate(plate)}
      </span>
    </span>
  )
}
