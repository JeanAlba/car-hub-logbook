import type { ServiceRecordType } from '@/types'

export const SERVICE_TYPE_META: Record<
  ServiceRecordType,
  { label: string; barClass: string; badgeClass: string }
> = {
  MAINTENANCE: {
    label: 'Manutenção',
    barClass: 'bg-brand',
    badgeClass: 'border-brand/60 bg-display text-brand shadow-[inset_0_1px_0_rgb(255_255_255/0.04)]',
  },
  REPAIR: {
    label: 'Reparo',
    barClass: 'bg-redline',
    badgeClass:
      'border-redline bg-display text-destructive shadow-[inset_0_1px_0_rgb(255_255_255/0.04)]',
  },
  MODIFICATION: {
    label: 'Preparação',
    barClass: 'bg-foreground',
    badgeClass:
      'border-foreground/40 bg-display text-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.04)]',
  },
  OTHER: {
    label: 'Outro',
    barClass: 'bg-muted-foreground',
    badgeClass:
      'border-border bg-display text-muted-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.04)]',
  },
}
