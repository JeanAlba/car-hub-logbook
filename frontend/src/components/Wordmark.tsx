import { cn } from '@/lib/utils'

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn('font-mono font-semibold tracking-tight', className)}>
      car-hub<span className="animate-pulse text-brand">_</span>
    </span>
  )
}
