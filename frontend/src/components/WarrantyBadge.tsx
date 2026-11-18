import { ShieldAlert, ShieldCheck, ShieldOff } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/formatters'
import { getWarrantyState, type WarrantyState } from '@/lib/warranty'
import { cn } from '@/lib/utils'

interface WarrantyBadgeProps {
  expiresAt?: string
}

const STATE_CONFIG: Record<
  WarrantyState,
  { prefix: string; className: string; Icon: typeof ShieldCheck }
> = {
  active: {
    prefix: 'Garantia até',
    className:
      'border-success/50 bg-display text-success shadow-[inset_0_1px_0_rgb(255_255_255/0.04)]',
    Icon: ShieldCheck,
  },
  expiring: {
    prefix: 'Vence em',
    className:
      'border-warning/60 bg-display text-warning shadow-[inset_0_1px_0_rgb(255_255_255/0.04)]',
    Icon: ShieldAlert,
  },
  expired: {
    prefix: 'Expirou em',
    className:
      'border-redline bg-display text-destructive shadow-[inset_0_1px_0_rgb(255_255_255/0.04)]',
    Icon: ShieldOff,
  },
}

export function WarrantyBadge({ expiresAt }: WarrantyBadgeProps) {
  if (!expiresAt) {
    return null
  }

  const state = getWarrantyState(expiresAt)
  const { prefix, className, Icon } = STATE_CONFIG[state]

  return (
    <Badge variant="outline" className={cn('tabular gap-1 font-normal', className)}>
      <Icon className="size-3" />
      {prefix} {formatDate(expiresAt)}
    </Badge>
  )
}
