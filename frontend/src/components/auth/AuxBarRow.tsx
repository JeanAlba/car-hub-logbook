import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface AuxBarRowProps {
  lit: number
  total: number
  redFrom?: number
  heights: number[]
  icon: ReactNode
  iconTone: 'red' | 'amber'
  scaleLabels?: string[]
}

export function AuxBarRow({
  lit,
  total,
  redFrom,
  heights,
  icon,
  iconTone,
  scaleLabels,
}: AuxBarRowProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-3.5">
        <div
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-[2px] border',
            iconTone === 'red'
              ? 'border-destructive/60 bg-redline/80 text-foreground'
              : 'border-brand/60 bg-brand/90 text-primary-foreground',
          )}
        >
          {icon}
        </div>

        <div className="flex-1 space-y-1.5">
          <div className="flex h-9 items-end gap-[3px] border-y border-emerald-500/25 py-0.5">
            {Array.from({ length: total }, (_, index) => {
              const isLit = index < lit
              const isRed = redFrom !== undefined && index >= redFrom
              const height = heights[index] ?? 100

              return (
                <span
                  key={index}
                  style={{ height: `${height}%` }}
                  className={cn(
                    'flex-1 rounded-[1px] transition-colors duration-150',
                    !isLit && (isRed ? 'bg-[#2a1212]' : 'bg-[#1b1811]'),
                    isLit && (isRed ? 'bg-[#dc2626]' : 'bg-brand'),
                  )}
                />
              )
            })}
          </div>
          {scaleLabels && (
            <div className="tabular flex justify-between px-1 text-[10px] leading-none text-brand">
              {scaleLabels.map((label) => (
                <span key={label}>{label}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function OilIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 14h11l4-4h3l-1 3" />
      <path d="M3 14v3h11l2-3" />
      <path d="M8 11V8M6 8h4" />
    </svg>
  )
}

export function BatteryIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="4" y="7" width="16" height="12" rx="1" />
      <path d="M7 7V5h2v2M15 7V5h2v2M7 13h4M15 11v4M13 13h4" />
    </svg>
  )
}

export function TempIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 4v10" />
      <circle cx="12" cy="16" r="2.2" />
      <path d="M12 8h4M12 11h4M5 20c2-1.5 4 1.5 7 0s5 1.5 7 0" />
    </svg>
  )
}

export function FuelIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="5" y="5" width="9" height="14" rx="1" />
      <path d="M7 8h5v4H7zM14 9l3 2v6a1.5 1.5 0 0 0 3 0v-5l-2-2" />
    </svg>
  )
}

export function CheckEngineIcon() {
  return (
    <svg viewBox="0 0 28 20" className="h-5 w-7" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M5 7h3l2-2h7l2 2h3v7h-3l-2 2H9l-2-2H5z" />
      <path d="M11 3h5M13.5 3v2M2 9v4M25 8v5" />
    </svg>
  )
}
