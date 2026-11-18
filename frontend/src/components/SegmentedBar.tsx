import { cn } from '@/lib/utils'

interface SegmentedBarProps {
  percentage: number
  activeClass?: string
  segments?: number
  className?: string
}

export function SegmentedBar({
  percentage,
  activeClass = 'bg-brand',
  segments = 20,
  className,
}: SegmentedBarProps) {
  const clamped = Math.max(0, Math.min(100, percentage))
  const activeCount = clamped > 0 ? Math.max(1, Math.round((clamped / 100) * segments)) : 0

  return (
    <div
      className={cn(
        'lcd-well flex w-full items-center gap-[2px] rounded-[2px] p-1',
        className,
      )}
    >
      {Array.from({ length: segments }).map((_, index) => (
        <span
          key={index}
          className={cn(
            'h-2 flex-1 rounded-[1px] transition-colors',
            index < activeCount ? activeClass : 'bg-secondary/50',
          )}
        />
      ))}
    </div>
  )
}
